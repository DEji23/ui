"use client"

import * as React from "react"
import { Banknote, BellRing, Layers, RotateCcw, Wallet } from "lucide-react"

import { naira, nairaShort, shortDate } from "@/lib/format"
import { organisationIdForLoan } from "@/lib/data/loans"
import { LEDGER } from "@/lib/data/ledger"
import { RAIL_LABEL } from "@/lib/domain/types"
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
import { StatCard } from "@/components/shared/stat-card"
import { OrgScopeSelector } from "@/components/shared/org-scope-selector"
import { EmptyState } from "@/components/shared/empty-state"
import { ResultDialog } from "@/components/queues/action-dialogs"

/**
 * Settlement + ledger view.
 * The lifecycle column reflects the PRD's four-stage progression:
 * PENDING → PROVISIONAL (bank ack) → FINALIZED (settlement) → REVERSED.
 * The ledger itself lives in lib/data/ledger.ts, shared with the recovery
 * and disputes screens so their money-movement actions post here too.
 */
const STATUS_TONE = {
  PENDING: "neutral",
  PROVISIONAL: "warning",
  FINALIZED: "success",
  REVERSED: "error",
} as const

const TYPE_TONE = {
  DEBIT: "info",
  REVERSAL: "error",
  REFUND: "purple",
} as const

export function SettlementsView() {
  const [org, setOrg] = React.useState("all")
  const [notified, setNotified] = React.useState<Record<string, boolean>>({})
  const [result, setResult] = React.useState<{ title: string; message: string } | null>(
    null
  )

  function notifyStakeholders(entryId: string, transactionId: string, amount: number) {
    setNotified((prev) => ({ ...prev, [entryId]: true }))
    setResult({
      title: "Stakeholders notified",
      message: `Finance, the assigned DRO and the lending client have all been sent the reversal notice for ${transactionId} (${naira(amount)}), per the ntf_reversal_stakeholders template.`,
    })
  }

  const rows = React.useMemo(
    () =>
      org === "all" ? LEDGER : LEDGER.filter((e) => organisationIdForLoan(e.loanId) === org),
    [org]
  )

  const settled = rows
    .filter((e) => e.type === "DEBIT" && e.status === "FINALIZED")
    .reduce((sum, e) => sum + e.amount, 0)
  const pending = rows
    .filter((e) => e.status !== "FINALIZED")
    .reduce((sum, e) => sum + e.amount, 0)
  const reversals = rows
    .filter((e) => e.type === "REVERSAL")
    .reduce((sum, e) => sum + e.amount, 0)
  const refunds = rows
    .filter((e) => e.type === "REFUND")
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="flex flex-col gap-6 px-8 pb-12">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Settled"
          value={nairaShort(settled)}
          icon={Banknote}
          tone="success"
          caption="Finalized entries"
        />
        <StatCard
          label="In Flight"
          value={nairaShort(pending)}
          icon={Layers}
          tone="warning"
          caption="Pending + provisional"
        />
        <StatCard
          label="Reversals"
          value={nairaShort(reversals)}
          icon={RotateCcw}
          tone="error"
          caption="Bank-initiated"
        />
        <StatCard
          label="Refunds"
          value={nairaShort(refunds)}
          icon={Wallet}
          tone="purple"
          caption="Dispute resolutions"
        />
      </div>

      <Card className="p-6">
        <CardHeader className="flex-wrap p-0 pb-4">
          <div>
            <CardTitle>Ledger Entries</CardTitle>
            <CardDescription>
              Reversals and refunds always reference their original transaction
            </CardDescription>
          </div>
          <OrgScopeSelector value={org} onValueChange={setOrg} />
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <EmptyState
              title="No ledger entries for this organisation."
              description="Choose a different organisation, or clear the filter."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Entry</TableHead>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Rail</TableHead>
                  <TableHead>References</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Lifecycle</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-semibold text-ink">{e.id}</TableCell>
                    <TableCell className="text-subtle">{e.loanId}</TableCell>
                    <TableCell className="text-subtle">{e.transactionId}</TableCell>
                    <TableCell>
                      <Badge tone={TYPE_TONE[e.type]}>{e.type}</Badge>
                    </TableCell>
                    <TableCell className="tabular font-semibold">
                      {naira(e.amount)}
                    </TableCell>
                    <TableCell className="text-subtle">{RAIL_LABEL[e.rail]}</TableCell>
                    <TableCell className="text-subtle">
                      {e.referenceEntryId ?? "—"}
                    </TableCell>
                    <TableCell className="text-subtle">
                      {shortDate(e.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge dot tone={STATUS_TONE[e.status]}>
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {e.type === "REVERSAL" ? (
                        <Button
                          variant={notified[e.id] ? "outline" : "soft"}
                          size="sm"
                          disabled={notified[e.id]}
                          onClick={() => notifyStakeholders(e.id, e.transactionId, e.amount)}
                        >
                          <BellRing className="size-3.5" />
                          {notified[e.id] ? "Notified" : "Notify Stakeholders"}
                        </Button>
                      ) : (
                        <span className="text-xs text-subtle">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </div>
  )
}

export { LEDGER }
