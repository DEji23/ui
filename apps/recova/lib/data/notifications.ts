/**
 * Notification templates.
 *
 * Copy is transcribed verbatim from the PRD's "SMS Notification Content" and
 * email sections — the wording is a consumer-protection artefact, not filler,
 * so it is stored as data rather than rewritten in components.
 */

export type NotificationChannel = "SMS" | "EMAIL" | "DASHBOARD"
export type NotificationAudience = "BORROWER" | "DRO" | "DRM" | "FINANCE" | "LEGAL"

export interface NotificationTemplate {
  id: string
  event: string
  trigger: string
  channels: NotificationChannel[]
  audience: NotificationAudience[]
  subject?: string
  body: string
  enabled: boolean
}

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: "ntf_consent_otp",
    event: "BVN verification initiated",
    trigger: "consent.otp_sent",
    channels: ["SMS"],
    audience: ["BORROWER"],
    body: "VBank: To proceed with your loan, please complete BVN verification. An OTP has been sent to you. Do not share this OTP with anyone.",
    enabled: true,
  },
  {
    id: "ntf_consent_declined",
    event: "Consent declined",
    trigger: "consent.declined",
    channels: ["SMS"],
    audience: ["BORROWER"],
    body: "VBank: We are unable to continue your loan application because BVN consent was not granted. Please retry or contact support for assistance.",
    enabled: true,
  },
  {
    id: "ntf_mandate_created",
    event: "Mandate setup required",
    trigger: "mandate.created",
    channels: ["SMS", "EMAIL"],
    audience: ["BORROWER"],
    subject: "Loan Repayment Mandate Setup",
    body: "VBank: A repayment mandate has been created for your loan. Please complete the ₦50 validation transfer to activate automatic repayments.",
    enabled: true,
  },
  {
    id: "ntf_mandate_approved",
    event: "Mandate approved",
    trigger: "mandate.approved",
    channels: ["SMS"],
    audience: ["BORROWER"],
    body: "VBank: Your loan repayment mandate has been successfully approved. Repayments will now be debited automatically as agreed.",
    enabled: true,
  },
  {
    id: "ntf_repayment_reminder",
    event: "Upcoming repayment reminder",
    trigger: "obligation.due_soon",
    channels: ["SMS"],
    audience: ["BORROWER"],
    body: "VBank: Reminder that your loan repayment is due today. Please ensure sufficient funds are available in your account.",
    enabled: true,
  },
  {
    id: "ntf_debit_success",
    event: "Debit successful",
    trigger: "recovery.success",
    channels: ["SMS", "EMAIL"],
    audience: ["BORROWER"],
    subject: "Loan Repayment Confirmation",
    body: "VBank: Your loan repayment of ₦{amount} has been successfully processed on {date}. Thank you.",
    enabled: true,
  },
  {
    id: "ntf_partial",
    event: "Partial debit successful",
    trigger: "recovery.partial",
    channels: ["SMS"],
    audience: ["BORROWER", "DRO"],
    body: "VBank: A partial loan repayment of ₦{amount} has been received. The remaining balance of ₦{balance} will be recovered subsequently.",
    enabled: true,
  },
  {
    id: "ntf_debit_failed",
    event: "Debit failed — insufficient funds",
    trigger: "recovery.failed",
    channels: ["SMS", "EMAIL"],
    audience: ["BORROWER", "DRO"],
    subject: "Loan Repayment Attempt Unsuccessful",
    body: "VBank: Your loan repayment attempt was unsuccessful due to insufficient funds. Another attempt will be made. Please fund your account.",
    enabled: true,
  },
  {
    id: "ntf_at_risk",
    event: "Escalation — At Risk",
    trigger: "escalation.tier_2",
    channels: ["SMS", "DASHBOARD"],
    audience: ["BORROWER", "DRM"],
    body: "VBank: Your loan repayment ₦{amount} is overdue. Please make payment immediately to avoid further recovery actions.",
    enabled: true,
  },
  {
    id: "ntf_collections",
    event: "Escalation — Collections",
    trigger: "escalation.tier_3",
    channels: ["SMS", "EMAIL", "DASHBOARD"],
    audience: ["BORROWER", "DRM"],
    subject: "Loan Escalated – Action Required",
    body: "VBank: Your loan has been escalated to collections due to repeated failed repayments. Please contact us urgently to resolve this.",
    enabled: true,
  },
  {
    id: "ntf_legal",
    event: "Escalation — Legal Review",
    trigger: "escalation.tier_4",
    channels: ["SMS", "EMAIL"],
    audience: ["BORROWER", "LEGAL"],
    body: "VBank: Your loan remains unpaid despite prior attempts. Your account has been escalated for formal review. Contact support immediately.",
    enabled: true,
  },
  {
    id: "ntf_dispute_ack",
    event: "Dispute acknowledgement",
    trigger: "dispute.created",
    channels: ["SMS", "EMAIL"],
    audience: ["BORROWER", "FINANCE"],
    subject: "Dispute Received – Loan Transaction",
    body: "VBank: We have received your dispute regarding a loan debit. Recovery attempts are paused while we review this. Reference ID: {DisputeID}.",
    enabled: true,
  },
  {
    id: "ntf_dispute_upheld",
    event: "Dispute resolved — debit upheld",
    trigger: "dispute.upheld",
    channels: ["SMS"],
    audience: ["BORROWER"],
    body: "VBank: Your dispute has been reviewed. The debit was valid and recovery will resume. Contact support if you have questions.",
    enabled: true,
  },
  {
    id: "ntf_dispute_refund",
    event: "Dispute resolved — refund processed",
    trigger: "dispute.refunded",
    channels: ["SMS", "EMAIL"],
    audience: ["BORROWER", "FINANCE"],
    subject: "Dispute Resolution Update",
    body: "VBank: Your dispute has been resolved. A refund of ₦{amount} has been processed to your account. Thank you for your patience.",
    enabled: true,
  },
]

export const WEBHOOK_EVENTS = [
  "recovery.success",
  "recovery.failed",
  "recovery.partial",
  "mandate.approved",
  "mandate.failed",
  "dispute.created",
  "dispute.resolved",
  "settlement.finalized",
  "reversal.received",
] as const
