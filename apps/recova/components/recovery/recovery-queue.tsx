"use client"

import * as React from "react"

import { naira } from "@/lib/format"
import { RECOVERY_CASES } from "@/lib/data/recovery-cases"
import type { RecoveryCase, RecoveryState } from "@/lib/domain/types"
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
import { EmptyState } from "@/components/shared/empty-state"
import { QueueToolbar } from "@/components/shared/queue-toolbar"
import { RailBadge, RecoveryStatePill } from "@/components/shared/status-pill"
import { RecoveryDetailSheet } from "./recovery-detail-sheet"

/** Tab filters mirror the Figma strip: All / Due / Overdue / In Recovery / … */
const FILTERS: Array<{ value: string; label: string; states?: RecoveryState[] }> = [
  { value: "all", label: "All" },
  { value: "due", label: "Due", states: ["DUE"] },
  { value: "overdue", label: "Overdue", states: ["OVERDUE"] },
  { value: "in-recovery", label: "In Recovery", states: ["IN_RECOVERY"] },
  { value: "partial", label: "Partial", states: ["PARTIALLY_RECOVERED"] },
  { value: "at-risk", label: "At Risk", states: ["AT_RISK"] },
  { value: "failed", label: "Failed", states: ["RECOVERY_FAILED", "COLLECTIONS"] },
  { value: "dispute", label: "Disputed", states: ["DISPUTE_OPEN"] },
]

export function RecoveryQueue({
  cases: initialCases = RECOVERY_CASES,
  emptyTitle = "No recovery case found.",
}: {
  cases?: RecoveryCase[]
  emptyTitle?: string
}) {
  const [cases, setCases] = React.useState<RecoveryCase[]>(initialCases)
  const [tab, setTab] = React.useState("all")
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<RecoveryCase | null>(null)

  function updateCase(updated: RecoveryCase) {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setSelected(updated)
  }

  const tabItems: TabItem[] = React.useMemo(
    () =>
      FILTERS.map((filter) => ({
        value: filter.value,
        label: filter.label,
        count: filter.states
          ? cases.filter((c) => filter.states!.includes(c.state)).length
          : cases.length,
      })),
    [cases]
  )

  const rows = React.useMemo(() => {
    const filter = FILTERS.find((f) => f.value === tab)
    const q = query.trim().toLowerCase()
    return cases
      .filter((c) => !filter?.states || filter.states.includes(c.state))
      .filter((c) =>
        q === ""
          ? true
          : [c.borrowerName, c.loanId, c.reference, c.assignedTo]
              .join(" ")
              .toLowerCase()
              .includes(q)
      )
  }, [cases, tab, query])

  return (
    <>
      <Card className="p-6">
        <QueueToolbar
          value={query}
          onValueChange={setQuery}
          placeholder="Search borrower, loan ID, officer…"
        />

        <Tabs items={tabItems} value={tab} onValueChange={setTab} className="mt-6" />

        {rows.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description="Adjust the filters above, or sync to pull the latest obligations from the loan service."
          />
        ) : (
          <Table className="mt-2">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Borrower</TableHead>
                <TableHead>Loan ID</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Days Past Due (DPD)</TableHead>
                <TableHead>Rail</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>DRO</TableHead>
                <TableHead>Last Action</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow
                  key={c.id}
                  onClick={() => setSelected(c)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setSelected(c)
                    }
                  }}
                  className="cursor-pointer focus:outline-none focus-visible:bg-surface"
                >
                  <TableCell className="whitespace-nowrap">
                    <p className="font-semibold text-ink">{c.borrowerName}</p>
                    <p className="text-xs text-subtle">{c.phone}</p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-subtle">
                    {c.loanId}
                  </TableCell>
                  <TableCell className="tabular font-semibold">
                    {naira(c.outstanding)}
                  </TableCell>
                  <TableCell
                    className={
                      c.dpd >= 30 ? "tabular font-semibold text-warning-600" : "tabular"
                    }
                  >
                    {c.dpd}
                  </TableCell>
                  <TableCell>
                    <RailBadge rail={c.rail} />
                  </TableCell>
                  <TableCell className="text-subtle">{c.tier}</TableCell>
                  <TableCell className="whitespace-nowrap font-semibold">
                    {c.assignedTo}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-subtle">
                    {c.lastAction}
                  </TableCell>
                  <TableCell>
                    <RecoveryStatePill state={c.state} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <RecoveryDetailSheet
        recoveryCase={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
        onUpdate={updateCase}
      />
    </>
  )
}
