import type { Rail } from "./types"

/**
 * Recovery policy engine.
 *
 * PRD, "Platform Governance & Controls":
 * "This platform must not hard-code recovery behaviour. All recovery logic
 *  shall be driven by configurable policies that can be defined per lender,
 *  per loan product, or per portfolio."
 *
 * Everything the orchestration engine consults lives in this object, and
 * `validatePolicy` exists because the onboarding PRD requires "guardrails to
 * prevent invalid combinations".
 */

export interface DebitPolicy {
  partialRecoveryEnabled: boolean
  minPartialAmount: number
  maxAttemptsPerAccountPerDay: number
  maxAttemptsPerCycle: number
  railPriority: Rail[]
  /** Hours after the first attempt at which each retry fires. */
  retryIntervalsHours: number[]
  quietHours: { from: string; to: string }
  coolDownHoursAfterFailures: number
  failuresBeforeCoolDown: number
}

export interface MandatePolicy {
  maxMandatesPerBorrower: number
  mandateExpiryDays: number
  autoRefreshAfterDays: number
  excludeDormantAccounts: boolean
  validationWindowHours: number
  reminderHours: number[]
}

export interface EscalationPolicy {
  cyclesToAtRisk: number
  cyclesToCollections: number
  cyclesToLegal: number
  overrideRoles: string[]
}

export interface CircuitBreakerPolicy {
  railFailureRateThreshold: number
  minimumSampleSize: number
  autoThrottleRetryStorm: number
}

export interface RecoveryPolicy {
  id: string
  name: string
  scope: string
  debit: DebitPolicy
  mandate: MandatePolicy
  escalation: EscalationPolicy
  circuitBreaker: CircuitBreakerPolicy
  updatedAt: string
  updatedBy: string
}

/**
 * Default policy mirrors the retry table in the overview PRD:
 * first attempt on due date, then +24h, +72h, +7d (168h).
 */
export const DEFAULT_POLICY: RecoveryPolicy = {
  id: "POL-RETRY-001",
  name: "VFD MFB — Retail Default",
  scope: "All retail loan products",
  debit: {
    partialRecoveryEnabled: true,
    minPartialAmount: 1000,
    maxAttemptsPerAccountPerDay: 2,
    maxAttemptsPerCycle: 4,
    railPriority: ["NDD", "REMITA", "EASY_PAY"],
    retryIntervalsHours: [24, 72, 168],
    quietHours: { from: "22:00", to: "06:00" },
    coolDownHoursAfterFailures: 48,
    failuresBeforeCoolDown: 3,
  },
  mandate: {
    maxMandatesPerBorrower: 5,
    mandateExpiryDays: 365,
    autoRefreshAfterDays: 300,
    excludeDormantAccounts: true,
    validationWindowHours: 24,
    reminderHours: [6, 12, 18, 24],
  },
  escalation: {
    cyclesToAtRisk: 2,
    cyclesToCollections: 3,
    cyclesToLegal: 4,
    overrideRoles: ["DRM", "SUPER_ADMIN"],
  },
  circuitBreaker: {
    railFailureRateThreshold: 0.4,
    minimumSampleSize: 100,
    autoThrottleRetryStorm: 500,
  },
  updatedAt: "2026-08-04T09:12:00Z",
  updatedBy: "Adaora Nwosu",
}

export interface PolicyViolation {
  field: string
  message: string
  severity: "ERROR" | "WARNING"
}

/**
 * Blocks the invalid combinations the PRD calls out as real operational risks:
 * retry timing that outruns settlement windows, escalation tiers out of order,
 * and partial thresholds that would generate uneconomic debits.
 */
export function validatePolicy(policy: RecoveryPolicy): PolicyViolation[] {
  const issues: PolicyViolation[] = []
  const { debit, escalation, mandate } = policy

  if (debit.retryIntervalsHours.some((h) => h < 24)) {
    issues.push({
      field: "debit.retryIntervalsHours",
      message:
        "Retry intervals under 24h risk double-debiting during NDD/Remita settlement lag.",
      severity: "ERROR",
    })
  }

  const ascending = debit.retryIntervalsHours.every(
    (h, i, arr) => i === 0 || h > arr[i - 1]
  )
  if (!ascending) {
    issues.push({
      field: "debit.retryIntervalsHours",
      message: "Retry intervals must increase monotonically.",
      severity: "ERROR",
    })
  }

  if (debit.retryIntervalsHours.length + 1 > debit.maxAttemptsPerCycle) {
    issues.push({
      field: "debit.maxAttemptsPerCycle",
      message: `Schedule defines ${
        debit.retryIntervalsHours.length + 1
      } attempts but the cycle cap is ${debit.maxAttemptsPerCycle}.`,
      severity: "ERROR",
    })
  }

  if (debit.partialRecoveryEnabled && debit.minPartialAmount < 500) {
    issues.push({
      field: "debit.minPartialAmount",
      message:
        "Minimum partial below ₦500 costs more in rail fees than it recovers.",
      severity: "WARNING",
    })
  }

  if (
    !(
      escalation.cyclesToAtRisk < escalation.cyclesToCollections &&
      escalation.cyclesToCollections < escalation.cyclesToLegal
    )
  ) {
    issues.push({
      field: "escalation",
      message:
        "Escalation thresholds must strictly increase: At Risk → Collections → Legal.",
      severity: "ERROR",
    })
  }

  if (mandate.autoRefreshAfterDays >= mandate.mandateExpiryDays) {
    issues.push({
      field: "mandate.autoRefreshAfterDays",
      message:
        "Auto-refresh must trigger before expiry, otherwise mandates lapse silently.",
      severity: "ERROR",
    })
  }

  if (debit.railPriority.length === 0) {
    issues.push({
      field: "debit.railPriority",
      message: "At least one recovery rail must be enabled.",
      severity: "ERROR",
    })
  }

  return issues
}

/** Quiet-hours check — no debit attempts are scheduled inside the window. */
export function isWithinQuietHours(
  date: Date,
  quietHours: DebitPolicy["quietHours"]
): boolean {
  const minutes = date.getHours() * 60 + date.getMinutes()
  const [fromH, fromM] = quietHours.from.split(":").map(Number)
  const [toH, toM] = quietHours.to.split(":").map(Number)
  const from = fromH * 60 + fromM
  const to = toH * 60 + toM
  // Window wraps past midnight (e.g. 22:00 → 06:00).
  return from > to ? minutes >= from || minutes < to : minutes >= from && minutes < to
}
