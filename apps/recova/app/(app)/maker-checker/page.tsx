"use client"

import * as React from "react"
import { Check, ShieldCheck, X } from "lucide-react"

import { naira, relativeTime } from "@/lib/format"
import { MAKER_CHECKER_ACTIONS, can } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  const [result, setResult] = React.useState<{ title: string; message: string } | null>(
    null
  )

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
              <CardTitle>Actions Requiring Approval</CardTitle>
              <CardDescription>
                Configured set — changing it is itself a maker-checker action
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 p-0">
            {MAKER_CHECKER_ACTIONS.map((action) => (
              <Badge key={action} tone="brand" className="font-mono">
                {action}
              </Badge>
            ))}
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
