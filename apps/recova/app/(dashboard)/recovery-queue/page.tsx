"use client"

import { useState, useMemo } from "react"
import { Search, Filter, Download, RefreshCcw, SlidersHorizontal } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoanStateBadge } from "@/components/recovery/loan-state-badge"
import { LoanCaseDrawer } from "@/components/recovery/loan-case-drawer"
import { loans, type Loan, type LoanState } from "@/lib/mock-data"
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils"
import { cn } from "@/lib/utils"

const STATE_TABS: { label: string; state: LoanState | "ALL" }[] = [
  { label: "All", state: "ALL" },
  { label: "In Recovery", state: "IN_RECOVERY" },
  { label: "At Risk", state: "AT_RISK" },
  { label: "Overdue", state: "OVERDUE" },
  { label: "Partial", state: "PARTIALLY_RECOVERED" },
  { label: "Dispute", state: "DISPUTE_OPEN" },
  { label: "Legal", state: "LEGAL_REVIEW" },
  { label: "Failed", state: "RECOVERY_FAILED" },
]

const RAIL_COLORS: Record<string, string> = {
  NDD: "bg-primary/10 text-primary",
  REMITA: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  EASY_PAY: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  MANUAL: "bg-muted text-muted-foreground",
}

const TIER_LABELS: Record<string, string> = {
  TIER_1: "T1",
  TIER_2: "T2",
  TIER_3: "T3",
  LEGAL: "LGL",
}

export default function RecoveryQueuePage() {
  const [activeState, setActiveState] = useState<LoanState | "ALL">("ALL")
  const [search, setSearch] = useState("")
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = useMemo(() => {
    let list = loans
    if (activeState !== "ALL") list = list.filter(l => l.state === activeState)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(l =>
        l.borrower.toLowerCase().includes(q) ||
        l.loanId.toLowerCase().includes(q) ||
        (l.dro ?? "").toLowerCase().includes(q)
      )
    }
    return list
  }, [activeState, search])

  function openCase(loan: Loan) {
    setSelectedLoan(loan)
    setDrawerOpen(true)
  }

  const countByState = (state: LoanState | "ALL") =>
    state === "ALL" ? loans.length : loans.filter(l => l.state === state).length

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Recovery Queue"
        description="Manage all active loan recovery cases"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            <Button size="sm" className="gap-2 text-xs">
              <RefreshCcw className="h-3.5 w-3.5" />
              Sync
            </Button>
          </div>
        }
      />

      <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 gap-4">
        {/* Search + filter bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search borrower, loan ID, officer…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </Button>
        </div>

        {/* Tabs + table */}
        <div className="flex-1 flex flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border overflow-x-auto no-scrollbar">
            <div className="flex px-4 pt-1 gap-0.5 min-w-max">
              {STATE_TABS.map(tab => {
                const count = countByState(tab.state)
                const isActive = activeState === tab.state
                return (
                  <button
                    key={tab.state}
                    onClick={() => setActiveState(tab.state)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors",
                      isActive
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <Search className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">No cases found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[800px]">
                <thead className="sticky top-0 bg-card border-b border-border z-10">
                  <tr>
                    {["Borrower", "Loan ID", "Outstanding", "DPD", "Rail", "Tier", "DRO", "Last Action", "State"].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(loan => (
                    <tr
                      key={loan.id}
                      onClick={() => openCase(loan)}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground leading-none">{loan.borrower}</span>
                          <span className="text-[11px] text-muted-foreground mt-0.5">{loan.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-muted-foreground">{loan.loanId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-foreground monospace-nums">
                          {formatCurrency(loan.outstanding)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-sm font-bold monospace-nums",
                            loan.dpd >= 90 ? "text-red-500" :
                            loan.dpd >= 30 ? "text-amber-500" :
                            "text-foreground"
                          )}
                        >
                          {loan.dpd}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                            RAIL_COLORS[loan.rail] ?? "bg-muted text-muted-foreground"
                          )}
                        >
                          {loan.rail}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground font-medium">
                          {TIER_LABELS[loan.tier] ?? loan.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground">{loan.dro?.split(" ")[0] ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatRelativeTime(loan.updatedAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <LoanStateBadge state={loan.state} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {filtered.length} case{filtered.length !== 1 ? "s" : ""} shown
            </span>
            <span className="text-xs text-muted-foreground">
              Click a row to open case details
            </span>
          </div>
        </div>
      </div>

      <LoanCaseDrawer
        loan={selectedLoan}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}
