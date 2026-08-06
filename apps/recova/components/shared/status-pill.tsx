import { Badge } from "@/components/ui/badge"
import {
  CONSENT_STATUS_LABEL,
  DISPUTE_STATUS_LABEL,
  MANDATE_STATUS_LABEL,
  RAIL_LABEL,
  RECONCILIATION_LABEL,
  RECOVERY_STATE_LABEL,
  VALIDATION_STATUS_LABEL,
  type ConsentStatus,
  type DisputeStatus,
  type MandateStatus,
  type Rail,
  type ReconciliationOutcome,
  type RecoveryState,
  type ValidationStatus,
} from "@/lib/domain/types"

type Tone = "neutral" | "success" | "warning" | "error" | "info" | "purple" | "brand"

const RECOVERY_TONE: Record<RecoveryState, Tone> = {
  ACTIVE: "neutral",
  DUE: "warning",
  OVERDUE: "warning",
  IN_RECOVERY: "info",
  PARTIALLY_RECOVERED: "warning",
  AT_RISK: "error",
  COLLECTIONS: "error",
  LEGAL_REVIEW: "purple",
  DISPUTE_OPEN: "purple",
  RECOVERY_FAILED: "error",
  CLOSED_PAID: "success",
  WRITE_OFF: "neutral",
}

export function RecoveryStatePill({ state }: { state: RecoveryState }) {
  return (
    <Badge dot tone={RECOVERY_TONE[state]}>
      {RECOVERY_STATE_LABEL[state]}
    </Badge>
  )
}

const MANDATE_TONE: Record<MandateStatus, Tone> = {
  INITIATED: "neutral",
  PENDING_APPROVAL: "warning",
  ACTIVE: "success",
  FAILED: "error",
  REVOKED: "error",
  EXPIRED: "neutral",
}

export function MandateStatusPill({ status }: { status: MandateStatus }) {
  return (
    <Badge dot tone={MANDATE_TONE[status]}>
      {MANDATE_STATUS_LABEL[status]}
    </Badge>
  )
}

const VALIDATION_TONE: Record<ValidationStatus, Tone> = {
  NOT_STARTED: "neutral",
  USER_ACTION_REQUIRED: "warning",
  VALIDATED: "success",
  FAILED: "error",
}

export function ValidationStatusPill({ status }: { status: ValidationStatus }) {
  return (
    <Badge dot tone={VALIDATION_TONE[status]}>
      {VALIDATION_STATUS_LABEL[status]}
    </Badge>
  )
}

const CONSENT_TONE: Record<ConsentStatus, Tone> = {
  PENDING: "neutral",
  OTP_SENT: "info",
  GRANTED: "success",
  DECLINED: "error",
  EXPIRED: "neutral",
  REVOKED: "error",
  VERIFICATION_FAILED: "error",
  NO_LINKED_ACCOUNTS: "warning",
}

export function ConsentStatusPill({ status }: { status: ConsentStatus }) {
  return (
    <Badge dot tone={CONSENT_TONE[status]}>
      {CONSENT_STATUS_LABEL[status]}
    </Badge>
  )
}

const DISPUTE_TONE: Record<DisputeStatus, Tone> = {
  OPEN: "error",
  INVESTIGATING: "warning",
  AWAITING_EVIDENCE: "warning",
  UPHELD: "success",
  REFUNDED: "info",
  REJECTED: "neutral",
}

export function DisputeStatusPill({ status }: { status: DisputeStatus }) {
  return (
    <Badge dot tone={DISPUTE_TONE[status]}>
      {DISPUTE_STATUS_LABEL[status]}
    </Badge>
  )
}

const RECON_TONE: Record<ReconciliationOutcome, Tone> = {
  MATCHED: "success",
  MISSING_SETTLEMENT: "warning",
  MISSING_INTERNAL: "error",
  DUPLICATE: "error",
  REVERSED: "purple",
}

export function ReconciliationPill({
  outcome,
}: {
  outcome: ReconciliationOutcome
}) {
  return (
    <Badge dot tone={RECON_TONE[outcome]}>
      {RECONCILIATION_LABEL[outcome]}
    </Badge>
  )
}

/** Rail tag — Figma: NDD is #eaeefb/#2652cf, Remita purple, EasyPay pink. */
const RAIL_TONE: Record<Rail, Tone> = {
  NDD: "info",
  REMITA: "purple",
  EASY_PAY: "error",
}

export function RailBadge({ rail }: { rail: Rail }) {
  return (
    <Badge tone={RAIL_TONE[rail]} className="uppercase">
      {rail === "EASY_PAY" ? "EASY_PAY" : RAIL_LABEL[rail]}
    </Badge>
  )
}
