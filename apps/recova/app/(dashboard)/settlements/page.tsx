"use client"

import { useState } from "react"
import { Download, Search, CheckCircle2, Clock, XCircle, RefreshCcw } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { settlements } from "@/lib/mock-data"
import { formatCurrency, formatDate, formatCurrencyCompact } from "@/lib/utils"
import { cn } from "@/lib/utils"

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  PROCESSING: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  FAILED: "bg-red-500/10 text-red-600 dark:text-red-400",
  REVERSED: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  PARTIAL: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
}

const totalCollected = settlements.filter(s => s.status === "COMPLETED").reduce((a, s) => a + s.amount, 0)
const pending = settlements.filter(s => s.status === "PENDING" || s.status === "PROCESSING").reduce((a, s) => a + s.amount, 0)

export default function SettlementsPage() {
  const [search, setSearch] = useState("")

  const filtered = settlements.filter(s => {
    const q = search.toLowerCase()
    return !q || s.borrower.toLowerCase().includes(q) || s.reference.toLowerCase().includes(q) || s.rail.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col">
      <Header
        title="Settlements & Reconciliation"
        description="Track all collections and payment settlements"
        actions={
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Settled (MTD)", value: formatCurrencyCompact(totalCollected), icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Pending Settlement", value: formatCurrencyCompact(pending), icon: <Clock className="h-4 w-4" />, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Transactions", value: settlements.length.toString(), icon: <RefreshCcw className="h-4 w-4" />, color: "text-primary", bg: "bg-primary/10" },
            { label: "Failed / Reversed", value: settlements.filter(s => s.status === "FAILED" || s.status === "REVERSED").length.toString(), icon: <XCircle className="h-4 w-4" />, color: "text-red-500", bg: "bg-red-500/10" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", s.bg)}>
                  <span className={s.color}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground truncate max-w-[100px]">{s.label}</p>
                  <p className={cn("text-lg font-bold", s.color)}>{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search settlements…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-8 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="border-b border-border">
                <tr>
                  {["Reference", "Borrower", "Amount", "Rail", "Type", "Date", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-muted/40 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-muted-foreground">{s.reference}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-foreground">{s.borrower}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-foreground monospace-nums">
                        {formatCurrency(s.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-foreground">{s.rail}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{s.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{formatDate(s.settledAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", STATUS_STYLE[s.status])}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border px-4 py-2.5">
            <span className="text-xs text-muted-foreground">{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
