import type { Role } from "./rbac"

/**
 * Onboarding orchestration.
 *
 * PRD principle: "Configuration before activation" and "Environment-gated:
 * onboarding progresses from sandbox to UAT to production, not directly to
 * live." The critical guardrail is that no organisation can initiate live
 * recovery until every checklist item passes — enforced by
 * `canActivate()` rather than by operator discipline.
 */

export type OnboardingState =
  | "INVITED"
  | "PROFILE_IN_PROGRESS"
  | "COMPLIANCE_REVIEW"
  | "CONFIGURATION_IN_PROGRESS"
  | "SANDBOX_READY"
  | "UAT_CERTIFIED"
  | "PRODUCTION_ACTIVE"

export const ONBOARDING_STATE_LABEL: Record<OnboardingState, string> = {
  INVITED: "Invited",
  PROFILE_IN_PROGRESS: "Profile In Progress",
  COMPLIANCE_REVIEW: "Compliance Review",
  CONFIGURATION_IN_PROGRESS: "Configuration In Progress",
  SANDBOX_READY: "Sandbox Ready",
  UAT_CERTIFIED: "UAT Certified",
  PRODUCTION_ACTIVE: "Production Active",
}

export const ONBOARDING_EXIT_CONDITION: Record<OnboardingState, string> = {
  INVITED: "Invite accepted",
  PROFILE_IN_PROGRESS: "Required fields validated",
  COMPLIANCE_REVIEW: "Approved by VFD team",
  CONFIGURATION_IN_PROGRESS: "Mandatory settings completed",
  SANDBOX_READY: "Test suite started",
  UAT_CERTIFIED: "Go-live approved",
  PRODUCTION_ACTIVE: "Operational use begins",
}

export const ONBOARDING_ORDER: OnboardingState[] = [
  "INVITED",
  "PROFILE_IN_PROGRESS",
  "COMPLIANCE_REVIEW",
  "CONFIGURATION_IN_PROGRESS",
  "SANDBOX_READY",
  "UAT_CERTIFIED",
  "PRODUCTION_ACTIVE",
]

export function stageIndex(state: OnboardingState): number {
  return ONBOARDING_ORDER.indexOf(state)
}

export type Environment = "SANDBOX" | "UAT" | "PRODUCTION"

/* ------------------------------------------------------------------ */
/* Activation checklist                                                */
/* ------------------------------------------------------------------ */

export type ChecklistKey =
  | "adminVerified"
  | "rolesAssigned"
  | "profileComplete"
  | "sandboxCredentials"
  | "webhookValidated"
  | "policiesConfigured"
  | "notificationsConfigured"
  | "uatPassed"
  | "productionApproved"

export interface ChecklistItem {
  key: ChecklistKey
  label: string
  detail: string
  /** The stage at which this item must be satisfied. */
  stage: OnboardingState
}

export const ACTIVATION_CHECKLIST: ChecklistItem[] = [
  {
    key: "adminVerified",
    label: "Admin account created and verified",
    detail: "Primary admin has accepted the invite and passed OTP verification.",
    stage: "PROFILE_IN_PROGRESS",
  },
  {
    key: "rolesAssigned",
    label: "Roles and permissions assigned",
    detail: "Every invited user holds an approved role with entitlements applied.",
    stage: "PROFILE_IN_PROGRESS",
  },
  {
    key: "profileComplete",
    label: "Organisation profile and compliance details completed",
    detail: "Legal name, service model, contacts and compliance artefacts submitted.",
    stage: "COMPLIANCE_REVIEW",
  },
  {
    key: "sandboxCredentials",
    label: "Sandbox credentials issued and tested",
    detail: "API key provisioned and a first successful call recorded.",
    stage: "CONFIGURATION_IN_PROGRESS",
  },
  {
    key: "webhookValidated",
    label: "Webhook endpoint validated",
    detail: "Signed test payload delivered and acknowledged within tolerance.",
    stage: "CONFIGURATION_IN_PROGRESS",
  },
  {
    key: "policiesConfigured",
    label: "Recovery and dispute policies configured",
    detail: "Rails, retry ladder, escalation thresholds and quiet hours set and valid.",
    stage: "CONFIGURATION_IN_PROGRESS",
  },
  {
    key: "notificationsConfigured",
    label: "Notification templates and recipients configured",
    detail: "Borrower and operator messaging enabled for every lifecycle event.",
    stage: "CONFIGURATION_IN_PROGRESS",
  },
  {
    key: "uatPassed",
    label: "UAT scenarios passed and signed off",
    detail: "Consent, mandate, debit, webhook and reversal scenarios all green.",
    stage: "SANDBOX_READY",
  },
  {
    key: "productionApproved",
    label: "Production approval granted by VFD Admin",
    detail: "Internal approver has countersigned go-live.",
    stage: "UAT_CERTIFIED",
  },
]

export type ChecklistStatus = Record<ChecklistKey, boolean>

export interface ActivationVerdict {
  canActivate: boolean
  outstanding: ChecklistItem[]
  completed: number
  total: number
  progress: number
}

/**
 * The hard gate. Production activation is refused until every checklist item
 * passes — "no organisation or user should be able to initiate live recovery
 * activity until production activation is approved".
 */
export function evaluateActivation(status: ChecklistStatus): ActivationVerdict {
  const outstanding = ACTIVATION_CHECKLIST.filter((item) => !status[item.key])
  const completed = ACTIVATION_CHECKLIST.length - outstanding.length
  return {
    canActivate: outstanding.length === 0,
    outstanding,
    completed,
    total: ACTIVATION_CHECKLIST.length,
    progress: (completed / ACTIVATION_CHECKLIST.length) * 100,
  }
}

/* ------------------------------------------------------------------ */
/* Sandbox certification scenarios                                     */
/* ------------------------------------------------------------------ */

export type ScenarioOutcome = "PASSED" | "FAILED" | "NOT_RUN"

export interface CertificationScenario {
  id: string
  name: string
  description: string
  /** The simulated NIBSS response this scenario exercises. */
  simulates: string
  required: boolean
}

export const CERTIFICATION_SCENARIOS: CertificationScenario[] = [
  {
    id: "sc_consent",
    name: "Consent granted",
    description: "Initiate consent, validate OTP, retrieve BVN data and linked accounts.",
    simulates: "iGree happy path",
    required: true,
  },
  {
    id: "sc_consent_declined",
    name: "Consent declined",
    description: "Borrower declines — application must halt with consent_denied.",
    simulates: "iGree consent_denied",
    required: true,
  },
  {
    id: "sc_mandate",
    name: "Mandate approved",
    description: "Create a mandate, complete validation, receive approval callback.",
    simulates: "NDD mandate approval",
    required: true,
  },
  {
    id: "sc_mandate_failed",
    name: "Mandate failed",
    description: "Dormant account rejection triggers the alternate-account path.",
    simulates: "NDD ACCOUNT_DORMANT",
    required: true,
  },
  {
    id: "sc_debit_success",
    name: "Debit successful",
    description: "Full recovery with settlement confirmation and ledger finalisation.",
    simulates: "NDD debit success",
    required: true,
  },
  {
    id: "sc_insufficient",
    name: "Insufficient funds",
    description: "Failed debit schedules a retry and emits recovery.failed.",
    simulates: "NDD INSUFFICIENT_FUNDS",
    required: true,
  },
  {
    id: "sc_partial",
    name: "Partial recovery",
    description: "Balance below amount due but above the partial threshold.",
    simulates: "EasyPay partial debit",
    required: true,
  },
  {
    id: "sc_reversal",
    name: "Reversal received",
    description: "Bank reverses a settled debit; ledger posts a linked reversal entry.",
    simulates: "NDD reversal",
    required: true,
  },
  {
    id: "sc_dispute",
    name: "Dispute created",
    description: "Dispute pauses recovery and emits dispute.created.",
    simulates: "Borrower dispute",
    required: true,
  },
  {
    id: "sc_idempotency",
    name: "Idempotent replay",
    description: "Same idempotency key replayed must not produce a second debit.",
    simulates: "Duplicate request",
    required: true,
  },
]

/* ------------------------------------------------------------------ */
/* Role landing — each role lands on the surface it works from         */
/* ------------------------------------------------------------------ */

export const ROLE_LANDING: Record<Role, { href: string; focus: string }> = {
  SUPER_ADMIN: { href: "/organisations", focus: "Tenants, users, products, rails, environment readiness" },
  ADMIN: { href: "/organisations", focus: "Tenants, users, products, rails, environment readiness" },
  DRO: { href: "/action-queues/failed-recovery", focus: "Active cases, failed debits, retries due, partial recoveries" },
  DRM: { href: "/action-queues", focus: "Escalations, at-risk accounts, override queue, policy exceptions" },
  FINANCE: { href: "/reconciliation", focus: "Settlements, unmatched transactions, reversals, exports" },
  LEGAL: { href: "/legal-review", focus: "Escalated cases awaiting legal review" },
  INTEGRATOR: { href: "/developer", focus: "API keys, webhooks, sandbox scenarios" },
}
