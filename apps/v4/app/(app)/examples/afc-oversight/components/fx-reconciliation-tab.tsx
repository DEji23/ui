import { IconDownload } from "@tabler/icons-react"

import { Badge } from "@/registry/new-york-v4/ui/badge"
import { Button } from "@/registry/new-york-v4/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/new-york-v4/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york-v4/ui/table"

import { fxRates, reconciliation } from "../data"

export function FxReconciliationTab() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>FX rate configuration</CardTitle>
          <CardDescription>
            Transaction-level FX snapshots are stored at capture time — historical rates cannot be retroactively edited
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Currency pair</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead>Effective date</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fxRates.map((rate, i) => (
                  <TableRow key={`${rate.pair}-${i}`}>
                    <TableCell className="font-mono text-xs">{rate.pair}</TableCell>
                    <TableCell className="text-right tabular-nums">{rate.rate}</TableCell>
                    <TableCell className="text-muted-foreground">{rate.effectiveDate}</TableCell>
                    <TableCell>
                      <Badge variant={rate.source === "Automated" ? "secondary" : "outline"}>
                        {rate.source}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Reconciliation by currency</CardTitle>
            <CardDescription>Gross, platform, operator, and compliance splits per operating currency</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <IconDownload />
              Per-currency report
            </Button>
            <Button variant="outline" size="sm">
              <IconDownload />
              Consolidated (USD)
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Gross revenue</TableHead>
                  <TableHead className="text-right">Platform earnings</TableHead>
                  <TableHead className="text-right">Compliance revenue</TableHead>
                  <TableHead className="text-right">Operator net</TableHead>
                  <TableHead className="text-right">FX impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reconciliation.map((row) => (
                  <TableRow key={row.currency}>
                    <TableCell className="font-mono">{row.currency}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.grossRevenue.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.platformEarnings.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.complianceRevenue.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.operatorNet.toLocaleString()}</TableCell>
                    <TableCell
                      className={`text-right tabular-nums ${row.fxImpact < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}
                    >
                      {row.fxImpact > 0 ? "+" : ""}
                      {row.fxImpact.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
