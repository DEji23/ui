import type { EscalationTier, Rail } from "@/lib/domain/types"

/* ------------------------------------------------------------------ */
/* EasyPay fallback log                                                */
/* ------------------------------------------------------------------ */

/** The four EasyPay endpoints the integration framework specifies. */
export type EasyPayOperation =
  | "NAME_ENQUIRY"
  | "BALANCE_ENQUIRY"
  | "FUND_TRANSFER"
  | "STATUS_QUERY"

export const EASYPAY_OPERATION_LABEL: Record<EasyPayOperation, string> = {
  NAME_ENQUIRY: "Name Enquiry",
  BALANCE_ENQUIRY: "Balance Enquiry",
  FUND_TRANSFER: "Fund Transfer",
  STATUS_QUERY: "Status Query",
}

export type EasyPayStatus =
  | "SUCCESS"
  | "PENDING_EXECUTION"
  | "BALANCE_CHECK_PASSED"
  | "DEBIT_INITIATED"
  | "CIRCUIT_BREAKER_ACTIVE"
  | "AWAITING_RETRY_POLICY"
  | "FAILED"

export const EASYPAY_STATUS_LABEL: Record<EasyPayStatus, string> = {
  SUCCESS: "Success",
  PENDING_EXECUTION: "Pending Execution",
  BALANCE_CHECK_PASSED: "Balance Check Passed",
  DEBIT_INITIATED: "Debit Initiated",
  CIRCUIT_BREAKER_ACTIVE: "Circuit Breaker Active",
  AWAITING_RETRY_POLICY: "Awaiting Retry Policy",
  FAILED: "Failed",
}

export interface EasyPayTransaction {
  id: string
  reference: string
  loanId: string
  borrowerName: string
  phone: string
  operation: EasyPayOperation
  amount: number
  status: EasyPayStatus
  tier: EscalationTier
  /** The rail this attempt fell back from — always a direct debit rail. */
  fallbackFrom: Rail
  attemptedAt: string
  costNaira: number
}

export const EASYPAY_TRANSACTIONS: EasyPayTransaction[] = [
  {
    id: "ep_001",
    reference: "EASY-28471",
    loanId: "LN-28471",
    borrowerName: "Emeka Okafor",
    phone: "+234 802 345 6789",
    operation: "FUND_TRANSFER",
    amount: 487_500,
    status: "SUCCESS",
    tier: "T1",
    fallbackFrom: "NDD",
    attemptedAt: "2026-08-06T09:12:00Z",
    costNaira: 6.75,
  },
  {
    id: "ep_002",
    reference: "EASY-28502",
    loanId: "LN-28502",
    borrowerName: "Tunde Bakare",
    phone: "+234 809 771 2233",
    operation: "BALANCE_ENQUIRY",
    amount: 305_000,
    status: "BALANCE_CHECK_PASSED",
    tier: "T1",
    fallbackFrom: "NDD",
    attemptedAt: "2026-08-06T08:40:00Z",
    costNaira: 3.0,
  },
  {
    id: "ep_003",
    reference: "EASY-1355",
    loanId: "LN-2024-1355",
    borrowerName: "Aisha Mohammed",
    phone: "+234 706 552 9910",
    operation: "FUND_TRANSFER",
    amount: 530_000,
    status: "DEBIT_INITIATED",
    tier: "T2",
    fallbackFrom: "REMITA",
    attemptedAt: "2026-08-06T08:05:00Z",
    costNaira: 3.75,
  },
  {
    id: "ep_004",
    reference: "EASY-1302",
    loanId: "LN-2024-1302",
    borrowerName: "Ngozi Adeyemi",
    phone: "+234 802 118 4402",
    operation: "FUND_TRANSFER",
    amount: 1_240_000,
    // Breaker is open on EasyPay, so this attempt is held rather than sent.
    status: "CIRCUIT_BREAKER_ACTIVE",
    tier: "T3",
    fallbackFrom: "NDD",
    attemptedAt: "2026-08-06T07:50:00Z",
    costNaira: 0,
  },
  {
    id: "ep_005",
    reference: "EASY-1247",
    loanId: "LN-2024-1247",
    borrowerName: "Adewale Johnson",
    phone: "+234 803 456 7890",
    operation: "NAME_ENQUIRY",
    amount: 487_500,
    status: "SUCCESS",
    tier: "T2",
    fallbackFrom: "NDD",
    attemptedAt: "2026-08-06T07:20:00Z",
    costNaira: 2.0,
  },
  {
    id: "ep_006",
    reference: "EASY-28560",
    loanId: "LN-28560",
    borrowerName: "Halima Sule",
    phone: "+234 703 909 4411",
    operation: "STATUS_QUERY",
    amount: 1_660_000,
    status: "AWAITING_RETRY_POLICY",
    tier: "LGL",
    fallbackFrom: "REMITA",
    attemptedAt: "2026-08-06T06:45:00Z",
    costNaira: 0,
  },
  {
    id: "ep_007",
    reference: "EASY-1401",
    loanId: "LN-2024-1401",
    borrowerName: "Chidinma Obi",
    phone: "+234 805 223 7788",
    operation: "STATUS_QUERY",
    amount: 2_100_000,
    status: "PENDING_EXECUTION",
    tier: "T2",
    fallbackFrom: "NDD",
    attemptedAt: "2026-08-06T06:10:00Z",
    costNaira: 0,
  },
  {
    id: "ep_008",
    reference: "EASY-28611",
    loanId: "LN-28611",
    borrowerName: "Segun Adebayo",
    phone: "+234 807 664 1290",
    operation: "FUND_TRANSFER",
    amount: 940_000,
    status: "FAILED",
    tier: "T1",
    fallbackFrom: "NDD",
    attemptedAt: "2026-08-05T18:30:00Z",
    costNaira: 3.75,
  },
]

/* ------------------------------------------------------------------ */
/* Collections queue                                                   */
/* ------------------------------------------------------------------ */

export type CollectionsStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "ESCALATED_TO_LEGAL"

export const COLLECTIONS_STATUS_LABEL: Record<CollectionsStatus, string> = {
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  ESCALATED_TO_LEGAL: "Escalated to Legal",
}

export interface CollectionsCase {
  id: string
  reference: string
  loanId: string
  borrowerName: string
  phone: string
  outstanding: number
  dpd: number
  tier: EscalationTier
  agent: string
  status: CollectionsStatus
  /** Tier 3 unlocks payment-plan negotiation per the escalation logic. */
  paymentPlanOffered: boolean
  lastContactAt: string
  failedCycles: number
}

export const COLLECTIONS_CASES: CollectionsCase[] = [
  {
    id: "col_001",
    reference: "COL-1302",
    loanId: "LN-2024-1302",
    borrowerName: "Ngozi Adeyemi",
    phone: "+234 802 118 4402",
    outstanding: 1_240_000,
    dpd: 45,
    tier: "T3",
    agent: "Sarah Okonkwo",
    status: "IN_PROGRESS",
    paymentPlanOffered: true,
    lastContactAt: "2026-08-05T14:00:00Z",
    failedCycles: 3,
  },
  {
    id: "col_002",
    reference: "COL-1247",
    loanId: "LN-2024-1247",
    borrowerName: "Adewale Johnson",
    phone: "+234 803 456 7890",
    outstanding: 487_500,
    dpd: 40,
    tier: "T2",
    agent: "John Okeke",
    status: "ASSIGNED",
    paymentPlanOffered: false,
    lastContactAt: "2026-08-04T10:30:00Z",
    failedCycles: 2,
  },
  {
    id: "col_003",
    reference: "COL-1355",
    loanId: "LN-2024-1355",
    borrowerName: "Aisha Mohammed",
    phone: "+234 706 552 9910",
    outstanding: 530_000,
    dpd: 32,
    tier: "T3",
    agent: "Sarah Okonkwo",
    status: "IN_PROGRESS",
    paymentPlanOffered: true,
    lastContactAt: "2026-08-06T09:15:00Z",
    failedCycles: 3,
  },
  {
    id: "col_004",
    reference: "COL-28560",
    loanId: "LN-28560",
    borrowerName: "Halima Sule",
    phone: "+234 703 909 4411",
    outstanding: 1_660_000,
    dpd: 70,
    tier: "LGL",
    agent: "John Okeke",
    status: "ESCALATED_TO_LEGAL",
    paymentPlanOffered: true,
    lastContactAt: "2026-08-03T11:00:00Z",
    failedCycles: 4,
  },
  {
    id: "col_005",
    reference: "COL-28502",
    loanId: "LN-28502",
    borrowerName: "Tunde Bakare",
    phone: "+234 809 771 2233",
    outstanding: 305_000,
    dpd: 4,
    tier: "T1",
    agent: "Sarah Okonkwo",
    status: "ASSIGNED",
    paymentPlanOffered: false,
    lastContactAt: "2026-08-06T08:00:00Z",
    failedCycles: 1,
  },
  {
    id: "col_006",
    reference: "COL-28611",
    loanId: "LN-28611",
    borrowerName: "Segun Adebayo",
    phone: "+234 807 664 1290",
    outstanding: 0,
    dpd: 0,
    tier: "T1",
    agent: "John Okeke",
    status: "RESOLVED",
    paymentPlanOffered: false,
    lastContactAt: "2026-08-01T16:20:00Z",
    failedCycles: 1,
  },
]

/* ------------------------------------------------------------------ */
/* Legal review queue                                                  */
/* ------------------------------------------------------------------ */

export type LegalStatus =
  | "PENDING_REVIEW"
  | "ASSIGNED"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "CLOSED"

export const LEGAL_STATUS_LABEL: Record<LegalStatus, string> = {
  PENDING_REVIEW: "Pending Review",
  ASSIGNED: "Assigned",
  UNDER_REVIEW: "Under Review",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
}

export interface LegalCase {
  id: string
  caseRef: string
  loanId: string
  borrowerName: string
  outstanding: number
  dpd: number
  counsel: string
  status: LegalStatus
  escalatedAt: string
  /** Maker-checker: legal escalation requires a second authoriser. */
  approvedBy: string | null
  reasonCode: string
}

export const LEGAL_CASES: LegalCase[] = [
  {
    id: "lgl_001",
    caseRef: "127OJHGAK",
    loanId: "LN-28560",
    borrowerName: "Halima Sule",
    outstanding: 1_660_000,
    dpd: 70,
    counsel: "Sarah Okonkwo",
    status: "UNDER_REVIEW",
    escalatedAt: "2026-08-04T12:00:00Z",
    approvedBy: "Adaora Nwosu",
    reasonCode: "TIER_4_DELINQUENT",
  },
  {
    id: "lgl_002",
    caseRef: "884PLMWQZ",
    loanId: "LN-2024-1302",
    borrowerName: "Ngozi Adeyemi",
    outstanding: 1_240_000,
    dpd: 45,
    counsel: "John Okeke",
    status: "PENDING_REVIEW",
    escalatedAt: "2026-08-06T07:30:00Z",
    approvedBy: null,
    reasonCode: "RECOVERY_EXHAUSTED",
  },
  {
    id: "lgl_003",
    caseRef: "310KDNRTY",
    loanId: "LN-2024-1188",
    borrowerName: "Musa Danjuma",
    outstanding: 3_400_000,
    dpd: 96,
    counsel: "Sarah Okonkwo",
    status: "ASSIGNED",
    escalatedAt: "2026-07-28T09:00:00Z",
    approvedBy: "Adaora Nwosu",
    reasonCode: "TIER_4_DELINQUENT",
  },
  {
    id: "lgl_004",
    caseRef: "552WRTGHB",
    loanId: "LN-2024-0991",
    borrowerName: "Grace Uche",
    outstanding: 780_000,
    dpd: 120,
    counsel: "John Okeke",
    status: "RESOLVED",
    escalatedAt: "2026-06-12T09:00:00Z",
    approvedBy: "Adaora Nwosu",
    reasonCode: "WRITE_OFF_RECOMMENDED",
  },
  {
    id: "lgl_005",
    caseRef: "778ZXCVBN",
    loanId: "LN-2024-0874",
    borrowerName: "Peter Aigbe",
    outstanding: 0,
    dpd: 0,
    counsel: "Sarah Okonkwo",
    status: "CLOSED",
    escalatedAt: "2026-05-02T09:00:00Z",
    approvedBy: "Adaora Nwosu",
    reasonCode: "SETTLED_IN_FULL",
  },
]
