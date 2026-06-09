"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Ban,
  AlertTriangle,
  Activity,
  ArrowRight,
  Timer,
  RefreshCw,
} from "lucide-react"
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils"
import {
  recoveryDecisions,
  throttledAccounts,
  recoveryEvents,
  decisionEngineKPIs,
  type RecoveryDecision,
  type ThrottledAccount,
  type RecoveryEvent,
} from "@/lib/mock-data"
import { toast } from "sonner"

// ─── Config ───────────────────────────────────────────────────────────────────

const DECISION_STATUS = {
  PENDING: { label: "Pending", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  EXECUTED: { label: "Executed", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  FAILED: { label: "Failed", className: "bg-red-500/10 text-red-600 border-red-500/20" },
  SKIPPED: { label: "Skipped", className: "bg-muted text-muted-foreground border-border" },
} as const

const RAIL_STYLE: Record<string, string> = {
  NDD: "bg-primary/10 text-primary border-primary/20",
  REMITA: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  EASY_PAY: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  MANUAL: "bg-muted text-muted-foreground border-border",
}

const TIMING_LABEL: Record<string, string> = {
  RECENT_CREDIT_DETECTED: "Recent credit detected",
  PREDICTED_INFLOW: "Predicted inflow",
  IMMEDIATE_TRIGGER: "Immediate trigger",
  SCHEDULED: "Scheduled",
}

const TIMING_ICON: Record<string, React.ElementType> = {
  RECENT_CREDIT_DETECTED: Zap,
  PREDICTED_INFLOW: Activity,
  IMMEDIATE_TRIGGER: Zap,
  SCHEDULED: Clock,
}

const EVENT_CONFIG: Record<string, { label: string; className: string }> = {
  BALANCE_INCREASE: { label: "Balance Increase", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  MANDATE_ACTIVATED: { label: "Mandate Activated", className: "bg-primary/10 text-primary border-primary/20" },
  PAYMENT_RECEIVED: { label: "Payment Received", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  DEBIT_FAILED: { label: "Debit Failed", className: "bg-red-500/10 text-red-600 border-red-500/20" },
  DISPUTE_OPENED: { label: "Dispute Opened", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  INFLOW_PREDICTED: { label: "Inflow Predicted", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  THROTTLE_APPLIED: { label: "Throttle Applied", className: "bg-red-500/10 text-red-600 border-red-500/20" },
  THROTTLE_RELEASED: { label: "Throttle Released", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
}

const BLOCK_LABEL: Record<string, string> = {
  dispute_active: "Dispute active",
  mandate_revoked: "Mandate revoked",
  account_flagged: "Account flagged",
}

function confidenceColor(score: number): string {
  if (score >= 0.8) return "bg-emerald-500"
  if (score >= 0.6) return "bg-amber-500"
  if (score >= 0.4) return "bg-orange-500"
  return "bg-red-500"
}

function confidenceTextColor(score: number): string {
  if (score >= 0.8) return "text-emerald-600"
  if (score >= 0.6) return "text-amber-600"
  if (score >= 0.4) return "text-orange-600"
  return "text-red-600"
}

// ─── Scoring Row ──────────────────────────────────────────────────────────────

function ScoreRow({
  label,
  weight,
  rawValue,
  contribution,
  positive = true,
}: {
  label: string
  weight: number
  rawValue: number
  contribution: number
  positive?: boolean
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className={cn("text-[10px] font-mono px-1 py-0.5 rounded", positive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600")}>
            {positive ? "+" : "−"}{weight * 100}%
          </span>
          <span className="text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2 tabular-nums">
          <span className="text-muted-foreground">{(rawValue * 100).toFixed(0)}%</span>
          <span className={cn("font-semibold", positive ? "text-emerald-600" : "text-red-600")}>
            {positive ? "+" : "−"}{(contribution * 100).toFixed(2)}
          </span>
        </div>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", positive ? "bg-emerald-500" : "bg-red-500")}
          style={{ width: `${Math.min(rawValue * 100, 100)}%` }}
        />
      </div>
    </div>
  )
}

// ─── Decision Drawer ──────────────────────────────────────────────────────────

function DecisionDrawer({
  decision,
  open,
  onClose,
}: {
  decision: RecoveryDecision | null
  open: boolean
  onClose: () => void
}) {
  if (!decision) return null
  const d = decision

  const statusCfg = DECISION_STATUS[d.status]
  const TimingIcon = TIMING_ICON[d.timingReason] ?? Clock

  const af = d.accountFeatures

  const checks = [
    { label: "Account flagged", passed: true },
    { label: "Dispute active", passed: d.blockReason !== "dispute_active" },
    { label: "Mandate revoked", passed: d.blockReason !== "mandate_revoked" },
  ]

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[480px] sm:w-[520px] overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span className="font-mono text-sm">{d.id}</span>
            <Badge className={cn("border text-xs font-medium", statusCfg.className)}>
              {statusCfg.label}
            </Badge>
          </SheetTitle>
          <div className="text-sm text-muted-foreground">
            {d.borrower} · {d.loanId} · {d.bank}
          </div>
        </SheetHeader>

        <div className="space-y-5 py-5">
          {/* Confidence score */}
          <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-muted">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(${d.confidenceScore >= 0.8 ? "#22c55e" : d.confidenceScore >= 0.6 ? "#f59e0b" : "#ef4444"} ${d.confidenceScore * 360}deg, transparent 0deg)`,
                  borderRadius: "50%",
                  padding: "3px",
                }}
              />
              <div className="absolute inset-[3px] rounded-full bg-card" />
              <span className={cn("relative text-sm font-bold tabular-nums", confidenceTextColor(d.confidenceScore))}>
                {(d.confidenceScore * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Confidence Score</p>
              <p className={cn("text-2xl font-bold tabular-nums", confidenceTextColor(d.confidenceScore))}>
                {(d.confidenceScore * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {d.confidenceScore >= 0.8 ? "Full amount recovery likely" : d.confidenceScore >= 0.6 ? "Partial recovery recommended" : "Low confidence — high risk"}
              </p>
            </div>
          </div>

          {/* Decision output */}
          <div className="rounded-xl border bg-card divide-y">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-muted-foreground">Rail</span>
              <Badge className={cn("border text-xs font-medium", RAIL_STYLE[d.rail])}>{d.rail}</Badge>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-muted-foreground">Amount</span>
              <span className="text-sm font-semibold tabular-nums">{d.amount > 0 ? formatCurrency(d.amount) : "—"}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-muted-foreground">Strategy</span>
              <Badge variant="outline" className="text-xs">{d.amountStrategy} AMOUNT</Badge>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-muted-foreground">Scheduled</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {new Date(d.scheduledAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-muted-foreground">Timing reason</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TimingIcon size={12} />
                {TIMING_LABEL[d.timingReason]}
              </div>
            </div>
          </div>

          {/* Account scoring */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account Score</p>
              <span className="font-mono text-sm font-bold">{(d.accountScore * 100).toFixed(0)} / 100</span>
            </div>
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <p className="text-[10px] font-mono text-muted-foreground border border-dashed rounded px-2 py-1 leading-relaxed">
                score = (0.30 × inflow) + (0.25 × recency) + (0.20 × success_rate) + (0.15 × stability) − (0.10 × failure_rate)
              </p>
              <ScoreRow label="Avg monthly inflow" weight={0.30} rawValue={Math.min(af.avgMonthlyInflow / 1000000, 1)} contribution={0.30 * Math.min(af.avgMonthlyInflow / 1000000, 1)} positive />
              <ScoreRow label="Recency of credit" weight={0.25} rawValue={af.lastCreditAmount / Math.max(af.avgMonthlyInflow, 1)} contribution={0.25 * Math.min(af.lastCreditAmount / Math.max(af.avgMonthlyInflow, 1), 1)} positive />
              <ScoreRow label="Debit success rate" weight={0.20} rawValue={af.lastDebitSuccessRate} contribution={0.20 * af.lastDebitSuccessRate} positive />
              <ScoreRow label="Balance stability" weight={0.15} rawValue={1 - af.balanceVolatility} contribution={0.15 * (1 - af.balanceVolatility)} positive />
              <ScoreRow label="Failure rate penalty" weight={0.10} rawValue={1 - af.lastDebitSuccessRate} contribution={0.10 * (1 - af.lastDebitSuccessRate)} positive={false} />
            </div>
          </div>

          {/* Rail selection reasoning */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rail Selection</p>
            <div className="rounded-xl border bg-card p-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className={cn("h-1.5 w-1.5 rounded-full", d.rail === "NDD" ? "bg-primary" : "bg-muted")} />
                <span>Mandate active: <span className={d.rail === "NDD" ? "text-foreground font-medium" : ""}>{d.rail === "NDD" ? "yes" : "no / inactive"}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn("h-1.5 w-1.5 rounded-full", af.bankReliabilityScore >= 0.7 ? "bg-emerald-500" : "bg-amber-500")} />
                <span>Bank uptime: <span className="text-foreground font-medium">{(af.bankReliabilityScore * 100).toFixed(0)}%</span> reliability</span>
              </div>
              <div className="mt-1 flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <ArrowRight size={12} className="shrink-0" />
                <span className="font-medium text-foreground">
                  {d.rail === "NDD" ? "Using NDD — mandate active, bank uptime good" : d.rail === "REMITA" ? "Using REMITA — mandate inactive or bank uptime low" : "Using EasyPay — NDD/REMITA unavailable"}
                </span>
              </div>
            </div>
          </div>

          {/* Risk checks */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Risk Controls</p>
            <div className="rounded-xl border bg-card divide-y">
              {checks.map((c) => (
                <div key={c.label} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">{c.label}</span>
                  {c.passed ? (
                    <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <CheckCircle2 size={13} />
                      Clear
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                      <XCircle size={13} />
                      Blocked
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Borrower context */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Borrower Context</p>
            <div className="rounded-xl border bg-card divide-y text-xs">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-muted-foreground">Repayment history</span>
                <span className="font-medium">{(d.borrowerFeatures.repaymentHistory * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-muted-foreground">Days past due</span>
                <span className={cn("font-medium", d.borrowerFeatures.dpd >= 30 ? "text-red-600" : "text-foreground")}>{d.borrowerFeatures.dpd}d</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-muted-foreground">Active loans</span>
                <span className="font-medium">{d.borrowerFeatures.loanCount}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-muted-foreground">Dispute history</span>
                <span className={cn("font-medium", d.borrowerFeatures.disputeHistory > 0 ? "text-orange-600" : "text-foreground")}>{d.borrowerFeatures.disputeHistory}</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DecisionEnginePage() {
  const kpis = decisionEngineKPIs
  const [selectedDecision, setSelectedDecision] = useState<RecoveryDecision | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [railFilter, setRailFilter] = useState<string>("ALL")

  const filteredDecisions = useMemo(() => {
    return recoveryDecisions.filter((d) => {
      if (statusFilter !== "ALL" && d.status !== statusFilter) return false
      if (railFilter !== "ALL" && d.rail !== railFilter) return false
      return true
    })
  }, [statusFilter, railFilter])

  function openDecision(d: RecoveryDecision) {
    setSelectedDecision(d)
    setDrawerOpen(true)
  }

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: recoveryDecisions.length, PENDING: 0, EXECUTED: 0, FAILED: 0, SKIPPED: 0 }
    recoveryDecisions.forEach((d) => counts[d.status]++)
    return counts
  }, [])

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-card/80 px-6 backdrop-blur-sm">
        <div>
          <h1 className="text-sm font-semibold">Risk & Recovery Decision Engine</h1>
          <p className="text-xs text-muted-foreground">Adaptive scoring — account, rail, amount, and timing optimisation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => toast.info("Engine re-run scheduled")}>
            <RefreshCw size={13} />
            Re-run engine
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* KPI bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Recovery per attempt */}
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recovery / Attempt</p>
              <div className="mt-2 flex items-end justify-between">
                <p className={cn("text-2xl font-bold tabular-nums", kpis.recoveryPerAttempt < kpis.recoveryPerAttemptTarget ? "text-red-600" : "text-emerald-600")}>
                  {kpis.recoveryPerAttempt}%
                </p>
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <TrendingDown size={13} />
                  <span>target {kpis.recoveryPerAttemptTarget}%</span>
                </div>
              </div>
              <Progress value={kpis.recoveryPerAttempt} className="mt-2 h-1.5" />
            </CardContent>
          </Card>

          {/* Cost per recovery */}
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cost / Successful Recovery</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-2xl font-bold tabular-nums text-emerald-600">₦{kpis.costPerSuccessfulRecovery}</p>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingDown size={13} />
                  <span>target &lt;₦{kpis.costTarget}</span>
                </div>
              </div>
              <Progress value={(kpis.costPerSuccessfulRecovery / kpis.costTarget) * 100} className="mt-2 h-1.5 [&>div]:bg-emerald-500" />
            </CardContent>
          </Card>

          {/* Avg retries */}
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Avg Retries / Loan</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-2xl font-bold tabular-nums text-emerald-600">{kpis.avgRetriesPerLoan}</p>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingDown size={13} />
                  <span>target ≤{kpis.avgRetriesTarget}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">↓</span>
                Trending down — engine improving
              </div>
            </CardContent>
          </Card>

          {/* Time to recovery */}
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Avg Time to Recovery</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-2xl font-bold tabular-nums text-emerald-600">{kpis.avgTimeToRecoveryHours}h</p>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingDown size={13} />
                  <span>target &lt;{kpis.timeToRecoveryTarget}h</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{kpis.executedToday} executed today</span>
                <span className="text-amber-600">{kpis.pendingDecisions} pending</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Decisions today", value: kpis.decisionsToday.toLocaleString(), color: "text-foreground" },
            { label: "Executed", value: kpis.executedToday.toLocaleString(), color: "text-emerald-600" },
            { label: "Pending", value: kpis.pendingDecisions.toLocaleString(), color: "text-amber-600" },
            { label: "Throttled accounts", value: kpis.throttledAccounts.toLocaleString(), color: "text-red-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-card px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className={cn("text-sm font-bold tabular-nums", s.color)}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="queue">
          <TabsList className="h-9">
            <TabsTrigger value="queue" className="text-xs gap-1.5">
              Decision Queue
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">{recoveryDecisions.length}</span>
            </TabsTrigger>
            <TabsTrigger value="throttled" className="text-xs gap-1.5">
              Throttled Accounts
              <span className="rounded-full bg-red-500/10 text-red-600 px-1.5 py-0.5 text-[10px] font-semibold">
                {throttledAccounts.filter((t) => t.status === "SUSPENDED").length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="events" className="text-xs gap-1.5">
              Event Log
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">{recoveryEvents.length}</span>
            </TabsTrigger>
          </TabsList>

          {/* ── Decision Queue ── */}
          <TabsContent value="queue" className="mt-4 space-y-3">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {(["ALL", "PENDING", "EXECUTED", "FAILED", "SKIPPED"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    statusFilter === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s === "ALL" ? "All" : DECISION_STATUS[s].label}
                  <span className="tabular-nums">{statusCounts[s]}</span>
                </button>
              ))}
              <div className="ml-auto flex gap-2">
                {(["ALL", "NDD", "REMITA", "EASY_PAY"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRailFilter(r)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      railFilter === r
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {r === "ALL" ? "All rails" : r}
                  </button>
                ))}
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Borrower / Loan</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Account</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Rail</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Amount</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground w-36">Confidence</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Scheduled</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredDecisions.map((d) => {
                      const statusCfg = DECISION_STATUS[d.status]
                      const TimingIcon = TIMING_ICON[d.timingReason] ?? Clock
                      return (
                        <tr
                          key={d.id}
                          className="hover:bg-muted/40 cursor-pointer transition-colors"
                          onClick={() => openDecision(d)}
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-sm">{d.borrower}</p>
                            <p className="text-xs text-muted-foreground font-mono">{d.loanId}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-medium">{d.bank}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              ****{d.accountNumber.slice(-4)}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={cn("border text-xs font-medium", RAIL_STYLE[d.rail])}>{d.rail}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            {d.blockReason ? (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Ban size={12} />
                                <span>{BLOCK_LABEL[d.blockReason] ?? d.blockReason}</span>
                              </div>
                            ) : (
                              <div>
                                <p className="text-xs font-semibold tabular-nums">{formatCurrency(d.amount)}</p>
                                <p className="text-[10px] text-muted-foreground">{d.amountStrategy}</p>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {d.confidenceScore > 0 ? (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className={cn("text-xs font-semibold tabular-nums", confidenceTextColor(d.confidenceScore))}>
                                    {(d.confidenceScore * 100).toFixed(0)}%
                                  </span>
                                  <TimingIcon size={11} className="text-muted-foreground" />
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                  <div
                                    className={cn("h-full rounded-full", confidenceColor(d.confidenceScore))}
                                    style={{ width: `${d.confidenceScore * 100}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={cn("border text-xs font-medium", statusCfg.className)}>
                              {statusCfg.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                            {new Date(d.scheduledAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="px-4 py-3">
                            <ChevronRight size={14} className="text-muted-foreground" />
                          </td>
                        </tr>
                      )
                    })}
                    {filteredDecisions.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                          No decisions match the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Throttled Accounts ── */}
          <TabsContent value="throttled" className="mt-4 space-y-3">
            <div className="rounded-xl border bg-amber-500/5 border-amber-500/20 px-4 py-3 flex items-start gap-3">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Accounts with 3+ failures in 24h are suspended for 48h. The engine will not generate decisions for suspended accounts.
                Throttles release automatically.
              </p>
            </div>
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Borrower</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Bank / Account</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Failures</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Last Reason</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Suspended Until</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {throttledAccounts.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium">{t.borrower}</p>
                          <p className="text-xs text-muted-foreground font-mono">{t.loanId}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium">{t.bank}</p>
                          <p className="text-xs text-muted-foreground font-mono">****{t.accountNumber.slice(-4)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="flex gap-0.5">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className={cn("h-3 w-1.5 rounded-sm", i < t.failureCount ? "bg-red-500" : "bg-muted")} />
                              ))}
                            </div>
                            <span className="text-xs font-semibold text-red-600">{t.failureCount}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">{t.lastFailureReason.replace(/_/g, " ").toLowerCase()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Timer size={12} className="text-muted-foreground" />
                            <span className="tabular-nums text-muted-foreground">
                              {new Date(t.suspendedUntil).toLocaleString("en-NG", { dateStyle: "short", timeStyle: "short" })}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={cn(
                              "border text-xs font-medium",
                              t.status === "SUSPENDED"
                                ? "bg-red-500/10 text-red-600 border-red-500/20"
                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            )}
                          >
                            {t.status === "SUSPENDED" ? "Suspended" : "Released"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Event Log ── */}
          <TabsContent value="events" className="mt-4">
            <Card>
              <CardContent className="p-0 divide-y">
                {recoveryEvents.map((e) => {
                  const cfg = EVENT_CONFIG[e.type]
                  return (
                    <div key={e.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/40 transition-colors">
                      <div className="mt-0.5 shrink-0">
                        <Badge className={cn("border text-[10px] font-medium whitespace-nowrap", cfg.className)}>
                          {cfg.label}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-sm font-medium">{e.borrower} <span className="text-muted-foreground font-mono text-xs">· {e.loanId}</span></p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{e.detail}</p>
                        {e.triggeredDecisionId && (
                          <p className="text-[10px] text-primary font-mono">{e.triggeredDecisionId} triggered</p>
                        )}
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

      <DecisionDrawer
        decision={selectedDecision}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  )
}
