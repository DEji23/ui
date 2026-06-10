"use client"

import { useState } from "react"
import { AlertTriangle, TrendingDown, TrendingUp, ArrowRight, Zap, RefreshCcw, XCircle, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  recoveryTodayStats,
  railPerformance,
  liveIncidents,
  actionQueueCounts,
  type Incident,
} from "@/lib/mock-data"
import { formatRelativeTime } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const SEVERITY_STYLE: Record<string, { border: string; bg: string; dot: string; icon: React.ReactNode }> = {
  CRITICAL: { border: "border-red-200 dark:border-red-900", bg: "bg-red-50 dark:bg-red-950/30", dot: "bg-red-500 animate-pulse", icon: <XCircle className="h-3.5 w-3.5 text-red-500" /> },
  WARNING: { border: "border-amber-200 dark:border-amber-900", bg: "bg-amber-50 dark:bg-amber-950/20", dot: "bg-amber-500", icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> },
  INFO: { border: "border-border", bg: "bg-muted/30", dot: "bg-blue-500", icon: <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> },
}

const RAIL_STYLE: Record<string, { bar: string; text: string }> = {
  good: { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  warning: { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  critical: { bar: "bg-red-500", text: "text-red-600 dark:text-red-400" },
}

const QUEUE_LINKS = [
  { key: "failedRecoveries", label: "Failed Recoveries", href: "/action-queues?tab=failed", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
  { key: "mandateIssues", label: "Mandate Issues", href: "/action-queues?tab=mandates", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  { key: "disputes", label: "Open Disputes", href: "/disputes", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
  { key: "reconciliationExceptions", label: "Recon Exceptions", href: "/action-queues?tab=recon", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
  { key: "collectionsCases", label: "Collections Cases", href: "/collections", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  { key: "pendingApprovals", label: "Pending Approvals", href: "/maker-checker", color: "text-primary", bg: "bg-primary/10" },
] as const

export default function DashboardPage() {
  const [incidents, setIncidents] = useState(liveIncidents)
  const activeIncidents = incidents.filter(i => !i.resolved)
  const criticalCount = activeIncidents.filter(i => i.severity === "CRITICAL").length

  function resolveIncident(id: string) {
    setIncidents(inc => inc.map(i => i.id === id ? { ...i, resolved: true } : i))
    toast.success("Incident marked as resolved")
  }

  const successRateOk = recoveryTodayStats.successRate >= recoveryTodayStats.successRateTarget

  return (
    <div className="flex flex-col">
      <Header
        title="Operations Command Center"
        description="Real-time recovery control and intervention"
        actions={
          criticalCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-200 dark:border-red-900 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                {criticalCount} critical incident{criticalCount !== 1 ? "s" : ""}
              </span>
            </div>
          )
        }
      />

      <div className="p-4 sm:p-6 space-y-5">

        {/* Row 1 — Recovery Health + Rail Performance */}
        <div className="grid lg:grid-cols-3 gap-4">

          {/* Recovery Health */}
          <div className="lg:col-span-1">
            <Card className={cn("h-full", !successRateOk && "border-red-200 dark:border-red-900")}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Recovery Today</CardTitle>
                  <div className={cn("flex items-center gap-1 text-xs font-semibold rounded-md px-2 py-0.5",
                    successRateOk ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse"
                  )}>
                    {successRateOk ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {!successRateOk && "Alert threshold breached"}
                    {successRateOk && "On target"}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-muted/50 p-3 text-center">
                    <p className="text-[11px] text-muted-foreground">Attempted</p>
                    <p className="text-lg font-bold text-foreground monospace-nums">{recoveryTodayStats.attempted.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 p-3 text-center">
                    <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70">Successful</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 monospace-nums">{recoveryTodayStats.successful.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-red-500/10 p-3 text-center">
                    <p className="text-[11px] text-red-600/70 dark:text-red-400/70">Failed</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400 monospace-nums">{recoveryTodayStats.failed.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Success Rate</span>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-bold monospace-nums", successRateOk ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                        {recoveryTodayStats.successRate}%
                      </span>
                      <span className="text-[11px] text-muted-foreground">target {recoveryTodayStats.successRateTarget}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", successRateOk ? "bg-emerald-500" : "bg-red-500")}
                      style={{ width: `${recoveryTodayStats.successRate}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-red-500">
                    <TrendingDown className="h-3 w-3" />
                    {Math.abs(recoveryTodayStats.trend)}% vs yesterday
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rail Performance */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Rail Performance</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs gap-1 h-7" asChild>
                    <Link href="/system-health">Monitor <ArrowRight className="h-3 w-3" /></Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {railPerformance.map(r => {
                  const style = RAIL_STYLE[r.status]
                  return (
                    <div key={r.rail} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground w-16">{r.rail}</span>
                          <span className={cn("text-xs font-bold monospace-nums", style.text)}>{r.successRate}%</span>
                          {r.status !== "good" && (
                            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded",
                              r.status === "critical" ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            )}>
                              {r.status === "critical" ? "↓ CRITICAL" : "⚠ WARNING"}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{r.successful.toLocaleString()} / {r.attempted.toLocaleString()}</span>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => toast.info(`Switching ${r.rail} to priority mode`)}>
                              <Zap className="h-2.5 w-2.5 mr-0.5" /> Prioritise
                            </Button>
                            {r.status === "critical" && (
                              <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => toast.warning(`${r.rail} throttle enabled`)}>
                                Throttle
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", style.bar)} style={{ width: `${r.successRate}%` }} />
                        <div className="absolute top-0 h-full w-px bg-foreground/20" style={{ left: `${r.target}%` }} title={`Target: ${r.target}%`} />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Target: {r.target}%</p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Row 2 — Live Incident Feed + Action Queue Summary */}
        <div className="grid lg:grid-cols-5 gap-4">

          {/* Incident Feed */}
          <div className="lg:col-span-3">
            <Card className={cn(activeIncidents.length > 0 && "border-red-200/60 dark:border-red-900/60")}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-semibold">Live Incident Feed</CardTitle>
                    {activeIncidents.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 rounded px-1.5 py-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        {activeIncidents.length} active
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
                    <Link href="/system-health">All incidents →</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {incidents.slice(0, 5).map(inc => {
                    const s = SEVERITY_STYLE[inc.severity]
                    return (
                      <div
                        key={inc.id}
                        className={cn(
                          "flex items-start gap-3 px-5 py-3 transition-colors",
                          inc.resolved ? "opacity-50" : s.bg
                        )}
                      >
                        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                          {!inc.resolved && <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />}
                          {s.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground leading-snug">{inc.message}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{formatRelativeTime(inc.timestamp)}</span>
                            {inc.rail && <span className="text-[10px] text-muted-foreground">· {inc.rail}</span>}
                            {inc.bank && <span className="text-[10px] text-muted-foreground">· {inc.bank}</span>}
                          </div>
                        </div>
                        {!inc.resolved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={() => resolveIncident(inc.id)}
                          >
                            Resolve
                          </Button>
                        )}
                        {inc.resolved && <span className="text-[10px] text-emerald-500 shrink-0 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Resolved</span>}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Queue Summary */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Action Queues</CardTitle>
                <p className="text-xs text-muted-foreground">Tasks requiring intervention</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {QUEUE_LINKS.map(q => {
                    const count = actionQueueCounts[q.key]
                    return (
                      <Link
                        key={q.key}
                        href={q.href}
                        className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={cn("h-2 w-2 rounded-full", q.bg.replace("bg-", "bg-").replace("/10", ""))} />
                          <span className="text-sm text-foreground group-hover:text-primary transition-colors">{q.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-bold monospace-nums", q.color)}>{count}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
                <div className="px-5 py-3 border-t border-border">
                  <Button size="sm" className="w-full text-xs gap-2" asChild>
                    <Link href="/action-queues">Open Action Queues <ArrowRight className="h-3.5 w-3.5" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  )
}
