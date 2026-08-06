import type { Rail } from "@/lib/domain/types"

/* ------------------------------------------------------------------ */
/* Refunds and reversals                                               */
/* ------------------------------------------------------------------ */

export type RefundStatus =
  | "REQUESTED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "EXECUTED"
  | "REJECTED"
  | "FAILED"

export const REFUND_STATUS_LABEL: Record<RefundStatus, string> = {
  REQUESTED: "Requested",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  EXECUTED: "Executed",
  REJECTED: "Rejected",
  FAILED: "Failed",
}

export interface Refund {
  id: string
  loanId: string
  borrowerName: string
  originalTransactionId: string
  amount: number
  rail: Rail
  reasonCode: string
  status: RefundStatus
  requestedBy: string
  approvedBy: string | null
  requestedAt: string
  executedAt: string | null
  disputeId: string | null
}

export const REFUNDS: Refund[] = [
  {
    id: "RFD-2026-0044",
    loanId: "LN-2024-1401",
    borrowerName: "Chidinma Obi",
    originalTransactionId: "TX-88213004",
    amount: 2_100_000,
    rail: "NDD",
    reasonCode: "DUPLICATE_DEBIT",
    status: "PENDING_APPROVAL",
    requestedBy: "Ibrahim Musa",
    approvedBy: null,
    requestedAt: "2026-08-06T09:40:00Z",
    disputeId: "DSP-2026-0031",
    executedAt: null,
  },
  {
    id: "RFD-2026-0039",
    loanId: "LN-28471",
    borrowerName: "Emeka Okafor",
    originalTransactionId: "TX-88201220",
    amount: 42_500,
    rail: "EASY_PAY",
    reasonCode: "DISPUTE_RESOLUTION",
    status: "EXECUTED",
    requestedBy: "Ibrahim Musa",
    approvedBy: "Adaora Nwosu",
    requestedAt: "2026-07-26T10:00:00Z",
    executedAt: "2026-07-27T14:00:00Z",
    disputeId: "DSP-2026-0022",
  },
  {
    id: "RFD-2026-0036",
    loanId: "LN-2024-1355",
    borrowerName: "Aisha Mohammed",
    originalTransactionId: "TX-88207001",
    amount: 1_500,
    rail: "EASY_PAY",
    reasonCode: "SETTLEMENT_MISMATCH",
    status: "APPROVED",
    requestedBy: "Ibrahim Musa",
    approvedBy: "Adaora Nwosu",
    requestedAt: "2026-07-31T09:00:00Z",
    executedAt: null,
    disputeId: null,
  },
  {
    id: "RFD-2026-0031",
    loanId: "LN-28560",
    borrowerName: "Halima Sule",
    originalTransactionId: "TX-88209100",
    amount: 120_000,
    rail: "NDD",
    reasonCode: "DUPLICATE_DEBIT",
    status: "REJECTED",
    requestedBy: "Fatima Bello",
    approvedBy: "Adaora Nwosu",
    requestedAt: "2026-07-22T11:00:00Z",
    executedAt: null,
    disputeId: "DSP-2026-0027",
  },
]

export type ReversalReason =
  | "INSUFFICIENT_FUNDS"
  | "TECHNICAL_FAILURE"
  | "MANDATE_CLAIM"
  | "INDEMNITY_CLAIM"

export const REVERSAL_REASON_LABEL: Record<ReversalReason, string> = {
  INSUFFICIENT_FUNDS: "Insufficient funds",
  TECHNICAL_FAILURE: "Technical failure",
  MANDATE_CLAIM: "Mandate claim",
  INDEMNITY_CLAIM: "Indemnity claim",
}

/**
 * Retry eligibility after a bank reversal.
 * The PRD is explicit: mandate and indemnity reversals must pause retries;
 * funding and technical reversals may resume.
 */
export const REVERSAL_RETRY_ELIGIBLE: Record<ReversalReason, boolean> = {
  INSUFFICIENT_FUNDS: true,
  TECHNICAL_FAILURE: true,
  MANDATE_CLAIM: false,
  INDEMNITY_CLAIM: false,
}

export interface Reversal {
  id: string
  loanId: string
  borrowerName: string
  originalTransactionId: string
  amount: number
  rail: Rail
  reason: ReversalReason
  receivedAt: string
  ledgerEntryId: string
  recoveryPaused: boolean
}

export const REVERSALS: Reversal[] = [
  {
    id: "REV-88213004",
    loanId: "LN-2024-1401",
    borrowerName: "Chidinma Obi",
    originalTransactionId: "TX-88213004",
    amount: 2_100_000,
    rail: "NDD",
    reason: "INDEMNITY_CLAIM",
    receivedAt: "2026-08-04T11:00:00Z",
    ledgerEntryId: "led_003",
    recoveryPaused: true,
  },
  {
    id: "REV-88209100",
    loanId: "LN-28560",
    borrowerName: "Halima Sule",
    originalTransactionId: "TX-88209100",
    amount: 120_000,
    rail: "NDD",
    reason: "MANDATE_CLAIM",
    receivedAt: "2026-08-01T09:30:00Z",
    ledgerEntryId: "led_006",
    recoveryPaused: true,
  },
  {
    id: "REV-88205511",
    loanId: "LN-28502",
    borrowerName: "Tunde Bakare",
    originalTransactionId: "TX-88205511",
    amount: 305_000,
    rail: "REMITA",
    reason: "TECHNICAL_FAILURE",
    receivedAt: "2026-07-29T16:20:00Z",
    ledgerEntryId: "led_007",
    recoveryPaused: false,
  },
]

/* ------------------------------------------------------------------ */
/* Account risk controls                                               */
/* ------------------------------------------------------------------ */

export interface RiskListedAccount {
  accountNumber: string
  bankName: string
  borrowerName: string
  listType: "BLACKLIST" | "WHITELIST"
  reason: string
  consecutiveFailures: number
  addedBy: string
  addedAt: string
  /** Suspended accounts auto-release; blacklisted ones need a human. */
  autoReleaseAt: string | null
}

export const RISK_LISTED_ACCOUNTS: RiskListedAccount[] = [
  {
    accountNumber: "0330561122",
    bankName: "UBA",
    borrowerName: "Ngozi Adeyemi",
    listType: "BLACKLIST",
    reason: "Three consecutive do-not-honour responses",
    consecutiveFailures: 3,
    addedBy: "System",
    addedAt: "2026-07-28T09:05:00Z",
    autoReleaseAt: null,
  },
  {
    accountNumber: "0110776655",
    bankName: "FirstBank",
    borrowerName: "Halima Sule",
    listType: "BLACKLIST",
    reason: "Account closed",
    consecutiveFailures: 1,
    addedBy: "System",
    addedAt: "2026-07-20T09:05:00Z",
    autoReleaseAt: null,
  },
  {
    accountNumber: "0447781200",
    bankName: "Access",
    borrowerName: "Adewale Johnson",
    listType: "BLACKLIST",
    reason: "Adaptive throttle — 3 failures within 24h",
    consecutiveFailures: 3,
    addedBy: "System",
    addedAt: "2026-08-05T14:00:00Z",
    // 48h suspension per the adaptive throttling rule.
    autoReleaseAt: "2026-08-07T14:00:00Z",
  },
  {
    accountNumber: "0580991122",
    bankName: "GTB",
    borrowerName: "Chidinma Obi",
    listType: "WHITELIST",
    reason: "High-value borrower — exempt from the low-balance skip rule",
    consecutiveFailures: 0,
    addedBy: "Adaora Nwosu",
    addedAt: "2026-07-02T10:00:00Z",
    autoReleaseAt: null,
  },
]

/* ------------------------------------------------------------------ */
/* Notification delivery log                                           */
/* ------------------------------------------------------------------ */

export type DeliveryStatus = "DELIVERED" | "SENT" | "FAILED" | "QUEUED"

export interface NotificationDelivery {
  id: string
  templateId: string
  event: string
  channel: "SMS" | "EMAIL" | "DASHBOARD"
  recipient: string
  recipientName: string
  loanId: string | null
  status: DeliveryStatus
  sentAt: string
  failureReason: string | null
}

export const NOTIFICATION_LOG: NotificationDelivery[] = [
  {
    id: "ntf_log_001",
    templateId: "ntf_debit_failed",
    event: "Debit failed — insufficient funds",
    channel: "SMS",
    recipient: "+234 803 456 7890",
    recipientName: "Adewale Johnson",
    loanId: "LN-2024-1247",
    status: "DELIVERED",
    sentAt: "2026-08-04T09:02:00Z",
    failureReason: null,
  },
  {
    id: "ntf_log_002",
    templateId: "ntf_dispute_ack",
    event: "Dispute acknowledgement",
    channel: "EMAIL",
    recipient: "chidinma.o@email.com",
    recipientName: "Chidinma Obi",
    loanId: "LN-2024-1401",
    status: "DELIVERED",
    sentAt: "2026-08-04T09:25:00Z",
    failureReason: null,
  },
  {
    id: "ntf_log_003",
    templateId: "ntf_at_risk",
    event: "Escalation — At Risk",
    channel: "SMS",
    recipient: "+234 802 118 4402",
    recipientName: "Ngozi Adeyemi",
    loanId: "LN-2024-1302",
    status: "FAILED",
    sentAt: "2026-08-05T08:00:00Z",
    failureReason: "Number unreachable — DND active",
  },
  {
    id: "ntf_log_004",
    templateId: "ntf_mandate_created",
    event: "Mandate setup required",
    channel: "SMS",
    recipient: "+234 809 771 2233",
    recipientName: "Tunde Bakare",
    loanId: "LN-28502",
    status: "DELIVERED",
    sentAt: "2026-08-05T12:00:00Z",
    failureReason: null,
  },
  {
    id: "ntf_log_005",
    templateId: "ntf_collections",
    event: "Escalation — Collections",
    channel: "EMAIL",
    recipient: "ngozi.a@email.com",
    recipientName: "Ngozi Adeyemi",
    loanId: "LN-2024-1302",
    status: "SENT",
    sentAt: "2026-08-05T14:10:00Z",
    failureReason: null,
  },
  {
    id: "ntf_log_006",
    templateId: "ntf_partial",
    event: "Partial debit successful",
    channel: "SMS",
    recipient: "+234 706 552 9910",
    recipientName: "Aisha Mohammed",
    loanId: "LN-2024-1355",
    status: "DELIVERED",
    sentAt: "2026-08-03T10:05:00Z",
    failureReason: null,
  },
  {
    id: "ntf_log_007",
    templateId: "ntf_legal",
    event: "Escalation — Legal Review",
    channel: "SMS",
    recipient: "+234 703 909 4411",
    recipientName: "Halima Sule",
    loanId: "LN-28560",
    status: "QUEUED",
    sentAt: "2026-08-06T10:00:00Z",
    failureReason: null,
  },
  {
    id: "ntf_log_008",
    templateId: "ntf_debit_success",
    event: "Debit successful",
    channel: "EMAIL",
    recipient: "segun.a@email.com",
    recipientName: "Segun Adebayo",
    loanId: "LN-28611",
    status: "DELIVERED",
    sentAt: "2026-08-01T09:05:00Z",
    failureReason: null,
  },
]
