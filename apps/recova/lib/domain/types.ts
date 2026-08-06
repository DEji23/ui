/**
 * Core domain vocabulary for the automated loan recovery platform.
 *
 * Every enum here is traceable to the VFD MFB PRD set:
 *  - "Automated Loan Repayment Tool — Overview and Objectives" (state model, rails)
 *  - "Recovery Orchestration Engine" (accounts, ranking, failure reasons)
 *  - "Mandate Orchestration Engine" (mandate + validation states)
 *  - "Ledger & Reconciliation System" (ledger entries, settlement)
 *  - "Dispute & Indemnity System" (dispute model)
 *  - "RBAC & Workflow Assignment" (roles, permissions, task states)
 */

/* ------------------------------------------------------------------ */
/* Rails                                                               */
/* ------------------------------------------------------------------ */

export const RAILS = ["NDD", "REMITA", "EASY_PAY"] as const
export type Rail = (typeof RAILS)[number]

export const RAIL_LABEL: Record<Rail, string> = {
  NDD: "NDD",
  REMITA: "Remita",
  EASY_PAY: "EasyPay",
}

/* ------------------------------------------------------------------ */
/* Loan recovery state machine                                         */
/* ------------------------------------------------------------------ */

export const RECOVERY_STATES = [
  "ACTIVE",
  "DUE",
  "OVERDUE",
  "IN_RECOVERY",
  "PARTIALLY_RECOVERED",
  "AT_RISK",
  "COLLECTIONS",
  "LEGAL_REVIEW",
  "DISPUTE_OPEN",
  "RECOVERY_FAILED",
  "CLOSED_PAID",
  "WRITE_OFF",
] as const
export type RecoveryState = (typeof RECOVERY_STATES)[number]

export const RECOVERY_STATE_LABEL: Record<RecoveryState, string> = {
  ACTIVE: "Active",
  DUE: "Due",
  OVERDUE: "Overdue",
  IN_RECOVERY: "In Recovery",
  PARTIALLY_RECOVERED: "Partial",
  AT_RISK: "At Risk",
  COLLECTIONS: "Collections",
  LEGAL_REVIEW: "Legal Review",
  DISPUTE_OPEN: "Dispute Open",
  RECOVERY_FAILED: "Failed",
  CLOSED_PAID: "Closed Paid",
  WRITE_OFF: "Write Off",
}

/** Escalation tiers from the PRD's "Escalation Logic (Mandatory)". */
export type EscalationTier = "T1" | "T2" | "T3" | "T4" | "LGL"

export const ESCALATION_TIER_LABEL: Record<EscalationTier, string> = {
  T1: "Tier 1 — Automated notice",
  T2: "Tier 2 — At risk",
  T3: "Tier 3 — Collections",
  T4: "Tier 4 — Delinquent",
  LGL: "Legal review",
}

/* ------------------------------------------------------------------ */
/* Consent (iGree)                                                     */
/* ------------------------------------------------------------------ */

export type ConsentStatus =
  | "PENDING"
  | "OTP_SENT"
  | "GRANTED"
  | "DECLINED"
  | "EXPIRED"
  | "REVOKED"
  | "VERIFICATION_FAILED"
  | "NO_LINKED_ACCOUNTS"

export const CONSENT_STATUS_LABEL: Record<ConsentStatus, string> = {
  PENDING: "Pending",
  OTP_SENT: "OTP Sent",
  GRANTED: "Granted",
  DECLINED: "Declined",
  EXPIRED: "Expired",
  REVOKED: "Revoked",
  VERIFICATION_FAILED: "Verification Failed",
  NO_LINKED_ACCOUNTS: "No Linked Accounts",
}

export interface ConsentRecord {
  id: string
  borrowerId: string
  borrowerName: string
  bvnMasked: string
  phone: string
  email: string
  status: ConsentStatus
  /** Consent artefact version — required for NDPA evidence. */
  version: string
  scope: string[]
  authChannel: "SMS_OTP" | "USSD" | "BANK_APP"
  grantedAt: string | null
  expiresAt: string | null
  linkedAccounts: LinkedAccount[]
  otpAttempts: number
  /** ₦50 consent-execution debit referenced in the onboarding flow. */
  executionFeeCharged: boolean
}

export interface LinkedAccount {
  accountNumber: string
  accountName: string
  bankCode: string
  bankName: string
  isPrimary: boolean
  mandateStatus: MandateStatus | "NONE"
  lastBalance: number | null
  inflowScore: number
  lastCreditAt: string | null
  riskScore: number
  blacklisted: boolean
}

/* ------------------------------------------------------------------ */
/* Mandates                                                            */
/* ------------------------------------------------------------------ */

export type MandateStatus =
  | "INITIATED"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "FAILED"
  | "REVOKED"
  | "EXPIRED"

export const MANDATE_STATUS_LABEL: Record<MandateStatus, string> = {
  INITIATED: "Initiated",
  PENDING_APPROVAL: "Pending Approval",
  ACTIVE: "Active",
  FAILED: "Failed",
  REVOKED: "Revoked",
  EXPIRED: "Expired",
}

/** Validation is a separate dimension from mandate status — see Mandate PRD §4. */
export type ValidationStatus =
  | "NOT_STARTED"
  | "USER_ACTION_REQUIRED"
  | "VALIDATED"
  | "FAILED"

export const VALIDATION_STATUS_LABEL: Record<ValidationStatus, string> = {
  NOT_STARTED: "Not Started",
  USER_ACTION_REQUIRED: "Awaiting Customer",
  VALIDATED: "Validated",
  FAILED: "Validation Failed",
}

export type MandateFailureReason =
  | "ACCOUNT_DORMANT"
  | "INVALID_ACCOUNT"
  | "NAME_MISMATCH"
  | "BANK_REJECTION"
  | "USER_ABANDONED"
  | "TIMEOUT"

export const MANDATE_FAILURE_LABEL: Record<MandateFailureReason, string> = {
  ACCOUNT_DORMANT: "Account dormant",
  INVALID_ACCOUNT: "Invalid account",
  NAME_MISMATCH: "Name mismatch",
  BANK_REJECTION: "Bank rejection",
  USER_ABANDONED: "Customer abandoned",
  TIMEOUT: "Timed out",
}

export interface Mandate {
  id: string
  reference: string
  customerId: string
  customerName: string
  accountNumber: string
  bankCode: string
  bankName: string
  provider: Rail
  externalReference: string
  status: MandateStatus
  validationStatus: ValidationStatus
  maxAmount: number
  startDate: string
  endDate: string
  lastCheckedAt: string
  failureReason: MandateFailureReason | null
  retryCount: number
  createdAt: string
}

/* ------------------------------------------------------------------ */
/* Recovery cases                                                      */
/* ------------------------------------------------------------------ */

export type FailureReason =
  | "INSUFFICIENT_FUNDS"
  | "NO_MANDATE"
  | "MANDATE_REVOKED"
  | "BANK_TIMEOUT"
  | "DO_NOT_HONOR"
  | "ACCOUNT_CLOSED"
  | "SYSTEM_ERROR"

export const FAILURE_REASON_LABEL: Record<FailureReason, string> = {
  INSUFFICIENT_FUNDS: "Insufficient funds",
  NO_MANDATE: "No active mandate",
  MANDATE_REVOKED: "Mandate revoked",
  BANK_TIMEOUT: "Bank timeout",
  DO_NOT_HONOR: "Do not honour",
  ACCOUNT_CLOSED: "Account closed",
  SYSTEM_ERROR: "System error",
}

export interface RecoveryAttempt {
  id: string
  attemptNo: number
  rail: Rail
  accountNumber: string
  amountRequested: number
  amountRecovered: number
  outcome: "SUCCESS" | "PARTIAL" | "FAILED"
  failureReason: FailureReason | null
  /** Enforced at the API layer to make every debit replay-safe. */
  idempotencyKey: string
  attemptedAt: string
}

export interface RecoveryCase {
  id: string
  reference: string
  loanId: string
  borrowerId: string
  borrowerName: string
  phone: string
  email: string
  originalAmount: number
  amountRecovered: number
  outstanding: number
  dueDate: string
  dpd: number
  state: RecoveryState
  tier: EscalationTier
  rail: Rail
  mandateReference: string | null
  linkedAccount: string
  assignedTo: string
  lastAction: string
  retryCount: number
  nextRetryAt: string | null
  attempts: RecoveryAttempt[]
  /** Set while a dispute is open — hard-blocks the retry scheduler. */
  recoveryPaused: boolean
  pauseReason: string | null
}

/* ------------------------------------------------------------------ */
/* Disputes                                                            */
/* ------------------------------------------------------------------ */

export type DisputeType = "UNAUTHORIZED" | "DUPLICATE" | "INCORRECT_AMOUNT"

export const DISPUTE_TYPE_LABEL: Record<DisputeType, string> = {
  UNAUTHORIZED: "Unauthorised debit",
  DUPLICATE: "Duplicate debit",
  INCORRECT_AMOUNT: "Incorrect amount",
}

export type DisputeStatus =
  | "OPEN"
  | "INVESTIGATING"
  | "AWAITING_EVIDENCE"
  | "UPHELD"
  | "REFUNDED"
  | "REJECTED"

export const DISPUTE_STATUS_LABEL: Record<DisputeStatus, string> = {
  OPEN: "Open",
  INVESTIGATING: "Investigating",
  AWAITING_EVIDENCE: "Awaiting Evidence",
  UPHELD: "Debit Upheld",
  REFUNDED: "Refunded",
  REJECTED: "Rejected",
}

export interface Dispute {
  id: string
  loanId: string
  transactionId: string
  borrowerName: string
  initiatedBy: "CUSTOMER" | "BANK"
  type: DisputeType
  status: DisputeStatus
  amount: number
  /** Auto-attached at creation time — Dispute PRD step 2. */
  evidence: DisputeEvidence
  slaDueAt: string
  createdAt: string
  isIndemnityClaim: boolean
}

export interface DisputeEvidence {
  consentLogged: boolean
  mandateDetails: boolean
  debitTrace: boolean
  notificationHistory: boolean
}

/* ------------------------------------------------------------------ */
/* Ledger, settlement and reconciliation                               */
/* ------------------------------------------------------------------ */

export type LedgerEntryType = "DEBIT" | "REVERSAL" | "REFUND"
export type LedgerStatus = "PENDING" | "PROVISIONAL" | "FINALIZED" | "REVERSED"

export interface LedgerEntry {
  id: string
  loanId: string
  transactionId: string
  type: LedgerEntryType
  status: LedgerStatus
  amount: number
  currency: "NGN"
  rail: Rail
  referenceEntryId: string | null
  createdAt: string
}

export type ReconciliationOutcome =
  | "MATCHED"
  | "MISSING_SETTLEMENT"
  | "MISSING_INTERNAL"
  | "DUPLICATE"
  | "REVERSED"

export const RECONCILIATION_LABEL: Record<ReconciliationOutcome, string> = {
  MATCHED: "Matched",
  MISSING_SETTLEMENT: "Awaiting Settlement",
  MISSING_INTERNAL: "Missing Internal",
  DUPLICATE: "Duplicate Debit",
  REVERSED: "Reversed",
}

export interface ReconciliationException {
  id: string
  transactionId: string
  loanId: string
  rail: Rail
  internalAmount: number | null
  bankAmount: number | null
  outcome: ReconciliationOutcome
  status: "OPEN" | "INVESTIGATING" | "RESOLVED"
  assignedTo: string
  detectedAt: string
}

/* ------------------------------------------------------------------ */
/* Workflow tasks                                                      */
/* ------------------------------------------------------------------ */

export type TaskState =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"

export interface WorkflowTask {
  id: string
  type: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  assignedTo: string | null
  status: TaskState
  dueTime: string
  subjectId: string
}

/* ------------------------------------------------------------------ */
/* Audit                                                               */
/* ------------------------------------------------------------------ */

export interface AuditEvent {
  id: string
  actor: string
  actorRole: string
  action: string
  subject: string
  category: "RECOVERY" | "MANDATE" | "DISPUTE" | "SYSTEM" | "FINANCE" | "ACCESS"
  reasonCode: string | null
  previousState: string | null
  newState: string | null
  at: string
}

/* ------------------------------------------------------------------ */
/* Rail health / incidents                                             */
/* ------------------------------------------------------------------ */

export interface RailHealth {
  rail: Rail
  successRate: number
  attempts: number
  avgLatencyMs: number
  /** Circuit breaker — pauses automated recovery on this rail. */
  circuitOpen: boolean
  trend: number
}

export interface Incident {
  id: string
  at: string
  severity: "INFO" | "WARN" | "CRITICAL"
  message: string
}
