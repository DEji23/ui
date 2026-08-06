"use client"

import * as React from "react"
import { ArrowRight, HandCoins } from "lucide-react"

import { naira, relativeTime } from "@/lib/format"
import {
  COLLECTIONS_CASES,
  COLLECTIONS_STATUS_LABEL,
  type CollectionsCase,
  type CollectionsStatus,
} from "@/lib/data/workqueues"
import { can } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import { DEFAULT_POLICY } from "@/lib/domain/policy"
import { ESCALATION_TIER_LABEL } from "@/lib/domain/types"
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

const STATUS_TONE: Record<CollectionsStatus, Tone> = {
  ASSIGNED: "info",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  ESCALATED_TO_LEGAL: "purple",
}

const FILTERS: Array<{ value: string; label: string; states?: CollectionsStatus[] }> = [
  { value: "all", label: "All" },
  { value: "assigned", label: "Assigned", states: ["ASSIGNED"] },
  { value: "in-progress", label: "In Progress", states: ["IN_PROGRESS"] },
  { value: "resolved", label: "Resolved", states: ["RESOLVED"] },
  { value: "legal", label: "Escalated to Legal", states: ["ESCALATED_TO_LEGAL"] },
]

/**
 * Collections queue — Tier 3 of the escalation ladder.
 * Payment-plan negotiation only unlocks at the configured Collections
 * threshold, so the button is gated on the policy rather than hard-coded.
 */
export function CollectionsModule() {
  const [tab, setTab] = React.useState("all")
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<CollectionsCase | null>(null)

  const tabItems: TabItem[] = FILTERS.map((f) => ({
    value: f.value,
    label: f.label,
    count: f.states
      ? COLLECTIONS_CASES.filter((c) => f.states!.includes(c.status)).length
      : COLLECTIONS_CASES.length,
  }))

  const rows = React.useMemo(() => {
    const filter = FILTERS.find((f) => f.value === tab)
    const q = query.trim().toLowerCase()
    return COLLECTIONS_CASES.filter(
      (c) => !filter?.states || filter.states.includes(c.status)
    ).filter(
      (c) =>
        q === "" ||
        [c.borrowerName, c.loanId, c.reference, c.agent]
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
          placeholder="Search borrower, loan ID, agent…"
        />
        <Tabs items={tabItems} value={tab} onValueChange={setTab} className="mt-6" />

        {rows.length === 0 ? (
          <EmptyState
            title="No collections case found."
            description={`Cases arrive here automatically after ${DEFAULT_POLICY.escalation.cyclesToCollections} failed recovery cycles.`}
          />
        ) : (
          <Table className="mt-2">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Borrower</TableHead>
                <TableHead>Loan ID</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>DPD</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Failed Cycles</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Last Contact</TableHead>
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
                  <TableCell>
                    <p className="font-semibold text-ink">{c.borrowerName}</p>
                    <p className="text-xs text-subtle">{c.phone}</p>
                  </TableCell>
                  <TableCell className="text-subtle">{c.loanId}</TableCell>
                  <TableCell className="tabular font-semibold">
                    {naira(c.outstanding)}
                  </TableCell>
                  <TableCell
                    className={
                      c.dpd >= 40 ? "tabular font-semibold text-error-600" : "tabular"
                    }
                  >
                    {c.dpd}
                  </TableCell>
                  <TableCell className="text-subtle">{c.tier}</TableCell>
                  <TableCell className="tabular text-subtle">{c.failedCycles}</TableCell>
                  <TableCell className="font-semibold">{c.agent}</TableCell>
                  <TableCell className="text-subtle">
                    {relativeTime(c.lastContactAt)}
                  </TableCell>
                  <TableCell>
                    <Badge dot tone={STATUS_TONE[c.status]}>
                      {COLLECTIONS_STATUS_LABEL[c.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <CollectionsDetailSheet
        item={selected}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </>
  )
}

function CollectionsDetailSheet({
  item,
  open,
  onOpenChange,
}: {
  item: CollectionsCase | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!item) return null

  const mayAssign = can(CURRENT_USER.role, "collections.assign")
  const mayEscalate = can(CURRENT_USER.role, "legal.escalate")
  const planUnlocked = item.failedCycles >= DEFAULT_POLICY.escalation.cyclesToCollections

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title="Collections Case"
        description={`${item.reference} · ${item.borrowerName}`}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="soft"
              size="lg"
              className="sm:flex-1"
              disabled={!planUnlocked}
              title={
                planUnlocked
                  ? undefined
                  : `Payment plans unlock at ${DEFAULT_POLICY.escalation.cyclesToCollections} failed cycles.`
              }
            >
              <HandCoins />
              Offer Payment Plan
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="sm:flex-1"
              disabled={!mayEscalate || item.status === "ESCALATED_TO_LEGAL"}
              title={
                mayEscalate
                  ? undefined
                  : "Escalating to legal requires the legal.escalate permission."
              }
            >
              Escalate to Legal
              <ArrowRight />
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {item.tier === "LGL" ? (
            <Alert tone="error" title="Tier 4 — Delinquent">
              Four recovery cycles have failed. Legal has been notified and the loan is
              awaiting legal review.
            </Alert>
          ) : (
            <Alert tone="warning" title={ESCALATION_TIER_LABEL[item.tier]}>
              {item.failedCycles} failed recovery cycle
              {item.failedCycles === 1 ? "" : "s"} recorded. Legal escalation triggers
              at {DEFAULT_POLICY.escalation.cyclesToLegal}.
            </Alert>
          )}

          <DetailSection title="Borrower">
            <DetailRow label="Full Name">{item.borrowerName}</DetailRow>
            <DetailRow label="Phone Number">{item.phone}</DetailRow>
            <DetailRow label="Loan ID">{item.loanId}</DetailRow>
          </DetailSection>

          <DetailSection title="Case">
            <DetailRow label="Case Reference">{item.reference}</DetailRow>
            <DetailRow label="Outstanding">{naira(item.outstanding)}</DetailRow>
            <DetailRow label="Days Past Due">{item.dpd}</DetailRow>
            <DetailRow label="Escalation Tier">{item.tier}</DetailRow>
            <DetailRow label="Failed Cycles">{item.failedCycles}</DetailRow>
            <DetailRow label="Assigned Agent">{item.agent}</DetailRow>
            <DetailRow label="Payment Plan">
              {item.paymentPlanOffered ? "Offered" : "Not offered"}
            </DetailRow>
            <DetailRow label="Status">
              <Badge dot tone={STATUS_TONE[item.status]}>
                {COLLECTIONS_STATUS_LABEL[item.status]}
              </Badge>
            </DetailRow>
          </DetailSection>

          <DetailSection title="Assignment" divided={false}>
            <p className="text-xs text-body">
              Collections cases are allocated to agents on a load-balanced strategy.
              {mayAssign
                ? " You can reassign this case."
                : " Reassignment requires the collections.assign permission."}
            </p>
            <Button variant="outline" size="md" block disabled={!mayAssign}>
              Reassign Case
            </Button>
          </DetailSection>
        </div>
      </SheetContent>
    </Sheet>
  )
}
