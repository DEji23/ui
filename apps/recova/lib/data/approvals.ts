/** Maker-checker queue — held here until a second authoriser approves.
 *  Exported separately from the Maker-Checker screen so the dashboard's
 *  "Pending Approval" stat can count the same underlying queue. */
export interface PendingApproval {
  id: string
  action: string
  permission: string
  subject: string
  amount: number | null
  maker: string
  makerRole: string
  reasonCode: string
  requestedAt: string
}

export const PENDING_APPROVALS: PendingApproval[] = [
  {
    id: "mc_001",
    action: "Approve refund",
    permission: "refund.approve",
    subject: "DSP-2026-0031 · Chidinma Obi",
    amount: 2_100_000,
    maker: "Ibrahim Musa",
    makerRole: "Finance / Ops",
    reasonCode: "DUPLICATE_DEBIT",
    requestedAt: "2026-08-06T09:40:00Z",
  },
  {
    id: "mc_002",
    action: "Escalate to legal review",
    permission: "legal.escalate",
    subject: "LN-2024-1302 · Ngozi Adeyemi",
    amount: 1_240_000,
    maker: "Fatima Bello",
    makerRole: "Debt Recovery Officer",
    reasonCode: "RECOVERY_EXHAUSTED",
    requestedAt: "2026-08-06T07:30:00Z",
  },
  {
    id: "mc_003",
    action: "Force debit outside policy",
    permission: "recovery.override",
    subject: "LN-28471 · Emeka Okafor",
    amount: 487_500,
    maker: "Chidi Okeke",
    makerRole: "Debt Recovery Officer",
    reasonCode: "CUSTOMER_AUTHORISED_BY_PHONE",
    requestedAt: "2026-08-06T06:15:00Z",
  },
  {
    id: "mc_004",
    action: "Policy exception — retry cap",
    permission: "policy.configure",
    subject: "POL-RETRY-001",
    amount: null,
    maker: "Adaora Nwosu",
    makerRole: "Debt Recovery Manager",
    reasonCode: "MONTH_END_PUSH",
    requestedAt: "2026-08-05T16:00:00Z",
  },
]
