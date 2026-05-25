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

export type MandateStatus =
  | "PENDING"
  | "SENT"
  | "VALIDATED"
  | "ACTIVE"
  | "EXPIRED"
  | "FAILED"
  | "CANCELLED"

export type RecoveryRail = "NDD" | "Remita" | "EasyPay"
export type EscalationTier = 1 | 2 | 3 | 4

export interface Loan {
  id: string
  borrowerName: string
  borrowerPhone: string
  borrowerEmail: string
  bvn: string
  accountNumber: string
  bankName: string
  principal: number
  outstanding: number
  disbursedDate: string
  dueDate: string
  dpd: number
  state: LoanState
  rail: RecoveryRail
  mandateStatus: MandateStatus
  mandateRef: string
  tier: EscalationTier
  retries: number
  maxRetries: number
  lastAttempt: string | null
  lastAttemptResult: "success" | "failed" | "partial" | null
  nextRetry: string | null
  assignedDRO: string | null
  loanType: "Digital" | "Manual"
  loanId: string
  partialRecovered?: number
}

export interface Dispute {
  id: string
  loanId: string
  borrowerName: string
  borrowerPhone: string
  type:
    | "Incorrect Debit"
    | "Unauthorised Mandate"
    | "Duplicate Debit"
    | "Insufficient Notice"
    | "Fraud"
  amount: number
  status:
    | "OPEN"
    | "INVESTIGATING"
    | "RECOMMENDATION_SUBMITTED"
    | "AWAITING_DRM"
    | "RESOLVED_UPHELD"
    | "RESOLVED_REFUNDED"
    | "RESOLVED_FRAUD"
    | "CLOSED"
  slaDeadline: string
  assignedOfficer: string
  openedAt: string
  description: string
  rail: RecoveryRail
}

export interface Settlement {
  id: string
  loanId: string
  borrowerName: string
  rail: RecoveryRail
  debitAmount: number
  settlementAmount: number
  status: "PENDING" | "PROVISIONAL" | "FINALIZED" | "REVERSED" | "REFUNDED"
  bankName: string
  timestamp: string
  settledAt: string | null
  idempotencyKey: string
}

export interface Mandate {
  id: string
  loanId: string
  borrowerName: string
  rail: RecoveryRail
  status: MandateStatus
  bankName: string
  accountNumber: string
  maxAmount: number
  frequency: "Monthly" | "Weekly" | "Daily"
  issuedAt: string
  approvedAt: string | null
  expiryDate: string
  validationTransferStatus: "PENDING" | "COMPLETED" | "EXPIRED"
  failureReason?: string
  riskFlag: "LOW" | "MEDIUM" | "HIGH"
}

export const loans: Loan[] = [
  {
    id: "1",
    loanId: "LN-28471",
    borrowerName: "Emeka Okafor",
    borrowerPhone: "+234 802 345 6789",
    borrowerEmail: "emeka.okafor@email.com",
    bvn: "22341056789",
    accountNumber: "0123456789",
    bankName: "Access Bank",
    principal: 500000,
    outstanding: 487500,
    disbursedDate: "2024-10-01",
    dueDate: "2024-11-01",
    dpd: 23,
    state: "IN_RECOVERY",
    rail: "NDD",
    mandateStatus: "ACTIVE",
    mandateRef: "MND-881234",
    tier: 1,
    retries: 2,
    maxRetries: 5,
    lastAttempt: "2025-05-24T09:15:00Z",
    lastAttemptResult: "failed",
    nextRetry: "2025-05-25T09:00:00Z",
    assignedDRO: "Fatima Bello",
    loanType: "Digital",
  },
  {
    id: "2",
    loanId: "LN-19302",
    borrowerName: "Ngozi Adeyemi",
    borrowerPhone: "+234 803 456 7890",
    borrowerEmail: "ngozi.a@gmail.com",
    bvn: "22456781234",
    accountNumber: "0987654321",
    bankName: "GTBank",
    principal: 1200000,
    outstanding: 1050000,
    disbursedDate: "2024-09-15",
    dueDate: "2024-10-15",
    dpd: 40,
    state: "AT_RISK",
    rail: "Remita",
    mandateStatus: "ACTIVE",
    mandateRef: "MND-771456",
    tier: 2,
    retries: 4,
    maxRetries: 5,
    lastAttempt: "2025-05-22T14:30:00Z",
    lastAttemptResult: "failed",
    nextRetry: "2025-05-29T09:00:00Z",
    assignedDRO: "Chidi Okeke",
    loanType: "Digital",
  },
  {
    id: "3",
    loanId: "LN-33812",
    borrowerName: "Tunde Fashola",
    borrowerPhone: "+234 805 678 9012",
    borrowerEmail: "tunde.f@yahoo.com",
    bvn: "22312389045",
    accountNumber: "0246813579",
    bankName: "Zenith Bank",
    principal: 250000,
    outstanding: 87500,
    disbursedDate: "2024-11-01",
    dueDate: "2024-12-01",
    dpd: 5,
    state: "PARTIALLY_RECOVERED",
    rail: "NDD",
    mandateStatus: "ACTIVE",
    mandateRef: "MND-992345",
    tier: 1,
    retries: 1,
    maxRetries: 5,
    lastAttempt: "2025-05-23T11:00:00Z",
    lastAttemptResult: "partial",
    nextRetry: "2025-05-24T11:00:00Z",
    assignedDRO: "Fatima Bello",
    loanType: "Digital",
    partialRecovered: 162500,
  },
  {
    id: "4",
    loanId: "LN-41023",
    borrowerName: "Aisha Mohammed",
    borrowerPhone: "+234 806 789 0123",
    borrowerEmail: "aisha.m@outlook.com",
    bvn: "22567890123",
    accountNumber: "0135792468",
    bankName: "First Bank",
    principal: 800000,
    outstanding: 800000,
    disbursedDate: "2024-10-20",
    dueDate: "2024-11-20",
    dpd: 4,
    state: "DISPUTE_OPEN",
    rail: "NDD",
    mandateStatus: "ACTIVE",
    mandateRef: "MND-553892",
    tier: 1,
    retries: 1,
    maxRetries: 5,
    lastAttempt: "2025-05-21T08:45:00Z",
    lastAttemptResult: "failed",
    nextRetry: null,
    assignedDRO: "Yusuf Ibrahim",
    loanType: "Manual",
  },
  {
    id: "5",
    loanId: "LN-55247",
    borrowerName: "Chidinma Obi",
    borrowerPhone: "+234 807 890 1234",
    borrowerEmail: "chidinma.o@email.ng",
    bvn: "22678901234",
    accountNumber: "0357924680",
    bankName: "UBA",
    principal: 3000000,
    outstanding: 3000000,
    disbursedDate: "2024-08-15",
    dueDate: "2024-09-15",
    dpd: 70,
    state: "LEGAL_REVIEW",
    rail: "EasyPay",
    mandateStatus: "EXPIRED",
    mandateRef: "MND-334891",
    tier: 4,
    retries: 5,
    maxRetries: 5,
    lastAttempt: "2025-05-10T10:00:00Z",
    lastAttemptResult: "failed",
    nextRetry: null,
    assignedDRO: "Chidi Okeke",
    loanType: "Digital",
  },
  {
    id: "6",
    loanId: "LN-62891",
    borrowerName: "Babatunde Adekoya",
    borrowerPhone: "+234 808 901 2345",
    borrowerEmail: "b.adekoya@gmail.com",
    bvn: "22789012345",
    accountNumber: "0468013579",
    bankName: "Stanbic IBTC",
    principal: 450000,
    outstanding: 450000,
    disbursedDate: "2024-11-10",
    dueDate: "2024-12-10",
    dpd: 14,
    state: "OVERDUE",
    rail: "NDD",
    mandateStatus: "PENDING",
    mandateRef: "MND-112567",
    tier: 1,
    retries: 0,
    maxRetries: 5,
    lastAttempt: null,
    lastAttemptResult: null,
    nextRetry: "2025-05-25T09:00:00Z",
    assignedDRO: null,
    loanType: "Manual",
  },
  {
    id: "7",
    loanId: "LN-78134",
    borrowerName: "Kemi Olusanya",
    borrowerPhone: "+234 809 012 3456",
    borrowerEmail: "kemi.o@yahoo.com",
    bvn: "22890123456",
    accountNumber: "0579124680",
    bankName: "Fidelity Bank",
    principal: 750000,
    outstanding: 750000,
    disbursedDate: "2024-09-01",
    dueDate: "2024-10-01",
    dpd: 55,
    state: "RECOVERY_FAILED",
    rail: "NDD",
    mandateStatus: "FAILED",
    mandateRef: "MND-667234",
    tier: 3,
    retries: 5,
    maxRetries: 5,
    lastAttempt: "2025-05-05T12:00:00Z",
    lastAttemptResult: "failed",
    nextRetry: null,
    assignedDRO: "Yusuf Ibrahim",
    loanType: "Digital",
  },
  {
    id: "8",
    loanId: "LN-89456",
    borrowerName: "Segun Adewale",
    borrowerPhone: "+234 810 123 4567",
    borrowerEmail: "segun.ade@company.ng",
    bvn: "22901234567",
    accountNumber: "0680235791",
    bankName: "Polaris Bank",
    principal: 2000000,
    outstanding: 1800000,
    disbursedDate: "2024-10-05",
    dueDate: "2024-11-05",
    dpd: 19,
    state: "IN_RECOVERY",
    rail: "Remita",
    mandateStatus: "ACTIVE",
    mandateRef: "MND-445678",
    tier: 1,
    retries: 2,
    maxRetries: 5,
    lastAttempt: "2025-05-24T16:20:00Z",
    lastAttemptResult: "failed",
    nextRetry: "2025-05-26T09:00:00Z",
    assignedDRO: "Fatima Bello",
    loanType: "Digital",
  },
]

export const disputes: Dispute[] = [
  {
    id: "DSP-001",
    loanId: "LN-41023",
    borrowerName: "Aisha Mohammed",
    borrowerPhone: "+234 806 789 0123",
    type: "Unauthorised Mandate",
    amount: 800000,
    status: "INVESTIGATING",
    slaDeadline: "2025-05-28T00:00:00Z",
    assignedOfficer: "Yusuf Ibrahim",
    openedAt: "2025-05-23T10:30:00Z",
    description: "Borrower claims they did not authorise the mandate setup for their Access Bank account.",
    rail: "NDD",
  },
  {
    id: "DSP-002",
    loanId: "LN-91234",
    borrowerName: "Victor Eze",
    borrowerPhone: "+234 811 234 5678",
    type: "Duplicate Debit",
    amount: 120000,
    status: "AWAITING_DRM",
    slaDeadline: "2025-05-26T00:00:00Z",
    assignedOfficer: "Fatima Bello",
    openedAt: "2025-05-21T14:00:00Z",
    description: "Two debits of ₦120,000 processed on the same day. Customer requests refund of duplicate.",
    rail: "NDD",
  },
  {
    id: "DSP-003",
    loanId: "LN-88234",
    borrowerName: "Nkechi Okonkwo",
    borrowerPhone: "+234 812 345 6789",
    type: "Incorrect Debit",
    amount: 350000,
    status: "OPEN",
    slaDeadline: "2025-05-25T00:00:00Z",
    assignedOfficer: "Chidi Okeke",
    openedAt: "2025-05-20T09:15:00Z",
    description: "Amount debited (₦350,000) does not match agreed repayment schedule (₦180,000).",
    rail: "Remita",
  },
  {
    id: "DSP-004",
    loanId: "LN-77102",
    borrowerName: "Bola Adesanya",
    borrowerPhone: "+234 813 456 7890",
    type: "Fraud",
    amount: 500000,
    status: "RECOMMENDATION_SUBMITTED",
    slaDeadline: "2025-05-30T00:00:00Z",
    assignedOfficer: "Yusuf Ibrahim",
    openedAt: "2025-05-25T11:00:00Z",
    description: "Customer reports account was compromised. Mandate created without knowledge.",
    rail: "EasyPay",
  },
]

export const settlements: Settlement[] = [
  {
    id: "TXN-881234",
    loanId: "LN-12345",
    borrowerName: "Adaeze Nwosu",
    rail: "NDD",
    debitAmount: 250000,
    settlementAmount: 250000,
    status: "FINALIZED",
    bankName: "Access Bank",
    timestamp: "2025-05-24T08:00:00Z",
    settledAt: "2025-05-25T08:00:00Z",
    idempotencyKey: "idem-881234-v1",
  },
  {
    id: "TXN-992345",
    loanId: "LN-28471",
    borrowerName: "Emeka Okafor",
    rail: "NDD",
    debitAmount: 487500,
    settlementAmount: 0,
    status: "REVERSED",
    bankName: "Access Bank",
    timestamp: "2025-05-24T09:15:00Z",
    settledAt: null,
    idempotencyKey: "idem-992345-v1",
  },
  {
    id: "TXN-773456",
    loanId: "LN-33812",
    borrowerName: "Tunde Fashola",
    rail: "NDD",
    debitAmount: 250000,
    settlementAmount: 162500,
    status: "FINALIZED",
    bankName: "Zenith Bank",
    timestamp: "2025-05-23T11:00:00Z",
    settledAt: "2025-05-24T11:00:00Z",
    idempotencyKey: "idem-773456-v1",
  },
  {
    id: "TXN-664567",
    loanId: "LN-55678",
    borrowerName: "Olumide Adeleke",
    rail: "EasyPay",
    debitAmount: 180000,
    settlementAmount: 180000,
    status: "PROVISIONAL",
    bankName: "GTBank",
    timestamp: "2025-05-24T14:30:00Z",
    settledAt: null,
    idempotencyKey: "idem-664567-v1",
  },
  {
    id: "TXN-555678",
    loanId: "LN-44123",
    borrowerName: "Bimpe Akintunde",
    rail: "Remita",
    debitAmount: 420000,
    settlementAmount: 420000,
    status: "FINALIZED",
    bankName: "Fidelity Bank",
    timestamp: "2025-05-23T16:00:00Z",
    settledAt: "2025-05-24T16:00:00Z",
    idempotencyKey: "idem-555678-v1",
  },
  {
    id: "TXN-446789",
    loanId: "LN-96234",
    borrowerName: "Rasheed Lawal",
    rail: "NDD",
    debitAmount: 120000,
    settlementAmount: 0,
    status: "PENDING",
    bankName: "UBA",
    timestamp: "2025-05-24T17:00:00Z",
    settledAt: null,
    idempotencyKey: "idem-446789-v1",
  },
]

export const mandates: Mandate[] = [
  {
    id: "MND-881234",
    loanId: "LN-28471",
    borrowerName: "Emeka Okafor",
    rail: "NDD",
    status: "ACTIVE",
    bankName: "Access Bank",
    accountNumber: "0123456789",
    maxAmount: 500000,
    frequency: "Monthly",
    issuedAt: "2024-10-01T10:00:00Z",
    approvedAt: "2024-10-02T08:00:00Z",
    expiryDate: "2025-10-01T00:00:00Z",
    validationTransferStatus: "COMPLETED",
    riskFlag: "LOW",
  },
  {
    id: "MND-771456",
    loanId: "LN-19302",
    borrowerName: "Ngozi Adeyemi",
    rail: "Remita",
    status: "ACTIVE",
    bankName: "GTBank",
    accountNumber: "0987654321",
    maxAmount: 1200000,
    frequency: "Monthly",
    issuedAt: "2024-09-15T10:00:00Z",
    approvedAt: "2024-09-16T11:00:00Z",
    expiryDate: "2025-09-15T00:00:00Z",
    validationTransferStatus: "COMPLETED",
    riskFlag: "HIGH",
  },
  {
    id: "MND-112567",
    loanId: "LN-62891",
    borrowerName: "Babatunde Adekoya",
    rail: "NDD",
    status: "PENDING",
    bankName: "Stanbic IBTC",
    accountNumber: "0468013579",
    maxAmount: 450000,
    frequency: "Monthly",
    issuedAt: "2025-05-20T09:00:00Z",
    approvedAt: null,
    expiryDate: "2026-05-20T00:00:00Z",
    validationTransferStatus: "PENDING",
    riskFlag: "MEDIUM",
  },
  {
    id: "MND-334891",
    loanId: "LN-55247",
    borrowerName: "Chidinma Obi",
    rail: "NDD",
    status: "EXPIRED",
    bankName: "UBA",
    accountNumber: "0357924680",
    maxAmount: 3000000,
    frequency: "Monthly",
    issuedAt: "2024-08-15T10:00:00Z",
    approvedAt: "2024-08-16T09:00:00Z",
    expiryDate: "2025-02-15T00:00:00Z",
    validationTransferStatus: "COMPLETED",
    riskFlag: "HIGH",
  },
  {
    id: "MND-667234",
    loanId: "LN-78134",
    borrowerName: "Kemi Olusanya",
    rail: "NDD",
    status: "FAILED",
    bankName: "Fidelity Bank",
    accountNumber: "0579124680",
    maxAmount: 750000,
    frequency: "Monthly",
    issuedAt: "2024-09-01T10:00:00Z",
    approvedAt: null,
    expiryDate: "2025-09-01T00:00:00Z",
    validationTransferStatus: "EXPIRED",
    failureReason: "Bank rejected mandate — account flagged",
    riskFlag: "HIGH",
  },
]

export const dashboardKPIs = {
  recoveryRate: { value: 87.4, trend: 3.2, period: "MTD" },
  loansInRecovery: { value: 1847, trend: -12, period: "vs yesterday" },
  partialRecoveries: { value: 234, trend: 8, period: "MTD" },
  failedDebitsToday: { value: 127, trend: 23, period: "vs yesterday", alert: true },
  escalatedCases: { value: 89, tier3: 67, tier4: 22, alert: true },
  totalRecoveredMTD: { value: 284_750_000, trend: 12.4, period: "vs last month" },
  atRiskAccounts: { value: 312, trend: -5, period: "vs yesterday", alert: true },
}

export const recoveryChartData = [
  { date: "May 18", success: 342, partial: 78, failed: 89 },
  { date: "May 19", success: 298, partial: 91, failed: 102 },
  { date: "May 20", success: 415, partial: 67, failed: 74 },
  { date: "May 21", success: 387, partial: 83, failed: 95 },
  { date: "May 22", success: 356, partial: 72, failed: 88 },
  { date: "May 23", success: 428, partial: 95, failed: 67 },
  { date: "May 24", success: 401, partial: 88, failed: 127 },
]

export const railDistributionData = [
  { name: "NDD", value: 58, color: "#3B82F6" },
  { name: "Remita", value: 28, color: "#8B5CF6" },
  { name: "EasyPay", value: 14, color: "#F59E0B" },
]

export const droUsers = [
  { id: "u1", name: "Fatima Bello", role: "DRO", activeCases: 127, email: "f.bello@vfd.ng" },
  { id: "u2", name: "Chidi Okeke", role: "DRO", activeCases: 143, email: "c.okeke@vfd.ng" },
  { id: "u3", name: "Yusuf Ibrahim", role: "DRO", activeCases: 98, email: "y.ibrahim@vfd.ng" },
  { id: "u4", name: "Adaora Nwosu", role: "DRM", activeCases: 0, email: "a.nwosu@vfd.ng" },
  { id: "u5", name: "Kunle Adesanya", role: "Finance", activeCases: 0, email: "k.adesanya@vfd.ng" },
]

export type AuditEvent = {
  id: string
  timestamp: string
  user: string
  role: string
  action: string
  entityType: string
  entityId: string
  riskLevel: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  ipAddress: string
  description: string
  previousState?: string
  newState?: string
}

export const auditEvents: AuditEvent[] = [
  {
    id: "AUD-001",
    timestamp: "2025-05-24T15:30:00Z",
    user: "Adaora Nwosu",
    role: "DRM",
    action: "PAUSE_RECOVERY",
    entityType: "Loan",
    entityId: "LN-19302",
    riskLevel: "MEDIUM",
    ipAddress: "196.23.45.67",
    description: "Paused recovery for loan LN-19302 due to customer complaint",
    previousState: "IN_RECOVERY",
    newState: "PAUSED",
  },
  {
    id: "AUD-002",
    timestamp: "2025-05-24T14:10:00Z",
    user: "Fatima Bello",
    role: "DRO",
    action: "MANUAL_RETRY",
    entityType: "Loan",
    entityId: "LN-28471",
    riskLevel: "LOW",
    ipAddress: "196.23.45.89",
    description: "Manual retry triggered for loan LN-28471",
  },
  {
    id: "AUD-003",
    timestamp: "2025-05-24T12:45:00Z",
    user: "Adaora Nwosu",
    role: "DRM",
    action: "POLICY_DRAFT_SUBMITTED",
    entityType: "Policy",
    entityId: "POL-RETRY-001",
    riskLevel: "HIGH",
    ipAddress: "196.23.45.67",
    description: "Policy change submitted for activation: Retry schedule updated",
  },
  {
    id: "AUD-004",
    timestamp: "2025-05-24T11:00:00Z",
    user: "System",
    role: "SYSTEM",
    action: "ESCALATION_TIER2",
    entityType: "Loan",
    entityId: "LN-19302",
    riskLevel: "MEDIUM",
    ipAddress: "127.0.0.1",
    description: "Loan automatically escalated to Tier 2 after 2 failed retry cycles",
    previousState: "IN_RECOVERY",
    newState: "AT_RISK",
  },
  {
    id: "AUD-005",
    timestamp: "2025-05-23T16:00:00Z",
    user: "Chidi Okeke",
    role: "DRO",
    action: "DISPUTE_CREATED",
    entityType: "Dispute",
    entityId: "DSP-001",
    riskLevel: "HIGH",
    ipAddress: "196.23.45.90",
    description: "Dispute case created for loan LN-41023 - Unauthorised Mandate",
  },
]
