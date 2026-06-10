"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, ArrowRight, Shield } from "lucide-react"
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils"
import {
  orchestrationKPIs,
  recoveryTasks,
  accountProfiles,
  orchestratorEvents,
  type RecoveryTaskState,
  type FailureReasonCode,
  type OrchestratorEventType,
} from "@/lib/mock-data"

// ─── Config ───────────────────────────────────────────────────────────────────

const TASK_STATE: Record<RecoveryTaskState, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-muted text-muted-foreground border-border" },
  IN_PROGRESS: { label: "Executing", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  RETRY_PENDING: { label: "Retry Pending", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  SUCCESS: { label: "Success", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  PARTIAL: { label: "Partial", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  FAILED: { label: "Failed", className: "bg-red-500/10 text-red-600 border-red-500/20" },
  PAUSED: { label: "Paused", className: "bg-muted text-muted-foreground border-border" },
  ESCALATED: { label: "Escalated", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
}

const FAILURE_LABEL: Partial<Record<FailureReasonCode, string>> = {
  INSUFFICIENT_FUNDS: "Insufficient funds",
  NO_MANDATE: "No mandate",
  MANDATE_REVOKED: "Mandate revoked",
  BANK_TIMEOUT: "Bank timeout",
  DO_NOT_HONOR: "Do not honor",
  ACCOUNT_CLOSED: "Account closed",
  SYSTEM_ERROR: "System error",
}

const RAIL_STYLE: Record<string, string> = {
  NDD: "bg-primary/10 text-primary border-primary/20",
  REMITA: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  EASY_PAY: "bg-pink-500/10 text-pink-600 border-pink-500/20",
}

const EVENT_CONFIG: Record<OrchestratorEventType, { label: string; className: string }> = {
  DEBIT_INITIATED: { label: "Initiated", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  DEBIT_SUCCESS: { label: "Success", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  DEBIT_FAILED: { label: "Failed", className: "bg-red-500/10 text-red-600 border-red-500/20" },
  PARTIAL_RECOVERY: { label: "Partial", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  RETRY_SCHEDULED: { label: "Retry Sched.", className: "bg-muted text-muted-foreground border-border" },
  ESCALATION_TRIGGERED: { label: "Escalated", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
}

const RETRY_STRATEGY = [
  { level: 0, timing: "T0", description: "All candidate accounts", accounts: "All" },
  { level: 1, timing: "+24h", description: "All candidate accounts", accounts: "All" },
  { level: 2, timing: "+72h", description: "Top 3 ranked accounts only", accounts: "Top 3" },
  { level: 3, timing: "+7d", description: "Top 1 ranked account only", accounts: "Top 1" },
]

const PIPELINE_STEPS = [
  { step: 1, label: "Candidate Selection", sub: "BVN-linked + mandated accounts" },
  { step: 2, label: "Account Ranking", sub: "Inflow × recency × success" },
  { step: 3, label: "Rail Routing", sub: "NDD → EasyPay fallback" },
  { step: 4, label: "Debit Execution", sub: "Full or partial debit" },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function RecoveryOrchestrationPage() {
  const kpis = orchestrationKPIs

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 flex h-14 items-center border-b bg-card/80 px-6 backdrop-blur-sm">
        <div>
          <h1 className="text-sm font-semibold">Recovery Orchestration Engine</h1>
          <p className="text-xs text-muted-foreground">Candidate selection · account ranking · rail routing · retry orchestration</p>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        {/* KPI bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mean Recovery / Loan</p>
            <p className="mt-2 text-2xl font-bold tabular-nums">{formatCurrency(kpis.meanRecoveryPerLoan)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{kpis.activeTasksToday.toLocaleString()} active tasks today</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Debit Success Rate</p>
            <div className="mt-2 flex items-end justify-between">
              <p className={cn("text-2xl font-bold tabular-nums", kpis.debitSuccessPerAttempt >= 75 ? "text-emerald-600" : "text-red-600")}>
                {kpis.debitSuccessPerAttempt}%
              </p>
              <span className="text-xs text-muted-foreground">target 75%</span>
            </div>
            <Progress value={kpis.debitSuccessPerAttempt} className="mt-2 h-1.5" />
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Retry Yield Rate</p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-2xl font-bold tabular-nums text-amber-600">{kpis.retryYieldRate}%</p>
              <span className="text-xs text-muted-foreground">of retries succeed</span>
            </div>
            <Progress value={kpis.retryYieldRate} className="mt-2 h-1.5 [&>div]:bg-amber-500" />
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cost per ₦ Recovered</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">₦{kpis.costPerRecoveredNaira}</p>
            <p className="mt-1 text-xs text-muted-foreground">₦{(kpis.costPerRecoveredNaira * 1000).toFixed(1)} per ₦1,000</p>
          </CardContent></Card>
        </div>

        {/* Pipeline stepper */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {PIPELINE_STEPS.map((s, i) => (
            <div key={s.step} className="flex items-center gap-1 flex-1 min-w-[140px]">
              <div className="flex-1 rounded-xl border bg-card p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shrink-0">{s.step}</span>
                  <p className="text-xs font-semibold">{s.label}</p>
                </div>
                <p className="text-[10px] text-muted-foreground">{s.sub}</p>
              </div>
              {i < PIPELINE_STEPS.length - 1 && <ArrowRight size={14} className="shrink-0 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Active tasks", value: kpis.activeTasksToday.toLocaleString(), color: "text-foreground" },
            { label: "Successful today", value: kpis.successfulToday.toLocaleString(), color: "text-emerald-600" },
            { label: "Pending retries", value: kpis.pendingRetries.toLocaleString(), color: "text-amber-600" },
            { label: "Escalated today", value: kpis.escalatedToday.toLocaleString(), color: "text-orange-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-card px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className={cn("text-sm font-bold tabular-nums", s.color)}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tasks">
          <TabsList className="h-9">
            <TabsTrigger value="tasks" className="text-xs gap-1.5">
              Active Tasks
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">{recoveryTasks.length}</span>
            </TabsTrigger>
            <TabsTrigger value="retry" className="text-xs">Retry Schedule</TabsTrigger>
            <TabsTrigger value="accounts" className="text-xs gap-1.5">
              Account Profiles
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">{accountProfiles.length}</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="text-xs gap-1.5">
              Event Log
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">{orchestratorEvents.length}</span>
            </TabsTrigger>
          </TabsList>

          {/* Active Tasks */}
          <TabsContent value="tasks" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Task / Loan</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Borrower</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Amount Due</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Retry</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">State</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Rail</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Last Failure</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Guardrail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recoveryTasks.map((t) => {
                      const stateCfg = TASK_STATE[t.state]
                      return (
                        <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-mono text-xs">{t.id}</p>
                            <p className="text-xs text-muted-foreground font-mono">{t.loanId} · DPD {t.dpd}</p>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">{t.borrower}</td>
                          <td className="px-4 py-3 text-right">
                            <p className="text-xs font-semibold tabular-nums">{formatCurrency(t.amountDue)}</p>
                            <p className="text-[10px] text-muted-foreground">{formatCurrency(t.outstandingBalance)} bal.</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-semibold">{t.retryCount}</span>
                              <span className="text-xs text-muted-foreground">/ {t.maxRetries}</span>
                            </div>
                            {t.nextRetryAt && (
                              <p className="text-[10px] text-amber-600">{formatRelativeTime(t.nextRetryAt)}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={cn("border text-xs font-medium", stateCfg.className)}>{stateCfg.label}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            {t.selectedRail ? (
                              <Badge className={cn("border text-xs font-medium", RAIL_STYLE[t.selectedRail])}>{t.selectedRail}</Badge>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-muted-foreground">
                              {t.lastFailureReason ? (FAILURE_LABEL[t.lastFailureReason] ?? t.lastFailureReason) : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {t.guardRailBlocked ? (
                              <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                                <Shield size={12} />
                                <span>{t.guardRailReason?.replace(/_/g, " ").toLowerCase()}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-xs text-emerald-600">
                                <CheckCircle2 size={12} />
                                <span>Clear</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Retry Schedule */}
          <TabsContent value="retry" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {RETRY_STRATEGY.map((r) => {
                const tasksAtLevel = recoveryTasks.filter((t) => t.retryCount === r.level)
                return (
                  <Card key={r.level}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{r.level}</span>
                        <span className="text-xs font-mono font-semibold text-muted-foreground">{r.timing}</span>
                      </div>
                      <p className="text-xs font-semibold mb-0.5">Level {r.level}</p>
                      <p className="text-[10px] text-muted-foreground mb-3">{r.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">{r.accounts}</Badge>
                        <span className="text-xs font-semibold tabular-nums">{tasksAtLevel.length} tasks</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Level</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Task</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Borrower</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Strategy</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Last Failure</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Next Retry</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recoveryTasks.filter((t) => t.retryCount > 0 || t.state === "RETRY_PENDING").map((t) => {
                      const strategy = RETRY_STRATEGY[Math.min(t.retryCount, 3)]
                      const stateCfg = TASK_STATE[t.state]
                      return (
                        <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                          <td className="px-4 py-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {t.retryCount}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-mono text-xs">{t.id}</p>
                            <p className="text-xs text-muted-foreground font-mono">{t.loanId}</p>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">{t.borrower}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-muted-foreground">{strategy.accounts} · {strategy.timing}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-muted-foreground">
                              {t.lastFailureReason ? (FAILURE_LABEL[t.lastFailureReason] ?? t.lastFailureReason) : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {t.nextRetryAt
                              ? <span className="text-xs tabular-nums text-amber-600">{formatRelativeTime(t.nextRetryAt)}</span>
                              : <span className="text-xs text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={cn("border text-xs font-medium", stateCfg.className)}>{stateCfg.label}</Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Profiles */}
          <TabsContent value="accounts" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Account</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Loan</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Mandate</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Balance</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground w-28">Rank Score</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Inflow</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Risk</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Selected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {accountProfiles.map((ap) => (
                      <tr key={ap.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium">{ap.bank}</p>
                          <p className="text-xs text-muted-foreground font-mono">****{ap.accountNumber.slice(-4)}</p>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{ap.loanId}</td>
                        <td className="px-4 py-3">
                          <Badge className={cn(
                            "border text-xs font-medium",
                            ap.mandateStatus === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : ap.mandateStatus === "FAILED" ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : "bg-muted text-muted-foreground border-border"
                          )}>
                            {ap.mandateStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-xs tabular-nums">
                          {ap.lastBalance !== null ? formatCurrency(ap.lastBalance) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <span className={cn("text-xs font-semibold tabular-nums",
                              ap.rankScore >= 0.7 ? "text-emerald-600" : ap.rankScore >= 0.4 ? "text-amber-600" : "text-red-600"
                            )}>
                              {(ap.rankScore * 100).toFixed(0)}
                            </span>
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn("h-full rounded-full", ap.rankScore >= 0.7 ? "bg-emerald-500" : ap.rankScore >= 0.4 ? "bg-amber-500" : "bg-red-500")}
                                style={{ width: `${ap.rankScore * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-xs tabular-nums">{(ap.inflowScore * 100).toFixed(0)}%</td>
                        <td className="px-4 py-3 text-right text-xs tabular-nums">
                          <span className={ap.riskScore >= 0.5 ? "text-red-600" : "text-muted-foreground"}>
                            {(ap.riskScore * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {ap.isSelected ? (
                            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                              <CheckCircle2 size={13} /> Selected
                            </div>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Event Log */}
          <TabsContent value="events" className="mt-4">
            <Card>
              <CardContent className="p-0 divide-y">
                {orchestratorEvents.map((e) => {
                  const cfg = EVENT_CONFIG[e.type]
                  return (
                    <div key={e.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/40 transition-colors">
                      <div className="mt-0.5 shrink-0">
                        <Badge className={cn("border text-[10px] font-medium whitespace-nowrap", cfg.className)}>
                          {cfg.label}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-sm font-medium">
                          {e.borrower}
                          <span className="text-muted-foreground font-mono text-xs"> · {e.loanId}</span>
                          {e.retryLevel !== null && (
                            <span className="ml-2 text-[10px] bg-muted text-muted-foreground rounded px-1 py-0.5">retry #{e.retryLevel}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{e.detail}</p>
                      </div>
                      <div className="shrink-0 text-right space-y-0.5">
                        <p className="text-xs text-muted-foreground tabular-nums">{formatRelativeTime(e.timestamp)}</p>
                        {e.amount !== null && (
                          <p className="text-xs font-semibold tabular-nums">{formatCurrency(e.amount)}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
