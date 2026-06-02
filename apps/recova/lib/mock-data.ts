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

export interface Dispute {
  id: string
  loanId: string
  borrower: string
  phone: string
  type: "Incorrect Debit" | "Unauthorised Mandate" | "Duplicate Debit" | "Insufficient Notice" | "Fraud"
  amount: number
  status: "OPEN" | "INVESTIGATING" | "ESCALATED" | "RESOLVED" | "REJECTED" | "CLOSED"
  slaDeadline: string
  assignedTo: string
  filedAt: string
  description: string
  rail: RecoveryRail
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

export interface Mandate {
  id: string
  loanId: string
  borrower: string
  reference: string
  rail: RecoveryRail
  status: MandateStatus
  bank: string
  accountNumber: string
  maxAmount: number
  frequency: "Monthly" | "Weekly" | "Daily"
  issuedAt: string
  expiryDate: string
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
    type: "Unauthorised Mandate",
    amount: 800000,
    status: "INVESTIGATING",
    slaDeadline: "2025-05-28T00:00:00Z",
    assignedTo: "Adaora Nwosu",
    filedAt: "2025-05-21T09:00:00Z",
    description: "Borrower claims mandate was set up without consent.",
    rail: "NDD",
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
    bank: "Access Bank",
    accountNumber: "0123456789",
    maxAmount: 500000,
    frequency: "Monthly",
    issuedAt: "2024-10-01",
    expiryDate: "2025-10-01",
  },
  {
    id: "MND-002",
    loanId: "LN-19302",
    borrower: "Ngozi Adeyemi",
    reference: "MND-771456",
    rail: "REMITA",
    status: "ACTIVE",
    bank: "GTBank",
    accountNumber: "0987654321",
    maxAmount: 1200000,
    frequency: "Monthly",
    issuedAt: "2024-09-15",
    expiryDate: "2025-09-15",
  },
  {
    id: "MND-003",
    loanId: "LN-55247",
    borrower: "Chidinma Obi",
    reference: "MND-334891",
    rail: "EASY_PAY",
    status: "EXPIRED",
    bank: "UBA",
    accountNumber: "0357924680",
    maxAmount: 3000000,
    frequency: "Monthly",
    issuedAt: "2024-08-15",
    expiryDate: "2025-02-15",
  },
  {
    id: "MND-004",
    loanId: "LN-62891",
    borrower: "Babatunde Adekoya",
    reference: "MND-112567",
    rail: "NDD",
    status: "PENDING",
    bank: "Stanbic IBTC",
    accountNumber: "0468013579",
    maxAmount: 450000,
    frequency: "Monthly",
    issuedAt: "2025-05-20",
    expiryDate: "2026-05-20",
  },
  {
    id: "MND-005",
    loanId: "LN-78134",
    borrower: "Kemi Olusanya",
    reference: "MND-667234",
    rail: "NDD",
    status: "FAILED",
    bank: "Fidelity Bank",
    accountNumber: "0579124680",
    maxAmount: 750000,
    frequency: "Monthly",
    issuedAt: "2024-09-01",
    expiryDate: "2025-09-01",
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
