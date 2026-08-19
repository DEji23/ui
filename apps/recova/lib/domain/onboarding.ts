import type { Role } from "./rbac"

/**
 * Onboarding orchestration — transcribed phase-for-phase from the
 * "Automated Loan Recovery Platform Onboarding Flow" document.
 *
 * Two journeys, two actors: internal staff (4 phases, activated by a
 * Platform Admin) and external lending institutions (7 phases, gated
 * environment-by-environment from registration through to go-live). Both
 * end in an explicit, named status rather than an implicit "done".
 */

/* ============================================================ */
/* Internal staff onboarding — 4 phases                          */
/* ============================================================ */

export const INTERNAL_TARGET_USERS = [
  "Platform Administrator",
  "Debt Recovery Manager (DRM)",
  "Debt Recovery Officer (DRO)",
  "Finance/Ops",
  "Compliance",
  "Legal",
  "Customer Support",
  "Technology Operations",
] as const

export type InternalPhase =
  | "USER_INVITATION"
  | "ACCOUNT_ACTIVATION"
  | "ROLE_CONFIGURATION"
  | "PRODUCT_WALKTHROUGH"

export const INTERNAL_PHASE_ORDER: InternalPhase[] = [
  "USER_INVITATION",
  "ACCOUNT_ACTIVATION",
  "ROLE_CONFIGURATION",
  "PRODUCT_WALKTHROUGH",
]

export const INTERNAL_PHASE_LABEL: Record<InternalPhase, string> = {
  USER_INVITATION: "User Invitation",
  ACCOUNT_ACTIVATION: "Account Activation",
  ROLE_CONFIGURATION: "Role Configuration",
  PRODUCT_WALKTHROUGH: "Product Walkthrough",
}

/** The named status each phase produces on exit. */
export const INTERNAL_PHASE_STATUS: Record<InternalPhase, string> = {
  USER_INVITATION: "Invitation Sent",
  ACCOUNT_ACTIVATION: "Account Activated",
  ROLE_CONFIGURATION: "Role Provisioned",
  PRODUCT_WALKTHROUGH: "Ready for Operations",
}

export function internalStageIndex(phase: InternalPhase): number {
  return INTERNAL_PHASE_ORDER.indexOf(phase)
}

export interface InternalPhaseDetail {
  phase: InternalPhase
  trigger: string
  systemActions?: string[]
  userActions?: string[]
  systemVerifies?: string[]
  status: string
}

export const INTERNAL_PHASES: InternalPhaseDetail[] = [
  {
    phase: "USER_INVITATION",
    trigger: "Platform Admin creates a new internal user.",
    systemActions: [
      "Create employee profile",
      "Assign business unit",
      "Assign Role",
      "Generate activation email",
      "Generate temporary password",
    ],
    status: "Invitation Sent",
  },
  {
    phase: "ACCOUNT_ACTIVATION",
    trigger: "User receives email.",
    userActions: [
      "Set password",
      "MFA enrollment",
      "Accept Acceptable Use Policy",
      "Accept Data Privacy Policy",
    ],
    systemVerifies: ["Password complexity", "MFA successful"],
    status: "Account Activated",
  },
  {
    phase: "ROLE_CONFIGURATION",
    trigger: "Administrator assigns a role and its permission set.",
    status: "Role Provisioned",
  },
  {
    phase: "PRODUCT_WALKTHROUGH",
    trigger: "First login.",
    status: "Ready for Operations",
  },
]

/** The interactive tour sequence shown on first login. */
export const PRODUCT_WALKTHROUGH_TOUR = [
  "Dashboard",
  "Recovery Queue",
  "Mandates",
  "Reports",
  "Audit Logs",
  "Notifications",
  "Support Centre",
]

export const PRODUCT_WALKTHROUGH_CHECKLIST = [
  "Complete profile",
  "Configure MFA",
  "Review Recovery Policies",
  "Review Operational Guide",
  "Complete training",
]

/** The frontend step sequence for the internal user journey. */
export const INTERNAL_USER_JOURNEY = [
  "Invite User",
  "Receive Email",
  "Activate Account",
  "Enable MFA",
  "Assign Role",
  "View Dashboard Tour",
  "Complete Checklist",
  "Operational Access Granted",
]

export interface RolePermissionSummary {
  role: Role
  label: string
  permissions: string[]
  /** DRM's permissions are additive on top of the DRO baseline in the PRD. */
  additional?: boolean
}

/** Phase 3 (Role Configuration) permission table, transcribed per role. */
export const ROLE_CONFIGURATION_PERMISSIONS: RolePermissionSummary[] = [
  {
    role: "DRO",
    label: "Debt Recovery Officer",
    permissions: [
      "View borrowers",
      "View mandates",
      "Initiate recovery",
      "Cannot refund",
      "Cannot write off loans",
    ],
  },
  {
    role: "DRM",
    label: "Debt Recovery Manager",
    permissions: ["Pause recovery", "Approve refunds", "Escalate legal", "Override recovery"],
    additional: true,
  },
  { role: "FINANCE", label: "Finance", permissions: ["Ledger", "Reconciliation", "Settlement"] },
  {
    role: "COMPLIANCE",
    label: "Compliance",
    permissions: ["Audit Logs", "Consent Records", "Reports", "Disputes"],
  },
  {
    role: "TECH_OPS",
    label: "Technology Operations",
    permissions: ["API Health", "Scheduler", "Queue Monitoring", "Integration Status"],
  },
]

/** Where each role lands once onboarding completes. */
export const ROLE_LANDING: Record<Role, { href: string; focus: string }> = {
  SUPER_ADMIN: { href: "/organisations", focus: "Tenants, users, products, rails, environment readiness" },
  ADMIN: { href: "/organisations", focus: "Tenants, users, products, rails, environment readiness" },
  DRO: { href: "/action-queues/failed-recovery", focus: "Active cases, failed debits, retries due, partial recoveries" },
  DRM: { href: "/action-queues", focus: "Escalations, at-risk accounts, override queue, policy exceptions" },
  FINANCE: { href: "/reconciliation", focus: "Settlements, unmatched transactions, reversals, exports" },
  COMPLIANCE: { href: "/audit-log", focus: "Audit logs, consent records, reports, dispute evidence" },
  LEGAL: { href: "/legal-review", focus: "Escalated cases awaiting legal review" },
  SUPPORT: { href: "/loan-cases", focus: "Borrower lookups, mandate status, recovery timeline" },
  TECH_OPS: { href: "/developer", focus: "API health, scheduler, queue monitoring, integration status" },
  INTEGRATOR: { href: "/developer", focus: "API keys, webhooks, sandbox scenarios" },
}

/* ============================================================ */
/* External organisation onboarding — 7 phases                   */
/* ============================================================ */

export type ExternalPhase =
  | "ORG_REGISTRATION"
  | "COMPLIANCE_APPROVAL"
  | "ADMIN_USER_CREATION"
  | "RECOVERY_POLICY_CONFIGURATION"
  | "API_INTEGRATION"
  | "SANDBOX_CERTIFICATION"
  | "PRODUCTION_APPROVAL"

export const EXTERNAL_PHASE_ORDER: ExternalPhase[] = [
  "ORG_REGISTRATION",
  "COMPLIANCE_APPROVAL",
  "ADMIN_USER_CREATION",
  "RECOVERY_POLICY_CONFIGURATION",
  "API_INTEGRATION",
  "SANDBOX_CERTIFICATION",
  "PRODUCTION_APPROVAL",
]

export const EXTERNAL_PHASE_LABEL: Record<ExternalPhase, string> = {
  ORG_REGISTRATION: "Organization Registration",
  COMPLIANCE_APPROVAL: "Compliance Approval",
  ADMIN_USER_CREATION: "Admin User Creation",
  RECOVERY_POLICY_CONFIGURATION: "Recovery Policy Configuration",
  API_INTEGRATION: "API Integration",
  SANDBOX_CERTIFICATION: "Sandbox Certification",
  PRODUCTION_APPROVAL: "Production Approval",
}

export const EXTERNAL_PHASE_STATUS_SUCCESS: Record<ExternalPhase, string> = {
  ORG_REGISTRATION: "Verification Successful",
  COMPLIANCE_APPROVAL: "Tenancy Created",
  ADMIN_USER_CREATION: "Tenant Administrator Active",
  RECOVERY_POLICY_CONFIGURATION: "Recovery Policy Published",
  API_INTEGRATION: "Integration Ready",
  SANDBOX_CERTIFICATION: "Sandbox Certified",
  PRODUCTION_APPROVAL: "Production Enabled",
}

export const EXTERNAL_PHASE_STATUS_PENDING: Partial<Record<ExternalPhase, string>> = {
  ORG_REGISTRATION: "Organization Pending Verification",
  COMPLIANCE_APPROVAL: "Tenancy Creation Incomplete",
}

export const EXTERNAL_PHASE_EXIT_CONDITION: Record<ExternalPhase, string> = {
  ORG_REGISTRATION: "Duplicate check, compliance review and business verification pass",
  COMPLIANCE_APPROVAL: "KYC, regulatory documents, contract and risk assessment approved",
  ADMIN_USER_CREATION: "Company admin activates, sets MFA and is assigned a role",
  RECOVERY_POLICY_CONFIGURATION:
    "Debit preference, retry rules, partial recovery, escalation and quiet hours published",
  API_INTEGRATION: "Authentication, signature, idempotency and webhook verification pass",
  SANDBOX_CERTIFICATION: "All required sandbox scenarios pass",
  PRODUCTION_APPROVAL: "VFD Operations approves production keys, webhooks and settlement account",
}

export function externalStageIndex(phase: ExternalPhase): number {
  return EXTERNAL_PHASE_ORDER.indexOf(phase)
}

/* --- Phase 1 — Organization Registration --- */
export const ORG_REGISTRATION_FIELDS = [
  "Company Name",
  "RC Number",
  "Business Email",
  "Contact Person",
  "Phone Number",
  "CBN License (if applicable)",
]
export const ORG_REGISTRATION_UPLOADS = ["CAC Certificate", "Regulatory License", "Authorized Signatory"]
export const ORG_REGISTRATION_SYSTEM_CHECKS = ["Duplicate check", "Compliance review", "Business verification"]

/* --- Phase 2 — Compliance Approval --- */
export const COMPLIANCE_REVIEW_ITEMS = ["KYC", "Regulatory documents", "Contract", "Risk Assessment"] as const
export type ComplianceReviewItem = (typeof COMPLIANCE_REVIEW_ITEMS)[number]
export const TENANT_PROVISIONING_STEPS = ["Create Tenant", "Generate Tenant ID", "Provision environment"]

/* --- Phase 3 — Admin User Creation --- */
export const ADMIN_CREATION_FIELDS = ["Name", "Email", "Phone"]
export const ADMIN_ACTIVATION_STEPS = ["Activation email", "Password setup", "MFA", "Role Assignment"]

/* --- Phase 4 — Recovery Policy Configuration --- */
export type DebitPreference = "NDD_REMITA_EASYPAY" | "REMITA_NDD_EASYPAY" | "NDD_REMITA"
export const DEBIT_PREFERENCE_LABEL: Record<DebitPreference, string> = {
  NDD_REMITA_EASYPAY: "NDD/Remita → EasyPay",
  REMITA_NDD_EASYPAY: "Remita/NDD → EasyPay",
  NDD_REMITA: "NDD/Remita",
}
export const RETRY_RULE_OPTIONS = ["24 Hours", "72 Hours", "7 Days", "Maximum Attempts"]
export const ESCALATION_STAGES = ["At Risk", "Collections", "Legal Review"]

export interface RecoveryPolicyDraft {
  debitPreference: DebitPreference
  retryRules: string[]
  partialRecoveryEnabled: boolean
  partialRecoveryMinAmount: number
  escalationStages: string[]
  quietHoursFrom: string
  quietHoursTo: string
}

/* --- Phase 5 — API Integration --- */
export const API_INTEGRATION_CREDENTIALS = ["Client ID", "API Key", "Sandbox credentials", "Webhook Secret"]
export const AVAILABLE_APIS = ["iGree", "NDD", "Remita", "EasyPay", "Webhooks"]
export const DEVELOPER_ACTIONS = ["API Authentication", "Webhook Registration", "Callback Testing"]
export const API_VALIDATIONS = ["Authentication", "Signature", "Idempotency", "Webhook Verification"]

/* --- Phase 6 — Sandbox Certification --- */
export const SANDBOX_SCENARIOS = [
  "Consent",
  "Mandate Creation",
  "Debit",
  "Partial Debit",
  "Failed Debit",
  "Retry",
  "Dispute",
  "Reversal",
  "Webhook Events",
] as const
export type SandboxScenarioName = (typeof SANDBOX_SCENARIOS)[number]
export type ScenarioOutcome = "PASSED" | "FAILED" | "NOT_RUN"

export function sandboxCertified(scenarios: Record<SandboxScenarioName, ScenarioOutcome>): boolean {
  return SANDBOX_SCENARIOS.every((s) => scenarios[s] === "PASSED")
}

/* --- Phase 7 — Production Approval --- */
export const PRODUCTION_APPROVAL_STEPS = [
  "Production API Keys",
  "Production Webhooks",
  "Settlement Account Configuration",
  "Go Live",
]

/** The frontend step sequence for the external (lending institution) journey. */
export const EXTERNAL_USER_JOURNEY = [
  "Organization Registration",
  "Compliance Verification",
  "Tenant Creation",
  "Admin Activation",
  "Recovery Policy Setup",
  "API Integration",
  "Sandbox Certification",
  "Production Approval",
  "Go Live",
]

/* ------------------------------------------------------------------ */
/* Readiness — computed from completed phases, never self-reported     */
/* ------------------------------------------------------------------ */

export type PhaseCompletion = Record<ExternalPhase, boolean>

/** First incomplete phase in order; PRODUCTION_APPROVAL once everything else passes. */
export function currentExternalPhase(phasesComplete: PhaseCompletion): ExternalPhase {
  return EXTERNAL_PHASE_ORDER.find((p) => !phasesComplete[p]) ?? "PRODUCTION_APPROVAL"
}

export function isLive(phasesComplete: PhaseCompletion): boolean {
  return EXTERNAL_PHASE_ORDER.every((p) => phasesComplete[p])
}

export interface ExternalReadiness {
  completed: number
  total: number
  progress: number
  live: boolean
  currentPhase: ExternalPhase
}

/**
 * "Go-live readiness score" from the PRD's Important Must Haves table —
 * indicates whether compliance, integrations, settlement accounts, recovery
 * policies and notifications are fully configured, computed from the same
 * phase-completion state the pipeline strip renders.
 */
export function evaluateExternalReadiness(phasesComplete: PhaseCompletion): ExternalReadiness {
  const completed = EXTERNAL_PHASE_ORDER.filter((p) => phasesComplete[p]).length
  return {
    completed,
    total: EXTERNAL_PHASE_ORDER.length,
    progress: (completed / EXTERNAL_PHASE_ORDER.length) * 100,
    live: completed === EXTERNAL_PHASE_ORDER.length,
    currentPhase: currentExternalPhase(phasesComplete),
  }
}

export type Environment = "SANDBOX" | "PRODUCTION"

export function environmentFor(phasesComplete: PhaseCompletion): Environment {
  return isLive(phasesComplete) ? "PRODUCTION" : "SANDBOX"
}

/* ------------------------------------------------------------------ */
/* Important Must Haves — PRD closing table                            */
/* ------------------------------------------------------------------ */

export interface MustHaveCapability {
  capability: string
  businessValue: string
}

export const MUST_HAVE_CAPABILITIES: MustHaveCapability[] = [
  {
    capability: "Onboarding progress tracker",
    businessValue: "Lets client admins see remaining steps before go-live.",
  },
  {
    capability: "Self-service API testing console",
    businessValue: "Reduces implementation support effort.",
  },
  {
    capability: "Environment health check",
    businessValue:
      "Verifies webhook URLs, certificates, IP whitelisting, and API connectivity before production.",
  },
  {
    capability: "Role-based onboarding checklists",
    businessValue: "Tailors onboarding for Operations, Compliance, Finance, and Developers.",
  },
  {
    capability: "Go-live readiness score",
    businessValue:
      "Indicates whether compliance, integrations, settlement accounts, recovery policies, and notifications are fully configured.",
  },
  {
    capability: "Guided first borrower onboarding",
    businessValue:
      "Allows clients to validate the complete borrower, mandate, and recovery flow before processing live loans.",
  },
]
