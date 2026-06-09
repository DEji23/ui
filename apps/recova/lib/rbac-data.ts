import type { RecoveryRail } from "./mock-data"

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "DRO" | "DRM" | "FINANCE_OPS" | "LEGAL" | "INTEGRATOR"

export type PermissionKey =
  | "recovery.create_customer" | "recovery.initiate" | "recovery.retry"
  | "recovery.pause" | "recovery.resume" | "recovery.override"
  | "mandate.create" | "mandate.retry" | "mandate.cancel" | "mandate.view"
  | "refund.initiate" | "refund.approve" | "refund.execute"
  | "ledger.view" | "reconciliation.run"
  | "dispute.create" | "dispute.review" | "dispute.resolve" | "dispute.override"
  | "escalation.trigger" | "collections.assign" | "collections.manage" | "legal.escalate"
  | "role.create" | "role.assign" | "policy.configure" | "webhook.configure"
  | "report.view" | "report.export" | "audit.view"

export type AllocationStrategy = "ROUND_ROBIN" | "LOAD_BALANCED" | "SKILL_BASED" | "MANUAL"

export type WorkflowState =
  | "ACTIVE" | "DUE" | "IN_RECOVERY" | "PARTIALLY_RECOVERED"
  | "AT_RISK" | "LEGAL_REVIEW" | "DISPUTE_OPEN" | "CLOSED_PAID"

export interface RoleDefinition {
  role: UserRole
  label: string
  description: string
  permissions: PermissionKey[]
  cannotDo: string[]
  userCount: number
}

export interface PermissionGroup {
  category: string
  permissions: { key: PermissionKey; label: string; description: string }[]
}

export interface WorkflowOwnership {
  state: WorkflowState
  stateLabel: string
  ownerRole: UserRole | null
  ownerLabel: string
}

export interface AssignmentRule {
  id: string
  triggerEvent: string
  triggerLabel: string
  role: UserRole
  allocationStrategy: AllocationStrategy
  conditions: string | null
  active: boolean
}

export interface ApprovalPolicy {
  id: string
  action: string
  actionLabel: string
  threshold: number | null
  requiredApprovers: UserRole[]
  description: string
  active: boolean
}

export interface RBACKPIs {
  unauthorizedAttempts: number
  activeRoles: number
  pendingAssignments: number
  avgApprovalHours: number
  roleAssignmentErrors: number
  taskCompletionOwnership: number
}

const ALL_PERMISSIONS: PermissionKey[] = [
  "recovery.create_customer", "recovery.initiate", "recovery.retry", "recovery.pause", "recovery.resume", "recovery.override",
  "mandate.create", "mandate.retry", "mandate.cancel", "mandate.view",
  "refund.initiate", "refund.approve", "refund.execute", "ledger.view", "reconciliation.run",
  "dispute.create", "dispute.review", "dispute.resolve", "dispute.override",
  "escalation.trigger", "collections.assign", "collections.manage", "legal.escalate",
  "role.create", "role.assign", "policy.configure", "webhook.configure",
  "report.view", "report.export", "audit.view",
]

export const rbacKPIs: RBACKPIs = {
  unauthorizedAttempts: 0,
  activeRoles: 6,
  pendingAssignments: 3,
  avgApprovalHours: 4.2,
  roleAssignmentErrors: 0,
  taskCompletionOwnership: 94.7,
}

export const permissionGroups: PermissionGroup[] = [
  {
    category: "A. Recovery Operations",
    permissions: [
      { key: "recovery.create_customer", label: "Create Customer",     description: "Create new customer profile" },
      { key: "recovery.initiate",        label: "Initiate Recovery",   description: "Trigger debit attempt" },
      { key: "recovery.retry",           label: "Retry Debit",         description: "Manually retry debit" },
      { key: "recovery.pause",           label: "Pause Recovery",      description: "Pause recovery workflow" },
      { key: "recovery.resume",          label: "Resume Recovery",     description: "Resume paused recovery" },
      { key: "recovery.override",        label: "Override Policy",     description: "Force debit outside policy" },
    ],
  },
  {
    category: "B. Mandate Management",
    permissions: [
      { key: "mandate.create", label: "Create Mandate", description: "Create new mandate" },
      { key: "mandate.retry",  label: "Retry Setup",    description: "Retry mandate setup" },
      { key: "mandate.cancel", label: "Cancel Mandate", description: "Cancel active mandate" },
      { key: "mandate.view",   label: "View Mandate",   description: "View mandate details" },
    ],
  },
  {
    category: "C. Financial Actions",
    permissions: [
      { key: "refund.initiate",      label: "Initiate Refund",      description: "Create refund request" },
      { key: "refund.approve",       label: "Approve Refund",       description: "Approve refund" },
      { key: "refund.execute",       label: "Execute Refund",       description: "Trigger refund payment" },
      { key: "ledger.view",          label: "View Ledger",          description: "Read ledger entries" },
      { key: "reconciliation.run",   label: "Run Reconciliation",   description: "Execute reconciliation" },
    ],
  },
  {
    category: "D. Dispute Management",
    permissions: [
      { key: "dispute.create",   label: "Create Dispute",   description: "Create dispute" },
      { key: "dispute.review",   label: "Review Dispute",   description: "Review dispute" },
      { key: "dispute.resolve",  label: "Resolve Dispute",  description: "Resolve dispute" },
      { key: "dispute.override", label: "Override Outcome", description: "Override dispute outcome" },
    ],
  },
  {
    category: "E. Escalation & Collections",
    permissions: [
      { key: "escalation.trigger",  label: "Trigger Escalation", description: "Move loan to next tier" },
      { key: "collections.assign",  label: "Assign Case",         description: "Assign collection case" },
      { key: "collections.manage",  label: "Manage Case",         description: "Edit case data" },
      { key: "legal.escalate",      label: "Legal Escalation",    description: "Send to legal" },
    ],
  },
  {
    category: "F. System Configuration",
    permissions: [
      { key: "role.create",       label: "Create Role",        description: "Create custom roles" },
      { key: "role.assign",       label: "Assign Role",        description: "Assign roles to users" },
      { key: "policy.configure",  label: "Configure Policy",   description: "Configure recovery rules" },
      { key: "webhook.configure", label: "Manage Webhooks",    description: "Configure webhooks" },
    ],
  },
  {
    category: "G. Reporting & Audit",
    permissions: [
      { key: "report.view",   label: "View Reports",   description: "View reports" },
      { key: "report.export", label: "Export Reports", description: "Export reports" },
      { key: "audit.view",    label: "View Audit Log", description: "View audit trail" },
    ],
  },
]

export const roleDefinitions: RoleDefinition[] = [
  {
    role: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Platform-wide controller with all permissions",
    permissions: ALL_PERMISSIONS,
    cannotDo: [],
    userCount: 1,
  },
  {
    role: "ADMIN",
    label: "Admin",
    description: "Org-level configuration and management",
    permissions: ["role.assign", "policy.configure", "webhook.configure", "report.view", "report.export", "audit.view"],
    cannotDo: ["Execute debits", "Approve refunds"],
    userCount: 3,
  },
  {
    role: "DRO",
    label: "DRO",
    description: "Operates recovery workflows day-to-day",
    permissions: ["recovery.create_customer", "recovery.initiate", "recovery.retry", "recovery.pause", "mandate.create", "mandate.view", "dispute.create", "collections.manage"],
    cannotDo: ["Approve refunds", "Escalate to legal"],
    userCount: 12,
  },
  {
    role: "DRM",
    label: "DRM",
    description: "Oversees and approves recovery operations",
    permissions: ["recovery.override", "recovery.pause", "recovery.resume", "escalation.trigger", "collections.assign", "dispute.resolve", "report.view"],
    cannotDo: ["Initiate refunds without Finance approval"],
    userCount: 4,
  },
  {
    role: "FINANCE_OPS",
    label: "Finance / Ops",
    description: "Handles settlements and reconciliation",
    permissions: ["refund.approve", "refund.execute", "ledger.view", "reconciliation.run", "dispute.review", "report.view", "report.export"],
    cannotDo: ["Initiate recovery", "Access mandate setup"],
    userCount: 5,
  },
  {
    role: "LEGAL",
    label: "Legal",
    description: "Handles escalated and legal cases",
    permissions: ["legal.escalate", "audit.view", "collections.manage", "report.view"],
    cannotDo: ["Trigger debits", "Access financial settlements"],
    userCount: 2,
  },
  {
    role: "INTEGRATOR",
    label: "Integrator",
    description: "API-only access with scoped keys, no dashboard",
    permissions: [],
    cannotDo: ["Dashboard access", "Manual actions"],
    userCount: 8,
  },
]

export const workflowOwnership: WorkflowOwnership[] = [
  { state: "ACTIVE",               stateLabel: "Active",               ownerRole: null,          ownerLabel: "None" },
  { state: "DUE",                  stateLabel: "Due",                  ownerRole: null,          ownerLabel: "System" },
  { state: "IN_RECOVERY",          stateLabel: "In Recovery",          ownerRole: "DRO",         ownerLabel: "DRO" },
  { state: "PARTIALLY_RECOVERED",  stateLabel: "Partially Recovered",  ownerRole: "DRO",         ownerLabel: "DRO" },
  { state: "AT_RISK",              stateLabel: "At Risk",              ownerRole: "DRM",         ownerLabel: "DRM" },
  { state: "LEGAL_REVIEW",         stateLabel: "Legal Review",         ownerRole: "LEGAL",       ownerLabel: "Legal" },
  { state: "DISPUTE_OPEN",         stateLabel: "Dispute Open",         ownerRole: "FINANCE_OPS", ownerLabel: "Finance / Ops" },
  { state: "CLOSED_PAID",          stateLabel: "Closed / Paid",        ownerRole: "FINANCE_OPS", ownerLabel: "Finance / Ops" },
]

export const assignmentRules: AssignmentRule[] = [
  { id: "RULE-001", triggerEvent: "loan.enter_recovery",   triggerLabel: "Loan enters recovery",       role: "DRO",         allocationStrategy: "ROUND_ROBIN",   conditions: null,             active: true },
  { id: "RULE-002", triggerEvent: "loan.escalated_tier_2", triggerLabel: "Loan escalated to Tier 2",   role: "DRM",         allocationStrategy: "LOAD_BALANCED", conditions: "dpd > 30",       active: true },
  { id: "RULE-003", triggerEvent: "loan.legal_review",     triggerLabel: "Loan sent to legal review",  role: "LEGAL",       allocationStrategy: "MANUAL",        conditions: "dpd > 180",      active: true },
  { id: "RULE-004", triggerEvent: "dispute.opened",        triggerLabel: "Dispute opened",             role: "FINANCE_OPS", allocationStrategy: "ROUND_ROBIN",   conditions: null,             active: true },
  { id: "RULE-005", triggerEvent: "loan.at_risk",          triggerLabel: "Loan flagged at risk",       role: "DRM",         allocationStrategy: "SKILL_BASED",  conditions: "outstanding > 500000", active: true },
  { id: "RULE-006", triggerEvent: "mandate.failed",        triggerLabel: "Mandate setup failed",       role: "DRO",         allocationStrategy: "LOAD_BALANCED", conditions: null,             active: false },
]

export const approvalPolicies: ApprovalPolicy[] = [
  { id: "APL-001", action: "refund.execute",    actionLabel: "Execute Refund",          threshold: 50000,  requiredApprovers: ["FINANCE_OPS", "ADMIN"],             description: "Refunds above ₦50,000 require Finance + Admin approval",    active: true },
  { id: "APL-002", action: "recovery.override", actionLabel: "Recovery Policy Override", threshold: null,   requiredApprovers: ["DRM", "ADMIN"],                    description: "Any policy override requires DRM and Admin sign-off",       active: true },
  { id: "APL-003", action: "write_off",         actionLabel: "Loan Write-Off",           threshold: 500000, requiredApprovers: ["DRM", "ADMIN", "FINANCE_OPS"],     description: "Write-offs above ₦500K require 3-level approval",            active: true },
  { id: "APL-004", action: "legal.escalate",    actionLabel: "Legal Escalation",        threshold: null,   requiredApprovers: ["DRM"],                             description: "Legal escalations require DRM approval",                    active: true },
  { id: "APL-005", action: "mandate.cancel",    actionLabel: "Mandate Cancellation",    threshold: null,   requiredApprovers: ["DRM"],                             description: "Mandate cancellations require manager sign-off",            active: true },
]
