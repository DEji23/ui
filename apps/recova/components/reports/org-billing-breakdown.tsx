"use client"

import * as React from "react"
import { FileText } from "lucide-react"

import { naira, percent } from "@/lib/format"
import { aggregateUsage, type UsageLine } from "@/lib/domain/billing"
import { ORGANISATIONS } from "@/lib/data/organisations"
import { LOANS, organisationIdForLoan } from "@/lib/data/loans"
import { RECOVERY_CASES } from "@/lib/data/recovery-cases"
import { isLive } from "@/lib/domain/onboarding"
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
import { Dialog, DialogContent } from "@/components/ui/dialog"

/**
 * Per-organisation billing.
 *
 * The Billing PRD bills by `org_id`; the platform-wide totals above are
 * built from a mature, illustrative dataset (1,000s of events) while the
 * actual seed data only has 8 loans across 2 live tenants. Rather than
 * compute two numbers that visibly don't reconcile, each organisation's
 * share of the platform total is allocated by its real share of recovered
 * volume — grounded in genuine per-org activity, but presented as an
 * allocation rather than literal per-event metering.
 */
export function OrgBillingBreakdown({ usage }: { usage: UsageLine[] }) {
  const [invoiceOrg, setInvoiceOrg] = React.useState<string | null>(null)

  const recoveredByOrg = React.useMemo(() => {
    const totals: Record<string, number> = {}
    for (const c of RECOVERY_CASES) {
      const orgId = organisationIdForLoan(c.loanId)
      if (!orgId) continue
      totals[orgId] = (totals[orgId] ?? 0) + c.amountRecovered
    }
    return totals
  }, [])

  const totalRecovered = Object.values(recoveredByOrg).reduce((s, n) => s + n, 0)

  const rows = ORGANISATIONS.map((org) => {
    const loanCount = LOANS.filter((l) => l.organisationId === org.id).length
    const recovered = recoveredByOrg[org.id] ?? 0
    const weight = totalRecovered === 0 ? 0 : recovered / totalRecovered
    const orgUsage: UsageLine[] = usage.map((line) => ({
      event: line.event,
      quantity: Math.round(line.quantity * weight),
    }))
    const totals = aggregateUsage(orgUsage)
    return { org, loanCount, recovered, weight, orgUsage, totals }
  }).sort((a, b) => b.recovered - a.recovered)

  const invoiceRow = rows.find((r) => r.org.id === invoiceOrg) ?? null

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4">
        <div>
          <CardTitle>Billing by Organisation</CardTitle>
          <CardDescription>
            Allocated by each tenant&apos;s share of platform recovery volume — the same
            tariffs as the platform total above, broken out per <code>org_id</code>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table className="min-w-[880px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Organisation</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Loans</TableHead>
              <TableHead>Recovered</TableHead>
              <TableHead>Allocated Cost</TableHead>
              <TableHead>Allocated Charge</TableHead>
              <TableHead>Margin</TableHead>
              <TableHead>Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ org, loanCount, recovered, totals }) => {
              const live = isLive(org.phasesComplete)
              return (
                <TableRow key={org.id}>
                  <TableCell className="whitespace-nowrap font-semibold text-ink">
                    {org.tradingName}
                  </TableCell>
                  <TableCell>
                    <Badge tone={live ? "success" : "neutral"}>
                      {live ? "PRODUCTION" : "SANDBOX"}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular text-subtle">{loanCount}</TableCell>
                  <TableCell className="tabular font-semibold">
                    {naira(recovered)}
                  </TableCell>
                  <TableCell className="tabular text-subtle">
                    {naira(totals.totalCost)}
                  </TableCell>
                  <TableCell className="tabular font-semibold">
                    {naira(totals.totalCharge)}
                  </TableCell>
                  <TableCell className="tabular text-subtle">
                    {percent(totals.marginPct)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loanCount === 0}
                      title={loanCount === 0 ? "No billable activity yet." : undefined}
                      onClick={() => setInvoiceOrg(org.id)}
                    >
                      <FileText className="size-3.5" />
                      Generate
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={invoiceRow !== null} onOpenChange={(o) => !o && setInvoiceOrg(null)}>
        {invoiceRow ? (
          <DialogContent
            title={`Invoice — ${invoiceRow.org.tradingName}`}
            description={`org_id: ${invoiceRow.org.id} · Billing period: August 2026`}
            footer={
              <Button variant="primary" size="lg" block onClick={() => setInvoiceOrg(null)}>
                Close
              </Button>
            }
          >
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3 rounded-[var(--radius-control)] bg-surface p-4">
                <div>
                  <p className="text-[10px] uppercase text-subtle">Total Usage</p>
                  <p className="tabular text-sm font-bold text-ink">
                    {invoiceRow.orgUsage.reduce((s, l) => s + l.quantity, 0)} events
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-subtle">Total Cost</p>
                  <p className="tabular text-sm font-bold text-ink">
                    {naira(invoiceRow.totals.totalCost)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-subtle">Total Charge</p>
                  <p className="tabular text-sm font-bold text-brand">
                    {naira(invoiceRow.totals.totalCharge)}
                  </p>
                </div>
              </div>

              <div className="max-h-[320px] overflow-y-auto rounded-[var(--radius-control)] border border-stroke">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stroke text-subtle">
                      <th className="p-2.5 font-semibold">Event</th>
                      <th className="p-2.5 font-semibold">Qty</th>
                      <th className="p-2.5 font-semibold">Charge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceRow.totals.lines
                      .filter((l) => l.quantity > 0)
                      .map((l) => (
                        <tr key={l.event} className="border-b border-stroke last:border-0">
                          <td className="p-2.5 text-ink">{l.label}</td>
                          <td className="tabular p-2.5 text-subtle">{l.quantity}</td>
                          <td className="tabular p-2.5 font-semibold text-ink">
                            {naira(l.charge)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-subtle">
                Usage is allocated from platform totals by this tenant&apos;s share of
                recovered volume ({percent(invoiceRow.weight * 100)}), using the same unit
                tariffs shown on the platform-wide report.
              </p>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </Card>
  )
}
