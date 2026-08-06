import type {
  ChecklistStatus,
  Environment,
  OnboardingState,
  ScenarioOutcome,
} from "@/lib/domain/onboarding"
import type { Role } from "@/lib/domain/rbac"

export interface Organisation {
  id: string
  legalName: string
  tradingName: string
  serviceModel: string
  recoveryUseCase: string
  state: OnboardingState
  environment: Environment
  operationalContact: string
  financeContact: string
  technicalContact: string
  createdAt: string
  activatedAt: string | null
  checklist: ChecklistStatus
  scenarios: Record<string, ScenarioOutcome>
  users: Array<{ name: string; email: string; role: Role; status: string }>
  isInternal: boolean
}

const ALL_PASSED: Record<string, ScenarioOutcome> = {
  sc_consent: "PASSED",
  sc_consent_declined: "PASSED",
  sc_mandate: "PASSED",
  sc_mandate_failed: "PASSED",
  sc_debit_success: "PASSED",
  sc_insufficient: "PASSED",
  sc_partial: "PASSED",
  sc_reversal: "PASSED",
  sc_dispute: "PASSED",
  sc_idempotency: "PASSED",
}

const FULL_CHECKLIST: ChecklistStatus = {
  adminVerified: true,
  rolesAssigned: true,
  profileComplete: true,
  sandboxCredentials: true,
  webhookValidated: true,
  policiesConfigured: true,
  notificationsConfigured: true,
  uatPassed: true,
  productionApproved: true,
}

export const ORGANISATIONS: Organisation[] = [
  {
    id: "org_vfd",
    legalName: "VFD Microfinance Bank Limited",
    tradingName: "VFD MFB",
    serviceModel: "First-party lender",
    recoveryUseCase: "Retail and SME loan recovery across own book",
    state: "PRODUCTION_ACTIVE",
    environment: "PRODUCTION",
    operationalContact: "adaora.nwosu@vfdmfb.com",
    financeContact: "ibrahim.musa@vfdmfb.com",
    technicalContact: "platform@vfdmfb.com",
    createdAt: "2026-01-10T09:00:00Z",
    activatedAt: "2026-02-18T09:00:00Z",
    checklist: FULL_CHECKLIST,
    scenarios: ALL_PASSED,
    users: [
      { name: "Adaora Nwosu", email: "adaora.nwosu@vfdmfb.com", role: "DRM", status: "Active" },
      { name: "Chidi Okeke", email: "chidi.okeke@vfdmfb.com", role: "DRO", status: "Active" },
      { name: "Ibrahim Musa", email: "ibrahim.musa@vfdmfb.com", role: "FINANCE", status: "Active" },
    ],
    isInternal: true,
  },
  {
    id: "org_lender_a",
    legalName: "Sterling Credit Partners Limited",
    tradingName: "Sterling Credit",
    serviceModel: "External lender",
    recoveryUseCase: "Micro-loan portfolio recovery",
    state: "UAT_CERTIFIED",
    environment: "UAT",
    operationalContact: "ops@sterlingcredit.ng",
    financeContact: "finance@sterlingcredit.ng",
    technicalContact: "dev@sterlingcredit.ng",
    createdAt: "2026-05-02T09:00:00Z",
    activatedAt: null,
    checklist: {
      ...FULL_CHECKLIST,
      // Everything passed except the final internal countersignature.
      productionApproved: false,
    },
    scenarios: ALL_PASSED,
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
    serviceModel: "External lender",
    recoveryUseCase: "Asset finance recovery",
    state: "SANDBOX_READY",
    environment: "SANDBOX",
    operationalContact: "ops@harbourfinance.ng",
    financeContact: "finance@harbourfinance.ng",
    technicalContact: "eng@harbourfinance.ng",
    createdAt: "2026-06-20T09:00:00Z",
    activatedAt: null,
    checklist: {
      adminVerified: true,
      rolesAssigned: true,
      profileComplete: true,
      sandboxCredentials: true,
      webhookValidated: true,
      policiesConfigured: true,
      notificationsConfigured: false,
      uatPassed: false,
      productionApproved: false,
    },
    scenarios: {
      ...ALL_PASSED,
      sc_reversal: "FAILED",
      sc_dispute: "NOT_RUN",
      sc_idempotency: "NOT_RUN",
    },
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
    serviceModel: "External lender",
    recoveryUseCase: "Payroll-linked consumer loans",
    state: "CONFIGURATION_IN_PROGRESS",
    environment: "SANDBOX",
    operationalContact: "ops@ridgeway.ng",
    financeContact: "finance@ridgeway.ng",
    technicalContact: "tech@ridgeway.ng",
    createdAt: "2026-07-14T09:00:00Z",
    activatedAt: null,
    checklist: {
      adminVerified: true,
      rolesAssigned: true,
      profileComplete: true,
      sandboxCredentials: true,
      webhookValidated: false,
      policiesConfigured: false,
      notificationsConfigured: false,
      uatPassed: false,
      productionApproved: false,
    },
    scenarios: {
      sc_consent: "PASSED",
      sc_consent_declined: "PASSED",
      sc_mandate: "NOT_RUN",
      sc_mandate_failed: "NOT_RUN",
      sc_debit_success: "NOT_RUN",
      sc_insufficient: "NOT_RUN",
      sc_partial: "NOT_RUN",
      sc_reversal: "NOT_RUN",
      sc_dispute: "NOT_RUN",
      sc_idempotency: "NOT_RUN",
    },
    users: [
      { name: "Nkem Eze", email: "nkem@ridgeway.ng", role: "ADMIN", status: "Active" },
    ],
    isInternal: false,
  },
  {
    id: "org_lender_d",
    legalName: "Anchor Microcredit Limited",
    tradingName: "Anchor Microcredit",
    serviceModel: "External lender",
    recoveryUseCase: "Group lending recovery",
    state: "COMPLIANCE_REVIEW",
    environment: "SANDBOX",
    operationalContact: "ops@anchormicro.ng",
    financeContact: "finance@anchormicro.ng",
    technicalContact: "tech@anchormicro.ng",
    createdAt: "2026-07-30T09:00:00Z",
    activatedAt: null,
    checklist: {
      adminVerified: true,
      rolesAssigned: false,
      profileComplete: false,
      sandboxCredentials: false,
      webhookValidated: false,
      policiesConfigured: false,
      notificationsConfigured: false,
      uatPassed: false,
      productionApproved: false,
    },
    scenarios: {
      sc_consent: "NOT_RUN",
      sc_consent_declined: "NOT_RUN",
      sc_mandate: "NOT_RUN",
      sc_mandate_failed: "NOT_RUN",
      sc_debit_success: "NOT_RUN",
      sc_insufficient: "NOT_RUN",
      sc_partial: "NOT_RUN",
      sc_reversal: "NOT_RUN",
      sc_dispute: "NOT_RUN",
      sc_idempotency: "NOT_RUN",
    },
    users: [
      { name: "Femi Ogun", email: "femi@anchormicro.ng", role: "ADMIN", status: "Invited" },
    ],
    isInternal: false,
  },
  {
    id: "org_lender_e",
    legalName: "Kaduna Trust Finance Limited",
    tradingName: "Kaduna Trust",
    serviceModel: "External lender",
    recoveryUseCase: "Agricultural lending recovery",
    state: "INVITED",
    environment: "SANDBOX",
    operationalContact: "ops@kadunatrust.ng",
    financeContact: "—",
    technicalContact: "—",
    createdAt: "2026-08-05T09:00:00Z",
    activatedAt: null,
    checklist: {
      adminVerified: false,
      rolesAssigned: false,
      profileComplete: false,
      sandboxCredentials: false,
      webhookValidated: false,
      policiesConfigured: false,
      notificationsConfigured: false,
      uatPassed: false,
      productionApproved: false,
    },
    scenarios: {
      sc_consent: "NOT_RUN",
      sc_consent_declined: "NOT_RUN",
      sc_mandate: "NOT_RUN",
      sc_mandate_failed: "NOT_RUN",
      sc_debit_success: "NOT_RUN",
      sc_insufficient: "NOT_RUN",
      sc_partial: "NOT_RUN",
      sc_reversal: "NOT_RUN",
      sc_dispute: "NOT_RUN",
      sc_idempotency: "NOT_RUN",
    },
    users: [],
    isInternal: false,
  },
]

export function organisationById(id: string): Organisation | undefined {
  return ORGANISATIONS.find((o) => o.id === id)
}

/** Staff onboarding journey — the six frontend steps from the PRD. */
export interface StaffOnboardingStep {
  id: string
  title: string
  detail: string
  status: "DONE" | "CURRENT" | "TODO"
}

export const STAFF_ONBOARDING: StaffOnboardingStep[] = [
  {
    id: "invite",
    title: "Staff receives invite",
    detail: "Role-specific email invitation issued by the platform administrator.",
    status: "DONE",
  },
  {
    id: "activate",
    title: "Account activation",
    detail:
      "Set password, complete OTP verification, accept the acceptable-use and compliance notice. Three failed attempts lock the account.",
    status: "DONE",
  },
  {
    id: "landing",
    title: "Role landing experience",
    detail: "Routed to the dashboard matching the assigned role.",
    status: "DONE",
  },
  {
    id: "context",
    title: "Profile and operating context",
    detail: "Select business unit, portfolio scope and notification preferences.",
    status: "CURRENT",
  },
  {
    id: "walkthrough",
    title: "Tool walkthrough",
    detail: "Guided tour of dashboard widgets, alerts and restricted actions.",
    status: "TODO",
  },
  {
    id: "confirm",
    title: "Access confirmation",
    detail:
      "Confirm visibility of assigned modules. The account is only marked Active after this step.",
    status: "TODO",
  },
]
