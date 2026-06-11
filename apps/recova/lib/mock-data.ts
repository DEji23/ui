export type LoanState =
  | "ACTIVE"
  | "DUE"
  | "OVERDUE"
  | "IN_RECOVERY"
  | "PARTIALLY_RECOVERED"
  | "AT_RISK"
  | "DISPUTE_OPEN"
  | "RECOVERY_FAILED"
  | "LEGAL_REVIEW"
  | "CLOSED_PAID"
  | "WRITE_OFF"

export type MandateStatus = "ACTIVE" | "PENDING" | "EXPIRED" | "FAILED" | "SUSPENDED"
export type RecoveryRail = "NDD" | "REMITA" | "EASY_PAY" | "MANUAL"
export type EscalationTier = "TIER_1" | "TIER_2" | "TIER_3" | "LEGAL"

export interface Loan {
  id: string
  loanId: string
  borrower: string
  phone: string
  email: string
  bvn: string
  accountNumber: string
  bank: string
  disbursed: number
  outstanding: number
  disbursedAt: string
  dueDate: string
  dpd: number
  state: LoanState
  rail: RecoveryRail
  mandateStatus: MandateStatus
  mandateRef: string | null
  tier: EscalationTier
  retryCount: number
  maxRetries: number
  lastAttempt: string | null
  nextRetry: string | null
  dro: string | null
  product: string
  branch: string
  interestRate: number
  iGreeConsent: boolean
  updatedAt: string
}

export type DisputeStatus =
  | "OPEN"
  | "EVIDENCE_COMPILED"
  | "DECISION_PENDING"
  | "VALID_DEBIT"
  | "PARTIAL_REFUND"
  | "FULL_REFUND"
  | "ESCALATED"
  | "CLOSED"

export type DisputeDecisionOutcome = "VALID_DEBIT" | "PARTIAL_ERROR" | "INVALID" | null

export interface DisputeEvidence {
  consentLog: { exists: boolean; signedAt: string | null; channel: string | null; reference: string | null; ipAddress: string | null }
  mandateDetails: { reference: string | null; status: string | null; maxAmount: number | null; setupDate: string | null; bank: string | null; authMethod: string | null }
  debitAttemptTrace: Array<{ reference: string; timestamp: string; channel: string; amount: number; status: string; bankResponse: string }>
  notificationHistory: Array<{ channel: string; message: string; timestamp: string; status: string }>
}

export interface Dispute {
  id: string
  loanId: string
  borrower: string
  phone: string
  type: "Incorrect Debit" | "Unauthorised Mandate" | "Duplicate Debit" | "Insufficient Notice" | "Fraud" | "AT_RISK Transaction"
  amount: number
  status: DisputeStatus
  slaDeadline: string
  assignedTo: string
  filedAt: string
  description: string
  rail: RecoveryRail
  initiatedBy: "CUSTOMER" | "BANK"
  transactionId: string
  isIndemnity: boolean
  indemnityAmount: number | null
  recoveryPaused: boolean
  mandateLocked: boolean
  decisionOutcome: DisputeDecisionOutcome
  decisionNote: string | null
  decisionAt: string | null
  decisionBy: string | null
  evidence: DisputeEvidence
}

export interface Settlement {
  id: string
  loanId: string
  borrower: string
  reference: string
  rail: RecoveryRail
  amount: number
  type: "FULL_PAYMENT" | "PARTIAL_PAYMENT" | "REVERSAL" | "REFUND"
  status: "COMPLETED" | "PROCESSING" | "PENDING" | "FAILED" | "REVERSED" | "PARTIAL"
  bank: string
  settledAt: string
}

export type MandateValidationStatus = "NOT_STARTED" | "USER_ACTION_REQUIRED" | "VALIDATED" | "FAILED"
export type MandateFailureReason = "ACCOUNT_DORMANT" | "INVALID_ACCOUNT" | "NAME_MISMATCH" | "BANK_REJECTION" | "USER_ABANDONED" | "TIMEOUT"

export interface Mandate {
  id: string
  loanId: string
  borrower: string
  reference: string
  rail: RecoveryRail
  status: MandateStatus
  bank: string
  bankCode: string
  accountNumber: string
  maxAmount: number
  frequency: "Monthly" | "Weekly" | "Daily"
  issuedAt: string
  expiryDate: string
  validationStatus: MandateValidationStatus
  lastCheckedAt: string | null
  activatedAt?: string | null
  externalReference?: string | null
  providerFallback: boolean
  failureReason?: MandateFailureReason
}

export interface DisputeNote {
  id: string
  author: string
  role: string
  timestamp: string
  text: string
}

export interface ApprovalRequest {
  id: string
  type: "WRITE_OFF" | "POLICY_CHANGE" | "MANDATE_SETUP" | "ESCALATION" | "SETTLEMENT_REVERSAL" | "RATE_CHANGE"
  title: string
  description: string
  initiator: string
  initiatorRole: string
  initiatedAt: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED"
  checker: string | null
  checkedAt: string | null
  rejectionReason: string | null
  entityId: string
  amount?: number
  expiresAt: string
  module: string
}

export interface IgreeCase {
  id: string
  loanId: string
  borrower: string
  phone: string
  email: string
  bank: string
  outstanding: number
  rail: RecoveryRail
  consentStatus: "NOT_SENT" | "LINK_SENT" | "OPENED" | "CONSENTED" | "DECLINED" | "EXPIRED"
  sentAt: string | null
  consentedAt: string | null
  linkExpiry: string | null
  dro: string
}

export interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  status: "ACTIVE" | "INACTIVE" | "FAILING"
  secret: string
  lastDelivery: string | null
  successRate: number
  createdAt: string
}

export interface ApiKey {
  id: string
  name: string
  prefix: string
  scopes: string[]
  createdAt: string
  lastUsed: string | null
  expiresAt: string | null
  status: "ACTIVE" | "REVOKED"
  createdBy: string
}

export interface AuditEvent {
  id: string
  timestamp: string
  actor: string
  role: string
  action: string
  module: string
  entityId: string
  ipAddress: string
}

export interface DROUser {
  id: string
  name: string
  email: string
  role: string
  casesAssigned: number
  recoveryRate: number
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  lastActive: string
}

export const loans: Loan[] = [
  {
    id: "1",
    loanId: "LN-28471",
    borrower: "Emeka Okafor",
    phone: "+234 802 345 6789",
    email: "emeka.okafor@email.com",
    bvn: "22341056789",
    accountNumber: "0123456789",
    bank: "Access Bank",
    disbursed: 500000,
    outstanding: 487500,
    disbursedAt: "2024-10-01",
    dueDate: "2024-11-01",
    dpd: 23,
    state: "IN_RECOVERY",
    rail: "NDD",
    mandateStatus: "ACTIVE",
    mandateRef: "MND-881234",
    tier: "TIER_1",
    retryCount: 2,
    maxRetries: 5,
    lastAttempt: "2025-05-24T09:15:00Z",
    nextRetry: "2025-05-25T09:00:00Z",
    dro: "Fatima Bello",
    product: "MSME Loan",
    branch: "Ikeja",
    interestRate: 24,
    iGreeConsent: true,
    updatedAt: "2025-05-24T09:15:00Z",
  },
  {
    id: "2",
    loanId: "LN-19302",
    borrower: "Ngozi Adeyemi",
    phone: "+234 803 456 7890",
    email: "ngozi.a@gmail.com",
    bvn: "22456781234",
    accountNumber: "0987654321",
    bank: "GTBank",
    disbursed: 1200000,
    outstanding: 1050000,
    disbursedAt: "2024-09-15",
    dueDate: "2024-10-15",
    dpd: 40,
    state: "AT_RISK",
    rail: "REMITA",
    mandateStatus: "ACTIVE",
    mandateRef: "MND-771456",
    tier: "TIER_2",
    retryCount: 4,
    maxRetries: 5,
    lastAttempt: "2025-05-22T14:30:00Z",
    nextRetry: "2025-05-29T09:00:00Z",
    dro: "Chidi Okeke",
    product: "Personal Loan",
    branch: "Victoria Island",
    interestRate: 30,
    iGreeConsent: true,
    updatedAt: "2025-05-22T14:30:00Z",
  },
  {
    id: "3",
    loanId: "LN-33812",
    borrower: "Tunde Fashola",
    phone: "+234 805 678 9012",
    email: "tunde.f@yahoo.com",
    bvn: "22312389045",
    accountNumber: "0246813579",
    bank: "Zenith Bank",
    disbursed: 250000,
    outstanding: 87500,
    disbursedAt: "2024-11-01",
    dueDate: "2024-12-01",
    dpd: 5,
    state: "PARTIALLY_RECOVERED",
    rail: "NDD",
    mandateStatus: "ACTIVE",
    mandateRef: "MND-992345",
    tier: "TIER_1",
    retryCount: 1,
    maxRetries: 5,
    lastAttempt: "2025-05-23T11:00:00Z",
    nextRetry: "2025-05-24T11:00:00Z",
    dro: "Fatima Bello",
    product: "Nano Loan",
    branch: "Lekki",
    interestRate: 18,
    iGreeConsent: false,
    updatedAt: "2025-05-23T11:00:00Z",
  },
  {
    id: "4",
    loanId: "LN-41023",
    borrower: "Aisha Mohammed",
    phone: "+234 806 789 0123",
    email: "aisha.m@outlook.com",
    bvn: "22567890123",
    accountNumber: "0135792468",
    bank: "First Bank",
    disbursed: 800000,
    outstanding: 800000,
    disbursedAt: "2024-10-20",
    dueDate: "2024-11-20",
    dpd: 4,
    state: "DISPUTE_OPEN",
    rail: "NDD",
    mandateStatus: "SUSPENDED",
    mandateRef: "MND-553892",
    tier: "TIER_1",
    retryCount: 1,
    maxRetries: 5,
    lastAttempt: "2025-05-21T08:45:00Z",
    nextRetry: null,
    dro: "Yusuf Ibrahim",
    product: "MSME Loan",
    branch: "Abuja",
    interestRate: 24,
    iGreeConsent: true,
    updatedAt: "2025-05-21T08:45:00Z",
  },
  {
    id: "5",
    loanId: "LN-55247",
    borrower: "Chidinma Obi",
    phone: "+234 807 890 1234",
    email: "chidinma.o@email.ng",
    bvn: "22678901234",
    accountNumber: "0357924680",
    bank: "UBA",
    disbursed: 3000000,
    outstanding: 3000000,
    disbursedAt: "2024-08-15",
    dueDate: "2024-09-15",
    dpd: 70,
    state: "LEGAL_REVIEW",
    rail: "EASY_PAY",
    mandateStatus: "EXPIRED",
    mandateRef: "MND-334891",
    tier: "LEGAL",
    retryCount: 5,
    maxRetries: 5,
    lastAttempt: "2025-05-10T10:00:00Z",
    nextRetry: null,
    dro: "Chidi Okeke",
    product: "Business Loan",
    branch: "Port Harcourt",
    interestRate: 28,
    iGreeConsent: false,
    updatedAt: "2025-05-10T10:00:00Z",
  },
  {
    id: "6",
    loanId: "LN-62891",
    borrower: "Babatunde Adekoya",
    phone: "+234 808 901 2345",
    email: "b.adekoya@gmail.com",
    bvn: "22789012345",
    accountNumber: "0468013579",
    bank: "Stanbic IBTC",
    disbursed: 450000,
    outstanding: 450000,
    disbursedAt: "2024-11-10",
    dueDate: "2024-12-10",
    dpd: 14,
    state: "OVERDUE",
    rail: "NDD",
    mandateStatus: "PENDING",
    mandateRef: null,
    tier: "TIER_1",
    retryCount: 0,
    maxRetries: 5,
    lastAttempt: null,
    nextRetry: "2025-05-25T09:00:00Z",
    dro: null,
    product: "Salary Advance",
    branch: "Kano",
    interestRate: 20,
    iGreeConsent: false,
    updatedAt: "2025-05-20T00:00:00Z",
  },
  {
    id: "7",
    loanId: "LN-78134",
    borrower: "Kemi Olusanya",
    phone: "+234 809 012 3456",
    email: "kemi.o@yahoo.com",
    bvn: "22890123456",
    accountNumber: "0579124680",
    bank: "Fidelity Bank",
    disbursed: 750000,
    outstanding: 750000,
    disbursedAt: "2024-09-01",
    dueDate: "2024-10-01",
    dpd: 55,
    state: "RECOVERY_FAILED",
    rail: "NDD",
    mandateStatus: "FAILED",
    mandateRef: "MND-667234",
    tier: "TIER_3",
    retryCount: 5,
    maxRetries: 5,
    lastAttempt: "2025-05-05T12:00:00Z",
    nextRetry: null,
    dro: "Yusuf Ibrahim",
    product: "Personal Loan",
    branch: "Enugu",
    interestRate: 30,
    iGreeConsent: true,
    updatedAt: "2025-05-05T12:00:00Z",
  },
  {
    id: "8",
    loanId: "LN-89456",
    borrower: "Segun Adewale",
    phone: "+234 810 123 4567",
    email: "segun.ade@company.ng",
    bvn: "22901234567",
    accountNumber: "0680235791",
    bank: "Polaris Bank",
    disbursed: 2000000,
    outstanding: 1800000,
    disbursedAt: "2024-10-05",
    dueDate: "2024-11-05",
    dpd: 19,
    state: "IN_RECOVERY",
    rail: "REMITA",
    mandateStatus: "ACTIVE",
    mandateRef: "MND-445678",
    tier: "TIER_1",
    retryCount: 2,
    maxRetries: 5,
    lastAttempt: "2025-05-24T16:20:00Z",
    nextRetry: "2025-05-26T09:00:00Z",
    dro: "Fatima Bello",
    product: "MSME Loan",
    branch: "Lagos Island",
    interestRate: 24,
    iGreeConsent: true,
    updatedAt: "2025-05-24T16:20:00Z",
  },
]

const emptyEvidence: DisputeEvidence = {
  consentLog: { exists: false, signedAt: null, channel: null, reference: null, ipAddress: null },
  mandateDetails: { reference: null, status: null, maxAmount: null, setupDate: null, bank: null, authMethod: null },
  debitAttemptTrace: [],
  notificationHistory: [],
}

export const disputes: Dispute[] = [
  {
    id: "DSP-001",
    loanId: "LN-41023",
    borrower: "Aisha Mohammed",
    phone: "+234 806 789 0123",
    type: "Unauthorised Mandate",
    amount: 800000,
    status: "EVIDENCE_COMPILED",
    slaDeadline: "2025-05-28T00:00:00Z",
    assignedTo: "Adaora Nwosu",
    filedAt: "2025-05-21T09:00:00Z",
    description: "Borrower claims mandate was set up without consent.",
    rail: "NDD",
    initiatedBy: "CUSTOMER",
    transactionId: "TXN-NDD-41023-001",
    isIndemnity: false,
    indemnityAmount: null,
    recoveryPaused: true,
    mandateLocked: true,
    decisionOutcome: null,
    decisionNote: null,
    decisionAt: null,
    decisionBy: null,
    evidence: {
      ...emptyEvidence,
      consentLog: { exists: true, signedAt: "2024-09-12T10:30:00Z", channel: "SMS", reference: "CGT-881234", ipAddress: "102.89.34.11" },
      mandateDetails: { reference: "MND-881234", status: "ACTIVE", maxAmount: 900000, setupDate: "2024-09-12T10:00:00Z", bank: "Access Bank", authMethod: "OTP" },
    },
  },
  {
    id: "DSP-002",
    loanId: "LN-28471",
    borrower: "Emeka Okafor",
    phone: "+234 802 345 6789",
    type: "Duplicate Debit",
    amount: 487500,
    status: "OPEN",
    slaDeadline: "2025-05-30T00:00:00Z",
    assignedTo: "Fatima Bello",
    filedAt: "2025-05-24T11:00:00Z",
    description: "Two debits of equal amount on the same day.",
    rail: "NDD",
    initiatedBy: "CUSTOMER",
    transactionId: "TXN-NDD-28471-002",
    isIndemnity: false,
    indemnityAmount: null,
    recoveryPaused: false,
    mandateLocked: false,
    decisionOutcome: null,
    decisionNote: null,
    decisionAt: null,
    decisionBy: null,
    evidence: emptyEvidence,
  },
  {
    id: "DSP-003",
    loanId: "LN-89456",
    borrower: "Segun Adewale",
    phone: "+234 810 123 4567",
    type: "Incorrect Debit",
    amount: 1800000,
    status: "ESCALATED",
    slaDeadline: "2025-05-26T00:00:00Z",
    assignedTo: "Adaora Nwosu",
    filedAt: "2025-05-20T08:30:00Z",
    description: "Amount debited exceeds mandate cap.",
    rail: "REMITA",
    initiatedBy: "BANK",
    transactionId: "TXN-RMT-89456-003",
    isIndemnity: true,
    indemnityAmount: 1800000,
    recoveryPaused: true,
    mandateLocked: false,
    decisionOutcome: null,
    decisionNote: null,
    decisionAt: null,
    decisionBy: null,
    evidence: {
      ...emptyEvidence,
      mandateDetails: { reference: "MND-334891", status: "SUSPENDED", maxAmount: 1200000, setupDate: "2024-08-15T00:00:00Z", bank: "GTBank", authMethod: "USSD" },
    },
  },
  {
    id: "DSP-004",
    loanId: "LN-55247",
    borrower: "Chidinma Obi",
    phone: "+234 807 890 1234",
    type: "Fraud",
    amount: 3000000,
    status: "OPEN",
    slaDeadline: "2025-05-25T00:00:00Z",
    assignedTo: "Adaora Nwosu",
    filedAt: "2025-05-19T14:00:00Z",
    description: "Borrower alleges fraudulent loan disbursement.",
    rail: "EASY_PAY",
    initiatedBy: "CUSTOMER",
    transactionId: "TXN-EP-55247-004",
    isIndemnity: false,
    indemnityAmount: null,
    recoveryPaused: false,
    mandateLocked: false,
    decisionOutcome: null,
    decisionNote: null,
    decisionAt: null,
    decisionBy: null,
    evidence: emptyEvidence,
  },
]

export const disputeKPIs = {
  disputeRate: 1.8,
  disputeRateTarget: 2.0,
  indemnityLossTotal: 4800000,
  indemnityLossRate: 0.04,
  slaCompliance: 91,
  slaComplianceTarget: 95,
  resolvedThisMonth: 12,
}

export const settlements: Settlement[] = [
  {
    id: "STL-001",
    loanId: "LN-33812",
    borrower: "Tunde Fashola",
    reference: "TXN-2025052401",
    rail: "NDD",
    amount: 162500,
    type: "PARTIAL_PAYMENT",
    status: "COMPLETED",
    bank: "Zenith Bank",
    settledAt: "2025-05-23T11:05:00Z",
  },
  {
    id: "STL-002",
    loanId: "LN-28471",
    borrower: "Emeka Okafor",
    reference: "TXN-2025052402",
    rail: "NDD",
    amount: 487500,
    type: "FULL_PAYMENT",
    status: "PROCESSING",
    bank: "Access Bank",
    settledAt: "2025-05-24T09:20:00Z",
  },
  {
    id: "STL-003",
    loanId: "LN-89456",
    borrower: "Segun Adewale",
    reference: "TXN-2025052201",
    rail: "REMITA",
    amount: 200000,
    type: "PARTIAL_PAYMENT",
    status: "COMPLETED",
    bank: "Polaris Bank",
    settledAt: "2025-05-22T16:30:00Z",
  },
  {
    id: "STL-004",
    loanId: "LN-41023",
    borrower: "Aisha Mohammed",
    reference: "TXN-2025052001",
    rail: "NDD",
    amount: 800000,
    type: "FULL_PAYMENT",
    status: "REVERSED",
    bank: "First Bank",
    settledAt: "2025-05-20T08:50:00Z",
  },
  {
    id: "STL-005",
    loanId: "LN-19302",
    borrower: "Ngozi Adeyemi",
    reference: "TXN-2025052101",
    rail: "REMITA",
    amount: 150000,
    type: "PARTIAL_PAYMENT",
    status: "FAILED",
    bank: "GTBank",
    settledAt: "2025-05-21T14:35:00Z",
  },
  {
    id: "STL-006",
    loanId: "LN-62891",
    borrower: "Babatunde Adekoya",
    reference: "TXN-2025051901",
    rail: "NDD",
    amount: 450000,
    type: "FULL_PAYMENT",
    status: "PENDING",
    bank: "Stanbic IBTC",
    settledAt: "2025-05-25T00:00:00Z",
  },
]

export const bankCapabilities = [
  { bankCode: "ACCESS", bankName: "Access Bank", supportsNDD: true, nddSuccessRate: 91, remitaSuccessRate: 88, preferredProvider: "NDD" as const },
  { bankCode: "GTB", bankName: "GTBank", supportsNDD: true, nddSuccessRate: 94, remitaSuccessRate: 90, preferredProvider: "NDD" as const },
  { bankCode: "UBA", bankName: "UBA", supportsNDD: false, nddSuccessRate: 0, remitaSuccessRate: 85, preferredProvider: "REMITA" as const },
  { bankCode: "STANBIC", bankName: "Stanbic IBTC", supportsNDD: true, nddSuccessRate: 87, remitaSuccessRate: 83, preferredProvider: "NDD" as const },
  { bankCode: "FIDELITY", bankName: "Fidelity Bank", supportsNDD: true, nddSuccessRate: 78, remitaSuccessRate: 80, preferredProvider: "REMITA" as const },
  { bankCode: "ZENITH", bankName: "Zenith Bank", supportsNDD: true, nddSuccessRate: 93, remitaSuccessRate: 89, preferredProvider: "NDD" as const },
]

export const mandates: Mandate[] = [
  {
    id: "MND-001",
    loanId: "LN-28471",
    borrower: "Emeka Okafor",
    reference: "MND-881234",
    rail: "NDD",
    status: "ACTIVE",
    bank: "Access Bank",
    bankCode: "ACCESS",
    accountNumber: "0123456789",
    maxAmount: 500000,
    frequency: "Monthly",
    issuedAt: "2024-10-01",
    expiryDate: "2025-10-01",
    validationStatus: "VALIDATED",
    lastCheckedAt: "2025-05-20T08:00:00Z",
    providerFallback: false,
  },
  {
    id: "MND-002",
    loanId: "LN-19302",
    borrower: "Ngozi Adeyemi",
    reference: "MND-771456",
    rail: "REMITA",
    status: "ACTIVE",
    bank: "GTBank",
    bankCode: "GTB",
    accountNumber: "0987654321",
    maxAmount: 1200000,
    frequency: "Monthly",
    issuedAt: "2024-09-15",
    expiryDate: "2025-09-15",
    validationStatus: "VALIDATED",
    lastCheckedAt: "2025-05-19T14:00:00Z",
    providerFallback: false,
  },
  {
    id: "MND-003",
    loanId: "LN-55247",
    borrower: "Chidinma Obi",
    reference: "MND-334891",
    rail: "EASY_PAY",
    status: "EXPIRED",
    bank: "UBA",
    bankCode: "UBA",
    accountNumber: "0357924680",
    maxAmount: 3000000,
    frequency: "Monthly",
    issuedAt: "2024-08-15",
    expiryDate: "2025-02-15",
    validationStatus: "NOT_STARTED",
    lastCheckedAt: null,
    providerFallback: false,
  },
  {
    id: "MND-004",
    loanId: "LN-62891",
    borrower: "Babatunde Adekoya",
    reference: "MND-112567",
    rail: "NDD",
    status: "PENDING",
    bank: "Stanbic IBTC",
    bankCode: "STANBIC",
    accountNumber: "0468013579",
    maxAmount: 450000,
    frequency: "Monthly",
    issuedAt: "2025-05-20",
    expiryDate: "2026-05-20",
    validationStatus: "USER_ACTION_REQUIRED",
    lastCheckedAt: "2025-05-21T10:00:00Z",
    providerFallback: false,
  },
  {
    id: "MND-005",
    loanId: "LN-78134",
    borrower: "Kemi Olusanya",
    reference: "MND-667234",
    rail: "NDD",
    status: "FAILED",
    bank: "Fidelity Bank",
    bankCode: "FIDELITY",
    accountNumber: "0579124680",
    maxAmount: 750000,
    frequency: "Monthly",
    issuedAt: "2024-09-01",
    expiryDate: "2025-09-01",
    validationStatus: "FAILED",
    lastCheckedAt: "2025-05-18T09:00:00Z",
    providerFallback: true,
    failureReason: "ACCOUNT_DORMANT",
  },
]

export const mandateKPIs = {
  activationRate: 84,
  activationRateTarget: 90,
  silentFailuresDetected: 3,
  totalFailed: 5,
  avgTimeToActiveHours: 6.2,
  avgTimeToActiveTarget: 8,
  refreshedThisMonth: 14,
  fallbackAccountRate: 12,
}

// ─── Reconciliation ──────────────────────────────────────────────────────────────────────────────

export type ReconClassification = "MATCHED" | "MISSING_SETTLEMENT" | "MISSING_INTERNAL" | "DUPLICATE" | "REVERSED"
export type ReconCaseStatus = "OPEN" | "INVESTIGATING" | "RESOLVED"

export interface ReconTransaction {
  id: string
  loanId: string
  borrower: string
  amount: number
  rail: RecoveryRail
  internalStatus: string
  externalReference: string
  classification: ReconClassification
  createdAt: string
}

export interface ReconSettlement {
  id: string
  transactionId: string
  amount: number
  settlementStatus: string
  settlementDate: string
  bank: string
}

export interface ReconCase {
  id: string
  transactionId: string
  loanId: string
  borrower: string
  amount: number
  rail: RecoveryRail
  externalReference: string
  internalStatus: string
  bankStatus: string
  agingHours: number
  classification: ReconClassification
  status: ReconCaseStatus
  assignedTo: string | null
  createdAt: string
  notes?: string
  resolution?: string
  resolvedAt?: string | null
}

export const reconKPIs = {
  gapRate: 0.8,
  gapRateTarget: 1.0,
  avgResolutionHours: 3.4,
  resolutionTarget: 6,
  resolvedToday: 7,
  matchRate: 98.6,
  totalSettlements: 1823,
  totalTransactions: 1849,
  duplicatesDetected: 2,
  openCases: 5,
}

export const reconTransactions: ReconTransaction[] = [
  { id: "TXN-NDD-001", loanId: "LN-28471", borrower: "Emeka Okafor", amount: 487500, rail: "NDD", internalStatus: "SUCCESS", externalReference: "EXT-NDD-881234", classification: "MATCHED", createdAt: "2025-05-24T10:00:00Z" },
  { id: "TXN-NDD-002", loanId: "LN-41023", borrower: "Aisha Mohammed", amount: 800000, rail: "NDD", internalStatus: "SUCCESS", externalReference: "EXT-NDD-773491", classification: "MISSING_SETTLEMENT", createdAt: "2025-05-23T14:00:00Z" },
  { id: "TXN-RMT-001", loanId: "LN-89456", borrower: "Segun Adewale", amount: 1800000, rail: "REMITA", internalStatus: "SUCCESS", externalReference: "EXT-RMT-334891", classification: "DUPLICATE", createdAt: "2025-05-22T09:30:00Z" },
  { id: "TXN-NDD-003", loanId: "LN-55247", borrower: "Chidinma Obi", amount: 3000000, rail: "NDD", internalStatus: "SUCCESS", externalReference: "EXT-NDD-556712", classification: "MATCHED", createdAt: "2025-05-21T11:00:00Z" },
]

export const reconSettlements: ReconSettlement[] = [
  { id: "STL-REC-001", transactionId: "TXN-NDD-001", amount: 487500, settlementStatus: "SETTLED", settlementDate: "2025-05-24T22:00:00Z", bank: "Access Bank" },
  { id: "STL-REC-002", transactionId: "TXN-RMT-001", amount: 1750000, settlementStatus: "SETTLED", settlementDate: "2025-05-22T23:00:00Z", bank: "GTBank" },
]

export const reconCases: ReconCase[] = [
  {
    id: "REC-001",
    transactionId: "TXN-NDD-002",
    loanId: "LN-41023",
    borrower: "Aisha Mohammed",
    amount: 800000,
    rail: "NDD",
    externalReference: "EXT-NDD-773491",
    internalStatus: "SUCCESS",
    bankStatus: "PENDING",
    agingHours: 36,
    classification: "MISSING_SETTLEMENT",
    status: "OPEN",
    assignedTo: null,
    createdAt: "2025-05-23T14:30:00Z",
  },
  {
    id: "REC-002",
    transactionId: "TXN-RMT-001",
    loanId: "LN-89456",
    borrower: "Segun Adewale",
    amount: 1800000,
    rail: "REMITA",
    externalReference: "EXT-RMT-334891",
    internalStatus: "SUCCESS",
    bankStatus: "SETTLED",
    agingHours: 12,
    classification: "DUPLICATE",
    status: "INVESTIGATING",
    assignedTo: "Kunle Adesanya",
    createdAt: "2025-05-22T09:45:00Z",
    notes: "Duplicate settlement received from REMITA — investigating double processing.",
  },
]

export const dashboardKPIs = {
  recoveryRate: 87.4,
  loansInRecovery: 1847,
  collectedMTD: 284750000,
  outstanding: 8432000000,
  activeMandates: 1247,
  openDisputes: 23,
  slaBreaches: 4,
  pendingApprovals: 11,
}

export const recoveryChartData = [
  { day: "May 18", success: 48300000, partial: 12100000, failed: 8900000 },
  { day: "May 19", success: 41200000, partial: 14500000, failed: 10200000 },
  { day: "May 20", success: 55700000, partial: 9800000, failed: 7400000 },
  { day: "May 21", success: 52100000, partial: 11200000, failed: 9500000 },
  { day: "May 22", success: 47800000, partial: 10600000, failed: 8800000 },
  { day: "May 23", success: 58400000, partial: 13200000, failed: 6700000 },
  { day: "May 24", success: 53900000, partial: 12800000, failed: 12700000 },
]

export const railDistributionData = [
  { name: "NDD", value: 58 },
  { name: "Remita", value: 28 },
  { name: "EasyPay", value: 14 },
]

export const droUsers: DROUser[] = [
  { id: "u1", name: "Fatima Bello", email: "f.bello@vfd.ng", role: "Debt Recovery Officer", casesAssigned: 127, recoveryRate: 91.2, status: "ACTIVE", lastActive: "2 min ago" },
  { id: "u2", name: "Chidi Okeke", email: "c.okeke@vfd.ng", role: "Senior DRO", casesAssigned: 143, recoveryRate: 88.7, status: "ACTIVE", lastActive: "15 min ago" },
  { id: "u3", name: "Yusuf Ibrahim", email: "y.ibrahim@vfd.ng", role: "Debt Recovery Officer", casesAssigned: 98, recoveryRate: 83.4, status: "ACTIVE", lastActive: "1 hour ago" },
  { id: "u4", name: "Adaora Nwosu", email: "a.nwosu@vfd.ng", role: "Recovery Manager", casesAssigned: 0, recoveryRate: 0, status: "ACTIVE", lastActive: "Just now" },
  { id: "u5", name: "Kunle Adesanya", email: "k.adesanya@vfd.ng", role: "Compliance Officer", casesAssigned: 0, recoveryRate: 0, status: "ACTIVE", lastActive: "3 hours ago" },
  { id: "u6", name: "Kemi Okonkwo", email: "k.okonkwo@vfd.ng", role: "Debt Recovery Officer", casesAssigned: 84, recoveryRate: 78.9, status: "ACTIVE", lastActive: "45 min ago" },
]

export const auditEvents: AuditEvent[] = [
  { id: "AUD-001", timestamp: "2025-05-24T15:30:00Z", actor: "Adaora Nwosu", role: "Recovery Manager", action: "Paused recovery for LN-19302 — customer complaint", module: "RECOVERY", entityId: "LN-19302", ipAddress: "196.23.45.67" },
  { id: "AUD-002", timestamp: "2025-05-24T14:10:00Z", actor: "Fatima Bello", role: "DRO", action: "Manual retry triggered for LN-28471", module: "RECOVERY", entityId: "LN-28471", ipAddress: "196.23.45.89" },
  { id: "AUD-003", timestamp: "2025-05-24T12:45:00Z", actor: "Adaora Nwosu", role: "Recovery Manager", action: "Policy change submitted: retry schedule updated (POL-RETRY-001)", module: "SYSTEM", entityId: "POL-RETRY-001", ipAddress: "196.23.45.67" },
  { id: "AUD-004", timestamp: "2025-05-24T11:00:00Z", actor: "System", role: "SYSTEM", action: "Loan LN-19302 auto-escalated to TIER_2 after 2 failed retry cycles", module: "RECOVERY", entityId: "LN-19302", ipAddress: "127.0.0.1" },
  { id: "AUD-005", timestamp: "2025-05-24T10:15:00Z", actor: "Chidi Okeke", role: "Senior DRO", action: "Dispute DSP-003 escalated to compliance team", module: "DISPUTE", entityId: "DSP-003", ipAddress: "196.23.45.91" },
  { id: "AUD-006", timestamp: "2025-05-24T09:30:00Z", actor: "System", role: "SYSTEM", action: "NDD mandate MND-881234 debit attempt — insufficient funds", module: "MANDATE", entityId: "MND-881234", ipAddress: "127.0.0.1" },
  { id: "AUD-007", timestamp: "2025-05-23T17:00:00Z", actor: "Kunle Adesanya", role: "Compliance Officer", action: "Write-off request for LN-78134 approved by compliance", module: "RECOVERY", entityId: "LN-78134", ipAddress: "196.23.45.70" },
  { id: "AUD-008", timestamp: "2025-05-23T14:20:00Z", actor: "Yusuf Ibrahim", role: "DRO", action: "iGree consent link sent to Aisha Mohammed (+234 806 789 0123)", module: "MANDATE", entityId: "LN-41023", ipAddress: "196.23.45.88" },
]

export const disputeNotes: Record<string, DisputeNote[]> = {
  "DSP-001": [
    { id: "n1", author: "Adaora Nwosu", role: "Recovery Manager", timestamp: "2025-05-21T10:00:00Z", text: "Opened investigation. Contacted borrower — claims she never authorised the mandate. Requested signed mandate form from NDD team." },
    { id: "n2", author: "Fatima Bello", role: "DRO", timestamp: "2025-05-22T14:30:00Z", text: "NDD team confirmed mandate was set up via iGree link sent on 2024-10-01. Forwarded consent log to borrower." },
  ],
  "DSP-003": [
    { id: "n3", author: "Chidi Okeke", role: "Senior DRO", timestamp: "2025-05-20T09:00:00Z", text: "Debit of ₦1,800,000 exceeds the mandate cap of ₦500,000. Likely a system error during mandate threshold update. Escalating to compliance." },
  ],
  "DSP-004": [
    { id: "n4", author: "Adaora Nwosu", role: "Recovery Manager", timestamp: "2025-05-19T15:00:00Z", text: "Serious allegation — borrower claims loan was not taken by her. Police report attached. Escalating to legal immediately. All collections paused." },
  ],
}

export const approvalRequests: ApprovalRequest[] = [
  {
    id: "APR-001",
    type: "WRITE_OFF",
    title: "Write-off request — LN-78134 (Kemi Olusanya)",
    description: "Loan has been in RECOVERY_FAILED state for 90+ days. All collection attempts exhausted. Requesting write-off of ₦750,000 outstanding balance.",
    initiator: "Yusuf Ibrahim",
    initiatorRole: "DRO",
    initiatedAt: "2025-05-23T11:00:00Z",
    status: "PENDING",
    checker: null,
    checkedAt: null,
    rejectionReason: null,
    entityId: "LN-78134",
    amount: 750000,
    expiresAt: "2025-05-30T00:00:00Z",
    module: "RECOVERY",
  },
  {
    id: "APR-002",
    type: "POLICY_CHANGE",
    title: "Update retry schedule — reduce interval from 7d to 3d",
    description: "Policy POL-RETRY-001: Change NDD retry interval from 7 business days to 3 business days for TIER_1 loans. Expected to improve early recovery rate by ~12%.",
    initiator: "Adaora Nwosu",
    initiatorRole: "Recovery Manager",
    initiatedAt: "2025-05-24T12:45:00Z",
    status: "PENDING",
    checker: null,
    checkedAt: null,
    rejectionReason: null,
    entityId: "POL-RETRY-001",
    expiresAt: "2025-05-31T00:00:00Z",
    module: "SYSTEM",
  },
  {
    id: "APR-003",
    type: "SETTLEMENT_REVERSAL",
    title: "Settlement reversal — STL-004 (Aisha Mohammed)",
    description: "Settlement STL-004 of ₦800,000 was collected during active dispute DSP-001. Requesting reversal per dispute resolution protocol.",
    initiator: "Adaora Nwosu",
    initiatorRole: "Recovery Manager",
    initiatedAt: "2025-05-22T09:00:00Z",
    status: "APPROVED",
    checker: "Kunle Adesanya",
    checkedAt: "2025-05-22T16:00:00Z",
    rejectionReason: null,
    entityId: "STL-004",
    amount: 800000,
    expiresAt: "2025-05-29T00:00:00Z",
    module: "SETTLEMENT",
  },
  {
    id: "APR-004",
    type: "ESCALATION",
    title: "Escalate LN-55247 to Legal — Chidinma Obi",
    description: "Loan 70 DPD, all mandates expired, EasyPay exhausted. Recommending legal escalation with demand letter. Outstanding: ₦3,000,000.",
    initiator: "Chidi Okeke",
    initiatorRole: "Senior DRO",
    initiatedAt: "2025-05-20T08:00:00Z",
    status: "APPROVED",
    checker: "Adaora Nwosu",
    checkedAt: "2025-05-20T14:30:00Z",
    rejectionReason: null,
    entityId: "LN-55247",
    amount: 3000000,
    expiresAt: "2025-05-27T00:00:00Z",
    module: "RECOVERY",
  },
  {
    id: "APR-005",
    type: "RATE_CHANGE",
    title: "Adjust interest rate — LN-62891 (Babatunde Adekoya)",
    description: "Borrower has engaged for restructuring. Proposing reduction of interest rate from 20% to 15% p.a. to facilitate settlement.",
    initiator: "Kemi Okonkwo",
    initiatorRole: "DRO",
    initiatedAt: "2025-05-24T09:00:00Z",
    status: "REJECTED",
    checker: "Adaora Nwosu",
    checkedAt: "2025-05-24T11:00:00Z",
    rejectionReason: "Rate reduction not within DRO authority. Requires CFO sign-off. Please escalate through proper channel.",
    entityId: "LN-62891",
    expiresAt: "2025-05-31T00:00:00Z",
    module: "RECOVERY",
  },
  {
    id: "APR-006",
    type: "WRITE_OFF",
    title: "Partial write-off request — LN-19302 (Ngozi Adeyemi)",
    description: "Borrower has offered ₦600,000 as full and final settlement of ₦1,050,000 outstanding. Requesting write-off of ₦450,000 balance.",
    initiator: "Chidi Okeke",
    initiatorRole: "Senior DRO",
    initiatedAt: "2025-05-25T08:00:00Z",
    status: "PENDING",
    checker: null,
    checkedAt: null,
    rejectionReason: null,
    entityId: "LN-19302",
    amount: 450000,
    expiresAt: "2025-06-01T00:00:00Z",
    module: "RECOVERY",
  },
]

export const igreeCases: IgreeCase[] = [
  {
    id: "IG-001",
    loanId: "LN-28471",
    borrower: "Emeka Okafor",
    phone: "+234 802 345 6789",
    email: "emeka.okafor@email.com",
    bank: "Access Bank",
    outstanding: 487500,
    rail: "NDD",
    consentStatus: "CONSENTED",
    sentAt: "2024-10-01T09:00:00Z",
    consentedAt: "2024-10-01T11:23:00Z",
    linkExpiry: "2024-10-08T09:00:00Z",
    dro: "Fatima Bello",
  },
  {
    id: "IG-002",
    loanId: "LN-19302",
    borrower: "Ngozi Adeyemi",
    phone: "+234 803 456 7890",
    email: "ngozi.a@gmail.com",
    bank: "GTBank",
    outstanding: 1050000,
    rail: "REMITA",
    consentStatus: "CONSENTED",
    sentAt: "2024-09-15T10:00:00Z",
    consentedAt: "2024-09-16T08:45:00Z",
    linkExpiry: "2024-09-22T10:00:00Z",
    dro: "Chidi Okeke",
  },
  {
    id: "IG-003",
    loanId: "LN-41023",
    borrower: "Aisha Mohammed",
    phone: "+234 806 789 0123",
    email: "aisha.m@outlook.com",
    bank: "First Bank",
    outstanding: 800000,
    rail: "NDD",
    consentStatus: "DECLINED",
    sentAt: "2024-10-20T09:00:00Z",
    consentedAt: null,
    linkExpiry: "2024-10-27T09:00:00Z",
    dro: "Yusuf Ibrahim",
  },
  {
    id: "IG-004",
    loanId: "LN-62891",
    borrower: "Babatunde Adekoya",
    phone: "+234 808 901 2345",
    email: "b.adekoya@gmail.com",
    bank: "Stanbic IBTC",
    outstanding: 450000,
    rail: "NDD",
    consentStatus: "NOT_SENT",
    sentAt: null,
    consentedAt: null,
    linkExpiry: null,
    dro: "Kemi Okonkwo",
  },
  {
    id: "IG-005",
    loanId: "LN-78134",
    borrower: "Kemi Olusanya",
    phone: "+234 809 012 3456",
    email: "kemi.o@yahoo.com",
    bank: "Fidelity Bank",
    outstanding: 750000,
    rail: "NDD",
    consentStatus: "EXPIRED",
    sentAt: "2025-04-01T09:00:00Z",
    consentedAt: null,
    linkExpiry: "2025-04-08T09:00:00Z",
    dro: "Yusuf Ibrahim",
  },
  {
    id: "IG-006",
    loanId: "LN-89456",
    borrower: "Segun Adewale",
    phone: "+234 810 123 4567",
    email: "segun.ade@company.ng",
    bank: "Polaris Bank",
    outstanding: 1800000,
    rail: "REMITA",
    consentStatus: "LINK_SENT",
    sentAt: "2025-05-24T10:00:00Z",
    consentedAt: null,
    linkExpiry: "2025-05-31T10:00:00Z",
    dro: "Fatima Bello",
  },
]

export const webhooks: WebhookEndpoint[] = [
  {
    id: "WH-001",
    url: "https://core.vfdbank.ng/recovery/webhook",
    events: ["mandate.created", "mandate.debited", "mandate.failed", "settlement.completed"],
    status: "ACTIVE",
    secret: "whsec_••••••••••••••••",
    lastDelivery: "2025-05-24T16:30:00Z",
    successRate: 99.2,
    createdAt: "2024-09-01",
  },
  {
    id: "WH-002",
    url: "https://notify.vfdbank.ng/hooks/recova",
    events: ["dispute.opened", "dispute.resolved", "sla.breached"],
    status: "ACTIVE",
    secret: "whsec_••••••••••••••••",
    lastDelivery: "2025-05-24T10:15:00Z",
    successRate: 97.8,
    createdAt: "2024-10-15",
  },
  {
    id: "WH-003",
    url: "https://audit.vfdbank.ng/ingest",
    events: ["*"],
    status: "FAILING",
    secret: "whsec_••••••••••••••••",
    lastDelivery: "2025-05-23T08:00:00Z",
    successRate: 61.4,
    createdAt: "2025-01-10",
  },
]

export const apiKeys: ApiKey[] = [
  {
    id: "AK-001",
    name: "Core Banking Integration",
    prefix: "rvk_live_xK9m••••",
    scopes: ["loans:read", "mandates:write", "settlements:read"],
    createdAt: "2024-09-01",
    lastUsed: "2025-05-24T16:28:00Z",
    expiresAt: null,
    status: "ACTIVE",
    createdBy: "Adaora Nwosu",
  },
  {
    id: "AK-002",
    name: "Reporting Service",
    prefix: "rvk_live_pQ3n••••",
    scopes: ["loans:read", "settlements:read", "audit:read"],
    createdAt: "2024-11-15",
    lastUsed: "2025-05-24T08:00:00Z",
    expiresAt: "2025-11-15",
    status: "ACTIVE",
    createdBy: "Kunle Adesanya",
  },
  {
    id: "AK-003",
    name: "Old Mobile App Key",
    prefix: "rvk_live_bR7j••••",
    scopes: ["loans:read"],
    createdAt: "2024-07-01",
    lastUsed: "2025-01-10T12:00:00Z",
    expiresAt: "2025-07-01",
    status: "REVOKED",
    createdBy: "Adaora Nwosu",
  },
]

// ─── Operations Command Center Data ───────────────────────────────────────────

export interface Incident {
  id: string
  timestamp: string
  type: "LATENCY" | "FAILURE_RATE" | "DUPLICATE" | "OUTAGE" | "THRESHOLD_BREACH"
  severity: "INFO" | "WARNING" | "CRITICAL"
  rail?: RecoveryRail
  bank?: string
  message: string
  resolved: boolean
}

export interface FailedRecovery {
  id: string
  loanId: string
  borrower: string
  phone: string
  amount: number
  failureReason: "INSUFFICIENT_FUNDS" | "ACCOUNT_DORMANT" | "MANDATE_EXPIRED" | "BANK_TIMEOUT" | "INVALID_ACCOUNT" | "DAILY_LIMIT_EXCEEDED"
  lastAttempt: string
  attempts: number
  maxAttempts: number
  assignedTo: string | null
  rail: RecoveryRail
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "PAUSED"
  recommendations: { action: string; reason: string; confidence: "HIGH" | "MEDIUM" | "LOW" }[]
}

export interface ReconciliationException {
  id: string
  transactionId: string
  loanId: string
  borrower: string
  amount: number
  internalStatus: "SUCCESS" | "PENDING" | "FAILED"
  bankStatus: "CONFIRMED" | "UNKNOWN" | "REJECTED" | "PENDING"
  exceptionType: "STATUS_MISMATCH" | "DUPLICATE_DEBIT" | "AMOUNT_MISMATCH" | "MISSING_CREDIT"
  createdAt: string
  assignedTo: string | null
  rail: RecoveryRail
}

export interface Obligation {
  id: string
  loanId: string
  dueDate: string
  amount: number
  status: "PAID" | "PARTIAL" | "PENDING" | "OVERDUE" | "WAIVED"
  paidAmount?: number
  paidAt?: string
}

export interface BorrowerAccount {
  id: string
  loanId: string
  bank: string
  accountNumber: string
  mandateStatus: MandateStatus | null
  inboundScore: number | null
  lastKnownBalance: number | null
  lastChecked: string | null
  isPrimary: boolean
}

export interface PolicyConfig {
  retry_intervals: number[]
  max_attempts: number
  partial_recovery_enabled: boolean
  min_partial_amount: number
  rail_priority: RecoveryRail[]
  quiet_hours: string
  escalation_dpd_threshold: number
  legal_dpd_threshold: number
  at_risk_amount_threshold: number
  easypay_trigger_after_failures: number
}

export const recoveryTodayStats = {
  attempted: 12432,
  successful: 8920,
  failed: 3512,
  successRate: 71.7,
  successRateTarget: 75.0,
  trend: -2.3,
  alertActive: true,
}

export const railPerformance = [
  { rail: "NDD" as RecoveryRail, successRate: 82, target: 80, attempted: 7200, successful: 5904, status: "good" as const },
  { rail: "REMITA" as RecoveryRail, successRate: 68, target: 75, attempted: 3800, successful: 2584, status: "warning" as const },
  { rail: "EASY_PAY" as RecoveryRail, successRate: 55, target: 70, attempted: 1432, successful: 788, status: "critical" as const },
]

export const actionQueueCounts = {
  failedRecoveries: 540,
  mandateIssues: 320,
  disputes: 23,
  reconciliationExceptions: 45,
  collectionsCases: 120,
  pendingApprovals: 11,
}

export const liveIncidents: Incident[] = [
  { id: "INC-001", timestamp: "2025-05-24T10:45:00Z", type: "LATENCY", severity: "WARNING", rail: "NDD", bank: "GTBank", message: "NDD latency spike detected — GTBank avg response 4.2s (threshold: 2s)", resolved: false },
  { id: "INC-002", timestamp: "2025-05-24T10:49:00Z", type: "FAILURE_RATE", severity: "CRITICAL", rail: "EASY_PAY", message: "EasyPay failure rate exceeded 40% in last 15 minutes — 88 failed of 218 attempts", resolved: false },
  { id: "INC-003", timestamp: "2025-05-24T10:52:00Z", type: "DUPLICATE", severity: "CRITICAL", message: "Duplicate debit detected — Loan LN-41023 (Aisha Mohammed) debited twice in 4 minutes", resolved: false },
  { id: "INC-004", timestamp: "2025-05-24T09:30:00Z", type: "THRESHOLD_BREACH", severity: "WARNING", message: "Overall success rate fell below 75% target — currently at 71.7%", resolved: false },
  { id: "INC-005", timestamp: "2025-05-24T08:15:00Z", type: "OUTAGE", severity: "CRITICAL", rail: "REMITA", bank: "Zenith Bank", message: "Remita API timeout for Zenith Bank — 12-minute outage, 47 transactions queued", resolved: true },
]

export const failedRecoveries: FailedRecovery[] = [
  {
    id: "FR-001", loanId: "LN-28471", borrower: "Emeka Okafor", phone: "+234 802 345 6789",
    amount: 487500, failureReason: "INSUFFICIENT_FUNDS", lastAttempt: "2025-05-24T09:15:00Z",
    attempts: 2, maxAttempts: 5, assignedTo: "Fatima Bello", rail: "NDD", status: "OPEN",
    recommendations: [
      { action: "Retry via EasyPay in 12h", reason: "NDD failed twice — EasyPay has higher success for this bank", confidence: "HIGH" },
      { action: "Check Account #2 (First Bank)", reason: "Alternate account shows higher inbound score (0.74)", confidence: "MEDIUM" },
    ],
  },
  {
    id: "FR-002", loanId: "LN-19302", borrower: "Ngozi Adeyemi", phone: "+234 803 456 7890",
    amount: 1050000, failureReason: "ACCOUNT_DORMANT", lastAttempt: "2025-05-22T14:30:00Z",
    attempts: 4, maxAttempts: 5, assignedTo: null, rail: "REMITA", status: "OPEN",
    recommendations: [
      { action: "Remove dormant account — trigger iGree for new account", reason: "Account has been dormant for 45+ days", confidence: "HIGH" },
      { action: "Escalate to TIER_3 — contact borrower directly", reason: "4 failed attempts, high balance", confidence: "HIGH" },
    ],
  },
  {
    id: "FR-003", loanId: "LN-62891", borrower: "Babatunde Adekoya", phone: "+234 808 901 2345",
    amount: 450000, failureReason: "MANDATE_EXPIRED", lastAttempt: "2025-05-24T08:00:00Z",
    attempts: 1, maxAttempts: 5, assignedTo: null, rail: "NDD", status: "OPEN",
    recommendations: [
      { action: "Setup new mandate — iGree consent not obtained", reason: "Original mandate expired, no replacement", confidence: "HIGH" },
      { action: "Skip — send reminder SMS first", reason: "Low DPD (14 days), borrower may self-pay", confidence: "MEDIUM" },
    ],
  },
  {
    id: "FR-004", loanId: "LN-78134", borrower: "Kemi Olusanya", phone: "+234 809 012 3456",
    amount: 750000, failureReason: "DAILY_LIMIT_EXCEEDED", lastAttempt: "2025-05-24T07:30:00Z",
    attempts: 5, maxAttempts: 5, assignedTo: "Yusuf Ibrahim", rail: "NDD", status: "OPEN",
    recommendations: [
      { action: "Max retries reached — write-off or legal", reason: "5 failures on NDD, account limit restriction", confidence: "HIGH" },
    ],
  },
  {
    id: "FR-005", loanId: "LN-89456", borrower: "Segun Adewale", phone: "+234 810 123 4567",
    amount: 1800000, failureReason: "BANK_TIMEOUT", lastAttempt: "2025-05-24T10:50:00Z",
    attempts: 2, maxAttempts: 5, assignedTo: "Fatima Bello", rail: "REMITA", status: "IN_PROGRESS",
    recommendations: [
      { action: "Retry in 2h — bank timeout, likely transient", reason: "Remita API had 12-min outage, Zenith Bank affected", confidence: "HIGH" },
    ],
  },
]

export const reconciliationExceptions: ReconciliationException[] = [
  { id: "REC-001", transactionId: "TX-2025052401", loanId: "LN-33812", borrower: "Tunde Fashola", amount: 162500, internalStatus: "SUCCESS", bankStatus: "UNKNOWN", exceptionType: "STATUS_MISMATCH", createdAt: "2025-05-24T11:05:00Z", assignedTo: null, rail: "NDD" },
  { id: "REC-002", transactionId: "TX-2025052402", loanId: "LN-41023", borrower: "Aisha Mohammed", amount: 800000, internalStatus: "SUCCESS", bankStatus: "CONFIRMED", exceptionType: "DUPLICATE_DEBIT", createdAt: "2025-05-24T10:52:00Z", assignedTo: "Kunle Adesanya", rail: "NDD" },
  { id: "REC-003", transactionId: "TX-2025052201", loanId: "LN-89456", borrower: "Segun Adewale", amount: 200000, internalStatus: "SUCCESS", bankStatus: "REJECTED", exceptionType: "STATUS_MISMATCH", createdAt: "2025-05-22T16:30:00Z", assignedTo: null, rail: "REMITA" },
  { id: "REC-004", transactionId: "TX-2025052101", loanId: "LN-28471", borrower: "Emeka Okafor", amount: 75000, internalStatus: "PENDING", bankStatus: "UNKNOWN", exceptionType: "MISSING_CREDIT", createdAt: "2025-05-21T09:00:00Z", assignedTo: null, rail: "NDD" },
  { id: "REC-005", transactionId: "TX-2025052002", loanId: "LN-19302", borrower: "Ngozi Adeyemi", amount: 1050000, internalStatus: "SUCCESS", bankStatus: "CONFIRMED", exceptionType: "AMOUNT_MISMATCH", createdAt: "2025-05-20T14:00:00Z", assignedTo: "Kunle Adesanya", rail: "REMITA" },
]

export const obligations: Obligation[] = [
  { id: "OBL-001", loanId: "LN-28471", dueDate: "2024-11-01", amount: 162500, status: "OVERDUE", paidAmount: 0 },
  { id: "OBL-002", loanId: "LN-28471", dueDate: "2024-12-01", amount: 162500, status: "OVERDUE", paidAmount: 0 },
  { id: "OBL-003", loanId: "LN-28471", dueDate: "2025-01-01", amount: 162500, status: "PENDING" },
  { id: "OBL-004", loanId: "LN-19302", dueDate: "2024-10-15", amount: 400000, status: "OVERDUE", paidAmount: 150000 },
  { id: "OBL-005", loanId: "LN-19302", dueDate: "2024-11-15", amount: 400000, status: "OVERDUE", paidAmount: 0 },
  { id: "OBL-006", loanId: "LN-19302", dueDate: "2024-12-15", amount: 400000, status: "PENDING" },
  { id: "OBL-007", loanId: "LN-33812", dueDate: "2024-12-01", amount: 87500, status: "PAID", paidAmount: 87500, paidAt: "2025-05-23T11:05:00Z" },
  { id: "OBL-008", loanId: "LN-33812", dueDate: "2025-01-01", amount: 87500, status: "PARTIAL", paidAmount: 42500 },
  { id: "OBL-009", loanId: "LN-33812", dueDate: "2025-02-01", amount: 87500, status: "PENDING" },
]

export const borrowerAccounts: BorrowerAccount[] = [
  { id: "ACC-001", loanId: "LN-28471", bank: "Access Bank", accountNumber: "0123456789", mandateStatus: "ACTIVE", inboundScore: 0.71, lastKnownBalance: 38500, lastChecked: "2025-05-24T06:00:00Z", isPrimary: true },
  { id: "ACC-002", loanId: "LN-28471", bank: "First Bank", accountNumber: "3045678901", mandateStatus: null, inboundScore: 0.74, lastKnownBalance: 91200, lastChecked: "2025-05-24T06:00:00Z", isPrimary: false },
  { id: "ACC-003", loanId: "LN-19302", bank: "GTBank", accountNumber: "0987654321", mandateStatus: "ACTIVE", inboundScore: 0.12, lastKnownBalance: 2100, lastChecked: "2025-05-22T06:00:00Z", isPrimary: true },
  { id: "ACC-004", loanId: "LN-19302", bank: "Zenith Bank", accountNumber: "2198765432", mandateStatus: "FAILED", inboundScore: null, lastKnownBalance: null, lastChecked: null, isPrimary: false },
  { id: "ACC-005", loanId: "LN-33812", bank: "Zenith Bank", accountNumber: "0246813579", mandateStatus: "ACTIVE", inboundScore: 0.88, lastKnownBalance: 124000, lastChecked: "2025-05-23T06:00:00Z", isPrimary: true },
]

export const policyConfig: PolicyConfig = {
  retry_intervals: [24, 72, 168],
  max_attempts: 5,
  partial_recovery_enabled: true,
  min_partial_amount: 1000,
  rail_priority: ["NDD", "EASY_PAY", "REMITA"],
  quiet_hours: "22:00-06:00",
  escalation_dpd_threshold: 30,
  legal_dpd_threshold: 180,
  at_risk_amount_threshold: 500000,
  easypay_trigger_after_failures: 2,
}

// ─── Risk & Recovery Decision Engine ──────────────────────────────────────────

export interface AccountFeatures {
  avgMonthlyInflow: number
  lastCreditAmount: number
  creditFrequency: number
  balanceVolatility: number
  lastDebitSuccessRate: number
  bankReliabilityScore: number
}

export interface BorrowerFeatures {
  repaymentHistory: number
  dpd: number
  loanCount: number
  disputeHistory: number
}

export type DecisionStatus = "PENDING" | "EXECUTED" | "FAILED" | "SKIPPED"
export type AmountStrategy = "FULL" | "PARTIAL"
export type TimingReason = "RECENT_CREDIT_DETECTED" | "PREDICTED_INFLOW" | "IMMEDIATE_TRIGGER" | "SCHEDULED"

export interface RecoveryDecision {
  id: string
  loanId: string
  borrower: string
  bank: string
  bankCode: string
  accountNumber: string
  rail: RecoveryRail
  amount: number
  outstandingBalance: number
  scheduledAt: string
  executedAt: string | null
  confidenceScore: number
  accountScore: number
  status: DecisionStatus
  amountStrategy: AmountStrategy
  timingReason: TimingReason
  blockReason: string | null
  accountFeatures: AccountFeatures
  borrowerFeatures: BorrowerFeatures
  createdAt: string
}

export interface ThrottledAccount {
  id: string
  loanId: string
  borrower: string
  bank: string
  bankCode: string
  accountNumber: string
  failureCount: number
  lastFailureReason: string
  firstFailureAt: string
  suspendedUntil: string
  status: "SUSPENDED" | "RELEASED"
}

export type RecoveryEventType =
  | "BALANCE_INCREASE"
  | "MANDATE_ACTIVATED"
  | "PAYMENT_RECEIVED"
  | "DEBIT_FAILED"
  | "DISPUTE_OPENED"
  | "INFLOW_PREDICTED"
  | "THROTTLE_APPLIED"
  | "THROTTLE_RELEASED"

export interface RecoveryEvent {
  id: string
  type: RecoveryEventType
  loanId: string
  borrower: string
  timestamp: string
  triggeredDecisionId: string | null
  amount: number | null
  detail: string
}

export interface DecisionEngineKPIs {
  recoveryPerAttempt: number
  recoveryPerAttemptTarget: number
  costPerSuccessfulRecovery: number
  costTarget: number
  avgRetriesPerLoan: number
  avgRetriesTarget: number
  avgTimeToRecoveryHours: number
  timeToRecoveryTarget: number
  decisionsToday: number
  executedToday: number
  pendingDecisions: number
  throttledAccounts: number
}

export const decisionEngineKPIs: DecisionEngineKPIs = {
  recoveryPerAttempt: 71.4,
  recoveryPerAttemptTarget: 78,
  costPerSuccessfulRecovery: 420,
  costTarget: 500,
  avgRetriesPerLoan: 2.1,
  avgRetriesTarget: 2.5,
  avgTimeToRecoveryHours: 6.8,
  timeToRecoveryTarget: 12,
  decisionsToday: 1247,
  executedToday: 891,
  pendingDecisions: 134,
  throttledAccounts: 23,
}

export const recoveryDecisions: RecoveryDecision[] = [
  {
    id: "DEC-001",
    loanId: "LN-28471",
    borrower: "Emeka Okafor",
    bank: "Access Bank",
    bankCode: "044",
    accountNumber: "0123456789",
    rail: "NDD",
    amount: 487500,
    outstandingBalance: 487500,
    scheduledAt: "2025-05-25T09:00:00Z",
    executedAt: null,
    confidenceScore: 0.87,
    accountScore: 0.82,
    status: "PENDING",
    amountStrategy: "FULL",
    timingReason: "RECENT_CREDIT_DETECTED",
    blockReason: null,
    accountFeatures: {
      avgMonthlyInflow: 650000,
      lastCreditAmount: 487500,
      creditFrequency: 2.3,
      balanceVolatility: 0.21,
      lastDebitSuccessRate: 0.67,
      bankReliabilityScore: 0.89,
    },
    borrowerFeatures: { repaymentHistory: 0.74, dpd: 23, loanCount: 2, disputeHistory: 0 },
    createdAt: "2025-05-24T18:30:00Z",
  },
  {
    id: "DEC-002",
    loanId: "LN-19302",
    borrower: "Ngozi Adeyemi",
    bank: "GTBank",
    bankCode: "058",
    accountNumber: "0987654321",
    rail: "REMITA",
    amount: 525000,
    outstandingBalance: 1050000,
    scheduledAt: "2025-05-26T11:00:00Z",
    executedAt: null,
    confidenceScore: 0.61,
    accountScore: 0.48,
    status: "PENDING",
    amountStrategy: "PARTIAL",
    timingReason: "PREDICTED_INFLOW",
    blockReason: null,
    accountFeatures: {
      avgMonthlyInflow: 380000,
      lastCreditAmount: 120000,
      creditFrequency: 1.1,
      balanceVolatility: 0.68,
      lastDebitSuccessRate: 0.25,
      bankReliabilityScore: 0.62,
    },
    borrowerFeatures: { repaymentHistory: 0.42, dpd: 40, loanCount: 3, disputeHistory: 1 },
    createdAt: "2025-05-24T18:31:00Z",
  },
  {
    id: "DEC-003",
    loanId: "LN-89456",
    borrower: "Segun Adewale",
    bank: "Polaris Bank",
    bankCode: "076",
    accountNumber: "0680235791",
    rail: "REMITA",
    amount: 450000,
    outstandingBalance: 1800000,
    scheduledAt: "2025-05-25T14:00:00Z",
    executedAt: "2025-05-25T14:02:00Z",
    confidenceScore: 0.74,
    accountScore: 0.71,
    status: "EXECUTED",
    amountStrategy: "PARTIAL",
    timingReason: "RECENT_CREDIT_DETECTED",
    blockReason: null,
    accountFeatures: {
      avgMonthlyInflow: 820000,
      lastCreditAmount: 520000,
      creditFrequency: 2.8,
      balanceVolatility: 0.34,
      lastDebitSuccessRate: 0.55,
      bankReliabilityScore: 0.71,
    },
    borrowerFeatures: { repaymentHistory: 0.58, dpd: 19, loanCount: 1, disputeHistory: 1 },
    createdAt: "2025-05-24T18:32:00Z",
  },
  {
    id: "DEC-004",
    loanId: "LN-33812",
    borrower: "Tunde Fashola",
    bank: "Zenith Bank",
    bankCode: "057",
    accountNumber: "0246813579",
    rail: "NDD",
    amount: 0,
    outstandingBalance: 87500,
    scheduledAt: "2025-05-25T09:00:00Z",
    executedAt: null,
    confidenceScore: 0,
    accountScore: 0.88,
    status: "SKIPPED",
    amountStrategy: "FULL",
    timingReason: "SCHEDULED",
    blockReason: "dispute_active",
    accountFeatures: {
      avgMonthlyInflow: 290000,
      lastCreditAmount: 87500,
      creditFrequency: 3.1,
      balanceVolatility: 0.12,
      lastDebitSuccessRate: 0.91,
      bankReliabilityScore: 0.88,
    },
    borrowerFeatures: { repaymentHistory: 0.85, dpd: 5, loanCount: 1, disputeHistory: 1 },
    createdAt: "2025-05-24T18:33:00Z",
  },
  {
    id: "DEC-005",
    loanId: "LN-78134",
    borrower: "Kemi Olusanya",
    bank: "Fidelity Bank",
    bankCode: "070",
    accountNumber: "0579124680",
    rail: "EASY_PAY",
    amount: 375000,
    outstandingBalance: 750000,
    scheduledAt: "2025-05-25T08:00:00Z",
    executedAt: "2025-05-25T08:05:00Z",
    confidenceScore: 0.52,
    accountScore: 0.39,
    status: "FAILED",
    amountStrategy: "PARTIAL",
    timingReason: "SCHEDULED",
    blockReason: null,
    accountFeatures: {
      avgMonthlyInflow: 180000,
      lastCreditAmount: 45000,
      creditFrequency: 0.8,
      balanceVolatility: 0.82,
      lastDebitSuccessRate: 0.12,
      bankReliabilityScore: 0.71,
    },
    borrowerFeatures: { repaymentHistory: 0.21, dpd: 55, loanCount: 2, disputeHistory: 0 },
    createdAt: "2025-05-24T18:34:00Z",
  },
  {
    id: "DEC-006",
    loanId: "LN-62891",
    borrower: "Babatunde Adekoya",
    bank: "Stanbic IBTC",
    bankCode: "221",
    accountNumber: "0468013579",
    rail: "NDD",
    amount: 0,
    outstandingBalance: 450000,
    scheduledAt: "2025-05-25T09:00:00Z",
    executedAt: null,
    confidenceScore: 0,
    accountScore: 0.64,
    status: "SKIPPED",
    amountStrategy: "FULL",
    timingReason: "SCHEDULED",
    blockReason: "mandate_revoked",
    accountFeatures: {
      avgMonthlyInflow: 510000,
      lastCreditAmount: 210000,
      creditFrequency: 1.9,
      balanceVolatility: 0.29,
      lastDebitSuccessRate: 0.72,
      bankReliabilityScore: 0.78,
    },
    borrowerFeatures: { repaymentHistory: 0.62, dpd: 14, loanCount: 1, disputeHistory: 0 },
    createdAt: "2025-05-24T18:35:00Z",
  },
]

export const throttledAccounts: ThrottledAccount[] = [
  {
    id: "THR-001",
    loanId: "LN-78134",
    borrower: "Kemi Olusanya",
    bank: "Fidelity Bank",
    bankCode: "070",
    accountNumber: "0579124680",
    failureCount: 3,
    lastFailureReason: "DAILY_LIMIT_EXCEEDED",
    firstFailureAt: "2025-05-24T07:00:00Z",
    suspendedUntil: "2025-05-26T07:00:00Z",
    status: "SUSPENDED",
  },
  {
    id: "THR-002",
    loanId: "LN-55247",
    borrower: "Chidinma Obi",
    bank: "UBA",
    bankCode: "033",
    accountNumber: "0357924680",
    failureCount: 4,
    lastFailureReason: "ACCOUNT_DORMANT",
    firstFailureAt: "2025-05-23T08:00:00Z",
    suspendedUntil: "2025-05-25T08:00:00Z",
    status: "RELEASED",
  },
  {
    id: "THR-003",
    loanId: "LN-91445",
    borrower: "Olumide Babalola",
    bank: "Union Bank",
    bankCode: "032",
    accountNumber: "0112233445",
    failureCount: 3,
    lastFailureReason: "BANK_TIMEOUT",
    firstFailureAt: "2025-05-24T10:00:00Z",
    suspendedUntil: "2025-05-26T10:00:00Z",
    status: "SUSPENDED",
  },
]

export const recoveryEvents: RecoveryEvent[] = [
  {
    id: "EVT-001",
    type: "BALANCE_INCREASE",
    loanId: "LN-28471",
    borrower: "Emeka Okafor",
    timestamp: "2025-05-24T17:45:00Z",
    triggeredDecisionId: "DEC-001",
    amount: 650000,
    detail: "Account credited ₦650,000. Recovery scheduled immediately.",
  },
  {
    id: "EVT-002",
    type: "INFLOW_PREDICTED",
    loanId: "LN-19302",
    borrower: "Ngozi Adeyemi",
    timestamp: "2025-05-24T16:20:00Z",
    triggeredDecisionId: "DEC-002",
    amount: null,
    detail: "Model predicts salary inflow within 36h based on credit pattern.",
  },
  {
    id: "EVT-003",
    type: "DEBIT_FAILED",
    loanId: "LN-78134",
    borrower: "Kemi Olusanya",
    timestamp: "2025-05-24T07:30:00Z",
    triggeredDecisionId: null,
    amount: 375000,
    detail: "NDD debit failed — daily limit exceeded. Failure #3 in 24h.",
  },
  {
    id: "EVT-004",
    type: "THROTTLE_APPLIED",
    loanId: "LN-78134",
    borrower: "Kemi Olusanya",
    timestamp: "2025-05-24T07:31:00Z",
    triggeredDecisionId: null,
    amount: null,
    detail: "Account suspended for 48h after 3 consecutive failures.",
  },
  {
    id: "EVT-005",
    type: "PAYMENT_RECEIVED",
    loanId: "LN-89456",
    borrower: "Segun Adewale",
    timestamp: "2025-05-25T13:55:00Z",
    triggeredDecisionId: "DEC-003",
    amount: 520000,
    detail: "Balance increase confirmed. Remita debit triggered immediately.",
  },
  {
    id: "EVT-006",
    type: "DISPUTE_OPENED",
    loanId: "LN-33812",
    borrower: "Tunde Fashola",
    timestamp: "2025-05-23T12:00:00Z",
    triggeredDecisionId: null,
    amount: null,
    detail: "Active dispute detected. Recovery decision blocked.",
  },
  {
    id: "EVT-007",
    type: "MANDATE_ACTIVATED",
    loanId: "LN-65123",
    borrower: "Funke Adeyemi",
    timestamp: "2025-05-24T15:00:00Z",
    triggeredDecisionId: null,
    amount: null,
    detail: "NDD mandate activated. Account added to scoring queue.",
  },
  {
    id: "EVT-008",
    type: "THROTTLE_RELEASED",
    loanId: "LN-55247",
    borrower: "Chidinma Obi",
    timestamp: "2025-05-25T08:00:00Z",
    triggeredDecisionId: null,
    amount: null,
    detail: "48h suspension lifted. Account re-enabled for recovery.",
  },
]

// ─── Loan Management & Repayment Scheduler ──────────────────────────────────

export type ObligationStatus = "PENDING" | "DUE" | "PARTIALLY_PAID" | "PAID" | "DEFAULTED" | "OVERDUE" | "RESTRUCTURED"
export type AmortizationType = "FLAT" | "DECLINING_BALANCE" | "BULLET"

export interface RepaymentObligation {
  id: string
  loanId: string
  borrower: string
  period: number
  dueDate: string
  principalComponent: number
  interestComponent: number
  penaltyComponent: number
  totalDue: number
  outstandingAmount: number
  paidAmount: number
  paidAt: string | null
  status: ObligationStatus
  createdAt: string
  updatedAt: string
}

export interface LoanScheduleSummary {
  loanId: string
  borrower: string
  principal: number
  interestRate: number
  tenureMonths: number
  amortizationType: AmortizationType
  disbursementDate: string
  totalRepayable: number
  totalPaid: number
}

export interface PenaltyRecord {
  id: string
  loanId: string
  borrower: string
  obligationId: string
  type: "PERCENTAGE" | "FLAT"
  value: number
  amount: number
  appliedAt: string
  status: "APPLIED" | "PAID" | "WAIVED"
}

export interface SchedulerKPIs {
  obligationAccuracy: number
  paymentAllocationErrors: number
  penaltyCorrectness: number
  totalObligations: number
  paidObligations: number
  overdueObligations: number
  totalOutstanding: number
}

export const schedulerKPIs: SchedulerKPIs = {
  obligationAccuracy: 99.8,
  paymentAllocationErrors: 3,
  penaltyCorrectness: 100,
  totalObligations: 24,
  paidObligations: 7,
  overdueObligations: 9,
  totalOutstanding: 5337500,
}

export const loanScheduleSummaries: LoanScheduleSummary[] = [
  { loanId: "LN-28471", borrower: "Emeka Okafor", principal: 500000, interestRate: 24, tenureMonths: 3, amortizationType: "FLAT", disbursementDate: "2024-10-01", totalRepayable: 530000, totalPaid: 12500 },
  { loanId: "LN-19302", borrower: "Ngozi Adeyemi", principal: 1200000, interestRate: 30, tenureMonths: 4, amortizationType: "DECLINING_BALANCE", disbursementDate: "2024-09-15", totalRepayable: 1290000, totalPaid: 190000 },
  { loanId: "LN-33812", borrower: "Tunde Fashola", principal: 250000, interestRate: 18, tenureMonths: 3, amortizationType: "FLAT", disbursementDate: "2024-11-01", totalRepayable: 261250, totalPaid: 111250 },
  { loanId: "LN-89456", borrower: "Segun Adewale", principal: 2000000, interestRate: 24, tenureMonths: 5, amortizationType: "DECLINING_BALANCE", disbursementDate: "2024-10-05", totalRepayable: 2250000, totalPaid: 400000 },
]

export const repaymentObligations: RepaymentObligation[] = [
  { id: "OBL-D001", loanId: "LN-28471", borrower: "Emeka Okafor", period: 1, dueDate: "2024-11-01", principalComponent: 166667, interestComponent: 10000, penaltyComponent: 8750, totalDue: 176667, outstandingAmount: 185417, paidAmount: 0, paidAt: null, status: "DEFAULTED", createdAt: "2024-10-01T00:00:00Z", updatedAt: "2025-05-24T00:00:00Z" },
  { id: "OBL-D002", loanId: "LN-28471", borrower: "Emeka Okafor", period: 2, dueDate: "2024-12-01", principalComponent: 166667, interestComponent: 10000, penaltyComponent: 5000, totalDue: 176667, outstandingAmount: 181667, paidAmount: 0, paidAt: null, status: "DEFAULTED", createdAt: "2024-10-01T00:00:00Z", updatedAt: "2025-05-24T00:00:00Z" },
  { id: "OBL-D003", loanId: "LN-28471", borrower: "Emeka Okafor", period: 3, dueDate: "2025-01-01", principalComponent: 166666, interestComponent: 10000, penaltyComponent: 0, totalDue: 176666, outstandingAmount: 164166, paidAmount: 12500, paidAt: "2024-12-15T09:00:00Z", status: "PARTIALLY_PAID", createdAt: "2024-10-01T00:00:00Z", updatedAt: "2024-12-15T09:00:00Z" },
  { id: "OBL-D004", loanId: "LN-19302", borrower: "Ngozi Adeyemi", period: 1, dueDate: "2024-10-15", principalComponent: 280000, interestComponent: 30000, penaltyComponent: 15000, totalDue: 310000, outstandingAmount: 325000, paidAmount: 0, paidAt: null, status: "DEFAULTED", createdAt: "2024-09-15T00:00:00Z", updatedAt: "2025-05-22T00:00:00Z" },
  { id: "OBL-D005", loanId: "LN-19302", borrower: "Ngozi Adeyemi", period: 2, dueDate: "2024-11-15", principalComponent: 287000, interestComponent: 23000, penaltyComponent: 10000, totalDue: 310000, outstandingAmount: 320000, paidAmount: 0, paidAt: null, status: "DEFAULTED", createdAt: "2024-09-15T00:00:00Z", updatedAt: "2025-05-22T00:00:00Z" },
  { id: "OBL-D006", loanId: "LN-19302", borrower: "Ngozi Adeyemi", period: 3, dueDate: "2024-12-15", principalComponent: 294500, interestComponent: 15500, penaltyComponent: 0, totalDue: 310000, outstandingAmount: 310000, paidAmount: 0, paidAt: null, status: "OVERDUE", createdAt: "2024-09-15T00:00:00Z", updatedAt: "2025-05-22T00:00:00Z" },
  { id: "OBL-D007", loanId: "LN-19302", borrower: "Ngozi Adeyemi", period: 4, dueDate: "2025-01-15", principalComponent: 338500, interestComponent: 7500, penaltyComponent: 0, totalDue: 346000, outstandingAmount: 95000, paidAmount: 190000, paidAt: "2025-01-10T14:00:00Z", status: "PARTIALLY_PAID", createdAt: "2024-09-15T00:00:00Z", updatedAt: "2025-01-10T14:00:00Z" },
  { id: "OBL-D008", loanId: "LN-33812", borrower: "Tunde Fashola", period: 1, dueDate: "2024-12-01", principalComponent: 83333, interestComponent: 3750, penaltyComponent: 0, totalDue: 87083, outstandingAmount: 0, paidAmount: 87083, paidAt: "2024-11-28T11:00:00Z", status: "PAID", createdAt: "2024-11-01T00:00:00Z", updatedAt: "2024-11-28T11:00:00Z" },
  { id: "OBL-D009", loanId: "LN-33812", borrower: "Tunde Fashola", period: 2, dueDate: "2025-01-01", principalComponent: 83333, interestComponent: 3750, penaltyComponent: 0, totalDue: 87083, outstandingAmount: 62500, paidAmount: 24583, paidAt: "2025-01-05T11:00:00Z", status: "PARTIALLY_PAID", createdAt: "2024-11-01T00:00:00Z", updatedAt: "2025-01-05T11:00:00Z" },
  { id: "OBL-D010", loanId: "LN-33812", borrower: "Tunde Fashola", period: 3, dueDate: "2025-02-01", principalComponent: 83334, interestComponent: 3750, penaltyComponent: 0, totalDue: 87084, outstandingAmount: 87084, paidAmount: 0, paidAt: null, status: "DUE", createdAt: "2024-11-01T00:00:00Z", updatedAt: "2025-02-01T00:00:00Z" },
  { id: "OBL-D011", loanId: "LN-89456", borrower: "Segun Adewale", period: 1, dueDate: "2024-11-05", principalComponent: 360000, interestComponent: 40000, penaltyComponent: 0, totalDue: 400000, outstandingAmount: 0, paidAmount: 400000, paidAt: "2024-11-03T10:00:00Z", status: "PAID", createdAt: "2024-10-05T00:00:00Z", updatedAt: "2024-11-03T10:00:00Z" },
  { id: "OBL-D012", loanId: "LN-89456", borrower: "Segun Adewale", period: 2, dueDate: "2024-12-05", principalComponent: 367200, interestComponent: 32800, penaltyComponent: 20000, totalDue: 400000, outstandingAmount: 420000, paidAmount: 0, paidAt: null, status: "DEFAULTED", createdAt: "2024-10-05T00:00:00Z", updatedAt: "2025-05-24T00:00:00Z" },
  { id: "OBL-D013", loanId: "LN-89456", borrower: "Segun Adewale", period: 3, dueDate: "2025-01-05", principalComponent: 374544, interestComponent: 25456, penaltyComponent: 0, totalDue: 400000, outstandingAmount: 400000, paidAmount: 0, paidAt: null, status: "DEFAULTED", createdAt: "2024-10-05T00:00:00Z", updatedAt: "2025-05-24T00:00:00Z" },
  { id: "OBL-D014", loanId: "LN-89456", borrower: "Segun Adewale", period: 4, dueDate: "2025-02-05", principalComponent: 382035, interestComponent: 17965, penaltyComponent: 0, totalDue: 400000, outstandingAmount: 400000, paidAmount: 0, paidAt: null, status: "OVERDUE", createdAt: "2024-10-05T00:00:00Z", updatedAt: "2025-05-24T00:00:00Z" },
  { id: "OBL-D015", loanId: "LN-89456", borrower: "Segun Adewale", period: 5, dueDate: "2025-03-05", principalComponent: 389676, interestComponent: 10324, penaltyComponent: 0, totalDue: 400000, outstandingAmount: 400000, paidAmount: 0, paidAt: null, status: "OVERDUE", createdAt: "2024-10-05T00:00:00Z", updatedAt: "2025-05-24T00:00:00Z" },
]

export const penaltyRecords: PenaltyRecord[] = [
  { id: "PNL-001", loanId: "LN-28471", borrower: "Emeka Okafor", obligationId: "OBL-D001", type: "PERCENTAGE", value: 5, amount: 8750, appliedAt: "2024-11-15T00:00:00Z", status: "APPLIED" },
  { id: "PNL-002", loanId: "LN-28471", borrower: "Emeka Okafor", obligationId: "OBL-D002", type: "PERCENTAGE", value: 3, amount: 5000, appliedAt: "2024-12-15T00:00:00Z", status: "APPLIED" },
  { id: "PNL-003", loanId: "LN-19302", borrower: "Ngozi Adeyemi", obligationId: "OBL-D004", type: "PERCENTAGE", value: 5, amount: 15000, appliedAt: "2024-10-29T00:00:00Z", status: "APPLIED" },
  { id: "PNL-004", loanId: "LN-19302", borrower: "Ngozi Adeyemi", obligationId: "OBL-D005", type: "PERCENTAGE", value: 3, amount: 10000, appliedAt: "2024-11-29T00:00:00Z", status: "APPLIED" },
  { id: "PNL-005", loanId: "LN-89456", borrower: "Segun Adewale", obligationId: "OBL-D012", type: "PERCENTAGE", value: 5, amount: 20000, appliedAt: "2024-12-19T00:00:00Z", status: "WAIVED" },
]

// ─── Recovery Orchestration Engine ─────────────────────────────────────────

export type RecoveryTaskState = "PENDING" | "IN_PROGRESS" | "RETRY_PENDING" | "SUCCESS" | "PARTIAL" | "FAILED" | "PAUSED" | "ESCALATED"
export type FailureReasonCode = "INSUFFICIENT_FUNDS" | "NO_MANDATE" | "MANDATE_REVOKED" | "BANK_TIMEOUT" | "DO_NOT_HONOR" | "ACCOUNT_CLOSED" | "SYSTEM_ERROR"

export interface RecoveryTask {
  id: string
  loanId: string
  borrower: string
  amountDue: number
  outstandingBalance: number
  dpd: number
  state: RecoveryTaskState
  retryCount: number
  maxRetries: number
  nextRetryAt: string | null
  lastAttemptAt: string | null
  lastFailureReason: FailureReasonCode | null
  selectedAccount: string | null
  selectedRail: RecoveryRail | null
  debitAmount: number | null
  policyId: string
  guardRailBlocked: boolean
  guardRailReason: string | null
  createdAt: string
}

export interface AccountProfile {
  id: string
  loanId: string
  accountNumber: string
  bankCode: string
  bank: string
  mandateStatus: "ACTIVE" | "FAILED" | "NONE"
  lastBalance: number | null
  lastDebitResult: "SUCCESS" | "FAILED" | "NONE"
  inflowScore: number
  lastCreditAt: string | null
  riskScore: number
  rankScore: number
  isSelected: boolean
}

export interface OrchestrationKPIs {
  meanRecoveryPerLoan: number
  debitSuccessPerAttempt: number
  retryYieldRate: number
  costPerRecoveredNaira: number
  activeTasksToday: number
  successfulToday: number
  pendingRetries: number
  escalatedToday: number
}

export type OrchestratorEventType = "DEBIT_INITIATED" | "DEBIT_SUCCESS" | "DEBIT_FAILED" | "PARTIAL_RECOVERY" | "RETRY_SCHEDULED" | "ESCALATION_TRIGGERED"

export interface OrchestratorEvent {
  id: string
  type: OrchestratorEventType
  loanId: string
  borrower: string
  timestamp: string
  amount: number | null
  detail: string
  retryLevel: number | null
}

export const orchestrationKPIs: OrchestrationKPIs = {
  meanRecoveryPerLoan: 1247000,
  debitSuccessPerAttempt: 71.4,
  retryYieldRate: 34.2,
  costPerRecoveredNaira: 0.0012,
  activeTasksToday: 1247,
  successfulToday: 891,
  pendingRetries: 134,
  escalatedToday: 23,
}

export const recoveryTasks: RecoveryTask[] = [
  { id: "TASK-001", loanId: "LN-28471", borrower: "Emeka Okafor", amountDue: 487500, outstandingBalance: 487500, dpd: 23, state: "RETRY_PENDING", retryCount: 2, maxRetries: 5, nextRetryAt: "2025-05-27T09:00:00Z", lastAttemptAt: "2025-05-24T09:15:00Z", lastFailureReason: "INSUFFICIENT_FUNDS", selectedAccount: "0123456789", selectedRail: "NDD", debitAmount: 487500, policyId: "POL-001", guardRailBlocked: false, guardRailReason: null, createdAt: "2025-05-01T00:00:00Z" },
  { id: "TASK-002", loanId: "LN-19302", borrower: "Ngozi Adeyemi", amountDue: 525000, outstandingBalance: 1050000, dpd: 40, state: "FAILED", retryCount: 4, maxRetries: 5, nextRetryAt: null, lastAttemptAt: "2025-05-22T14:30:00Z", lastFailureReason: "ACCOUNT_CLOSED", selectedAccount: "0987654321", selectedRail: "REMITA", debitAmount: 525000, policyId: "POL-001", guardRailBlocked: false, guardRailReason: null, createdAt: "2025-05-01T00:00:00Z" },
  { id: "TASK-003", loanId: "LN-78134", borrower: "Kemi Olusanya", amountDue: 375000, outstandingBalance: 750000, dpd: 55, state: "RETRY_PENDING", retryCount: 3, maxRetries: 5, nextRetryAt: "2025-05-31T08:00:00Z", lastAttemptAt: "2025-05-24T07:30:00Z", lastFailureReason: "INSUFFICIENT_FUNDS", selectedAccount: "0579124680", selectedRail: "EASY_PAY", debitAmount: 375000, policyId: "POL-001", guardRailBlocked: false, guardRailReason: null, createdAt: "2025-04-15T00:00:00Z" },
  { id: "TASK-004", loanId: "LN-89456", borrower: "Segun Adewale", amountDue: 450000, outstandingBalance: 1800000, dpd: 19, state: "IN_PROGRESS", retryCount: 2, maxRetries: 5, nextRetryAt: null, lastAttemptAt: "2025-05-24T10:50:00Z", lastFailureReason: "BANK_TIMEOUT", selectedAccount: "0680235791", selectedRail: "REMITA", debitAmount: 450000, policyId: "POL-001", guardRailBlocked: false, guardRailReason: null, createdAt: "2025-05-01T00:00:00Z" },
  { id: "TASK-005", loanId: "LN-62891", borrower: "Babatunde Adekoya", amountDue: 450000, outstandingBalance: 450000, dpd: 14, state: "PENDING", retryCount: 0, maxRetries: 5, nextRetryAt: "2025-05-25T09:00:00Z", lastAttemptAt: null, lastFailureReason: "NO_MANDATE", selectedAccount: null, selectedRail: null, debitAmount: null, policyId: "POL-001", guardRailBlocked: false, guardRailReason: null, createdAt: "2025-05-20T00:00:00Z" },
  { id: "TASK-006", loanId: "LN-33812", borrower: "Tunde Fashola", amountDue: 87500, outstandingBalance: 87500, dpd: 5, state: "PAUSED", retryCount: 0, maxRetries: 5, nextRetryAt: null, lastAttemptAt: null, lastFailureReason: null, selectedAccount: null, selectedRail: null, debitAmount: null, policyId: "POL-001", guardRailBlocked: true, guardRailReason: "DISPUTE_OPEN", createdAt: "2025-05-23T00:00:00Z" },
]

export const accountProfiles: AccountProfile[] = [
  { id: "AP-001", loanId: "LN-28471", accountNumber: "0123456789", bankCode: "044", bank: "Access Bank", mandateStatus: "ACTIVE", lastBalance: 38500, lastDebitResult: "FAILED", inflowScore: 0.71, lastCreditAt: "2025-05-24T17:45:00Z", riskScore: 0.28, rankScore: 0.74, isSelected: true },
  { id: "AP-002", loanId: "LN-28471", accountNumber: "3045678901", bankCode: "011", bank: "First Bank", mandateStatus: "NONE", lastBalance: 91200, lastDebitResult: "NONE", inflowScore: 0.74, lastCreditAt: "2025-05-20T09:00:00Z", riskScore: 0.22, rankScore: 0.68, isSelected: false },
  { id: "AP-003", loanId: "LN-19302", accountNumber: "0987654321", bankCode: "058", bank: "GTBank", mandateStatus: "ACTIVE", lastBalance: 2100, lastDebitResult: "FAILED", inflowScore: 0.12, lastCreditAt: "2025-04-30T00:00:00Z", riskScore: 0.71, rankScore: 0.18, isSelected: true },
  { id: "AP-004", loanId: "LN-89456", accountNumber: "0680235791", bankCode: "076", bank: "Polaris Bank", mandateStatus: "ACTIVE", lastBalance: 520000, lastDebitResult: "SUCCESS", inflowScore: 0.81, lastCreditAt: "2025-05-25T13:55:00Z", riskScore: 0.19, rankScore: 0.83, isSelected: true },
  { id: "AP-005", loanId: "LN-78134", accountNumber: "0579124680", bankCode: "070", bank: "Fidelity Bank", mandateStatus: "FAILED", lastBalance: 12000, lastDebitResult: "FAILED", inflowScore: 0.18, lastCreditAt: "2025-05-01T00:00:00Z", riskScore: 0.82, rankScore: 0.14, isSelected: true },
]

export const orchestratorEvents: OrchestratorEvent[] = [
  { id: "OEVT-001", type: "DEBIT_INITIATED", loanId: "LN-89456", borrower: "Segun Adewale", timestamp: "2025-05-25T14:00:00Z", amount: 450000, detail: "REMITA debit initiated via Polaris Bank mandate.", retryLevel: 2 },
  { id: "OEVT-002", type: "DEBIT_SUCCESS", loanId: "LN-89456", borrower: "Segun Adewale", timestamp: "2025-05-25T14:02:00Z", amount: 450000, detail: "Debit confirmed. Outstanding balance reduced by ₦450,000.", retryLevel: 2 },
  { id: "OEVT-003", type: "DEBIT_FAILED", loanId: "LN-28471", borrower: "Emeka Okafor", timestamp: "2025-05-24T09:15:00Z", amount: 487500, detail: "NDD debit failed — insufficient funds. Retry #2 scheduled in 72h.", retryLevel: 2 },
  { id: "OEVT-004", type: "RETRY_SCHEDULED", loanId: "LN-28471", borrower: "Emeka Okafor", timestamp: "2025-05-24T09:16:00Z", amount: null, detail: "Next retry at 2025-05-27T09:00Z. Strategy: top-3 accounts only.", retryLevel: 2 },
  { id: "OEVT-005", type: "DEBIT_FAILED", loanId: "LN-19302", borrower: "Ngozi Adeyemi", timestamp: "2025-05-22T14:30:00Z", amount: 525000, detail: "REMITA debit failed — account closed. No fallback available.", retryLevel: 4 },
  { id: "OEVT-006", type: "ESCALATION_TRIGGERED", loanId: "LN-19302", borrower: "Ngozi Adeyemi", timestamp: "2025-05-22T14:31:00Z", amount: null, detail: "Retry limit nearing. Task escalated to DRO queue for manual intervention.", retryLevel: 4 },
  { id: "OEVT-007", type: "PARTIAL_RECOVERY", loanId: "LN-33812", borrower: "Tunde Fashola", timestamp: "2025-05-23T11:05:00Z", amount: 24583, detail: "Partial debit of ₦24,583 applied. Outstanding reduced to ₦62,500.", retryLevel: 1 },
  { id: "OEVT-008", type: "DEBIT_FAILED", loanId: "LN-89456", borrower: "Segun Adewale", timestamp: "2025-05-24T10:50:00Z", amount: 450000, detail: "REMITA API timeout — Zenith Bank outage. Retrying when bank recovers.", retryLevel: 2 },
]

// ─── Ledger & Reconciliation ──────────────────────────────────────────────────

export type LedgerEntryType = "DEBIT" | "REVERSAL" | "REFUND"
export type LedgerEntryStatus = "PENDING" | "PROVISIONAL" | "FINALIZED" | "REVERSED" | "REFUNDED"
export type ReconciliationMatchType = "MATCHED" | "MISSING" | "DUPLICATE" | "REVERSED"

export interface LedgerEntry {
  entryId: string
  loanId: string
  borrower: string
  transactionId: string
  type: LedgerEntryType
  status: LedgerEntryStatus
  amount: number
  currency: "NGN"
  debitAccount: string
  creditAccount: string
  referenceEntryId: string | null
  rail: RecoveryRail
  createdAt: string
  finalizedAt: string | null
}

export interface ReconciliationRecord {
  id: string
  loanId: string
  borrower: string
  transactionId: string
  internalEntryId: string | null
  bankReportId: string | null
  source: RecoveryRail
  amount: number
  internalAmount: number | null
  bankAmount: number | null
  matchType: ReconciliationMatchType
  timestampInternal: string | null
  timestampBank: string | null
  resolvedAt: string | null
  notes: string | null
}

export interface LedgerKPIs {
  reconciliationAccuracy: number
  unmatchedRate: number
  pendingEntries: number
  totalVolumeMTD: number
  totalEntriesToday: number
  matchedToday: number
  unmatchedToday: number
  duplicatesFound: number
}

export const ledgerKPIs: LedgerKPIs = {
  reconciliationAccuracy: 99.9,
  unmatchedRate: 0.1,
  pendingEntries: 23,
  totalVolumeMTD: 2847500000,
  totalEntriesToday: 1247,
  matchedToday: 1234,
  unmatchedToday: 13,
  duplicatesFound: 2,
}

export const ledgerEntries: LedgerEntry[] = [
  {
    entryId: "LED-001", loanId: "LN-89456", borrower: "Segun Adewale",
    transactionId: "TXN-REM-20250525-001", type: "DEBIT", status: "FINALIZED",
    amount: 450000, currency: "NGN",
    debitAccount: "REPAYMENT_COLLECTION", creditAccount: "LOAN_RECEIVABLE",
    referenceEntryId: null, rail: "REMITA",
    createdAt: "2025-05-25T14:00:00Z", finalizedAt: "2025-05-25T14:02:00Z",
  },
  {
    entryId: "LED-002", loanId: "LN-28471", borrower: "Emeka Okafor",
    transactionId: "TXN-NDD-20250524-001", type: "DEBIT", status: "PENDING",
    amount: 487500, currency: "NGN",
    debitAccount: "REPAYMENT_COLLECTION", creditAccount: "LOAN_RECEIVABLE",
    referenceEntryId: null, rail: "NDD",
    createdAt: "2025-05-24T09:15:00Z", finalizedAt: null,
  },
  {
    entryId: "LED-003", loanId: "LN-19302", borrower: "Ngozi Adeyemi",
    transactionId: "TXN-REM-20250522-001", type: "DEBIT", status: "REVERSED",
    amount: 525000, currency: "NGN",
    debitAccount: "REPAYMENT_COLLECTION", creditAccount: "LOAN_RECEIVABLE",
    referenceEntryId: null, rail: "REMITA",
    createdAt: "2025-05-22T14:30:00Z", finalizedAt: "2025-05-22T15:00:00Z",
  },
  {
    entryId: "LED-004", loanId: "LN-19302", borrower: "Ngozi Adeyemi",
    transactionId: "TXN-REM-20250522-001-REV", type: "REVERSAL", status: "FINALIZED",
    amount: 525000, currency: "NGN",
    debitAccount: "LOAN_RECEIVABLE", creditAccount: "REPAYMENT_COLLECTION",
    referenceEntryId: "LED-003", rail: "REMITA",
    createdAt: "2025-05-22T15:01:00Z", finalizedAt: "2025-05-22T15:05:00Z",
  },
  {
    entryId: "LED-005", loanId: "LN-33812", borrower: "Tunde Fashola",
    transactionId: "TXN-NDD-20250523-001", type: "DEBIT", status: "PROVISIONAL",
    amount: 24583, currency: "NGN",
    debitAccount: "REPAYMENT_COLLECTION", creditAccount: "LOAN_RECEIVABLE",
    referenceEntryId: null, rail: "NDD",
    createdAt: "2025-05-23T11:05:00Z", finalizedAt: null,
  },
  {
    entryId: "LED-006", loanId: "LN-78134", borrower: "Amaka Eze",
    transactionId: "TXN-EP-20250521-001", type: "DEBIT", status: "FINALIZED",
    amount: 215000, currency: "NGN",
    debitAccount: "REPAYMENT_COLLECTION", creditAccount: "LOAN_RECEIVABLE",
    referenceEntryId: null, rail: "EASY_PAY",
    createdAt: "2025-05-21T09:00:00Z", finalizedAt: "2025-05-21T09:30:00Z",
  },
  {
    entryId: "LED-007", loanId: "LN-78134", borrower: "Amaka Eze",
    transactionId: "TXN-EP-20250521-001-RFD", type: "REFUND", status: "FINALIZED",
    amount: 10000, currency: "NGN",
    debitAccount: "CUSTOMER_REFUND_PAYABLE", creditAccount: "REPAYMENT_COLLECTION",
    referenceEntryId: "LED-006", rail: "EASY_PAY",
    createdAt: "2025-05-22T10:00:00Z", finalizedAt: "2025-05-22T10:45:00Z",
  },
  {
    entryId: "LED-008", loanId: "LN-89456", borrower: "Segun Adewale",
    transactionId: "TXN-REM-20250520-001", type: "DEBIT", status: "FINALIZED",
    amount: 450000, currency: "NGN",
    debitAccount: "REPAYMENT_COLLECTION", creditAccount: "LOAN_RECEIVABLE",
    referenceEntryId: null, rail: "REMITA",
    createdAt: "2025-05-20T10:00:00Z", finalizedAt: "2025-05-20T10:03:00Z",
  },
  {
    entryId: "LED-009", loanId: "LN-28471", borrower: "Emeka Okafor",
    transactionId: "TXN-NDD-20250519-001", type: "DEBIT", status: "FINALIZED",
    amount: 487500, currency: "NGN",
    debitAccount: "REPAYMENT_COLLECTION", creditAccount: "LOAN_RECEIVABLE",
    referenceEntryId: null, rail: "NDD",
    createdAt: "2025-05-19T09:00:00Z", finalizedAt: "2025-05-19T09:10:00Z",
  },
  {
    entryId: "LED-010", loanId: "LN-33812", borrower: "Tunde Fashola",
    transactionId: "TXN-MAN-20250518-001", type: "DEBIT", status: "PENDING",
    amount: 62500, currency: "NGN",
    debitAccount: "REPAYMENT_COLLECTION", creditAccount: "LOAN_RECEIVABLE",
    referenceEntryId: null, rail: "MANUAL",
    createdAt: "2025-05-18T08:00:00Z", finalizedAt: null,
  },
  {
    entryId: "LED-011", loanId: "LN-19302", borrower: "Ngozi Adeyemi",
    transactionId: "TXN-REM-20250517-001", type: "DEBIT", status: "FINALIZED",
    amount: 525000, currency: "NGN",
    debitAccount: "REPAYMENT_COLLECTION", creditAccount: "LOAN_RECEIVABLE",
    referenceEntryId: null, rail: "REMITA",
    createdAt: "2025-05-17T14:00:00Z", finalizedAt: "2025-05-17T14:05:00Z",
  },
]

export const reconciliationRecords: ReconciliationRecord[] = [
  {
    id: "RCN-001", loanId: "LN-89456", borrower: "Segun Adewale",
    transactionId: "TXN-REM-20250525-001",
    internalEntryId: "LED-001", bankReportId: "BANK-REM-20250525-4471",
    source: "REMITA", amount: 450000,
    internalAmount: 450000, bankAmount: 450000,
    matchType: "MATCHED",
    timestampInternal: "2025-05-25T14:00:00Z", timestampBank: "2025-05-25T14:02:30Z",
    resolvedAt: "2025-05-25T14:05:00Z", notes: null,
  },
  {
    id: "RCN-002", loanId: "LN-28471", borrower: "Emeka Okafor",
    transactionId: "TXN-NDD-20250524-001",
    internalEntryId: "LED-002", bankReportId: null,
    source: "NDD", amount: 487500,
    internalAmount: 487500, bankAmount: null,
    matchType: "MISSING",
    timestampInternal: "2025-05-24T09:15:00Z", timestampBank: null,
    resolvedAt: null, notes: "No bank record received within 24h window. Pending bank reconciliation file.",
  },
  {
    id: "RCN-003", loanId: "LN-19302", borrower: "Ngozi Adeyemi",
    transactionId: "TXN-REM-20250522-001",
    internalEntryId: "LED-003", bankReportId: "BANK-REM-20250522-2291",
    source: "REMITA", amount: 525000,
    internalAmount: 525000, bankAmount: 525000,
    matchType: "REVERSED",
    timestampInternal: "2025-05-22T14:30:00Z", timestampBank: "2025-05-22T15:00:00Z",
    resolvedAt: "2025-05-22T15:30:00Z", notes: "Account closed. Reversal LED-004 recorded.",
  },
  {
    id: "RCN-004", loanId: "LN-33812", borrower: "Tunde Fashola",
    transactionId: "TXN-NDD-20250523-001",
    internalEntryId: "LED-005", bankReportId: "BANK-NDD-20250523-0831",
    source: "NDD", amount: 24583,
    internalAmount: 24583, bankAmount: 24583,
    matchType: "MATCHED",
    timestampInternal: "2025-05-23T11:05:00Z", timestampBank: "2025-05-23T11:10:00Z",
    resolvedAt: "2025-05-23T11:15:00Z", notes: "Partial collection confirmed.",
  },
  {
    id: "RCN-005", loanId: "LN-78134", borrower: "Amaka Eze",
    transactionId: "TXN-EP-20250521-001",
    internalEntryId: "LED-006", bankReportId: "BANK-EP-20250521-1102",
    source: "EASY_PAY", amount: 215000,
    internalAmount: 215000, bankAmount: 215000,
    matchType: "MATCHED",
    timestampInternal: "2025-05-21T09:00:00Z", timestampBank: "2025-05-21T09:32:00Z",
    resolvedAt: "2025-05-21T09:45:00Z", notes: null,
  },
  {
    id: "RCN-006", loanId: "LN-89456", borrower: "Segun Adewale",
    transactionId: "TXN-REM-20250520-001",
    internalEntryId: "LED-008", bankReportId: "BANK-REM-20250520-3310",
    source: "REMITA", amount: 450000,
    internalAmount: 450000, bankAmount: 450000,
    matchType: "MATCHED",
    timestampInternal: "2025-05-20T10:00:00Z", timestampBank: "2025-05-20T10:03:45Z",
    resolvedAt: "2025-05-20T10:10:00Z", notes: null,
  },
  {
    id: "RCN-007", loanId: "LN-28471", borrower: "Emeka Okafor",
    transactionId: "TXN-NDD-20250519-DUPE",
    internalEntryId: null, bankReportId: "BANK-NDD-20250519-7712",
    source: "NDD", amount: 487500,
    internalAmount: null, bankAmount: 487500,
    matchType: "DUPLICATE",
    timestampInternal: null, timestampBank: "2025-05-19T09:11:00Z",
    resolvedAt: null, notes: "Duplicate bank record — same amount as LED-009 within 5-min window. Under investigation.",
  },
  {
    id: "RCN-008", loanId: "LN-33812", borrower: "Tunde Fashola",
    transactionId: "TXN-MAN-20250518-001",
    internalEntryId: "LED-010", bankReportId: null,
    source: "MANUAL", amount: 62500,
    internalAmount: 62500, bankAmount: null,
    matchType: "MISSING",
    timestampInternal: "2025-05-18T08:00:00Z", timestampBank: null,
    resolvedAt: null, notes: "Manual collection — cash receipt pending bank confirmation.",
  },
]
