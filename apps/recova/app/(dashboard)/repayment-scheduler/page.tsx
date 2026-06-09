"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import {
  schedulerKPIs,
  loanScheduleSummaries,
  repaymentObligations,
  penaltyRecords,
  type ObligationStatus,
} from "@/lib/mock-data"

// ─── Config ───────────────────────────────────────────────────────────────────

const OBL_STATUS: Record<ObligationStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-muted text-muted-foreground border-border" },
  DUE: { label: "Due", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  PARTIALLY_PAID: { label: "Partial", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  PAID: { label: "Paid", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  DEFAULTED: { label: "Defaulted", className: "bg-red-500/10 text-red-600 border-red-500/20" },
  OVERDUE: { label: "Overdue", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  RESTRUCTURED: { label: "Restructured", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
}

const AMORTIZATION_STYLE: Record<string, string> = {
  FLAT: "bg-primary/10 text-primary border-primary/20",
  DECLINING_BALANCE: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  BULLET: "bg-orange-500/10 text-orange-600 border-orange-500/20",
}

const STATUS_FILTERS = ["ALL", "DUE", "OVERDUE", "PARTIALLY_PAID", "PAID", "DEFAULTED"] as const

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function RepaymentSchedulerPage() {
  const kpis = schedulerKPIs
  const [oblStatusFilter, setOblStatusFilter] = useState<string>("ALL")
  const [expandedLoans, setExpandedLoans] = useState<Set<string>>(new Set(["LN-28471"]))

  const toggleLoan = (loanId: string) => {
    setExpandedLoans((prev) => {
      const next = new Set(prev)
      if (next.has(loanId)) next.delete(loanId)
      else next.add(loanId)
      return next
    })
  }

  const filteredObligations = useMemo(() => {
    if (oblStatusFilter === "ALL") return repaymentObligations
    return repaymentObligations.filter((o) => o.status === oblStatusFilter)
  }, [oblStatusFilter])

  const oblStatusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: repaymentObligations.length }
    repaymentObligations.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1 })
    return counts
  }, [])

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 flex h-14 items-center border-b bg-card/80 px-6 backdrop-blur-sm">
        <div>
          <h1 className="text-sm font-semibold">Loan Management & Repayment Scheduler</h1>
          <p className="text-xs text-muted-foreground">Obligation units · amortization schedules · payment application · penalty engine</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* KPI bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Obligation Accuracy</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-2xl font-bold tabular-nums text-emerald-600">{kpis.obligationAccuracy}%</p>
                <span className="text-xs text-muted-foreground">target 100%</span>
              </div>
              <Progress value={kpis.obligationAccuracy} className="mt-2 h-1.5 [&>div]:bg-emerald-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Alloc. Errors</p>
              <div className="mt-2 flex items-end justify-between">
                <p className={cn("text-2xl font-bold tabular-nums", kpis.paymentAllocationErrors > 0 ? "text-red-600" : "text-emerald-600")}>
                  {kpis.paymentAllocationErrors}
                </p>
                <span className="text-xs text-muted-foreground">target 0</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{kpis.paymentAllocationErrors} need manual review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Penalty Correctness</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-2xl font-bold tabular-nums text-emerald-600">{kpis.penaltyCorrectness}%</p>
                <span className="text-xs text-muted-foreground">audit req.</span>
              </div>
              <Progress value={kpis.penaltyCorrectness} className="mt-2 h-1.5 [&>div]:bg-emerald-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Outstanding</p>
              <div className="mt-2">
                <p className="text-2xl font-bold tabular-nums text-red-600">{formatCurrency(kpis.totalOutstanding)}</p>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs">
                <span className="text-emerald-600">{kpis.paidObligations} paid</span>
                <span className="text-red-600">{kpis.overdueObligations} overdue</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total obligations", value: kpis.totalObligations, color: "text-foreground" },
            { label: "Paid", value: kpis.paidObligations, color: "text-emerald-600" },
            { label: "Overdue / Defaulted", value: kpis.overdueObligations, color: "text-red-600" },
            { label: "Active schedules", value: loanScheduleSummaries.length, color: "text-amber-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-card px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className={cn("text-sm font-bold tabular-nums", s.color)}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="schedule">
          <TabsList className="h-9">
            <TabsTrigger value="schedule" className="text-xs">Repayment Schedule</TabsTrigger>
            <TabsTrigger value="obligations" className="text-xs gap-1.5">
              All Obligations
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">{repaymentObligations.length}</span>
            </TabsTrigger>
            <TabsTrigger value="penalties" className="text-xs gap-1.5">
              Penalties
              <span className="rounded-full bg-red-500/10 text-red-600 px-1.5 py-0.5 text-[10px] font-semibold">
                {penaltyRecords.filter((p) => p.status === "APPLIED").length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* ── Schedule Tab ── */}
          <TabsContent value="schedule" className="mt-4 space-y-3">
            {loanScheduleSummaries.map((loan) => {
              const loanObligations = repaymentObligations.filter((o) => o.loanId === loan.loanId)
              const isExpanded = expandedLoans.has(loan.loanId)
              const paidPct = Math.round((loan.totalPaid / loan.totalRepayable) * 100)
              const outstanding = loan.totalRepayable - loan.totalPaid
              return (
                <Card key={loan.loanId}>
                  <div
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleLoan(loan.loanId)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{loan.borrower}</span>
                        <span className="font-mono text-xs text-muted-foreground">{loan.loanId}</span>
                        <Badge className={cn("border text-[10px] font-medium", AMORTIZATION_STYLE[loan.amortizationType])}>
                          {loan.amortizationType.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{loan.interestRate}% p.a. · {loan.tenureMonths}m</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{formatCurrency(loan.totalPaid)} paid of {formatCurrency(loan.totalRepayable)}</span>
                          <span className="font-semibold tabular-nums">{paidPct}%</span>
                        </div>
                        <Progress value={paidPct} className="h-1.5" />
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">Outstanding</p>
                      <p className="text-sm font-bold tabular-nums text-red-600">{formatCurrency(outstanding)}</p>
                    </div>
                    {isExpanded
                      ? <ChevronDown size={16} className="shrink-0 text-muted-foreground" />
                      : <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
                    }
                  </div>

                  {isExpanded && (
                    <div className="border-t">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b bg-muted/30">
                            <th className="px-4 py-2 text-center font-semibold text-muted-foreground w-12">#</th>
                            <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Due Date</th>
                            <th className="px-4 py-2 text-right font-semibold text-muted-foreground">Principal</th>
                            <th className="px-4 py-2 text-right font-semibold text-muted-foreground">Interest</th>
                            <th className="px-4 py-2 text-right font-semibold text-muted-foreground">Penalty</th>
                            <th className="px-4 py-2 text-right font-semibold text-muted-foreground">Total Due</th>
                            <th className="px-4 py-2 text-right font-semibold text-muted-foreground">Outstanding</th>
                            <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {loanObligations.map((obl) => {
                            const cfg = OBL_STATUS[obl.status]
                            return (
                              <tr key={obl.id} className="hover:bg-muted/20">
                                <td className="px-4 py-2.5 text-center font-mono text-muted-foreground">{obl.period}</td>
                                <td className="px-4 py-2.5 tabular-nums">
                                  {new Date(obl.dueDate).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                                </td>
                                <td className="px-4 py-2.5 text-right tabular-nums">{formatCurrency(obl.principalComponent)}</td>
                                <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{formatCurrency(obl.interestComponent)}</td>
                                <td className="px-4 py-2.5 text-right tabular-nums">
                                  {obl.penaltyComponent > 0
                                    ? <span className="text-red-600 font-medium">{formatCurrency(obl.penaltyComponent)}</span>
                                    : <span className="text-muted-foreground">—</span>}
                                </td>
                                <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{formatCurrency(obl.totalDue)}</td>
                                <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                                  {obl.outstandingAmount > 0
                                    ? <span className="text-red-600">{formatCurrency(obl.outstandingAmount)}</span>
                                    : <span className="text-emerald-600">—</span>}
                                </td>
                                <td className="px-4 py-2.5">
                                  <Badge className={cn("border text-[10px] font-medium", cfg.className)}>{cfg.label}</Badge>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              )
            })}
          </TabsContent>

          {/* ── All Obligations Tab ── */}
          <TabsContent value="obligations" className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setOblStatusFilter(s)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    oblStatusFilter === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s === "ALL" ? "All" : (OBL_STATUS[s as ObligationStatus]?.label ?? s)}
                  <span className="tabular-nums">{oblStatusCounts[s] ?? 0}</span>
                </button>
              ))}
            </div>

            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Obligation</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Borrower / Loan</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Due Date</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Principal</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Interest</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Penalty</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Total</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Outstanding</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredObligations.map((obl) => {
                      const cfg = OBL_STATUS[obl.status]
                      return (
                        <tr key={obl.id} className="hover:bg-muted/40 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-mono text-xs">{obl.id}</p>
                            <p className="text-[10px] text-muted-foreground">Period {obl.period}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-sm">{obl.borrower}</p>
                            <p className="text-xs text-muted-foreground font-mono">{obl.loanId}</p>
                          </td>
                          <td className="px-4 py-3 text-xs tabular-nums">
                            {new Date(obl.dueDate).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-4 py-3 text-right text-xs tabular-nums">{formatCurrency(obl.principalComponent)}</td>
                          <td className="px-4 py-3 text-right text-xs tabular-nums text-muted-foreground">{formatCurrency(obl.interestComponent)}</td>
                          <td className="px-4 py-3 text-right text-xs tabular-nums">
                            {obl.penaltyComponent > 0
                              ? <span className="text-red-600">{formatCurrency(obl.penaltyComponent)}</span>
                              : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3 text-right text-xs font-semibold tabular-nums">{formatCurrency(obl.totalDue)}</td>
                          <td className="px-4 py-3 text-right text-xs font-semibold tabular-nums">
                            {obl.outstandingAmount > 0
                              ? <span className="text-red-600">{formatCurrency(obl.outstandingAmount)}</span>
                              : <span className="text-emerald-600">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={cn("border text-xs font-medium", cfg.className)}>{cfg.label}</Badge>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredObligations.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                          No obligations match the selected filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Penalties Tab ── */}
          <TabsContent value="penalties" className="mt-4 space-y-3">
            <div className="rounded-xl border bg-amber-500/5 border-amber-500/20 px-4 py-3 flex items-start gap-3">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Penalty engine triggers when an obligation reaches DEFAULTED status and the 14-day grace period has passed.
                Applied penalties are auditable — they can only be waived, not deleted.
              </p>
            </div>
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Penalty</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Borrower / Loan</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Obligation</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Type</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Rate</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Amount</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Applied</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {penaltyRecords.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{p.borrower}</p>
                          <p className="text-xs text-muted-foreground font-mono">{p.loanId}</p>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.obligationId}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">{p.type}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-xs tabular-nums">{p.value}%</td>
                        <td className="px-4 py-3 text-right text-xs font-semibold tabular-nums text-red-600">{formatCurrency(p.amount)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                          {new Date(p.appliedAt).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={cn(
                            "border text-xs font-medium",
                            p.status === "APPLIED" ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : p.status === "PAID" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-muted text-muted-foreground border-border"
                          )}>
                            {p.status === "APPLIED" ? "Applied" : p.status === "PAID" ? "Paid" : "Waived"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
