import { Download, Zap } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { loans } from "@/lib/mock-data"
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils"
import { cn } from "@/lib/utils"

const totalOutstanding = loans.reduce((a, l) => a + l.outstanding, 0)
const byRail = loans.reduce<Record<string, { count: number; amount: number }>>((acc, l) => {
  if (!acc[l.rail]) acc[l.rail] = { count: 0, amount: 0 }
  acc[l.rail].count += 1
  acc[l.rail].amount += l.outstanding
  return acc
}, {})

const RAIL_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  NDD: { bg: "bg-primary/10", text: "text-primary", bar: "bg-primary" },
  REMITA: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", bar: "bg-purple-500" },
  EASY_PAY: { bg: "bg-pink-500/10", text: "text-pink-600 dark:text-pink-400", bar: "bg-pink-500" },
  MANUAL: { bg: "bg-muted", text: "text-muted-foreground", bar: "bg-muted-foreground" },
}

export default function CollectionsPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="Collections"
        description="EasyPay fallback and manual collection management"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            <Button size="sm" className="gap-2 text-xs">
              <Zap className="h-3.5 w-3.5" />
              Trigger EasyPay
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Rail performance */}
        <div className="grid sm:grid-cols-3 gap-4">
          {Object.entries(byRail).map(([rail, data]) => {
            const pct = Math.round((data.amount / totalOutstanding) * 100)
            const style = RAIL_COLORS[rail] ?? RAIL_COLORS.MANUAL
            return (
              <Card key={rail}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn("rounded-lg px-2.5 py-1 text-xs font-semibold", style.bg, style.text)}>
                      {rail}
                    </div>
                    <span className={cn("text-sm font-bold", style.text)}>{pct}%</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{formatCurrencyCompact(data.amount)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{data.count} active loans</p>
                  <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", style.bar)} style={{ width: `${pct}%` }} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* EasyPay fallback queue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">EasyPay Fallback Queue</CardTitle>
            <p className="text-xs text-muted-foreground">Loans eligible for EasyPay after mandate failures</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="border-b border-border">
                  <tr>
                    {["Borrower", "Outstanding", "Attempts", "Last Attempt", "Action"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loans.filter(l => l.rail === "EASY_PAY" || l.state === "RECOVERY_FAILED").map(loan => (
                    <tr key={loan.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{loan.borrower}</span>
                          <span className="text-[11px] text-muted-foreground">{loan.loanId}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-foreground monospace-nums">
                          {formatCurrency(loan.outstanding)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-foreground">{loan.retryCount || 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">—</span>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                          <Zap className="h-3 w-3" />
                          Trigger
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
