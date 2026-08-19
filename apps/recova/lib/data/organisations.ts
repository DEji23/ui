import type {
  ComplianceReviewItem,
  ExternalPhase,
  PhaseCompletion,
  RecoveryPolicyDraft,
  SandboxScenarioName,
  ScenarioOutcome,
} from "@/lib/domain/onboarding"
import { EXTERNAL_PHASE_ORDER } from "@/lib/domain/onboarding"
import type { Role } from "@/lib/domain/rbac"

export interface Organisation {
  id: string
  legalName: string
  tradingName: string
  rcNumber: string
  businessEmail: string
  contactPerson: string
  phoneNumber: string
  cbnLicense: string | null
  serviceModel: string
  recoveryUseCase: string
  tenantId: string | null
  phasesComplete: PhaseCompletion
  complianceReview: Record<ComplianceReviewItem, boolean>
  recoveryPolicy: RecoveryPolicyDraft
  sandboxScenarios: Record<SandboxScenarioName, ScenarioOutcome>
  operationalContact: string
  financeContact: string
  technicalContact: string
  createdAt: string
  goLiveAt: string | null
  users: Array<{ name: string; email: string; role: Role; status: string }>
  isInternal: boolean
}

function phasesUpTo(phase: ExternalPhase | null): PhaseCompletion {
  const cutoff = phase ? EXTERNAL_PHASE_ORDER.indexOf(phase) : EXTERNAL_PHASE_ORDER.length
  return Object.fromEntries(
    EXTERNAL_PHASE_ORDER.map((p, i) => [p, i < cutoff])
  ) as PhaseCompletion
}

const ALL_SCENARIOS_PASSED: Record<SandboxScenarioName, ScenarioOutcome> = {
  Consent: "PASSED",
  "Mandate Creation": "PASSED",
  Debit: "PASSED",
  "Partial Debit": "PASSED",
  "Failed Debit": "PASSED",
  Retry: "PASSED",
  Dispute: "PASSED",
  Reversal: "PASSED",
  "Webhook Events": "PASSED",
}

const NO_SCENARIOS_RUN: Record<SandboxScenarioName, ScenarioOutcome> = {
  Consent: "NOT_RUN",
  "Mandate Creation": "NOT_RUN",
  Debit: "NOT_RUN",
  "Partial Debit": "NOT_RUN",
  "Failed Debit": "NOT_RUN",
  Retry: "NOT_RUN",
  Dispute: "NOT_RUN",
  Reversal: "NOT_RUN",
  "Webhook Events": "NOT_RUN",
}

const FULL_COMPLIANCE_REVIEW: Record<ComplianceReviewItem, boolean> = {
  KYC: true,
  "Regulatory documents": true,
  Contract: true,
  "Risk Assessment": true,
}

const DEFAULT_RECOVERY_POLICY: RecoveryPolicyDraft = {
  debitPreference: "NDD_REMITA_EASYPAY",
  retryRules: ["24 Hours", "72 Hours", "7 Days"],
  partialRecoveryEnabled: true,
  partialRecoveryMinAmount: 5_000,
  escalationStages: ["At Risk", "Collections", "Legal Review"],
  quietHoursFrom: "22:00",
  quietHoursTo: "06:00",
}

export const ORGANISATIONS: Organisation[] = [
  {
    id: "org_vfd",
    legalName: "VFD Microfinance Bank Limited",
    tradingName: "VFD MFB",
    rcNumber: "RC1234567",
    businessEmail: "platform@vfdmfb.com",
    contactPerson: "Adaora Nwosu",
    phoneNumber: "+234 801 234 5678",
    cbnLicense: "CBN/MFB/00214",
    serviceModel: "First-party lender",
    recoveryUseCase: "Retail and SME loan recovery across own book",
    tenantId: "TEN-000001",
    phasesComplete: phasesUpTo(null),
    complianceReview: FULL_COMPLIANCE_REVIEW,
    recoveryPolicy: DEFAULT_RECOVERY_POLICY,
    sandboxScenarios: ALL_SCENARIOS_PASSED,
    operationalContact: "adaora.nwosu@vfdmfb.com",
    financeContact: "ibrahim.musa@vfdmfb.com",
    technicalContact: "platform@vfdmfb.com",
    createdAt: "2026-01-10T09:00:00Z",
    goLiveAt: "2026-02-18T09:00:00Z",
    users: [
      { name: "Adaora Nwosu", email: "adaora.nwosu@vfdmfb.com", role: "DRM", status: "Active" },
      { name: "Chidi Okeke", email: "chidi.okeke@vfdmfb.com", role: "DRO", status: "Active" },
      { name: "Ibrahim Musa", email: "ibrahim.musa@vfdmfb.com", role: "FINANCE", status: "Active" },
      { name: "Funmi Lawal", email: "funmi.lawal@vfdmfb.com", role: "COMPLIANCE", status: "Active" },
      { name: "Bayo Adisa", email: "bayo.adisa@vfdmfb.com", role: "TECH_OPS", status: "Active" },
    ],
    isInternal: true,
  },
  {
    id: "org_lender_a",
    legalName: "Sterling Credit Partners Limited",
    tradingName: "Sterling Credit",
    rcNumber: "RC2245891",
    businessEmail: "ops@sterlingcredit.ng",
    contactPerson: "Bisi Adeyinka",
    phoneNumber: "+234 803 456 7890",
    cbnLicense: null,
    serviceModel: "External lender",
    recoveryUseCase: "Micro-loan portfolio recovery",
    tenantId: "TEN-000002",
    // Sandbox certified — every phase but the final production sign-off.
    phasesComplete: phasesUpTo("PRODUCTION_APPROVAL"),
    complianceReview: FULL_COMPLIANCE_REVIEW,
    recoveryPolicy: DEFAULT_RECOVERY_POLICY,
    sandboxScenarios: ALL_SCENARIOS_PASSED,
    operationalContact: "ops@sterlingcredit.ng",
    financeContact: "finance@sterlingcredit.ng",
    technicalContact: "dev@sterlingcredit.ng",
    createdAt: "2026-05-02T09:00:00Z",
    goLiveAt: null,
    users: [
      { name: "Bisi Adeyinka", email: "bisi@sterlingcredit.ng", role: "ADMIN", status: "Active" },
      { name: "Tope Aluko", email: "tope@sterlingcredit.ng", role: "DRO", status: "Active" },
      { name: "partner-api", email: "dev@sterlingcredit.ng", role: "INTEGRATOR", status: "Active" },
    ],
    isInternal: false,
  },
  {
    id: "org_lender_b",
    legalName: "Harbour Finance Nigeria Limited",
    tradingName: "Harbour Finance",
    rcNumber: "RC3312045",
    businessEmail: "ops@harbourfinance.ng",
    contactPerson: "Kunle Bakare",
    phoneNumber: "+234 805 678 1234",
    cbnLicense: "CBN/MFB/00489",
    serviceModel: "External lender",
    recoveryUseCase: "Asset finance recovery",
    tenantId: "TEN-000003",
    // Mid Sandbox Certification — API Integration done, scenarios in progress.
    phasesComplete: phasesUpTo("SANDBOX_CERTIFICATION"),
    complianceReview: FULL_COMPLIANCE_REVIEW,
    recoveryPolicy: DEFAULT_RECOVERY_POLICY,
    sandboxScenarios: {
      ...ALL_SCENARIOS_PASSED,
      Reversal: "FAILED",
      Dispute: "NOT_RUN",
      "Webhook Events": "NOT_RUN",
    },
    operationalContact: "ops@harbourfinance.ng",
    financeContact: "finance@harbourfinance.ng",
    technicalContact: "eng@harbourfinance.ng",
    createdAt: "2026-06-20T09:00:00Z",
    goLiveAt: null,
    users: [
      { name: "Kunle Bakare", email: "kunle@harbourfinance.ng", role: "ADMIN", status: "Active" },
      { name: "Ada Nnamdi", email: "ada@harbourfinance.ng", role: "FINANCE", status: "Invited" },
    ],
    isInternal: false,
  },
  {
    id: "org_lender_c",
    legalName: "Ridgeway Lending Services Limited",
    tradingName: "Ridgeway Lending",
    rcNumber: "RC4478102",
    businessEmail: "ops@ridgeway.ng",
    contactPerson: "Nkem Eze",
    phoneNumber: "+234 807 890 3456",
    cbnLicense: null,
    serviceModel: "External lender",
    recoveryUseCase: "Payroll-linked consumer loans",
    tenantId: "TEN-000004",
    // Recovery policy published, working through API Integration.
    phasesComplete: phasesUpTo("API_INTEGRATION"),
    complianceReview: FULL_COMPLIANCE_REVIEW,
    recoveryPolicy: {
      ...DEFAULT_RECOVERY_POLICY,
      debitPreference: "REMITA_NDD_EASYPAY",
      partialRecoveryEnabled: false,
    },
    sandboxScenarios: NO_SCENARIOS_RUN,
    operationalContact: "ops@ridgeway.ng",
    financeContact: "finance@ridgeway.ng",
    technicalContact: "tech@ridgeway.ng",
    createdAt: "2026-07-14T09:00:00Z",
    goLiveAt: null,
    users: [{ name: "Nkem Eze", email: "nkem@ridgeway.ng", role: "ADMIN", status: "Active" }],
    isInternal: false,
  },
  {
    id: "org_lender_d",
    legalName: "Anchor Microcredit Limited",
    tradingName: "Anchor Microcredit",
    rcNumber: "RC5501783",
    businessEmail: "ops@anchormicro.ng",
    contactPerson: "Femi Ogun",
    phoneNumber: "+234 809 012 5678",
    cbnLicense: null,
    serviceModel: "External lender",
    recoveryUseCase: "Group lending recovery",
    tenantId: null,
    // Registration verified, compliance review in progress — tenant not yet created.
    phasesComplete: phasesUpTo("COMPLIANCE_APPROVAL"),
    complianceReview: {
      KYC: true,
      "Regulatory documents": true,
      Contract: false,
      "Risk Assessment": false,
    },
    recoveryPolicy: DEFAULT_RECOVERY_POLICY,
    sandboxScenarios: NO_SCENARIOS_RUN,
    operationalContact: "ops@anchormicro.ng",
    financeContact: "—",
    technicalContact: "—",
    createdAt: "2026-07-30T09:00:00Z",
    goLiveAt: null,
    users: [{ name: "Femi Ogun", email: "femi@anchormicro.ng", role: "ADMIN", status: "Invited" }],
    isInternal: false,
  },
  {
    id: "org_lender_e",
    legalName: "Kaduna Trust Finance Limited",
    tradingName: "Kaduna Trust",
    rcNumber: "RC6609214",
    businessEmail: "ops@kadunatrust.ng",
    contactPerson: "Yusuf Aliyu",
    phoneNumber: "+234 810 234 6789",
    cbnLicense: null,
    serviceModel: "External lender",
    recoveryUseCase: "Agricultural lending recovery",
    tenantId: null,
    // Just registered — nothing complete yet.
    phasesComplete: phasesUpTo("ORG_REGISTRATION"),
    complianceReview: {
      KYC: false,
      "Regulatory documents": false,
      Contract: false,
      "Risk Assessment": false,
    },
    recoveryPolicy: DEFAULT_RECOVERY_POLICY,
    sandboxScenarios: NO_SCENARIOS_RUN,
    operationalContact: "ops@kadunatrust.ng",
    financeContact: "—",
    technicalContact: "—",
    createdAt: "2026-08-05T09:00:00Z",
    goLiveAt: null,
    users: [],
    isInternal: false,
  },
]

export function organisationById(id: string): Organisation | undefined {
  return ORGANISATIONS.find((o) => o.id === id)
}

/** Internal staff onboarding journey — the frontend step sequence from the PRD. */
export interface StaffOnboardingStep {
  id: string
  title: string
  detail: string
  status: "DONE" | "CURRENT" | "TODO"
}

export const STAFF_ONBOARDING: StaffOnboardingStep[] = [
  {
    id: "invite",
    title: "Invite User",
    detail: "Platform Admin creates the employee profile, assigns a business unit and role.",
    status: "DONE",
  },
  {
    id: "receive",
    title: "Receive Email",
    detail: "Activation email and temporary password delivered.",
    status: "DONE",
  },
  {
    id: "activate",
    title: "Activate Account",
    detail: "Set password, accept the Acceptable Use and Data Privacy policies.",
    status: "DONE",
  },
  {
    id: "mfa",
    title: "Enable MFA",
    detail: "Multi-factor enrollment verified before the account can be provisioned.",
    status: "DONE",
  },
  {
    id: "role",
    title: "Assign Role",
    detail: "Administrator provisions the role's permission set.",
    status: "CURRENT",
  },
  {
    id: "tour",
    title: "View Dashboard Tour",
    detail: "First-login walkthrough of Dashboard, Recovery Queue, Mandates, Reports, Audit Logs, Notifications and Support Centre.",
    status: "TODO",
  },
  {
    id: "checklist",
    title: "Complete Checklist",
    detail: "Complete profile, configure MFA, review recovery policies and the operational guide, complete training.",
    status: "TODO",
  },
  {
    id: "granted",
    title: "Operational Access Granted",
    detail: "Account is only marked Ready for Operations after every checklist item is ticked.",
    status: "TODO",
  },
]
