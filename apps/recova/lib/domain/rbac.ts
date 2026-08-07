/**
 * Action-level RBAC.
 *
 * The RBAC PRD is explicit that permissions are atomic actions, not screens:
 * "Action-Level Control (Not screen-level) — e.g. 'approve refund' instead of
 *  'Finance page access'". Screens therefore ask `can(role, "refund.approve")`
 * rather than checking the role name directly.
 */

export const PERMISSIONS = [
  // Recovery operations
  "recovery.create_customer",
  "recovery.initiate",
  "recovery.retry",
  "recovery.pause",
  "recovery.resume",
  "recovery.override",
  // Mandate management
  "mandate.create",
  "mandate.retry",
  "mandate.cancel",
  "mandate.view",
  // Financial actions
  "refund.initiate",
  "refund.approve",
  "refund.execute",
  "ledger.view",
  "reconciliation.run",
  // Dispute management
  "dispute.create",
  "dispute.review",
  "dispute.resolve",
  "dispute.override",
  // Escalation & collections
  "escalation.trigger",
  "collections.assign",
  "collections.manage",
  "legal.escalate",
  // System configuration
  "role.create",
  "role.assign",
  "policy.configure",
  "webhook.configure",
  // Reporting & audit
  "report.view",
  "report.export",
  "audit.view",
] as const

export type Permission = (typeof PERMISSIONS)[number]

export const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "DRO",
  "DRM",
  "FINANCE",
  "COMPLIANCE",
  "LEGAL",
  "SUPPORT",
  "TECH_OPS",
  "INTEGRATOR",
] as const

export type Role = (typeof ROLES)[number]

export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  DRO: "Debt Recovery Officer",
  DRM: "Debt Recovery Manager",
  FINANCE: "Finance / Ops",
  COMPLIANCE: "Compliance",
  LEGAL: "Legal",
  SUPPORT: "Customer Support",
  TECH_OPS: "Technology Operations",
  INTEGRATOR: "Integrator",
}

/**
 * Role → permission mapping, transcribed from RBAC PRD §5.
 * Separation of duties is preserved: no role both initiates and approves a
 * refund, and DRO explicitly cannot approve refunds or escalate to legal.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  ADMIN: [
    "role.assign",
    "policy.configure",
    "webhook.configure",
    "report.view",
    "report.export",
    "audit.view",
    "mandate.view",
  ],
  DRO: [
    "recovery.create_customer",
    "recovery.initiate",
    "recovery.retry",
    "mandate.create",
    "mandate.retry",
    "mandate.view",
    "dispute.create",
    "collections.manage",
    "report.view",
  ],
  DRM: [
    "recovery.initiate",
    "recovery.retry",
    "recovery.pause",
    "recovery.resume",
    "recovery.override",
    "mandate.view",
    "mandate.cancel",
    "escalation.trigger",
    "collections.assign",
    "collections.manage",
    "dispute.review",
    "dispute.resolve",
    // Onboarding PRD Phase 3 lists "Approve refunds" as a DRM permission.
    "refund.approve",
    "report.view",
    "report.export",
    "audit.view",
  ],
  FINANCE: [
    "refund.initiate",
    "refund.approve",
    "refund.execute",
    "ledger.view",
    "reconciliation.run",
    "dispute.review",
    "report.view",
    "report.export",
    "audit.view",
  ],
  // Onboarding PRD Phase 3: Audit Logs, Consent Records, Reports, Disputes.
  COMPLIANCE: ["audit.view", "report.view", "report.export", "dispute.review", "mandate.view"],
  LEGAL: ["legal.escalate", "audit.view", "collections.manage", "report.view"],
  // Not itemised in the onboarding PRD's permission table — scoped narrowly
  // to read-only borrower/mandate visibility until a dedicated support
  // capability is specified.
  SUPPORT: ["mandate.view", "report.view"],
  // Onboarding PRD Phase 3: API Health, Scheduler, Queue Monitoring,
  // Integration Status — closest existing action-level permissions.
  TECH_OPS: ["webhook.configure", "audit.view", "report.view"],
  INTEGRATOR: [],
}

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function canAll(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => can(role, p))
}

/**
 * Sensitive actions requiring maker-checker.
 * PRD: "Consideration should be given to maker-checker approval for sensitive
 *  actions such as Legal Review escalation, Write Off, policy exception,
 *  refund approval, or mandate override."
 */
export const MAKER_CHECKER_ACTIONS: Permission[] = [
  "recovery.override",
  "legal.escalate",
  "refund.approve",
  "policy.configure",
  "dispute.override",
]

export function requiresMakerChecker(permission: Permission): boolean {
  return MAKER_CHECKER_ACTIONS.includes(permission)
}

/** Workflow ownership per recovery state — RBAC PRD §6.1. */
export const STATE_OWNER: Record<string, Role | "SYSTEM" | "NONE"> = {
  ACTIVE: "NONE",
  DUE: "SYSTEM",
  IN_RECOVERY: "DRO",
  PARTIALLY_RECOVERED: "DRO",
  AT_RISK: "DRM",
  COLLECTIONS: "DRM",
  LEGAL_REVIEW: "LEGAL",
  DISPUTE_OPEN: "FINANCE",
  RECOVERY_FAILED: "DRM",
  CLOSED_PAID: "FINANCE",
  WRITE_OFF: "FINANCE",
}

export type AllocationStrategy =
  | "ROUND_ROBIN"
  | "LOAD_BALANCED"
  | "SKILL_BASED"
  | "MANUAL"

export interface AssignmentRule {
  triggerEvent: string
  role: Role
  allocationStrategy: AllocationStrategy
}

export const ASSIGNMENT_RULES: AssignmentRule[] = [
  { triggerEvent: "loan.enter_recovery", role: "DRO", allocationStrategy: "ROUND_ROBIN" },
  { triggerEvent: "loan.escalated_tier_2", role: "DRM", allocationStrategy: "LOAD_BALANCED" },
  { triggerEvent: "loan.legal_review", role: "LEGAL", allocationStrategy: "MANUAL" },
  { triggerEvent: "dispute.created", role: "FINANCE", allocationStrategy: "LOAD_BALANCED" },
]
