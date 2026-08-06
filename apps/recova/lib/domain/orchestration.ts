import type { RecoveryPolicy } from "./policy"
import { isWithinQuietHours } from "./policy"
import { retryEligibility } from "./state-machine"
import type {
  FailureReason,
  LinkedAccount,
  Rail,
  RecoveryCase,
} from "./types"

/**
 * Recovery orchestration engine.
 *
 * Answers the four questions the PRD says the engine must answer:
 * which account, which rail, when to debit, and how much.
 *
 * Deliberately pure: no I/O, no dates read from the ambient clock unless
 * passed in. That makes each decision reproducible in an audit, which the
 * PRD requires ("recompute before execution" for stale recommendations).
 */

/* ------------------------------------------------------------------ */
/* Step 1 + 2 — candidate selection and ranking                        */
/* ------------------------------------------------------------------ */

export interface ScoredAccount {
  account: LinkedAccount
  score: number
  breakdown: {
    inflow: number
    recency: number
    successRate: number
    stability: number
    failurePenalty: number
  }
}

function recencyScore(lastCreditAt: string | null, now: Date): number {
  if (!lastCreditAt) return 0
  const days = (now.getTime() - new Date(lastCreditAt).getTime()) / 86_400_000
  if (days <= 1) return 1
  if (days >= 30) return 0
  return 1 - days / 30
}

/**
 * Weights are transcribed from the Risk & Recovery Decision Engine PRD:
 *   0.3 inflow + 0.25 recency + 0.2 success rate + 0.15 stability − 0.1 failure
 */
export function scoreAccount(
  account: LinkedAccount,
  now: Date = new Date()
): ScoredAccount {
  const inflow = clamp01(account.inflowScore)
  const recency = recencyScore(account.lastCreditAt, now)
  const successRate = clamp01(1 - account.riskScore)
  const stability = account.lastBalance && account.lastBalance > 0 ? 0.8 : 0.2
  const failurePenalty = clamp01(account.riskScore)

  const score =
    0.3 * inflow +
    0.25 * recency +
    0.2 * successRate +
    0.15 * stability -
    0.1 * failurePenalty

  return {
    account,
    score: Number(Math.max(0, score).toFixed(3)),
    breakdown: { inflow, recency, successRate, stability, failurePenalty },
  }
}

/**
 * Filter then rank. Blacklisted accounts and — when the policy says so —
 * dormant/failed-mandate accounts never reach the debit engine at all.
 */
export function rankAccounts(
  accounts: LinkedAccount[],
  policy: RecoveryPolicy,
  now: Date = new Date()
): ScoredAccount[] {
  return accounts
    .filter((a) => !a.blacklisted)
    .filter((a) => !(policy.mandate.excludeDormantAccounts && a.mandateStatus === "FAILED"))
    .map((a) => scoreAccount(a, now))
    .sort((a, b) => b.score - a.score)
}

/* ------------------------------------------------------------------ */
/* Step 3 — rail selection                                             */
/* ------------------------------------------------------------------ */

export function selectRail(
  account: LinkedAccount,
  policy: RecoveryPolicy,
  railHealth: Record<Rail, { successRate: number; circuitOpen: boolean }>
): Rail | null {
  const usable = policy.debit.railPriority.filter((rail) => {
    if (railHealth[rail]?.circuitOpen) return false
    // Direct debit rails need a live mandate; EasyPay is the fallback rail.
    if (rail !== "EASY_PAY" && account.mandateStatus !== "ACTIVE") return false
    return true
  })
  return usable[0] ?? null
}

/* ------------------------------------------------------------------ */
/* Step 4 — debit amount decision                                      */
/* ------------------------------------------------------------------ */

export type DebitDecision =
  | { action: "DEBIT_FULL"; amount: number }
  | { action: "DEBIT_PARTIAL"; amount: number }
  | { action: "SKIP_ACCOUNT"; reason: string }

export function decideDebitAmount(
  balance: number | null,
  amountDue: number,
  policy: RecoveryPolicy
): DebitDecision {
  if (balance === null) {
    return { action: "SKIP_ACCOUNT", reason: "Balance unknown — enquiry failed." }
  }
  if (balance >= amountDue) {
    return { action: "DEBIT_FULL", amount: amountDue }
  }
  if (!policy.debit.partialRecoveryEnabled) {
    return { action: "SKIP_ACCOUNT", reason: "Partial recovery disabled by policy." }
  }
  if (balance >= policy.debit.minPartialAmount) {
    return { action: "DEBIT_PARTIAL", amount: balance }
  }
  return {
    action: "SKIP_ACCOUNT",
    reason: `Balance below the ₦${policy.debit.minPartialAmount.toLocaleString()} partial threshold.`,
  }
}

/* ------------------------------------------------------------------ */
/* Failure classification → next action                                */
/* ------------------------------------------------------------------ */

export interface NextAction {
  action:
    | "RETRY_SAME_ACCOUNT"
    | "RETRY_NEXT_ACCOUNT"
    | "SWITCH_TO_EASYPAY"
    | "WAIT_FOR_CREDIT_EVENT"
    | "REMOVE_ACCOUNT"
    | "ESCALATE"
  detail: string
  delayHours: number
}

/** Advanced retry logic, transcribed from Recovery Orchestration PRD §5. */
export function classifyFailure(reason: FailureReason): NextAction {
  switch (reason) {
    case "INSUFFICIENT_FUNDS":
      return {
        action: "WAIT_FOR_CREDIT_EVENT",
        detail: "Hold until an inflow is detected on the account, then debit immediately.",
        delayHours: 24,
      }
    case "BANK_TIMEOUT":
    case "SYSTEM_ERROR":
      return {
        action: "RETRY_SAME_ACCOUNT",
        detail: "Transient rail failure — safe to retry the same account.",
        delayHours: 0,
      }
    case "NO_MANDATE":
    case "MANDATE_REVOKED":
      return {
        action: "SWITCH_TO_EASYPAY",
        detail: "No debit authority on this rail — fall back to EasyPay.",
        delayHours: 0,
      }
    case "DO_NOT_HONOR":
      return {
        action: "REMOVE_ACCOUNT",
        detail: "Repeated do-not-honour responses — blacklist the account.",
        delayHours: 0,
      }
    case "ACCOUNT_CLOSED":
      return {
        action: "RETRY_NEXT_ACCOUNT",
        detail: "Account closed — drop from the pool and move to the next ranked account.",
        delayHours: 0,
      }
  }
}

/* ------------------------------------------------------------------ */
/* Retry scheduling                                                    */
/* ------------------------------------------------------------------ */

export interface RetryPlan {
  attemptNo: number
  scheduledAt: Date
  strategy: string
}

/**
 * Builds the full retry ladder for a case.
 * Attempt 0 fires at the due date; each retry is offset by the configured
 * interval, and any slot landing inside quiet hours is pushed to the window's
 * end rather than silently firing at 02:00.
 */
export function buildRetryPlan(
  firstAttemptAt: Date,
  policy: RecoveryPolicy
): RetryPlan[] {
  const strategies = [
    "All mandated accounts",
    "All accounts",
    "Top 3 ranked accounts",
    "Top ranked account only",
  ]

  const plans: RetryPlan[] = [
    { attemptNo: 0, scheduledAt: firstAttemptAt, strategy: strategies[0] },
  ]

  policy.debit.retryIntervalsHours.forEach((hours, i) => {
    const at = new Date(firstAttemptAt.getTime() + hours * 3_600_000)
    plans.push({
      attemptNo: i + 1,
      scheduledAt: shiftOutOfQuietHours(at, policy),
      strategy: strategies[Math.min(i + 1, strategies.length - 1)],
    })
  })

  return plans.slice(0, policy.debit.maxAttemptsPerCycle)
}

function shiftOutOfQuietHours(date: Date, policy: RecoveryPolicy): Date {
  if (!isWithinQuietHours(date, policy.debit.quietHours)) return date
  const [toH, toM] = policy.debit.quietHours.to.split(":").map(Number)
  const shifted = new Date(date)
  if (date.getHours() >= Number(policy.debit.quietHours.from.split(":")[0])) {
    shifted.setDate(shifted.getDate() + 1)
  }
  shifted.setHours(toH, toM, 0, 0)
  return shifted
}

/* ------------------------------------------------------------------ */
/* Full recommendation surfaced in the Recovery Queue                  */
/* ------------------------------------------------------------------ */

export interface RecoveryRecommendation {
  eligible: boolean
  blockedReason?: string
  rail: Rail | null
  account: LinkedAccount | null
  decision: DebitDecision | null
  confidence: number
  rationale: string[]
}

export function recommend(
  recoveryCase: RecoveryCase,
  accounts: LinkedAccount[],
  policy: RecoveryPolicy,
  railHealth: Record<Rail, { successRate: number; circuitOpen: boolean }>,
  now: Date = new Date()
): RecoveryRecommendation {
  const eligibility = retryEligibility(recoveryCase)
  if (!eligibility.allowed) {
    return {
      eligible: false,
      blockedReason: eligibility.reason,
      rail: null,
      account: null,
      decision: null,
      confidence: 0,
      rationale: [eligibility.reason ?? "Recovery blocked."],
    }
  }

  const ranked = rankAccounts(accounts, policy, now)
  if (ranked.length === 0) {
    return {
      eligible: false,
      blockedReason: "No eligible accounts remain in the pool.",
      rail: null,
      account: null,
      decision: null,
      confidence: 0,
      rationale: ["All BVN-linked accounts are blacklisted or mandate-failed."],
    }
  }

  const best = ranked[0]
  const rail = selectRail(best.account, policy, railHealth)
  const decision = decideDebitAmount(
    best.account.lastBalance,
    recoveryCase.outstanding,
    policy
  )

  const railSuccess = rail ? railHealth[rail]?.successRate ?? 0.5 : 0
  const confidence = Number((best.score * 0.6 + railSuccess * 0.4).toFixed(2))

  const rationale = [
    `Ranked #1 of ${ranked.length} accounts (score ${best.score}).`,
    rail
      ? `Routing via ${rail} — ${(railSuccess * 100).toFixed(0)}% rail success rate.`
      : "No rail available: mandate inactive and all fallback rails are circuit-broken.",
    decision.action === "DEBIT_FULL"
      ? `Balance covers the full ₦${recoveryCase.outstanding.toLocaleString()} outstanding.`
      : decision.action === "DEBIT_PARTIAL"
        ? `Partial debit of ₦${decision.amount.toLocaleString()} — balance is short.`
        : decision.reason,
  ]

  return {
    eligible: rail !== null && decision.action !== "SKIP_ACCOUNT",
    rail,
    account: best.account,
    decision,
    confidence,
    rationale,
  }
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}
