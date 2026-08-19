import type { EscalationTier, RecoveryCase, RecoveryState } from "./types"
import type { Permission } from "./rbac"

/**
 * Deterministic recovery state machine.
 *
 * The PRD is explicit that recovery behaviour must never be implicit:
 * "All loans under recovery shall be governed by a deterministic state machine
 *  to prevent inconsistent behaviour and ensure auditability."
 *
 * Transitions are event-driven and every guarded edge names the permission
 * required to traverse it, so the UI can grey out what a role may not do
 * instead of failing the action after the fact.
 */

export interface Transition {
  to: RecoveryState
  event: string
  /** Permission required for a human to force this transition. */
  requires?: Permission
  /** True when only the engine may perform it (no manual override). */
  systemOnly?: boolean
}

export const TRANSITIONS: Record<RecoveryState, Transition[]> = {
  ACTIVE: [{ to: "DUE", event: "obligation.due", systemOnly: true }],
  DUE: [
    { to: "IN_RECOVERY", event: "recovery.initiated", requires: "recovery.initiate" },
    { to: "OVERDUE", event: "obligation.overdue", systemOnly: true },
    { to: "CLOSED_PAID", event: "payment.settled", systemOnly: true },
  ],
  OVERDUE: [
    { to: "IN_RECOVERY", event: "recovery.initiated", requires: "recovery.initiate" },
    { to: "DISPUTE_OPEN", event: "dispute.created", requires: "dispute.create" },
  ],
  IN_RECOVERY: [
    { to: "PARTIALLY_RECOVERED", event: "debit.partial", systemOnly: true },
    { to: "CLOSED_PAID", event: "debit.success.full", systemOnly: true },
    { to: "AT_RISK", event: "cycle.failed.2", systemOnly: true },
    { to: "DISPUTE_OPEN", event: "dispute.created", requires: "dispute.create" },
    { to: "RECOVERY_FAILED", event: "retries.exhausted", systemOnly: true },
  ],
  PARTIALLY_RECOVERED: [
    { to: "IN_RECOVERY", event: "retry.scheduled", requires: "recovery.retry" },
    { to: "CLOSED_PAID", event: "balance.cleared", systemOnly: true },
    { to: "AT_RISK", event: "cycle.failed.2", systemOnly: true },
    { to: "DISPUTE_OPEN", event: "dispute.created", requires: "dispute.create" },
  ],
  AT_RISK: [
    { to: "COLLECTIONS", event: "escalation.tier3", requires: "escalation.trigger" },
    { to: "IN_RECOVERY", event: "recovery.resumed", requires: "recovery.resume" },
    { to: "DISPUTE_OPEN", event: "dispute.created", requires: "dispute.create" },
    { to: "CLOSED_PAID", event: "balance.cleared", systemOnly: true },
  ],
  COLLECTIONS: [
    { to: "LEGAL_REVIEW", event: "escalation.legal", requires: "legal.escalate" },
    { to: "IN_RECOVERY", event: "payment.plan.agreed", requires: "collections.manage" },
    { to: "CLOSED_PAID", event: "balance.cleared", systemOnly: true },
    { to: "DISPUTE_OPEN", event: "dispute.created", requires: "dispute.create" },
  ],
  LEGAL_REVIEW: [
    { to: "WRITE_OFF", event: "loan.written.off", requires: "recovery.override" },
    { to: "CLOSED_PAID", event: "balance.cleared", systemOnly: true },
    { to: "COLLECTIONS", event: "legal.returned", requires: "collections.assign" },
  ],
  DISPUTE_OPEN: [
    { to: "IN_RECOVERY", event: "dispute.upheld", requires: "dispute.resolve" },
    { to: "PARTIALLY_RECOVERED", event: "dispute.partial.refund", requires: "dispute.resolve" },
    { to: "CLOSED_PAID", event: "dispute.invalid.refunded", requires: "dispute.resolve" },
  ],
  RECOVERY_FAILED: [
    { to: "COLLECTIONS", event: "escalation.tier3", requires: "escalation.trigger" },
    { to: "IN_RECOVERY", event: "mandate.refreshed", requires: "recovery.retry" },
  ],
  CLOSED_PAID: [],
  WRITE_OFF: [],
}

export function allowedTransitions(state: RecoveryState): Transition[] {
  return TRANSITIONS[state] ?? []
}

export function canTransition(from: RecoveryState, to: RecoveryState): boolean {
  return allowedTransitions(from).some((t) => t.to === to)
}

export function isTerminal(state: RecoveryState): boolean {
  return allowedTransitions(state).length === 0
}

/**
 * The single most important guardrail in the product.
 *
 * "No retries must occur while a loan is in DISPUTE OPEN status. This is a
 *  critical consumer protection guardrail."
 *
 * Enforced here so the scheduler, the orchestration engine and the manual
 * replay button in the UI all consult one implementation.
 */
export interface RetryEligibility {
  allowed: boolean
  reason?: string
}

export function retryEligibility(c: RecoveryCase): RetryEligibility {
  if (c.state === "DISPUTE_OPEN") {
    return {
      allowed: false,
      reason: "Loan is in DISPUTE OPEN — retries are blocked until the dispute closes.",
    }
  }
  if (c.recoveryPaused) {
    return {
      allowed: false,
      reason: c.pauseReason ?? "Recovery is paused for this loan.",
    }
  }
  if (c.state === "CLOSED_PAID" || c.state === "WRITE_OFF") {
    return { allowed: false, reason: "Loan has reached a terminal state." }
  }
  if (c.state === "LEGAL_REVIEW") {
    return {
      allowed: false,
      reason: "Loan is under legal review — automated recovery is suspended.",
    }
  }
  return { allowed: true }
}

/** Escalation tier derived from completed failed recovery cycles. */
export function tierForFailedCycles(cycles: number): EscalationTier {
  if (cycles >= 4) return "LGL"
  if (cycles >= 3) return "T3"
  if (cycles >= 2) return "T2"
  return "T1"
}
