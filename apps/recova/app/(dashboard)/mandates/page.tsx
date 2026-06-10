"use client"

import { useState } from "react"
import { Plus, Search, Download, RefreshCcw } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { mandates } from "@/lib/mock-data"
import { formatCurrency, formatDate, maskAccount } from "@/lib/utils"
import { cn } from "@/lib/utils"

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  EXPIRED: "bg-muted text-muted-foreground",
  FAILED: "bg-red-500/10 text-red-600 dark:text-red-400",
  SUSPENDED: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
}

const RAIL_STYLE: Record<string, string> = {
  NDD: "bg-primary/10 text-primary",
  REMITA: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  EASY_PAY: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
}

const statusCounts = mandates.reduce<Record<string, number>>((acc, m) => {
  acc[m.status] = (acc[m.status] || 0) + 1
  return acc
}, {})

export default function MandatesPage() {
  const [search, setSearch] = useState("")

  const filtered = mandates.filter(m => {
    const q = search.toLowerCase()
    return !q || m.borrower.toLowerCase().includes(q) || m.reference.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col">
      <Header
        title="Mandates"
        description="Manage NDD and Remita direct debit mandates"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            <Button size="sm" className="gap-2 text-xs">
              <Plus className="h-3.5 w-3.5" />
              New Mandate
            </Button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 space-y-5">
        {/* KPI summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Active", value: statusCounts.ACTIVE || 0, color: "text-emerald-500" },
            { label: "Pending", value: statusCounts.PENDING || 0, color: "text-amber-500" },
            { label: "Failed", value: statusCounts.FAILED || 0, color: "text-red-500" },
            { label: "Expired", value: statusCounts.EXPIRED || 0, color: "text-muted-foreground" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <p className={cn("text-2xl font-bold mt-1", s.color)}>{s.value}</p>
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
                placeholder="Search mandates…"
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
                  {["Borrower", "Reference", "Bank / Account", "Rail", "Max Amount", "Frequency", "Status", "Expires"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(mandate => (
                  <tr key={mandate.id} className="hover:bg-muted/40 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-foreground">{mandate.borrower}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-muted-foreground">{mandate.reference}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">{mandate.bank}</span>
                        <span className="text-[11px] text-muted-foreground monospace-nums">{maskAccount(mandate.accountNumber)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", RAIL_STYLE[mandate.rail] ?? "bg-muted text-muted-foreground")}>
                        {mandate.rail}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-foreground monospace-nums">
                        {formatCurrency(mandate.maxAmount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{mandate.frequency}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", STATUS_STYLE[mandate.status])}>
                        {mandate.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{formatDate(mandate.expiryDate)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border px-4 py-2.5">
            <span className="text-xs text-muted-foreground">{filtered.length} mandate{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
