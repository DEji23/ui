import { Banknote, Layers, RotateCcw, Wallet } from "lucide-react"

import { naira, nairaShort, shortDate } from "@/lib/format"
import { RAIL_LABEL, type LedgerEntry } from "@/lib/domain/types"
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
import { SettlementsPageActions } from "@/components/wizards/misc-page-actions"

/**
 * Settlement + ledger view.
 * The lifecycle column reflects the PRD's four-stage progression:
 * PENDING → PROVISIONAL (bank ack) → FINALIZED (settlement) → REVERSED.
 */
const LEDGER: LedgerEntry[] = [
  {
    id: "led_001",
    loanId: "LN-28611",
    transactionId: "TX-88198770",
    type: "DEBIT",
    status: "FINALIZED",
    amount: 940_000,
    currency: "NGN",
    rail: "NDD",
    referenceEntryId: null,
    createdAt: "2026-08-01T09:00:00Z",
  },
  {
    id: "led_002",
    loanId: "LN-2024-1401",
    transactionId: "TX-88213004",
    type: "DEBIT",
    status: "PROVISIONAL",
    amount: 2_100_000,
    currency: "NGN",
    rail: "NDD",
    referenceEntryId: null,
    createdAt: "2026-07-30T09:00:00Z",
  },
  {
    id: "led_003",
    loanId: "LN-2024-1401",
    transactionId: "TX-88213004-R",
    type: "REVERSAL",
    status: "FINALIZED",
    amount: 2_100_000,
    currency: "NGN",
    rail: "NDD",
    referenceEntryId: "led_002",
    createdAt: "2026-08-04T11:00:00Z",
  },
  {
    id: "led_004",
    loanId: "LN-28471",
    transactionId: "TX-88201220-RF",
    type: "REFUND",
    status: "FINALIZED",
    amount: 42_500,
    currency: "NGN",
    rail: "EASY_PAY",
    referenceEntryId: "led_005",
    createdAt: "2026-07-27T14:00:00Z",
  },
  {
    id: "led_005",
    loanId: "LN-2024-1355",
    transactionId: "TX-88207001",
    type: "DEBIT",
    status: "PENDING",
    amount: 320_000,
    currency: "NGN",
    rail: "EASY_PAY",
    referenceEntryId: null,
    createdAt: "2026-08-06T08:05:00Z",
  },
]

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

export default function SettlementsPage() {
  const settled = LEDGER.filter((e) => e.type === "DEBIT" && e.status === "FINALIZED")
    .reduce((sum, e) => sum + e.amount, 0)
  const pending = LEDGER.filter((e) => e.status !== "FINALIZED").reduce(
    (sum, e) => sum + e.amount,
    0
  )
  const reversals = LEDGER.filter((e) => e.type === "REVERSAL").reduce(
    (sum, e) => sum + e.amount,
    0
  )
  const refunds = LEDGER.filter((e) => e.type === "REFUND").reduce(
    (sum, e) => sum + e.amount,
    0
  )

  return (
    <>
      <PageHeader
        title="Settlements"
        description="Immutable double-entry ledger and settlement status across every recovery rail."
        actions={<SettlementsPageActions />}
      />

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
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Ledger Entries</CardTitle>
              <CardDescription>
                Reversals and refunds always reference their original transaction
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {LEDGER.map((e) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
