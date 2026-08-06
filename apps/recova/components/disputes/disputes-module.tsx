"use client"

import * as React from "react"
import { Check, CircleSlash, Undo2 } from "lucide-react"

import { naira, relativeTime, shortDate } from "@/lib/format"
import { DISPUTES } from "@/lib/data/operations"
import { can, requiresMakerChecker } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import {
  DISPUTE_TYPE_LABEL,
  type Dispute,
  type DisputeStatus,
} from "@/lib/domain/types"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, type TabItem } from "@/components/ui/tabs"
import { Sheet, SheetContent, DetailRow, DetailSection } from "@/components/ui/sheet"
import { EmptyState } from "@/components/shared/empty-state"
import { QueueToolbar } from "@/components/shared/queue-toolbar"
import { DisputeStatusPill } from "@/components/shared/status-pill"

const FILTERS: Array<{ value: string; label: string; states?: DisputeStatus[] }> = [
  { value: "all", label: "All" },
  { value: "open", label: "Open", states: ["OPEN"] },
  { value: "review", label: "Under Review", states: ["INVESTIGATING", "AWAITING_EVIDENCE"] },
  { value: "resolved", label: "Resolved", states: ["UPHELD", "REFUNDED"] },
  { value: "rejected", label: "Rejected", states: ["REJECTED"] },
]

const EVIDENCE_LABELS: Array<[keyof Dispute["evidence"], string]> = [
  ["consentLogged", "iGree consent record"],
  ["mandateDetails", "Mandate details"],
  ["debitTrace", "Debit attempt trace"],
  ["notificationHistory", "Notification history"],
]

/**
 * Dispute & indemnity workbench.
 *
 * Creating a dispute pauses recovery and auto-attaches evidence; this screen
 * shows whether that evidence is actually complete, because an incomplete
 * bundle is what turns a defensible debit into a regulatory finding.
 */
export function DisputesModule() {
  const [tab, setTab] = React.useState("all")
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<Dispute | null>(null)

  const tabItems: TabItem[] = FILTERS.map((f) => ({
    value: f.value,
    label: f.label,
    count: f.states
      ? DISPUTES.filter((d) => f.states!.includes(d.status)).length
      : DISPUTES.length,
  }))

  const rows = React.useMemo(() => {
    const filter = FILTERS.find((f) => f.value === tab)
    const q = query.trim().toLowerCase()
    return DISPUTES.filter((d) => !filter?.states || filter.states.includes(d.status)).filter(
      (d) =>
        q === "" ||
        [d.id, d.loanId, d.borrowerName, d.transactionId]
          .join(" ")
          .toLowerCase()
          .includes(q)
    )
  }, [tab, query])

  return (
    <>
      <Card className="p-6">
        <QueueToolbar
          value={query}
          onValueChange={setQuery}
          placeholder="Search dispute ID, borrower, transaction…"
        />
        <Tabs items={tabItems} value={tab} onValueChange={setTab} className="mt-6" />

        {rows.length === 0 ? (
          <EmptyState
            title="No dispute found."
            description="Disputes pause recovery immediately and move the loan into DISPUTE_OPEN."
          />
        ) : (
          <Table className="mt-2">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Dispute ID</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Loan ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Raised By</TableHead>
                <TableHead>Evidence</TableHead>
                <TableHead>SLA Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((d) => {
                const complete = Object.values(d.evidence).filter(Boolean).length
                return (
                  <TableRow
                    key={d.id}
                    onClick={() => setSelected(d)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-semibold text-ink">
                      {d.id}
                      {d.isIndemnityClaim ? (
                        <Badge tone="purple" className="ml-2">
                          INDEMNITY
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="font-semibold">{d.borrowerName}</TableCell>
                    <TableCell className="text-subtle">{d.loanId}</TableCell>
                    <TableCell className="text-subtle">
                      {DISPUTE_TYPE_LABEL[d.type]}
                    </TableCell>
                    <TableCell className="tabular font-semibold">
                      {naira(d.amount)}
                    </TableCell>
                    <TableCell className="text-subtle">
                      {d.initiatedBy === "BANK" ? "Bank" : "Customer"}
                    </TableCell>
                    <TableCell>
                      <Badge tone={complete === 4 ? "success" : "warning"}>
                        {complete}/4
                      </Badge>
                    </TableCell>
                    <TableCell className="text-subtle">
                      {relativeTime(d.slaDueAt)}
                    </TableCell>
                    <TableCell>
                      <DisputeStatusPill status={d.status} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <DisputeDetailSheet
        dispute={selected}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </>
  )
}

function DisputeDetailSheet({
  dispute,
  open,
  onOpenChange,
}: {
  dispute: Dispute | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!dispute) return null

  const mayResolve = can(CURRENT_USER.role, "dispute.resolve")
  const mayRefund = can(CURRENT_USER.role, "refund.approve")
  const evidenceComplete = Object.values(dispute.evidence).every(Boolean)
  const active = dispute.status === "OPEN" || dispute.status === "INVESTIGATING" ||
    dispute.status === "AWAITING_EVIDENCE"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title="Dispute Case"
        description={`${dispute.id} · ${dispute.borrowerName}`}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="soft"
              size="lg"
              className="sm:flex-1"
              disabled={!mayRefund || !active}
              title={
                mayRefund
                  ? undefined
                  : "Refund approval is a Finance permission — separation of duties."
              }
            >
              <Undo2 />
              Approve Refund
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="sm:flex-1"
              disabled={!mayResolve || !active}
            >
              <CircleSlash />
              Reject
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="sm:flex-1"
              disabled={!mayResolve || !active || !evidenceComplete}
              title={
                evidenceComplete
                  ? undefined
                  : "Evidence bundle is incomplete — resolve only on a full record."
              }
            >
              <Check />
              Uphold Debit
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {active ? (
            <Alert tone="warning" title="Recovery paused">
              Retries are suspended for {dispute.loanId} while this dispute is open.
              The loan sits in DISPUTE_OPEN and no scheduler, engine or manual replay
              can debit it.
            </Alert>
          ) : null}

          {dispute.isIndemnityClaim ? (
            <Alert tone="error" title="NDD indemnity claim">
              The bank is reclaiming funds under the Direct Debit scheme. The
              transaction is marked AT_RISK and this case is prioritised.
            </Alert>
          ) : null}

          {!evidenceComplete && active ? (
            <Alert tone="error" title="Evidence bundle incomplete">
              One or more evidence artefacts failed to attach. Upholding the debit is
              blocked until the record is complete.
            </Alert>
          ) : null}

          <DetailSection title="Dispute">
            <DetailRow label="Dispute ID">{dispute.id}</DetailRow>
            <DetailRow label="Loan ID">{dispute.loanId}</DetailRow>
            <DetailRow label="Transaction">{dispute.transactionId}</DetailRow>
            <DetailRow label="Type">{DISPUTE_TYPE_LABEL[dispute.type]}</DetailRow>
            <DetailRow label="Amount">{naira(dispute.amount)}</DetailRow>
            <DetailRow label="Initiated By">
              {dispute.initiatedBy === "BANK" ? "Bank" : "Customer"}
            </DetailRow>
            <DetailRow label="Raised">{shortDate(dispute.createdAt)}</DetailRow>
            <DetailRow label="SLA Due">{shortDate(dispute.slaDueAt)}</DetailRow>
            <DetailRow label="Status">
              <DisputeStatusPill status={dispute.status} />
            </DetailRow>
          </DetailSection>

          <DetailSection title="Auto-attached Evidence" divided={false}>
            <div className="flex flex-col gap-2">
              {EVIDENCE_LABELS.map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-nav)] bg-surface p-3"
                >
                  <span className="text-xs font-medium text-ink">{label}</span>
                  <Badge dot tone={dispute.evidence[key] ? "success" : "error"}>
                    {dispute.evidence[key] ? "Attached" : "Missing"}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-subtle">
              Refunds reference the original transaction and require Finance approval
              {requiresMakerChecker("refund.approve")
                ? ", with maker-checker countersignature."
                : "."}
            </p>
          </DetailSection>
        </div>
      </SheetContent>
    </Sheet>
  )
}
