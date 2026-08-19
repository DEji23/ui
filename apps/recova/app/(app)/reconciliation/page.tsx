import { CheckCircle2, Scale, TriangleAlert } from "lucide-react"

import { naira, percent, relativeTime } from "@/lib/format"
import { RECONCILIATION_EXCEPTIONS } from "@/lib/data/operations"
import { LEDGER } from "@/lib/data/ledger"
import {
  reconciliationSummary,
  SETTLEMENT_WINDOW_HOURS,
  type MatchResult,
} from "@/lib/domain/reconciliation"
import { RAIL_LABEL, RAILS } from "@/lib/domain/types"
import { Badge } from "@/components/ui/badge"
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
import { ReconciliationPill } from "@/components/shared/status-pill"
import { ReconciliationPageActions } from "@/components/wizards/misc-page-actions"

/**
 * Reconciliation engine view.
 * The rail-window table is here because the PRD's core failure mode is
 * treating a delayed settlement as a missing one: each rail settles on a
 * different clock, and the classifier tolerates that difference.
 */
export default function ReconciliationPage() {
  const open = RECONCILIATION_EXCEPTIONS.filter((e) => e.status !== "RESOLVED")
  const duplicates = RECONCILIATION_EXCEPTIONS.filter((e) => e.outcome === "DUPLICATE")

  // Every ledger entry is a real reconciliation attempt — one that also has
  // a logged exception carries that exception's outcome, everything else
  // reconciled clean. reconciliationSummary() then computes accuracy from
  // this, rather than a hardcoded illustrative figure.
  const matchResults: MatchResult[] = LEDGER.map((entry) => {
    const exception = RECONCILIATION_EXCEPTIONS.find((e) => e.transactionId === entry.transactionId)
    return {
      transactionId: entry.transactionId,
      outcome: exception?.outcome ?? "MATCHED",
      internalAmount: entry.amount,
      bankAmount: exception?.bankAmount ?? entry.amount,
      detail: exception
        ? `${RAIL_LABEL[exception.rail]} · ${exception.status}`
        : "Matched against settlement file",
    }
  })
  const summary = reconciliationSummary(matchResults)

  return (
    <>
      <PageHeader
        title="Reconciliation"
        description="Match internal ledger entries against NDD, Remita and EasyPay settlement files."
        actions={<ReconciliationPageActions />}
      />

      <div className="flex flex-col gap-6 px-8 pb-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Reconciliation Accuracy"
            value={percent(summary.accuracy, 2)}
            icon={CheckCircle2}
            tone="success"
            caption={`Target ≥ 99.9% · ${summary.unmatched} unmatched of ${summary.total}`}
          />
          <StatCard
            label="Open Exceptions"
            value={String(open.length)}
            icon={TriangleAlert}
            tone="warning"
            caption="Awaiting finance review"
          />
          <StatCard
            label="Duplicate Debits"
            value={String(duplicates.length)}
            icon={Scale}
            tone="error"
            caption="Refund path triggered"
          />
          <StatCard
            label="Unmatched Rate"
            value={percent(0.06, 2)}
            icon={Scale}
            tone="brand"
            caption="Target ≤ 0.1%"
          />
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Settlement Windows</CardTitle>
              <CardDescription>
                A transaction is only an exception once its rail window has elapsed
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {RAILS.map((rail) => (
              <div
                key={rail}
                className="rounded-[var(--radius-control)] border border-stroke p-4"
              >
                <p className="text-sm font-semibold text-ink">{RAIL_LABEL[rail]}</p>
                <p className="tabular mt-1 text-2xl font-bold text-ink-header">
                  {SETTLEMENT_WINDOW_HOURS[rail]}h
                </p>
                <p className="mt-1 text-xs text-subtle">
                  Tolerance before an exception is raised
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-ink-header">Exception Queue</h2>
            <p className="text-sm text-subtle">
              Unmatched transactions, delayed settlements and duplicate debits
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Transaction</TableHead>
                <TableHead>Loan ID</TableHead>
                <TableHead>Rail</TableHead>
                <TableHead>Internal</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Detected</TableHead>
                <TableHead>Case Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECONCILIATION_EXCEPTIONS.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-semibold text-ink">
                    {e.transactionId}
                  </TableCell>
                  <TableCell className="text-subtle">{e.loanId}</TableCell>
                  <TableCell className="text-subtle">{RAIL_LABEL[e.rail]}</TableCell>
                  <TableCell className="tabular">
                    {e.internalAmount === null ? "—" : naira(e.internalAmount)}
                  </TableCell>
                  <TableCell className="tabular">
                    {e.bankAmount === null ? "—" : naira(e.bankAmount)}
                  </TableCell>
                  <TableCell>
                    <ReconciliationPill outcome={e.outcome} />
                  </TableCell>
                  <TableCell className="text-subtle">{e.assignedTo}</TableCell>
                  <TableCell className="text-subtle">
                    {relativeTime(e.detectedAt)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      dot
                      tone={
                        e.status === "RESOLVED"
                          ? "success"
                          : e.status === "INVESTIGATING"
                            ? "warning"
                            : "error"
                      }
                    >
                      {e.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  )
}
