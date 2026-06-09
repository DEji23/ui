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
  consentLog: {
    exists: boolean
    signedAt: string | null
    channel: string | null
    reference: string | null
    ipAddress: string | null
  }
  mandateDetails: {
    reference: string | null
    status: string | null
    maxAmount: number | null
    setupDate: string | null
    bank: string | null
    authMethod: string | null
  }
  debitAttemptTrace: Array<{
    timestamp: string
    amount: number
    status: string
    reference: string
    channel: string
  }>
  notificationHistory: Array<{
    timestamp: string
    channel: string
    status: string
    message: string
  }>
}

export interface Dispute {
  id: string
  loanId: string
  borrower: string
  phone: string
  initiatedBy: "CUSTOMER" | "BANK"
  type: "Incorrect Debit" | "Unauthorised Mandate" | "Duplicate Debit" | "Insufficient Notice" | "Fraud" | "AT_RISK Transaction"
  transactionId: string
  amount: number
  status: DisputeStatus
  slaDeadline: string
  assignedTo: string
  filedAt: string
  description: string
  rail: RecoveryRail
  evidence: DisputeEvidence
  decisionOutcome: DisputeDecisionOutcome
  decisionNote: string | null
  decisionAt: string | null
  decisionBy: string | null
  isIndemnity: boolean
  indemnityAmount: number | null
  recoveryPaused: boolean
  mandateLocked: boolean
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
  validationStatus: MandateValidationStatus
  bank: string
  bankCode: string
  accountNumber: string
  maxAmount: number
  frequency: "Monthly" | "Weekly" | "Daily"
  issuedAt: string
  expiryDate: string
  externalReference: string | null
  failureReason: MandateFailureReason | null
  lastCheckedAt: string | null
  activatedAt: string | null
  providerFallback: boolean
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

export const disputes: Dispute[] = [
  {
    id: "DSP-001",
    loanId: "LN-41023",
    borrower: "Aisha Mohammed",
    phone: "+234 806 789 0123",
    initiatedBy: "CUSTOMER",
    type: "Unauthorised Mandate",
    transactionId: "TXN-2025052001",
    amount: 800000,
    status: "EVIDENCE_COMPILED",
    slaDeadline: "2026-06-15T00:00:00Z",
    assignedTo: "Adaora Nwosu",
    filedAt: "2025-05-21T09:00:00Z",
    description: "Borrower claims mandate was set up without her knowledge or consent. She was abroad at the time of the mandate setup and could not have authorised via iGree.",
    rail: "NDD",
    evidence: {
      consentLog: {
        exists: true,
        signedAt: "2024-10-01T14:32:00Z",
        channel: "iGree Web Link",
        reference: "IGREE-2024-882341",
        ipAddress: "102.89.23.44",
      },
      mandateDetails: {
        reference: "MND-553892",
        status: "SUSPENDED",
        maxAmount: 800000,
        setupDate: "2024-10-01",
        bank: "First Bank",
        authMethod: "iGree Digital Consent",
      },
      debitAttemptTrace: [
        { timestamp: "2025-05-20T08:45:00Z", amount: 800000, status: "SUCCESS", reference: "TXN-2025052001", channel: "NDD" },
        { timestamp: "2025-04-20T09:00:00Z", amount: 800000, status: "INSUFFICIENT_FUNDS", reference: "TXN-2025042001", channel: "NDD" },
      ],
      notificationHistory: [
        { timestamp: "2025-05-20T08:50:00Z", channel: "SMS", status: "DELIVERED", message: "Your account was debited ₦800,000 for loan LN-41023." },
        { timestamp: "2024-10-01T14:35:00Z", channel: "Email", status: "DELIVERED", message: "Mandate MND-553892 set up successfully on your First Bank account." },
      ],
    },
    decisionOutcome: null,
    decisionNote: null,
    decisionAt: null,
    decisionBy: null,
    isIndemnity: false,
    indemnityAmount: null,
    recoveryPaused: true,
    mandateLocked: true,
  },
  {
    id: "DSP-002",
    loanId: "LN-28471",
    borrower: "Emeka Okafor",
    phone: "+234 802 345 6789",
    initiatedBy: "CUSTOMER",
    type: "Duplicate Debit",
    transactionId: "TXN-2025052402",
    amount: 487500,
    status: "OPEN",
    slaDeadline: "2026-06-18T00:00:00Z",
    assignedTo: "Fatima Bello",
    filedAt: "2025-05-24T11:00:00Z",
    description: "Borrower reports two identical debits of ₦487,500 on the same day from the same mandate. Bank statement attached.",
    rail: "NDD",
    evidence: {
      consentLog: {
        exists: true,
        signedAt: "2024-10-02T10:15:00Z",
        channel: "iGree Mobile",
        reference: "IGREE-2024-881234",
        ipAddress: "41.58.102.76",
      },
      mandateDetails: {
        reference: "MND-881234",
        status: "ACTIVE",
        maxAmount: 500000,
        setupDate: "2024-10-02",
        bank: "Access Bank",
        authMethod: "iGree Digital Consent",
      },
      debitAttemptTrace: [
        { timestamp: "2025-05-24T09:15:00Z", amount: 487500, status: "SUCCESS", reference: "TXN-2025052402", channel: "NDD" },
        { timestamp: "2025-05-24T09:14:58Z", amount: 487500, status: "SUCCESS", reference: "TXN-2025052401B", channel: "NDD" },
        { timestamp: "2025-04-24T09:00:00Z", amount: 487500, status: "SUCCESS", reference: "TXN-2025042401", channel: "NDD" },
      ],
      notificationHistory: [
        { timestamp: "2025-05-24T09:20:00Z", channel: "SMS", status: "DELIVERED", message: "Your account was debited ₦487,500 for loan LN-28471." },
        { timestamp: "2025-05-24T09:18:00Z", channel: "SMS", status: "DELIVERED", message: "Your account was debited ₦487,500 for loan LN-28471." },
      ],
    },
    decisionOutcome: null,
    decisionNote: null,
    decisionAt: null,
    decisionBy: null,
    isIndemnity: false,
    indemnityAmount: null,
    recoveryPaused: true,
    mandateLocked: false,
  },
  {
    id: "DSP-003",
    loanId: "LN-89456",
    borrower: "Segun Adewale",
    phone: "+234 810 123 4567",
    initiatedBy: "CUSTOMER",
    type: "Incorrect Debit",
    transactionId: "TXN-2025052201",
    amount: 1800000,
    status: "DECISION_PENDING",
    slaDeadline: "2026-06-10T00:00:00Z",
    assignedTo: "Adaora Nwosu",
    filedAt: "2025-05-20T08:30:00Z",
    description: "Amount debited (₦1,800,000) significantly exceeds the mandate cap of ₦500,000. Borrower requests full reversal of excess ₦1,300,000.",
    rail: "REMITA",
    evidence: {
      consentLog: {
        exists: true,
        signedAt: "2024-09-15T11:00:00Z",
        channel: "iGree Web Link",
        reference: "IGREE-2024-774512",
        ipAddress: "197.210.44.22",
      },
      mandateDetails: {
        reference: "MND-774512",
        status: "ACTIVE",
        maxAmount: 500000,
        setupDate: "2024-09-15",
        bank: "Polaris Bank",
        authMethod: "iGree Digital Consent",
      },
      debitAttemptTrace: [
        { timestamp: "2025-05-22T16:30:00Z", amount: 1800000, status: "SUCCESS", reference: "TXN-2025052201", channel: "REMITA" },
      ],
      notificationHistory: [
        { timestamp: "2025-05-22T16:35:00Z", channel: "SMS", status: "DELIVERED", message: "Your account was debited ₦1,800,000 for loan LN-89456." },
        { timestamp: "2025-05-22T16:40:00Z", channel: "Email", status: "FAILED", message: "Debit notification email failed to deliver." },
      ],
    },
    decisionOutcome: null,
    decisionNote: null,
    decisionAt: null,
    decisionBy: null,
    isIndemnity: false,
    indemnityAmount: null,
    recoveryPaused: true,
    mandateLocked: true,
  },
  {
    id: "DSP-004",
    loanId: "LN-55247",
    borrower: "Chidinma Obi",
    phone: "+234 807 890 1234",
    initiatedBy: "CUSTOMER",
    type: "Fraud",
    transactionId: "TXN-2025051901",
    amount: 3000000,
    status: "ESCALATED",
    slaDeadline: "2026-06-09T00:00:00Z",
    assignedTo: "Adaora Nwosu",
    filedAt: "2025-05-19T14:00:00Z",
    description: "Borrower alleges she never applied for this loan. Claims identity theft — BVN used without authorisation. Police report filed. All collections must stop immediately.",
    rail: "EASY_PAY",
    evidence: {
      consentLog: {
        exists: false,
        signedAt: null,
        channel: null,
        reference: null,
        ipAddress: null,
      },
      mandateDetails: {
        reference: "MND-992512",
        status: "SUSPENDED",
        maxAmount: 3000000,
        setupDate: "2024-10-20",
        bank: "UBA",
        authMethod: "Branch Form (Physical)",
      },
      debitAttemptTrace: [
        { timestamp: "2025-05-19T08:00:00Z", amount: 1000000, status: "SUCCESS", reference: "TXN-2025051901", channel: "EASY_PAY" },
        { timestamp: "2025-04-19T08:00:00Z", amount: 1000000, status: "SUCCESS", reference: "TXN-2025041901", channel: "EASY_PAY" },
      ],
      notificationHistory: [
        { timestamp: "2025-05-19T08:05:00Z", channel: "SMS", status: "DELIVERED", message: "Your account was debited ₦1,000,000 for loan LN-55247." },
        { timestamp: "2025-04-19T08:05:00Z", channel: "SMS", status: "DELIVERED", message: "Your account was debited ₦1,000,000 for loan LN-55247." },
      ],
    },
    decisionOutcome: null,
    decisionNote: null,
    decisionAt: null,
    decisionBy: null,
    isIndemnity: false,
    indemnityAmount: null,
    recoveryPaused: true,
    mandateLocked: true,
  },
  {
    id: "DSP-005",
    loanId: "LN-28471",
    borrower: "Emeka Okafor",
    phone: "+234 802 345 6789",
    initiatedBy: "CUSTOMER",
    type: "Incorrect Debit",
    transactionId: "TXN-2025040901",
    amount: 487500,
    status: "VALID_DEBIT",
    slaDeadline: "2025-04-16T00:00:00Z",
    assignedTo: "Fatima Bello",
    filedAt: "2025-04-09T13:00:00Z",
    description: "Borrower claimed amount was incorrect but evidence confirmed it matches the outstanding balance per loan schedule.",
    rail: "NDD",
    evidence: {
      consentLog: {
        exists: true,
        signedAt: "2024-10-02T10:15:00Z",
        channel: "iGree Mobile",
        reference: "IGREE-2024-881234",
        ipAddress: "41.58.102.76",
      },
      mandateDetails: {
        reference: "MND-881234",
        status: "ACTIVE",
        maxAmount: 500000,
        setupDate: "2024-10-02",
        bank: "Access Bank",
        authMethod: "iGree Digital Consent",
      },
      debitAttemptTrace: [
        { timestamp: "2025-04-09T09:00:00Z", amount: 487500, status: "SUCCESS", reference: "TXN-2025040901", channel: "NDD" },
      ],
      notificationHistory: [
        { timestamp: "2025-04-09T09:05:00Z", channel: "SMS", status: "DELIVERED", message: "Your account was debited ₦487,500 for loan LN-28471." },
      ],
    },
    decisionOutcome: "VALID_DEBIT",
    decisionNote: "Reviewed loan schedule and debit trace. Amount matches instalment 4 of 12 per signed agreement. Consent log confirms valid mandate authorisation. Dispute rejected — debit is valid.",
    decisionAt: "2025-04-13T11:00:00Z",
    decisionBy: "Fatima Bello",
    isIndemnity: false,
    indemnityAmount: null,
    recoveryPaused: false,
    mandateLocked: false,
  },
  {
    id: "DSP-006",
    loanId: "LN-19302",
    borrower: "Ngozi Adeyemi",
    phone: "+234 803 456 7890",
    initiatedBy: "BANK",
    type: "AT_RISK Transaction",
    transactionId: "TXN-2025052101",
    amount: 150000,
    status: "OPEN",
    slaDeadline: "2026-06-20T00:00:00Z",
    assignedTo: "Chidi Okeke",
    filedAt: "2025-05-22T10:00:00Z",
    description: "Bank flagged REMITA debit on an AT_RISK loan while borrower has a pending legal notice. Indemnity claim filed with REMITA processor to recover funds in case of chargeback.",
    rail: "REMITA",
    evidence: {
      consentLog: {
        exists: true,
        signedAt: "2024-09-16T09:00:00Z",
        channel: "iGree Web Link",
        reference: "IGREE-2024-771456",
        ipAddress: "154.120.30.45",
      },
      mandateDetails: {
        reference: "MND-771456",
        status: "ACTIVE",
        maxAmount: 200000,
        setupDate: "2024-09-16",
        bank: "GTBank",
        authMethod: "iGree Digital Consent",
      },
      debitAttemptTrace: [
        { timestamp: "2025-05-21T14:30:00Z", amount: 150000, status: "SUCCESS", reference: "TXN-2025052101", channel: "REMITA" },
      ],
      notificationHistory: [
        { timestamp: "2025-05-21T14:35:00Z", channel: "SMS", status: "DELIVERED", message: "REMITA debit of ₦150,000 processed for LN-19302." },
      ],
    },
    decisionOutcome: null,
    decisionNote: null,
    decisionAt: null,
    decisionBy: null,
    isIndemnity: true,
    indemnityAmount: 150000,
    recoveryPaused: false,
    mandateLocked: false,
  },
  {
    id: "DSP-007",
    loanId: "LN-33812",
    borrower: "Tunde Fashola",
    phone: "+234 805 678 9012",
    initiatedBy: "BANK",
    type: "AT_RISK Transaction",
    transactionId: "TXN-2025052301",
    amount: 162500,
    status: "FULL_REFUND",
    slaDeadline: "2025-05-30T00:00:00Z",
    assignedTo: "Adaora Nwosu",
    filedAt: "2025-05-23T12:00:00Z",
    description: "NDD debit processed but loan was in PARTIALLY_RECOVERED state with open partial recovery isolation rule. Bank resolved: full refund issued to preserve customer relationship.",
    rail: "NDD",
    evidence: {
      consentLog: {
        exists: false,
        signedAt: null,
        channel: null,
        reference: null,
        ipAddress: null,
      },
      mandateDetails: {
        reference: "MND-992345",
        status: "ACTIVE",
        maxAmount: 200000,
        setupDate: "2024-11-02",
        bank: "Zenith Bank",
        authMethod: "Branch Form (Physical)",
      },
      debitAttemptTrace: [
        { timestamp: "2025-05-23T11:00:00Z", amount: 162500, status: "SUCCESS", reference: "TXN-2025052301", channel: "NDD" },
      ],
      notificationHistory: [
        { timestamp: "2025-05-23T11:05:00Z", channel: "SMS", status: "DELIVERED", message: "Your account was debited ₦162,500 for loan LN-33812." },
      ],
    },
    decisionOutcome: "INVALID",
    decisionNote: "Partial recovery isolation rule was active — debit should not have processed. Full refund of ₦162,500 authorised. Mandate temporarily suspended pending system fix.",
    decisionAt: "2025-05-24T09:00:00Z",
    decisionBy: "Adaora Nwosu",
    isIndemnity: true,
    indemnityAmount: 162500,
    recoveryPaused: true,
    mandateLocked: true,
  },
]

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

export const mandates: Mandate[] = [
  {
    id: "MND-001",
    loanId: "LN-28471",
    borrower: "Emeka Okafor",
    reference: "MND-881234",
    rail: "NDD",
    status: "ACTIVE",
    validationStatus: "VALIDATED",
    bank: "Access Bank",
    bankCode: "044",
    accountNumber: "0123456789",
    maxAmount: 500000,
    frequency: "Monthly",
    issuedAt: "2024-10-01",
    expiryDate: "2025-10-01",
    externalReference: "NDD-REF-881234-2024",
    failureReason: null,
    lastCheckedAt: "2025-05-24T06:00:00Z",
    activatedAt: "2024-10-03T10:15:00Z",
    providerFallback: false,
  },
  {
    id: "MND-002",
    loanId: "LN-19302",
    borrower: "Ngozi Adeyemi",
    reference: "MND-771456",
    rail: "REMITA",
    status: "ACTIVE",
    validationStatus: "VALIDATED",
    bank: "GTBank",
    bankCode: "058",
    accountNumber: "0987654321",
    maxAmount: 1200000,
    frequency: "Monthly",
    issuedAt: "2024-09-15",
    expiryDate: "2025-09-15",
    externalReference: "RMT-REF-771456-2024",
    failureReason: null,
    lastCheckedAt: "2025-05-24T06:00:00Z",
    activatedAt: "2024-09-17T09:30:00Z",
    providerFallback: true,
  },
  {
    id: "MND-003",
    loanId: "LN-55247",
    borrower: "Chidinma Obi",
    reference: "MND-334891",
    rail: "EASY_PAY",
    status: "EXPIRED",
    validationStatus: "VALIDATED",
    bank: "UBA",
    bankCode: "033",
    accountNumber: "0357924680",
    maxAmount: 3000000,
    frequency: "Monthly",
    issuedAt: "2024-08-15",
    expiryDate: "2025-02-15",
    externalReference: "EPY-REF-334891-2024",
    failureReason: null,
    lastCheckedAt: "2025-05-10T06:00:00Z",
    activatedAt: "2024-08-18T14:00:00Z",
    providerFallback: false,
  },
  {
    id: "MND-004",
    loanId: "LN-62891",
    borrower: "Babatunde Adekoya",
    reference: "MND-112567",
    rail: "NDD",
    status: "PENDING",
    validationStatus: "USER_ACTION_REQUIRED",
    bank: "Stanbic IBTC",
    bankCode: "221",
    accountNumber: "0468013579",
    maxAmount: 450000,
    frequency: "Monthly",
    issuedAt: "2025-05-20",
    expiryDate: "2026-05-20",
    externalReference: "NDD-REF-112567-2025",
    failureReason: null,
    lastCheckedAt: "2025-05-24T06:00:00Z",
    activatedAt: null,
    providerFallback: false,
  },
  {
    id: "MND-005",
    loanId: "LN-78134",
    borrower: "Kemi Olusanya",
    reference: "MND-667234",
    rail: "NDD",
    status: "FAILED",
    validationStatus: "FAILED",
    bank: "Fidelity Bank",
    bankCode: "070",
    accountNumber: "0579124680",
    maxAmount: 750000,
    frequency: "Monthly",
    issuedAt: "2024-09-01",
    expiryDate: "2025-09-01",
    externalReference: "NDD-REF-667234-2024",
    failureReason: "ACCOUNT_DORMANT",
    lastCheckedAt: "2025-05-05T06:00:00Z",
    activatedAt: null,
    providerFallback: false,
  },
  {
    id: "MND-006",
    loanId: "LN-33812",
    borrower: "Tunde Fashola",
    reference: "MND-992345",
    rail: "NDD",
    status: "SUSPENDED",
    validationStatus: "VALIDATED",
    bank: "Zenith Bank",
    bankCode: "057",
    accountNumber: "0246813579",
    maxAmount: 200000,
    frequency: "Monthly",
    issuedAt: "2024-11-02",
    expiryDate: "2025-11-02",
    externalReference: "NDD-REF-992345-2024",
    failureReason: null,
    lastCheckedAt: "2025-05-24T06:00:00Z",
    activatedAt: "2024-11-05T11:00:00Z",
    providerFallback: false,
  },
  {
    id: "MND-007",
    loanId: "LN-41023",
    borrower: "Aisha Mohammed",
    reference: "MND-553892",
    rail: "NDD",
    status: "SUSPENDED",
    validationStatus: "VALIDATED",
    bank: "First Bank",
    bankCode: "011",
    accountNumber: "0135792468",
    maxAmount: 800000,
    frequency: "Monthly",
    issuedAt: "2024-10-01",
    expiryDate: "2025-10-01",
    externalReference: "NDD-REF-553892-2024",
    failureReason: null,
    lastCheckedAt: "2025-05-21T06:00:00Z",
    activatedAt: "2024-10-04T09:00:00Z",
    providerFallback: false,
  },
  {
    id: "MND-008",
    loanId: "LN-91445",
    borrower: "Olumide Babalola",
    reference: "MND-223891",
    rail: "REMITA",
    status: "FAILED",
    validationStatus: "FAILED",
    bank: "Union Bank",
    bankCode: "032",
    accountNumber: "0112233445",
    maxAmount: 350000,
    frequency: "Monthly",
    issuedAt: "2025-04-15",
    expiryDate: "2026-04-15",
    externalReference: "RMT-REF-223891-2025",
    failureReason: "NAME_MISMATCH",
    lastCheckedAt: "2025-05-20T06:00:00Z",
    activatedAt: null,
    providerFallback: false,
  },
  {
    id: "MND-009",
    loanId: "LN-87234",
    borrower: "Blessing Okafor",
    reference: "MND-445678",
    rail: "NDD",
    status: "PENDING",
    validationStatus: "NOT_STARTED",
    bank: "Access Bank",
    bankCode: "044",
    accountNumber: "0998877665",
    maxAmount: 280000,
    frequency: "Monthly",
    issuedAt: "2025-05-22",
    expiryDate: "2026-05-22",
    externalReference: null,
    failureReason: null,
    lastCheckedAt: null,
    activatedAt: null,
    providerFallback: false,
  },
  {
    id: "MND-010",
    loanId: "LN-65123",
    borrower: "Funke Adeyemi",
    reference: "MND-556789",
    rail: "REMITA",
    status: "ACTIVE",
    validationStatus: "VALIDATED",
    bank: "First Bank",
    bankCode: "011",
    accountNumber: "3029847561",
    maxAmount: 600000,
    frequency: "Monthly",
    issuedAt: "2025-02-10",
    expiryDate: "2026-02-10",
    externalReference: "RMT-REF-556789-2025",
    failureReason: null,
    lastCheckedAt: "2025-05-24T06:00:00Z",
    activatedAt: "2025-02-13T08:30:00Z",
    providerFallback: true,
  },
  {
    id: "MND-011",
    loanId: "LN-74892",
    borrower: "Adebayo Ogunleye",
    reference: "MND-667891",
    rail: "NDD",
    status: "FAILED",
    validationStatus: "FAILED",
    bank: "Keystone Bank",
    bankCode: "082",
    accountNumber: "1234567890",
    maxAmount: 450000,
    frequency: "Monthly",
    issuedAt: "2025-03-05",
    expiryDate: "2026-03-05",
    externalReference: "NDD-REF-667891-2025",
    failureReason: "USER_ABANDONED",
    lastCheckedAt: "2025-05-01T06:00:00Z",
    activatedAt: null,
    providerFallback: false,
  },
  {
    id: "MND-012",
    loanId: "LN-52301",
    borrower: "Ifeoma Eze",
    reference: "MND-778912",
    rail: "NDD",
    status: "PENDING",
    validationStatus: "USER_ACTION_REQUIRED",
    bank: "GTBank",
    bankCode: "058",
    accountNumber: "0234567891",
    maxAmount: 900000,
    frequency: "Monthly",
    issuedAt: "2025-05-21",
    expiryDate: "2026-05-21",
    externalReference: "NDD-REF-778912-2025",
    failureReason: null,
    lastCheckedAt: "2025-05-23T06:00:00Z",
    activatedAt: null,
    providerFallback: false,
  },
  {
    id: "MND-013",
    loanId: "LN-38945",
    borrower: "Rotimi Adeleke",
    reference: "MND-889023",
    rail: "REMITA",
    status: "ACTIVE",
    validationStatus: "VALIDATED",
    bank: "Zenith Bank",
    bankCode: "057",
    accountNumber: "2001234567",
    maxAmount: 1500000,
    frequency: "Monthly",
    issuedAt: "2025-01-15",
    expiryDate: "2026-01-15",
    externalReference: "RMT-REF-889023-2025",
    failureReason: null,
    lastCheckedAt: "2025-05-24T06:00:00Z",
    activatedAt: "2025-01-18T11:00:00Z",
    providerFallback: false,
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

export interface DisputeKPIs {
  disputeRate: number
  disputeRateTarget: number
  indemnityLossRate: number
  indemnityLossTotal: number
  slaCompliance: number
  slaComplianceTarget: number
  openDisputes: number
  resolvedThisMonth: number
}

export const disputeKPIs: DisputeKPIs = {
  disputeRate: 0.8,
  disputeRateTarget: 1.0,
  indemnityLossRate: 2.3,
  indemnityLossTotal: 2400000,
  slaCompliance: 87.5,
  slaComplianceTarget: 95,
  openDisputes: 4,
  resolvedThisMonth: 12,
}

export const disputeNotes: Record<string, DisputeNote[]> = {
  "DSP-001": [
    { id: "n1", author: "Adaora Nwosu", role: "Recovery Manager", timestamp: "2025-05-21T10:00:00Z", text: "Opened investigation. Contacted borrower — claims she never authorised the mandate. Requested signed mandate form from NDD team." },
    { id: "n2", author: "Fatima Bello", role: "DRO", timestamp: "2025-05-22T14:30:00Z", text: "NDD team confirmed mandate was set up via iGree link sent on 2024-10-01. Forwarded consent log to borrower." },
    { id: "n3", author: "System", role: "Automated", timestamp: "2025-05-22T14:32:00Z", text: "[AUTO] Evidence compilation complete. Consent log, mandate details, debit trace, and notification history compiled and ready for review." },
  ],
  "DSP-002": [
    { id: "n4", author: "Fatima Bello", role: "DRO", timestamp: "2025-05-24T11:30:00Z", text: "Two debit entries TXN-2025052402 and TXN-2025052401B both show SUCCESS status with identical amounts 2 seconds apart. Likely a duplicate request at NDD gateway. Investigating with NDD ops team." },
  ],
  "DSP-003": [
    { id: "n5", author: "Chidi Okeke", role: "Senior DRO", timestamp: "2025-05-20T09:00:00Z", text: "Debit of ₦1,800,000 exceeds the mandate cap of ₦500,000. Likely a system error during mandate threshold update. Escalating to compliance." },
    { id: "n6", author: "System", role: "Automated", timestamp: "2025-05-20T09:05:00Z", text: "[AUTO] Recovery paused and mandate locked pending dispute resolution." },
    { id: "n7", author: "Adaora Nwosu", role: "Recovery Manager", timestamp: "2025-05-21T08:00:00Z", text: "Evidence compiled. Mandate clearly shows ₦500,000 cap. Debit of ₦1,800,000 is a clear system overshoot — ₦1,300,000 must be refunded. Awaiting Decision Engine input." },
  ],
  "DSP-004": [
    { id: "n8", author: "Adaora Nwosu", role: "Recovery Manager", timestamp: "2025-05-19T15:00:00Z", text: "Serious allegation — borrower claims loan was not taken by her. Police report attached. Escalating to legal immediately. All collections paused." },
    { id: "n9", author: "System", role: "Automated", timestamp: "2025-05-19T15:02:00Z", text: "[AUTO] Recovery paused and mandate locked. Consent log check: NO digital consent record found for this mandate — physical form only." },
    { id: "n10", author: "Chidi Okeke", role: "Senior DRO", timestamp: "2025-05-21T10:00:00Z", text: "Physical mandate form scanned and sent to compliance. No biometric match on BVN. Escalated to legal team per fraud protocol." },
  ],
  "DSP-006": [
    { id: "n11", author: "Chidi Okeke", role: "Senior DRO", timestamp: "2025-05-22T10:30:00Z", text: "Bank-initiated indemnity flag. AT_RISK loan LN-19302 had successful REMITA debit. Indemnity claim filed with processor as precautionary measure per policy." },
  ],
  "DSP-007": [
    { id: "n12", author: "Adaora Nwosu", role: "Recovery Manager", timestamp: "2025-05-23T12:30:00Z", text: "Bank-initiated. Partial recovery isolation rule should have blocked this debit. System bug confirmed by engineering. Full refund processed." },
    { id: "n13", author: "System", role: "Automated", timestamp: "2025-05-24T09:00:00Z", text: "[AUTO] Decision recorded: INVALID debit. Refund of ₦162,500 authorised. Mandate MND-992345 suspended." },
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

// ─── Reconciliation Engine ────────────────────────────────────────────────────

export type ReconClassification =
  | "MATCHED"
  | "MISSING_SETTLEMENT"
  | "MISSING_INTERNAL"
  | "DUPLICATE"
  | "REVERSED"

export type ReconCaseStatus = "OPEN" | "INVESTIGATING" | "RESOLVED"

export interface ReconTransaction {
  id: string
  loanId: string
  borrower: string
  amount: number
  rail: RecoveryRail
  internalStatus: "SUCCESS" | "PENDING" | "FAILED"
  externalReference: string
  createdAt: string
  classification: ReconClassification
  settlementId: string | null
  agingHours: number
}

export interface ReconSettlement {
  id: string
  transactionId: string | null
  externalReference: string
  amount: number
  rail: RecoveryRail
  settlementStatus: "PROVISIONAL" | "FINAL"
  settlementDate: string
  bank: string
  matchedAt: string | null
}

export interface ReconCase {
  id: string
  transactionId: string
  loanId: string
  borrower: string
  amount: number
  classification: ReconClassification
  status: ReconCaseStatus
  assignedTo: string | null
  rail: RecoveryRail
  createdAt: string
  resolvedAt: string | null
  notes: string | null
  resolution: string | null
  externalReference: string
  internalStatus: string
  bankStatus: string
  agingHours: number
}

export interface ReconKPIs {
  gapRate: number
  gapRateTarget: number
  avgResolutionHours: number
  resolutionTarget: number
  matchRate: number
  totalTransactions: number
  totalSettlements: number
  duplicatesDetected: number
  openCases: number
  resolvedToday: number
}

export const reconKPIs: ReconKPIs = {
  gapRate: 0.08,
  gapRateTarget: 0.1,
  avgResolutionHours: 18.4,
  resolutionTarget: 24,
  matchRate: 99.2,
  totalTransactions: 12432,
  totalSettlements: 12318,
  duplicatesDetected: 3,
  openCases: 8,
  resolvedToday: 12,
}

export const reconTransactions: ReconTransaction[] = [
  { id: "TXN-RC-001", loanId: "LN-28471", borrower: "Emeka Okafor", amount: 487500, rail: "NDD", internalStatus: "SUCCESS", externalReference: "NDD-EXT-20250524-881234", createdAt: "2025-05-24T09:15:00Z", classification: "MATCHED", settlementId: "STL-RC-001", agingHours: 0 },
  { id: "TXN-RC-002", loanId: "LN-33812", borrower: "Tunde Fashola", amount: 162500, rail: "NDD", internalStatus: "SUCCESS", externalReference: "NDD-EXT-20250524-992345", createdAt: "2025-05-24T11:05:00Z", classification: "MISSING_SETTLEMENT", settlementId: null, agingHours: 18 },
  { id: "TXN-RC-003", loanId: "LN-41023", borrower: "Aisha Mohammed", amount: 800000, rail: "NDD", internalStatus: "SUCCESS", externalReference: "NDD-EXT-20250524-553892", createdAt: "2025-05-24T09:45:00Z", classification: "DUPLICATE", settlementId: "STL-RC-003", agingHours: 0 },
  { id: "TXN-RC-004", loanId: "LN-41023", borrower: "Aisha Mohammed", amount: 800000, rail: "NDD", internalStatus: "SUCCESS", externalReference: "NDD-EXT-20250524-553893", createdAt: "2025-05-24T09:41:00Z", classification: "DUPLICATE", settlementId: "STL-RC-004", agingHours: 0 },
  { id: "TXN-RC-005", loanId: "LN-89456", borrower: "Segun Adewale", amount: 1800000, rail: "REMITA", internalStatus: "SUCCESS", externalReference: "RMT-EXT-20250522-774512", createdAt: "2025-05-22T16:30:00Z", classification: "REVERSED", settlementId: "STL-RC-005", agingHours: 0 },
  { id: "TXN-RC-006", loanId: "LN-19302", borrower: "Ngozi Adeyemi", amount: 150000, rail: "REMITA", internalStatus: "SUCCESS", externalReference: "RMT-EXT-20250521-771456", createdAt: "2025-05-21T14:30:00Z", classification: "MATCHED", settlementId: "STL-RC-006", agingHours: 0 },
  { id: "TXN-RC-007", loanId: "LN-55247", borrower: "Chidinma Obi", amount: 1000000, rail: "EASY_PAY", internalStatus: "SUCCESS", externalReference: "EPY-EXT-20250519-992512", createdAt: "2025-05-19T08:00:00Z", classification: "MATCHED", settlementId: "STL-RC-007", agingHours: 0 },
  { id: "TXN-RC-008", loanId: "LN-78134", borrower: "Kemi Olusanya", amount: 250000, rail: "NDD", internalStatus: "PENDING", externalReference: "NDD-EXT-20250523-668901", createdAt: "2025-05-23T10:00:00Z", classification: "MISSING_SETTLEMENT", settlementId: null, agingHours: 42 },
  { id: "TXN-RC-009", loanId: "LN-44721", borrower: "Bola Adeyinka", amount: 320000, rail: "REMITA", internalStatus: "FAILED", externalReference: "RMT-EXT-20250524-882200", createdAt: "2025-05-24T07:30:00Z", classification: "MATCHED", settlementId: null, agingHours: 0 },
  { id: "TXN-RC-010", loanId: "LN-61902", borrower: "Taiwo Okonkwo", amount: 180000, rail: "NDD", internalStatus: "SUCCESS", externalReference: "NDD-EXT-20250520-771100", createdAt: "2025-05-20T13:00:00Z", classification: "MISSING_INTERNAL", settlementId: "STL-RC-010", agingHours: 96 },
]

export const reconSettlements: ReconSettlement[] = [
  { id: "STL-RC-001", transactionId: "TXN-RC-001", externalReference: "NDD-EXT-20250524-881234", amount: 487500, rail: "NDD", settlementStatus: "FINAL", settlementDate: "2025-05-24T17:00:00Z", bank: "Access Bank", matchedAt: "2025-05-24T17:05:00Z" },
  { id: "STL-RC-003", transactionId: "TXN-RC-003", externalReference: "NDD-EXT-20250524-553892", amount: 800000, rail: "NDD", settlementStatus: "FINAL", settlementDate: "2025-05-24T17:00:00Z", bank: "First Bank", matchedAt: "2025-05-24T17:05:00Z" },
  { id: "STL-RC-004", transactionId: "TXN-RC-004", externalReference: "NDD-EXT-20250524-553893", amount: 800000, rail: "NDD", settlementStatus: "PROVISIONAL", settlementDate: "2025-05-24T17:00:00Z", bank: "First Bank", matchedAt: "2025-05-24T17:05:00Z" },
  { id: "STL-RC-005", transactionId: "TXN-RC-005", externalReference: "RMT-EXT-20250522-774512", amount: 1800000, rail: "REMITA", settlementStatus: "FINAL", settlementDate: "2025-05-22T20:00:00Z", bank: "Polaris Bank", matchedAt: "2025-05-24T09:00:00Z" },
  { id: "STL-RC-006", transactionId: "TXN-RC-006", externalReference: "RMT-EXT-20250521-771456", amount: 150000, rail: "REMITA", settlementStatus: "FINAL", settlementDate: "2025-05-21T20:00:00Z", bank: "GTBank", matchedAt: "2025-05-21T20:30:00Z" },
  { id: "STL-RC-007", transactionId: "TXN-RC-007", externalReference: "EPY-EXT-20250519-992512", amount: 1000000, rail: "EASY_PAY", settlementStatus: "FINAL", settlementDate: "2025-05-19T16:00:00Z", bank: "UBA", matchedAt: "2025-05-19T16:15:00Z" },
  { id: "STL-RC-010", transactionId: null, externalReference: "NDD-EXT-20250520-771100", amount: 180000, rail: "NDD", settlementStatus: "FINAL", settlementDate: "2025-05-20T17:00:00Z", bank: "Wema Bank", matchedAt: null },
]

export const reconCases: ReconCase[] = [
  {
    id: "CASE-RC-001",
    transactionId: "TXN-RC-002",
    loanId: "LN-33812",
    borrower: "Tunde Fashola",
    amount: 162500,
    classification: "MISSING_SETTLEMENT",
    status: "INVESTIGATING",
    assignedTo: "Kunle Adesanya",
    rail: "NDD",
    createdAt: "2025-05-24T11:05:00Z",
    resolvedAt: null,
    notes: "NDD ops team notified. Settlement file received late — bank batch job delayed. Expected settlement in next cycle.",
    resolution: null,
    externalReference: "NDD-EXT-20250524-992345",
    internalStatus: "SUCCESS",
    bankStatus: "UNKNOWN",
    agingHours: 18,
  },
  {
    id: "CASE-RC-002",
    transactionId: "TXN-RC-003",
    loanId: "LN-41023",
    borrower: "Aisha Mohammed",
    amount: 800000,
    classification: "DUPLICATE",
    status: "OPEN",
    assignedTo: null,
    rail: "NDD",
    createdAt: "2025-05-24T10:52:00Z",
    resolvedAt: null,
    notes: null,
    resolution: null,
    externalReference: "NDD-EXT-20250524-553892",
    internalStatus: "SUCCESS",
    bankStatus: "CONFIRMED",
    agingHours: 10,
  },
  {
    id: "CASE-RC-003",
    transactionId: "TXN-RC-005",
    loanId: "LN-89456",
    borrower: "Segun Adewale",
    amount: 1800000,
    classification: "REVERSED",
    status: "RESOLVED",
    assignedTo: "Kunle Adesanya",
    rail: "REMITA",
    createdAt: "2025-05-22T16:30:00Z",
    resolvedAt: "2025-05-24T09:00:00Z",
    notes: "Reversal confirmed. Recovery re-triggered for valid instalment amount of ₦500,000. Mandate cap corrected.",
    resolution: "Ledger adjusted. Recovery re-triggered for ₦500,000. Excess ₦1,300,000 refunded.",
    externalReference: "RMT-EXT-20250522-774512",
    internalStatus: "SUCCESS",
    bankStatus: "REVERSED",
    agingHours: 0,
  },
  {
    id: "CASE-RC-004",
    transactionId: "TXN-RC-008",
    loanId: "LN-78134",
    borrower: "Kemi Olusanya",
    amount: 250000,
    classification: "MISSING_SETTLEMENT",
    status: "OPEN",
    assignedTo: null,
    rail: "NDD",
    createdAt: "2025-05-23T10:00:00Z",
    resolvedAt: null,
    notes: null,
    resolution: null,
    externalReference: "NDD-EXT-20250523-668901",
    internalStatus: "PENDING",
    bankStatus: "UNKNOWN",
    agingHours: 42,
  },
  {
    id: "CASE-RC-005",
    transactionId: "TXN-RC-010",
    loanId: "LN-61902",
    borrower: "Taiwo Okonkwo",
    amount: 180000,
    classification: "MISSING_INTERNAL",
    status: "INVESTIGATING",
    assignedTo: "Adaora Nwosu",
    rail: "NDD",
    createdAt: "2025-05-21T06:00:00Z",
    resolvedAt: null,
    notes: "Settlement received from NDD but no matching transaction in our system. Possible webhook failure during outage on 2025-05-20 18:00-18:45. Engineering investigating.",
    resolution: null,
    externalReference: "NDD-EXT-20250520-771100",
    internalStatus: "NOT_FOUND",
    bankStatus: "CONFIRMED",
    agingHours: 96,
  },
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

// ─── Mandate Orchestration Engine ─────────────────────────────────────────────

export interface BankCapability {
  bankCode: string
  bankName: string
  supportsNDD: boolean
  nddSuccessRate: number | null
  remitaSuccessRate: number | null
  preferredProvider: "NDD" | "REMITA"
  lastUpdated: string
}

export const bankCapabilities: BankCapability[] = [
  { bankCode: "044", bankName: "Access Bank", supportsNDD: true, nddSuccessRate: 89, remitaSuccessRate: 84, preferredProvider: "NDD", lastUpdated: "2025-05-20T00:00:00Z" },
  { bankCode: "058", bankName: "GTBank", supportsNDD: true, nddSuccessRate: 62, remitaSuccessRate: 91, preferredProvider: "REMITA", lastUpdated: "2025-05-20T00:00:00Z" },
  { bankCode: "011", bankName: "First Bank", supportsNDD: true, nddSuccessRate: 85, remitaSuccessRate: 80, preferredProvider: "NDD", lastUpdated: "2025-05-20T00:00:00Z" },
  { bankCode: "057", bankName: "Zenith Bank", supportsNDD: true, nddSuccessRate: 88, remitaSuccessRate: 86, preferredProvider: "NDD", lastUpdated: "2025-05-20T00:00:00Z" },
  { bankCode: "033", bankName: "UBA", supportsNDD: false, nddSuccessRate: null, remitaSuccessRate: 79, preferredProvider: "REMITA", lastUpdated: "2025-05-20T00:00:00Z" },
  { bankCode: "221", bankName: "Stanbic IBTC", supportsNDD: true, nddSuccessRate: 78, remitaSuccessRate: 83, preferredProvider: "REMITA", lastUpdated: "2025-05-20T00:00:00Z" },
  { bankCode: "070", bankName: "Fidelity Bank", supportsNDD: true, nddSuccessRate: 71, remitaSuccessRate: 75, preferredProvider: "REMITA", lastUpdated: "2025-05-20T00:00:00Z" },
  { bankCode: "032", bankName: "Union Bank", supportsNDD: true, nddSuccessRate: 64, remitaSuccessRate: 77, preferredProvider: "REMITA", lastUpdated: "2025-05-20T00:00:00Z" },
  { bankCode: "082", bankName: "Keystone Bank", supportsNDD: false, nddSuccessRate: null, remitaSuccessRate: 68, preferredProvider: "REMITA", lastUpdated: "2025-05-20T00:00:00Z" },
  { bankCode: "035", bankName: "Wema Bank", supportsNDD: true, nddSuccessRate: 82, remitaSuccessRate: 76, preferredProvider: "NDD", lastUpdated: "2025-05-20T00:00:00Z" },
]

export interface MandateKPIs {
  activationRate: number
  activationRateTarget: number
  silentFailuresDetected: number
  avgTimeToActiveHours: number
  avgTimeToActiveTarget: number
  fallbackAccountRate: number
  totalActive: number
  totalPending: number
  totalFailed: number
  refreshedThisMonth: number
}

export const mandateKPIs: MandateKPIs = {
  activationRate: 78.4,
  activationRateTarget: 85,
  silentFailuresDetected: 12,
  avgTimeToActiveHours: 4.2,
  avgTimeToActiveTarget: 6,
  fallbackAccountRate: 23,
  totalActive: 847,
  totalPending: 134,
  totalFailed: 98,
  refreshedThisMonth: 43,
}
