"use client"

import * as React from "react"
import { FileText, ShieldAlert } from "lucide-react"

import { naira, shortDate } from "@/lib/format"
import {
  LEGAL_CASES,
  LEGAL_STATUS_LABEL,
  type LegalCase,
  type LegalStatus,
} from "@/lib/data/workqueues"
import { can, requiresMakerChecker } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
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

type Tone = "neutral" | "success" | "warning" | "error" | "info" | "purple" | "brand"

const STATUS_TONE: Record<LegalStatus, Tone> = {
  PENDING_REVIEW: "warning",
  ASSIGNED: "info",
  UNDER_REVIEW: "purple",
  RESOLVED: "success",
  CLOSED: "neutral",
}

const FILTERS: Array<{ value: string; label: string; states?: LegalStatus[] }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending Review", states: ["PENDING_REVIEW"] },
  { value: "assigned", label: "Assigned", states: ["ASSIGNED"] },
  { value: "under-review", label: "Under Review", states: ["UNDER_REVIEW"] },
  { value: "resolved", label: "Resolved", states: ["RESOLVED"] },
  { value: "closed", label: "Closed", states: ["CLOSED"] },
]

/**
 * Legal review queue.
 * Write-off is the most consequential action in the platform, so it is gated
 * twice: on the recovery.override permission and on maker-checker approval.
 */
export function LegalModule() {
  const [tab, setTab] = React.useState("all")
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<LegalCase | null>(null)

  const tabItems: TabItem[] = FILTERS.map((f) => ({
    value: f.value,
    label: f.label,
    count: f.states
      ? LEGAL_CASES.filter((c) => f.states!.includes(c.status)).length
      : LEGAL_CASES.length,
  }))

  const rows = React.useMemo(() => {
    const filter = FILTERS.find((f) => f.value === tab)
    const q = query.trim().toLowerCase()
    return LEGAL_CASES.filter(
      (c) => !filter?.states || filter.states.includes(c.status)
    ).filter(
      (c) =>
        q === "" ||
        [c.borrowerName, c.loanId, c.caseRef, c.counsel]
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
          placeholder="Search borrower, case reference, counsel…"
        />
        <Tabs items={tabItems} value={tab} onValueChange={setTab} className="mt-6" />

        {rows.length === 0 ? (
          <EmptyState
            title="No legal case found."
            description="Loans reach legal review after the fourth failed recovery cycle, or by manager escalation."
          />
        ) : (
          <Table className="mt-2">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Borrower</TableHead>
                <TableHead>Case Ref</TableHead>
                <TableHead>Loan ID</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>DPD</TableHead>
                <TableHead>Counsel</TableHead>
                <TableHead>Escalated</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-semibold text-ink">
                    {c.borrowerName}
                  </TableCell>
                  <TableCell className="tabular text-subtle">{c.caseRef}</TableCell>
                  <TableCell className="text-subtle">{c.loanId}</TableCell>
                  <TableCell className="tabular font-semibold">
                    {naira(c.outstanding)}
                  </TableCell>
                  <TableCell className="tabular font-semibold text-error-600">
                    {c.dpd}
                  </TableCell>
                  <TableCell className="font-semibold">{c.counsel}</TableCell>
                  <TableCell className="text-subtle">
                    {shortDate(c.escalatedAt)}
                  </TableCell>
                  <TableCell className="text-subtle">
                    {c.approvedBy ?? (
                      <Badge tone="warning">AWAITING CHECKER</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge dot tone={STATUS_TONE[c.status]}>
                      {LEGAL_STATUS_LABEL[c.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <LegalDetailSheet
        item={selected}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </>
  )
}

function LegalDetailSheet({
  item,
  open,
  onOpenChange,
}: {
  item: LegalCase | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!item) return null

  const mayWriteOff = can(CURRENT_USER.role, "recovery.override")
  const needsChecker = requiresMakerChecker("recovery.override")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title="Legal Review"
        description={`${item.caseRef} · ${item.borrowerName}`}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="soft" size="lg" className="sm:flex-1">
              <FileText />
              Export Case Bundle
            </Button>
            <Button
              variant="danger"
              size="lg"
              className="sm:flex-1"
              disabled={!mayWriteOff}
              title={
                mayWriteOff
                  ? needsChecker
                    ? "Requires a second authoriser before it takes effect."
                    : undefined
                  : "Write-off requires the recovery.override permission."
              }
            >
              <ShieldAlert />
              Recommend Write Off
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Alert tone="warning" title="Automated recovery suspended">
            No debit attempts run while a loan sits in LEGAL_REVIEW. Manual recovery
            handling applies until legal returns the case or it is written off.
          </Alert>

          {item.approvedBy === null ? (
            <Alert tone="error" title="Maker-checker approval outstanding">
              This escalation was raised but has not been countersigned. It stays in
              Pending Review until a second authoriser approves it.
            </Alert>
          ) : null}

          <DetailSection title="Case">
            <DetailRow label="Case Reference">{item.caseRef}</DetailRow>
            <DetailRow label="Loan ID">{item.loanId}</DetailRow>
            <DetailRow label="Borrower">{item.borrowerName}</DetailRow>
            <DetailRow label="Outstanding">{naira(item.outstanding)}</DetailRow>
            <DetailRow label="Days Past Due">{item.dpd}</DetailRow>
            <DetailRow label="Status">
              <Badge dot tone={STATUS_TONE[item.status]}>
                {LEGAL_STATUS_LABEL[item.status]}
              </Badge>
            </DetailRow>
          </DetailSection>

          <DetailSection title="Escalation Audit" divided={false}>
            <DetailRow label="Assigned Counsel">{item.counsel}</DetailRow>
            <DetailRow label="Escalated At">{shortDate(item.escalatedAt)}</DetailRow>
            <DetailRow label="Reason Code">{item.reasonCode}</DetailRow>
            <DetailRow label="Approved By">{item.approvedBy ?? "Pending"}</DetailRow>
            <p className="text-xs text-subtle">
              Every material override is logged with actor, timestamp, reason code and
              the previous and new state, and the log is immutable and exportable.
            </p>
          </DetailSection>
        </div>
      </SheetContent>
    </Sheet>
  )
}
