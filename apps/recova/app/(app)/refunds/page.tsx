"use client"

import * as React from "react"
import { Banknote, Check, ShieldCheck, X } from "lucide-react"

import { naira, relativeTime, shortDate } from "@/lib/format"
import {
  REFUNDS,
  REFUND_STATUS_LABEL,
  REVERSALS,
  REVERSAL_REASON_LABEL,
  REVERSAL_RETRY_ELIGIBLE,
  type Refund,
  type RefundStatus,
} from "@/lib/data/risk"
import { can, requiresMakerChecker } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import { RAIL_LABEL } from "@/lib/domain/types"
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
import { StatCard } from "@/components/shared/stat-card"
import { ReasonDialog, ResultDialog } from "@/components/queues/action-dialogs"
import type { TaskAction } from "@/lib/domain/tasks"

type Tone = "neutral" | "success" | "warning" | "error" | "info" | "purple" | "brand"

const REFUND_TONE: Record<RefundStatus, Tone> = {
  REQUESTED: "neutral",
  PENDING_APPROVAL: "warning",
  APPROVED: "info",
  EXECUTED: "success",
  REJECTED: "error",
  FAILED: "error",
}

/** Approve-refund action, reusing the same reason-capture dialog as the action queues. */
const APPROVE_ACTION: TaskAction = {
  id: "approve_refund",
  label: "Approve Refund",
  permission: "refund.approve",
  requiresReason: true,
  tone: "primary",
}

/**
 * Refunds & reversals workbench.
 *
 * Refunds always reference the original transaction and require Finance
 * approval — the maker (who requested) can never also be the checker (who
 * approves), enforced below rather than assumed.
 */
export default function RefundsPage() {
  const [refunds, setRefunds] = React.useState<Refund[]>(REFUNDS)
  const [reasonTarget, setReasonTarget] = React.useState<Refund | null>(null)
  const [result, setResult] = React.useState<{ title: string; message: string } | null>(
    null
  )

  const mayApprove = can(CURRENT_USER.role, "refund.approve")
  const pending = refunds.filter((r) => r.status === "PENDING_APPROVAL")
  const executed = refunds.filter((r) => r.status === "EXECUTED")
  const totalExecuted = executed.reduce((s, r) => s + r.amount, 0)
  const pausedReversals = REVERSALS.filter((r) => r.recoveryPaused)

  function approve(refund: Refund, reasonCode: string) {
    setRefunds((prev) =>
      prev.map((r) =>
        r.id === refund.id
          ? { ...r, status: "APPROVED", approvedBy: CURRENT_USER.name }
          : r
      )
    )
    setResult({
      title: "Refund approved",
      message: `${refund.id} approved by ${CURRENT_USER.name} with reason ${reasonCode}. Execution against ${refund.rail === "EASY_PAY" ? "EasyPay" : RAIL_LABEL[refund.rail]} is now queued and will reference ${refund.originalTransactionId}.`,
    })
  }

  return (
    <>
      <PageHeader
        title="Refunds & Reversals"
        description="Refunds reference the original transaction and require Finance approval. Mandate and indemnity reversals pause retries automatically."
      />

      <div className="flex flex-col gap-6 px-8 pb-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Pending Approval"
            value={String(pending.length)}
            icon={ShieldCheck}
            tone="warning"
            caption="Awaiting a second authoriser"
          />
          <StatCard
            label="Executed This Month"
            value={naira(totalExecuted)}
            icon={Banknote}
            tone="success"
            caption={`${executed.length} refunds settled`}
          />
          <StatCard
            label="Reversals Received"
            value={String(REVERSALS.length)}
            icon={Banknote}
            tone="info"
            caption="Bank-initiated"
          />
          <StatCard
            label="Retries Paused"
            value={String(pausedReversals.length)}
            icon={ShieldCheck}
            tone="error"
            caption="Mandate or indemnity reversal"
          />
        </div>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Refunds</CardTitle>
              <CardDescription>
                Separation of duties: a maker can never approve their own request
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Refund</TableHead>
                  <TableHead>Loan</TableHead>
                  <TableHead>Original Transaction</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Decision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.map((refund) => {
                  const isMaker = refund.requestedBy === CURRENT_USER.name
                  const actionable = refund.status === "PENDING_APPROVAL"
                  return (
                    <TableRow key={refund.id}>
                      <TableCell className="whitespace-nowrap font-semibold text-ink">
                        {refund.id}
                        {refund.disputeId ? (
                          <p className="text-xs font-normal text-subtle">
                            {refund.disputeId}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-subtle">
                        {refund.loanId}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-subtle">
                        {refund.originalTransactionId}
                      </TableCell>
                      <TableCell className="tabular font-semibold">
                        {naira(refund.amount)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-subtle">
                        {refund.reasonCode}
                      </TableCell>
                      <TableCell className="text-subtle">{refund.requestedBy}</TableCell>
                      <TableCell className="text-subtle">
                        {relativeTime(refund.requestedAt)}
                      </TableCell>
                      <TableCell>
                        <Badge dot tone={REFUND_TONE[refund.status]}>
                          {REFUND_STATUS_LABEL[refund.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!actionable ? (
                          refund.approvedBy ? (
                            <span className="text-xs text-subtle">
                              {refund.status === "REJECTED" ? "Rejected" : "Approved"} by{" "}
                              {refund.approvedBy}
                            </span>
                          ) : (
                            "—"
                          )
                        ) : isMaker ? (
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
                                  : "Requires the refund.approve permission."
                              }
                              onClick={() => setReasonTarget(refund)}
                            >
                              <Check />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="dangerSoft"
                              disabled={!mayApprove}
                              onClick={() =>
                                setRefunds((prev) =>
                                  prev.map((r) =>
                                    r.id === refund.id
                                      ? {
                                          ...r,
                                          status: "REJECTED",
                                          approvedBy: CURRENT_USER.name,
                                        }
                                      : r
                                  )
                                )
                              }
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
            {requiresMakerChecker("refund.approve") ? (
              <p className="mt-4 text-xs text-subtle">
                Refund approval is a maker-checker action — this decision is written to
                the immutable audit log with actor, timestamp, reason code and prior
                state.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Bank-Initiated Reversals</CardTitle>
              <CardDescription>
                Retry eligibility is derived from the reversal reason, not assumed
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Reversal</TableHead>
                  <TableHead>Loan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Rail</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Ledger Entry</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Retry Eligible</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {REVERSALS.map((reversal) => {
                  const eligible = REVERSAL_RETRY_ELIGIBLE[reversal.reason]
                  return (
                    <TableRow key={reversal.id}>
                      <TableCell className="whitespace-nowrap font-semibold text-ink">
                        {reversal.id}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-subtle">
                        {reversal.loanId}
                      </TableCell>
                      <TableCell className="tabular font-semibold">
                        {naira(reversal.amount)}
                      </TableCell>
                      <TableCell className="text-subtle">
                        {RAIL_LABEL[reversal.rail]}
                      </TableCell>
                      <TableCell className="text-subtle">
                        {REVERSAL_REASON_LABEL[reversal.reason]}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-subtle">
                        {reversal.ledgerEntryId}
                      </TableCell>
                      <TableCell className="text-subtle">
                        {shortDate(reversal.receivedAt)}
                      </TableCell>
                      <TableCell>
                        <Badge dot tone={eligible ? "success" : "error"}>
                          {eligible ? "Eligible" : "Paused"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <Alert tone="warning" title="Mandate and indemnity reversals pause retries" className="mt-4">
              Recovery only resumes after a Finance/Ops operator reviews the claim —
              never automatically.
            </Alert>
          </CardContent>
        </Card>
      </div>

      <ReasonDialog
        open={reasonTarget !== null}
        onOpenChange={(o) => !o && setReasonTarget(null)}
        action={APPROVE_ACTION}
        category="refund"
        subject={reasonTarget?.id ?? ""}
        onConfirm={(reasonCode) => {
          if (reasonTarget) approve(reasonTarget, reasonCode)
          setReasonTarget(null)
        }}
      />
      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}
