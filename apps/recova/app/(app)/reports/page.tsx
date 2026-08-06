import { FileArchive, FileSpreadsheet, FileText, Percent, TrendingUp } from "lucide-react"

import { naira, percent } from "@/lib/format"
import {
  EASYPAY_ATTEMPT_COST,
  IGREE_ONBOARDING_COST,
  TARIFFS,
  aggregateUsage,
  costPerNairaRecovered,
} from "@/lib/domain/billing"
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

/**
 * Reporting + unit economics.
 * Cost and price are shown side by side because the billing PRD's whole
 * point is that a failed debit still costs money — margin has to be visible
 * per event type, not just in aggregate.
 */
const USAGE = [
  { event: "IGREE_CONSENT" as const, quantity: 1_532 },
  { event: "IGREE_SMS_OTP" as const, quantity: 1_847 },
  { event: "IGREE_BVN_DATA" as const, quantity: 1_532 },
  { event: "IGREE_LINKED_ACCOUNTS" as const, quantity: 1_532 },
  { event: "MANDATE_ACTIVATION" as const, quantity: 1_247 },
  { event: "NDD_DEBIT" as const, quantity: 7_210 },
  { event: "NDD_BALANCE_ENQUIRY" as const, quantity: 7_210 },
  { event: "EASYPAY_TRANSFER" as const, quantity: 1_742 },
  { event: "EASYPAY_BALANCE_ENQUIRY" as const, quantity: 1_742 },
  { event: "EASYPAY_NAME_ENQUIRY" as const, quantity: 1_742 },
]

const SPOOL_REPORTS = [
  { name: "Daily Recovery Performance", format: "CSV", cadence: "Daily 06:00" },
  { name: "Settlement & Reconciliation", format: "XLSX", cadence: "Daily 02:00" },
  { name: "Mandate & Consent Register", format: "CSV", cadence: "Weekly Mon 07:00" },
  { name: "Dispute & Reversal Log", format: "CSV", cadence: "Weekly Mon 07:00" },
  { name: "Audit Evidence Bundle", format: "ZIP", cadence: "On demand" },
  { name: "Billing & Unit Economics", format: "XLSX", cadence: "Monthly 1st" },
]

const FORMAT_ICON = {
  CSV: FileText,
  XLSX: FileSpreadsheet,
  ZIP: FileArchive,
} as const

export default function ReportsPage() {
  const totals = aggregateUsage(USAGE)
  const recovered = 284_800_000
  const costPerNaira = costPerNairaRecovered(totals.totalCost, recovered)

  return (
    <>
      <PageHeader
        title="Reports"
        description="Operational, financial and audit reporting with spool export."
        actions={
          <Button variant="primary" className="h-12 px-5">
            Generate Report
            <FileSpreadsheet />
          </Button>
        }
      />

      <div className="flex flex-col gap-6 px-8 pb-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Platform Cost"
            value={naira(totals.totalCost)}
            icon={Percent}
            tone="warning"
            caption="Rail fees this period"
          />
          <StatCard
            label="Billed to Lenders"
            value={naira(totals.totalCharge)}
            icon={TrendingUp}
            tone="success"
            caption="Revenue this period"
          />
          <StatCard
            label="Gross Margin"
            value={percent(totals.marginPct)}
            icon={Percent}
            tone="brand"
            caption={naira(totals.margin)}
          />
          <StatCard
            label="Cost per ₦ Recovered"
            value={`₦${costPerNaira.toFixed(4)}`}
            icon={Percent}
            tone="info"
            caption={`on ${naira(recovered)} recovered`}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <div>
                <CardTitle>Unit Economics by Event</CardTitle>
                <CardDescription>
                  Rail tariffs from the NIBSS cost schedule, with platform margin
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Billable Event</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Total Charge</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {totals.lines.map((line) => (
                    <TableRow key={line.event}>
                      <TableCell className="font-semibold text-ink">
                        {line.label}
                      </TableCell>
                      <TableCell className="tabular text-subtle">
                        {line.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell className="tabular text-subtle">
                        ₦{line.cost / line.quantity}
                      </TableCell>
                      <TableCell className="tabular text-subtle">
                        ₦{line.charge / line.quantity}
                      </TableCell>
                      <TableCell className="tabular">{naira(line.cost)}</TableCell>
                      <TableCell className="tabular font-semibold">
                        {naira(line.charge)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 flex flex-wrap gap-6 border-t border-stroke pt-4 text-xs text-subtle">
                <span>
                  iGree onboarding per user:{" "}
                  <span className="tabular font-semibold text-ink">
                    {naira(IGREE_ONBOARDING_COST)}
                  </span>
                </span>
                <span>
                  EasyPay per fallback attempt:{" "}
                  <span className="tabular font-semibold text-ink">
                    {naira(EASYPAY_ATTEMPT_COST)}
                  </span>
                </span>
                <span>
                  Mandate activation:{" "}
                  <span className="tabular font-semibold text-ink">
                    {naira(TARIFFS.MANDATE_ACTIVATION.cost)}
                  </span>
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <div>
                <CardTitle>Spool Exports</CardTitle>
                <CardDescription>Queued, then available for download</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-0">
              {SPOOL_REPORTS.map((report) => {
                const Icon = FORMAT_ICON[report.format as keyof typeof FORMAT_ICON]
                return (
                  <div
                    key={report.name}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-stroke p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Icon className="size-5 shrink-0 text-brand" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {report.name}
                        </p>
                        <p className="text-xs text-subtle">{report.cadence}</p>
                      </div>
                    </div>
                    <Button variant="soft" size="sm">
                      {report.format}
                    </Button>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
