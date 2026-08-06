"use client"

import * as React from "react"
import Link from "next/link"

import { naira, shortDate } from "@/lib/format"
import { LOANS, LOAN_REFERENCE_DATE, obligationsFor } from "@/lib/data/loans"
import { LOAN_STATE_LABEL, summarise, type LoanState } from "@/lib/domain/scheduler"
import { Badge } from "@/components/ui/badge"
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

type Tone = "neutral" | "success" | "warning" | "error" | "info" | "purple" | "brand"

const STATE_TONE: Record<LoanState, Tone> = {
  CREATED: "neutral",
  DISBURSED: "info",
  ACTIVE: "success",
  DUE: "warning",
  OVERDUE: "warning",
  IN_RECOVERY: "error",
  PARTIALLY_RECOVERED: "warning",
  CLOSED: "success",
  WRITE_OFF: "neutral",
}

const FILTERS: Array<{ value: string; label: string; states?: LoanState[] }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active", states: ["ACTIVE", "DISBURSED"] },
  { value: "overdue", label: "Overdue", states: ["OVERDUE", "DUE"] },
  { value: "recovery", label: "In Recovery", states: ["IN_RECOVERY", "PARTIALLY_RECOVERED"] },
  { value: "closed", label: "Closed", states: ["CLOSED", "WRITE_OFF"] },
]

/** Loan book — the entry point into the Customer 360 view. */
export function LoansTable() {
  const [tab, setTab] = React.useState("all")
  const [query, setQuery] = React.useState("")

  const enriched = React.useMemo(
    () =>
      LOANS.map((loan) => ({
        loan,
        summary: summarise(obligationsFor(loan.id), LOAN_REFERENCE_DATE),
      })),
    []
  )

  const tabItems: TabItem[] = FILTERS.map((f) => ({
    value: f.value,
    label: f.label,
    count: f.states
      ? enriched.filter((e) => f.states!.includes(e.loan.state)).length
      : enriched.length,
  }))

  const rows = React.useMemo(() => {
    const filter = FILTERS.find((f) => f.value === tab)
    const q = query.trim().toLowerCase()
    return enriched
      .filter((e) => !filter?.states || filter.states.includes(e.loan.state))
      .filter(
        (e) =>
          q === "" ||
          [e.loan.id, e.loan.customerName, e.loan.productName]
            .join(" ")
            .toLowerCase()
            .includes(q)
      )
  }, [enriched, tab, query])

  return (
    <Card className="p-6">
      <QueueToolbar
        value={query}
        onValueChange={setQuery}
        placeholder="Search loan ID, borrower, product…"
      />
      <Tabs items={tabItems} value={tab} onValueChange={setTab} className="mt-6" />

      {rows.length === 0 ? (
        <EmptyState title="No loan found." description="Adjust the filters above." />
      ) : (
        <Table className="mt-2">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Borrower</TableHead>
              <TableHead>Loan ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead>Outstanding</TableHead>
              <TableHead>DPD</TableHead>
              <TableHead>Amortisation</TableHead>
              <TableHead>Next Due</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ loan, summary }) => (
              <TableRow key={loan.id} className="cursor-pointer">
                <TableCell className="whitespace-nowrap">
                  <Link
                    href={`/loans/${encodeURIComponent(loan.id)}`}
                    className="font-semibold text-ink hover:text-brand"
                  >
                    {loan.customerName}
                  </Link>
                </TableCell>
                <TableCell className="whitespace-nowrap text-subtle">
                  {loan.id}
                </TableCell>
                <TableCell className="whitespace-nowrap text-subtle">
                  {loan.productName}
                </TableCell>
                <TableCell className="tabular">{naira(loan.amount)}</TableCell>
                <TableCell className="tabular font-semibold">
                  {naira(summary.totalOutstanding)}
                </TableCell>
                <TableCell
                  className={
                    summary.dpd >= 30
                      ? "tabular font-semibold text-error-600"
                      : "tabular"
                  }
                >
                  {summary.dpd}
                </TableCell>
                <TableCell className="whitespace-nowrap text-subtle">
                  {loan.amortizationType.replace("_", " ")}
                </TableCell>
                <TableCell className="whitespace-nowrap text-subtle">
                  {summary.nextObligation
                    ? shortDate(summary.nextObligation.dueDate)
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge dot tone={STATE_TONE[loan.state]}>
                    {LOAN_STATE_LABEL[loan.state]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  )
}
