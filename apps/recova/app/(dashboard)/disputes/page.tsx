"use client"

import { useState } from "react"
import { AlertTriangle, Clock, CheckCircle2, XCircle, Search } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { disputes } from "@/lib/mock-data"
import { formatCurrency, formatDate, formatRelativeTime, getSLAStatus } from "@/lib/utils"
import { cn } from "@/lib/utils"

const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  INVESTIGATING: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  RESOLVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400",
  ESCALATED: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
}

const SLA_STYLE: Record<string, string> = {
  safe: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  urgent: "text-orange-600 dark:text-orange-400",
  breached: "text-red-600 dark:text-red-400",
}

const SLA_BADGE: Record<string, string> = {
  safe: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  urgent: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  breached: "bg-red-500/10 text-red-600 dark:text-red-400",
}

const statusCounts = disputes.reduce<Record<string, number>>((acc, d) => {
  acc[d.status] = (acc[d.status] || 0) + 1
  return acc
}, {})

export default function DisputesPage() {
  const [search, setSearch] = useState("")

  const filtered = disputes.filter(d => {
    const q = search.toLowerCase()
    return !q || d.borrower.toLowerCase().includes(q) || d.loanId.toLowerCase().includes(q) || d.type.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col">
      <Header
        title="Disputes"
        description="Manage borrower disputes and SLA deadlines"
        actions={
          <Button size="sm" className="gap-2 text-xs">
            <AlertTriangle className="h-3.5 w-3.5" />
            Flag Dispute
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Open", value: statusCounts.OPEN || 0, icon: <AlertTriangle className="h-4 w-4" />, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Investigating", value: statusCounts.INVESTIGATING || 0, icon: <Search className="h-4 w-4" />, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Resolved", value: statusCounts.RESOLVED || 0, icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Escalated", value: statusCounts.ESCALATED || 0, icon: <Clock className="h-4 w-4" />, color: "text-purple-500", bg: "bg-purple-500/10" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", s.bg)}>
                  <span className={s.color}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
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
                placeholder="Search disputes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-8 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px]">
              <thead className="border-b border-border">
                <tr>
                  {["Borrower", "Loan ID", "Type", "Amount", "Filed", "SLA Deadline", "SLA", "Status", "Assigned To"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(dispute => {
                  const sla = getSLAStatus(dispute.slaDeadline)
                  return (
                    <tr key={dispute.id} className="hover:bg-muted/40 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-foreground">{dispute.borrower}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-muted-foreground">{dispute.loanId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-foreground">{dispute.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-foreground monospace-nums">
                          {formatCurrency(dispute.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(dispute.filedAt)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-medium", SLA_STYLE[sla])}>
                          {formatDate(dispute.slaDeadline)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize", SLA_BADGE[sla])}>
                          {sla}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", STATUS_STYLE[dispute.status])}>
                          {dispute.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{dispute.assignedTo}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border px-4 py-2.5">
            <span className="text-xs text-muted-foreground">{filtered.length} dispute{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
