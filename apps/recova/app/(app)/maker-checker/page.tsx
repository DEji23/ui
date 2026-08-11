"use client"

import * as React from "react"
import { Check, Pencil, ShieldCheck, X } from "lucide-react"

import { naira, relativeTime } from "@/lib/format"
import { MAKER_CHECKER_ACTIONS, can } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/shared/page-header"
import { ResultDialog } from "@/components/queues/action-dialogs"

interface ApprovalPolicy {
  id: string
  action: string
  permission: string
  thresholdNaira: number | null
  requiredApprovers: string[]
}

const APPROVAL_POLICIES: ApprovalPolicy[] = [
  {
    id: "ap_refund",
    action: "Refund approval",
    permission: "refund.approve",
    thresholdNaira: 50_000,
    requiredApprovers: ["Finance", "Admin"],
  },
  {
    id: "ap_legal",
    action: "Legal escalation",
    permission: "legal.escalate",
    thresholdNaira: null,
    requiredApprovers: ["DRM", "Legal"],
  },
  {
    id: "ap_override",
    action: "Force debit / recovery override",
    permission: "recovery.override",
    thresholdNaira: 100_000,
    requiredApprovers: ["DRM", "Admin"],
  },
  {
    id: "ap_policy",
    action: "Policy exception",
    permission: "policy.configure",
    thresholdNaira: null,
    requiredApprovers: ["Admin", "Super Admin"],
  },
  {
    id: "ap_dispute",
    action: "Dispute override",
    permission: "dispute.override",
    thresholdNaira: 25_000,
    requiredApprovers: ["Finance", "DRM"],
  },
]

/**
 * Maker-checker queue.
 * Sensitive actions are held here until a second authoriser approves, and a
 * maker can never approve their own request — the separation-of-duties rule
 * the RBAC PRD calls "critical for audit".
 */
interface PendingApproval {
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

const PENDING: PendingApproval[] = [
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

export default function MakerCheckerPage() {
  const [pending, setPending] = React.useState<PendingApproval[]>(PENDING)
  const [policies, setPolicies] = React.useState<ApprovalPolicy[]>(APPROVAL_POLICIES)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [draftThreshold, setDraftThreshold] = React.useState("")
  const [result, setResult] = React.useState<{ title: string; message: string } | null>(
    null
  )
  const mayConfigure = can(CURRENT_USER.role, "policy.configure")

  function startEdit(policy: ApprovalPolicy) {
    setEditingId(policy.id)
    setDraftThreshold(policy.thresholdNaira === null ? "" : String(policy.thresholdNaira))
  }

  function saveThreshold(policy: ApprovalPolicy) {
    const next = draftThreshold.trim() === "" ? null : Number(draftThreshold)
    setPolicies((prev) =>
      prev.map((p) => (p.id === policy.id ? { ...p, thresholdNaira: next } : p))
    )
    setEditingId(null)
    setResult({
      title: "Approval threshold updated",
      message: `${policy.action} now requires ${policy.requiredApprovers.join(" + ")} sign-off ${
        next === null ? "on every request" : `above ${naira(next)}`
      }. This change is itself written to the audit log as a maker-checker action.`,
    })
  }

  function decide(item: PendingApproval, decision: "APPROVED" | "REJECTED") {
    setPending((prev) => prev.filter((p) => p.id !== item.id))
    setResult({
      title: decision === "APPROVED" ? "Approved" : "Rejected",
      message:
        decision === "APPROVED"
          ? `${item.action} on ${item.subject} is countersigned by ${CURRENT_USER.name} and takes effect immediately. Written to the audit log with both the maker's and checker's identity.`
          : `${item.action} on ${item.subject} has been rejected by ${CURRENT_USER.name} and returned to ${item.maker} with the decision logged.`,
    })
  }

  return (
    <>
      <PageHeader
        title="Maker-Checker"
        description="Sensitive actions held for a second authoriser before they take effect."
      />

      <div className="flex flex-col gap-6 px-8 pb-12">
        <Alert tone="info" title="Separation of duties">
          No single user may initiate, approve and settle a financial action. A maker
          cannot approve their own request, and every decision is written to the audit
          log with actor, timestamp and reason code.
        </Alert>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>{pending.length} awaiting a checker</CardDescription>
            </div>
            <ShieldCheck className="size-5 text-brand" />
          </CardHeader>
          <CardContent className="p-0">
            {pending.length === 0 ? (
              <p className="py-8 text-center text-sm text-subtle">
                Nothing outstanding — every sensitive action has a second signature.
              </p>
            ) : (
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Action</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Maker</TableHead>
                  <TableHead>Reason Code</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Decision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((item) => {
                  // A checker needs the permission AND must not be the maker.
                  const isMaker = item.maker === CURRENT_USER.name
                  const mayApprove =
                    can(CURRENT_USER.role, item.permission as never) && !isMaker

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-semibold text-ink">{item.action}</p>
                        <p className="font-mono text-xs text-subtle">
                          {item.permission}
                        </p>
                      </TableCell>
                      <TableCell className="text-subtle">{item.subject}</TableCell>
                      <TableCell className="tabular font-semibold">
                        {item.amount === null ? "—" : naira(item.amount)}
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-ink">{item.maker}</p>
                        <p className="text-xs text-subtle">{item.makerRole}</p>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-subtle">
                        {item.reasonCode}
                      </TableCell>
                      <TableCell className="text-subtle">
                        {relativeTime(item.requestedAt)}
                      </TableCell>
                      <TableCell>
                        {isMaker ? (
                          <Badge tone="warning">YOUR REQUEST</Badge>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={!mayApprove}
                              title={
                                mayApprove
                                  ? undefined
                                  : `Requires the ${item.permission} permission.`
                              }
                              onClick={() => decide(item, "APPROVED")}
                            >
                              <Check />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="dangerSoft"
                              disabled={!mayApprove}
                              onClick={() => decide(item, "REJECTED")}
                            >
                              <X />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Approval Policies</CardTitle>
              <CardDescription>
                Naira threshold and required approvers per action — configured set backs the{" "}
                {MAKER_CHECKER_ACTIONS.length} permissions below, and changing a threshold is
                itself a maker-checker action
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-[820px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Action</TableHead>
                  <TableHead>Permission</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Required Approvers</TableHead>
                  <TableHead>Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-semibold text-ink">{policy.action}</TableCell>
                    <TableCell className="font-mono text-xs text-subtle">
                      {policy.permission}
                    </TableCell>
                    <TableCell className="tabular">
                      {editingId === policy.id ? (
                        <Input
                          type="number"
                          className="h-9 w-32"
                          placeholder="Always"
                          value={draftThreshold}
                          onChange={(e) => setDraftThreshold(e.target.value)}
                          autoFocus
                        />
                      ) : policy.thresholdNaira === null ? (
                        <span className="text-subtle">Every request</span>
                      ) : (
                        `Above ${naira(policy.thresholdNaira)}`
                      )}
                    </TableCell>
                    <TableCell className="flex flex-wrap gap-1.5">
                      {policy.requiredApprovers.map((a) => (
                        <Badge key={a} tone="brand">
                          {a}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      {editingId === policy.id ? (
                        <div className="flex gap-2">
                          <Button variant="primary" size="sm" onClick={() => saveThreshold(policy)}>
                            Save
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!mayConfigure}
                          title={mayConfigure ? undefined : "Requires the policy.configure permission."}
                          onClick={() => startEdit(policy)}
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}
