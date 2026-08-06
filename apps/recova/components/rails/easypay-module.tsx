"use client"

import * as React from "react"

import { naira, relativeTime } from "@/lib/format"
import {
  EASYPAY_OPERATION_LABEL,
  EASYPAY_STATUS_LABEL,
  EASYPAY_TRANSACTIONS,
  type EasyPayStatus,
} from "@/lib/data/workqueues"
import { RAIL_LABEL } from "@/lib/domain/types"
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

const STATUS_TONE: Record<EasyPayStatus, Tone> = {
  SUCCESS: "success",
  PENDING_EXECUTION: "neutral",
  BALANCE_CHECK_PASSED: "info",
  DEBIT_INITIATED: "info",
  CIRCUIT_BREAKER_ACTIVE: "error",
  AWAITING_RETRY_POLICY: "warning",
  FAILED: "error",
}

const FILTERS: Array<{ value: string; label: string; states?: EasyPayStatus[] }> = [
  { value: "all", label: "All" },
  { value: "success", label: "Successful", states: ["SUCCESS"] },
  {
    value: "in-flight",
    label: "In Flight",
    states: ["PENDING_EXECUTION", "BALANCE_CHECK_PASSED", "DEBIT_INITIATED"],
  },
  { value: "held", label: "Held", states: ["CIRCUIT_BREAKER_ACTIVE", "AWAITING_RETRY_POLICY"] },
  { value: "failed", label: "Failed", states: ["FAILED"] },
]

/** EasyPay fallback log — every attempt carries its rail cost for unit economics. */
export function EasyPayModule() {
  const [tab, setTab] = React.useState("all")
  const [query, setQuery] = React.useState("")

  const tabItems: TabItem[] = FILTERS.map((f) => ({
    value: f.value,
    label: f.label,
    count: f.states
      ? EASYPAY_TRANSACTIONS.filter((t) => f.states!.includes(t.status)).length
      : EASYPAY_TRANSACTIONS.length,
  }))

  const rows = React.useMemo(() => {
    const filter = FILTERS.find((f) => f.value === tab)
    const q = query.trim().toLowerCase()
    return EASYPAY_TRANSACTIONS.filter(
      (t) => !filter?.states || filter.states.includes(t.status)
    ).filter(
      (t) =>
        q === "" ||
        [t.borrowerName, t.loanId, t.reference].join(" ").toLowerCase().includes(q)
    )
  }, [tab, query])

  const spend = rows.reduce((sum, t) => sum + t.costNaira, 0)

  return (
    <Card className="p-6">
      <QueueToolbar
        value={query}
        onValueChange={setQuery}
        placeholder="Search borrower, loan ID, reference…"
      >
        <span className="hidden text-xs text-subtle sm:block">
          Rail spend shown: <span className="tabular font-semibold text-ink">{naira(spend)}</span>
        </span>
      </QueueToolbar>

      <Tabs items={tabItems} value={tab} onValueChange={setTab} className="mt-6" />

      {rows.length === 0 ? (
        <EmptyState
          title="No EasyPay attempt found."
          description="EasyPay attempts appear here when a direct debit rail fails or no mandate is available."
        />
      ) : (
        <Table className="mt-2">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Borrower</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Operation</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Fell back from</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Rail Cost</TableHead>
              <TableHead>Attempted</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <p className="font-semibold text-ink">{t.borrowerName}</p>
                  <p className="text-xs text-subtle">{t.phone}</p>
                </TableCell>
                <TableCell className="text-subtle">{t.reference}</TableCell>
                <TableCell className="text-subtle">
                  {EASYPAY_OPERATION_LABEL[t.operation]}
                </TableCell>
                <TableCell className="tabular font-semibold">{naira(t.amount)}</TableCell>
                <TableCell className="text-subtle">
                  {RAIL_LABEL[t.fallbackFrom]}
                </TableCell>
                <TableCell className="text-subtle">{t.tier}</TableCell>
                <TableCell className="tabular text-subtle">
                  {t.costNaira === 0 ? "—" : naira(t.costNaira)}
                </TableCell>
                <TableCell className="text-subtle">
                  {relativeTime(t.attemptedAt)}
                </TableCell>
                <TableCell>
                  <Badge dot tone={STATUS_TONE[t.status]}>
                    {EASYPAY_STATUS_LABEL[t.status]}
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
