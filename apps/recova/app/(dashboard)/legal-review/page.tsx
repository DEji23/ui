import { Gavel, FileText, Plus } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { loans } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

const legalLoans = loans.filter(l => l.state === "LEGAL_REVIEW")

export default function LegalReviewPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="Legal Review"
        description="Cases escalated for legal action"
        actions={
          <Button size="sm" className="gap-2 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Escalate Case
          </Button>
        }
      />

      <div className="p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "In Legal Review", value: legalLoans.length, color: "text-purple-500" },
            { label: "Total Exposure", value: formatCurrency(legalLoans.reduce((a, l) => a + l.outstanding, 0)), color: "text-red-500" },
            { label: "Avg DPD", value: legalLoans.length ? Math.round(legalLoans.reduce((a, l) => a + l.dpd, 0) / legalLoans.length) + "d" : "—", color: "text-amber-500" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={cn("text-2xl font-bold mt-1", s.color)}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-border">
                <tr>
                  {["Borrower", "Loan ID", "Outstanding", "DPD", "Product", "Branch", "Due Date", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {legalLoans.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <Gavel className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No cases in legal review</p>
                    </td>
                  </tr>
                ) : legalLoans.map(loan => (
                  <tr key={loan.id} className="hover:bg-muted/40 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-foreground">{loan.borrower}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-muted-foreground">{loan.loanId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-destructive monospace-nums">
                        {formatCurrency(loan.outstanding)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-red-500">{loan.dpd}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{loan.product}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{loan.branch}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{formatDate(loan.dueDate)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                        <FileText className="h-3 w-3" />
                        Files
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
