"use client"

import { useState } from "react"
import {
  CheckCircle2, AlertTriangle, Clock, Search, RefreshCcw, X,
  TrendingDown, TrendingUp, Shield, Zap, ArrowRightLeft, User,
  ChevronRight, Building2,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  mandates as initialMandates, mandateKPIs, bankCapabilities,
  type Mandate, type MandateStatus, type MandateValidationStatus, type MandateFailureReason,
} from "@/lib/mock-data"
import { formatCurrency, formatRelativeTime, formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ─── Style configs ───────────────────────────────────────────────────────────────────────────────

const MANDATE_STATUS_STYLE: Record<MandateStatus, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  EXPIRED: "bg-muted text-muted-foreground",
  FAILED: "bg-red-500/10 text-red-600 dark:text-red-400",
  SUSPENDED: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
}

const VALIDATION_STYLE: Record<MandateValidationStatus, string> = {
  NOT_STARTED: "bg-muted text-muted-foreground",
  USER_ACTION_REQUIRED: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  VALIDATED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  FAILED: "bg-red-500/10 text-red-600 dark:text-red-400",
}

const VALIDATION_LABEL: Record<MandateValidationStatus, string> = {
  NOT_STARTED: "Not Started",
  USER_ACTION_REQUIRED: "Action Required",
  VALIDATED: "Validated",
  FAILED: "Failed",
}

const FAILURE_LABEL: Record<MandateFailureReason, string> = {
  ACCOUNT_DORMANT: "Account Dormant",
  INVALID_ACCOUNT: "Invalid Account",
  NAME_MISMATCH: "Name Mismatch",
  BANK_REJECTION: "Bank Rejection",
  USER_ABANDONED: "User Abandoned",
  TIMEOUT: "Timeout",
}

const FAILURE_STYLE: Record<MandateFailureReason, string> = {
  ACCOUNT_DORMANT: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  INVALID_ACCOUNT: "bg-red-500/10 text-red-600 dark:text-red-400",
  NAME_MISMATCH: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  BANK_REJECTION: "bg-red-500/10 text-red-600 dark:text-red-400",
  USER_ABANDONED: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  TIMEOUT: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
}

const FAILURE_ACTION: Record<MandateFailureReason, string> = {
  ACCOUNT_DORMANT: "Remove account from pool — trigger iGree for replacement",
  INVALID_ACCOUNT: "Flag BVN for manual review — halt debit attempts",
  NAME_MISMATCH: "Request BVN verification — re-submit with corrected name",
  BANK_REJECTION: "Retry via REMITA fallback — contact bank ops if persists",
  USER_ABANDONED: "Re-send validation notification — 3-attempt limit",
  TIMEOUT: "Re-queue mandate creation — bank API timeout, likely transient",
}

const RAIL_STYLE: Record<string, string> = {
  NDD: "bg-primary/10 text-primary",
  REMITA: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  EASY_PAY: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  MANUAL: "bg-muted text-muted-foreground",
}

// ─── Mandate Drawer ────────────────────────────────────────────────────────────────────────────

function MandateDrawer({
  mandate, open, onClose, onUpdate,
}: {
  mandate: Mandate | null
  open: boolean
  onClose: () => void
  onUpdate: (id: string, update: Partial<Mandate>) => void
}) {
  if (!mandate || !open) return null

  // Capture non-null mandate for use in nested functions
  const m = mandate
  const bank = bankCapabilities.find(b => b.bankCode === m.bankCode)

  function refresh() {
    onUpdate(m.id, { lastCheckedAt: new Date().toISOString() })
    toast.success(`Mandate ${m.reference} refresh queued — polling in 15 min`)
  }

  function revalidate() {
    onUpdate(m.id, { validationStatus: "USER_ACTION_REQUIRED" })
    toast.info(`Re-validation flow triggered — notification sent to ${m.borrower}`)
  }

  function switchProvider() {
    const newRail = m.rail === "NDD" ? "REMITA" : "NDD"
    onUpdate(m.id, { rail: newRail as Mandate["rail"], providerFallback: true, status: "PENDING", validationStatus: "NOT_STARTED" })
    toast.info(`Provider switched to ${newRail} — new mandate creation queued`)
  }

  function sendIgree() {
    toast.success(`iGree consent link sent to ${m.borrower}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full sm:w-[540px] flex-col bg-background border-l border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base font-semibold font-mono">{mandate.reference}</p>
              <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", MANDATE_STATUS_STYLE[mandate.status])}>
                {mandate.status}
              </span>
              {mandate.providerFallback && (
                <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <ArrowRightLeft className="h-3 w-3" />
                  Fallback
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{mandate.borrower} · {mandate.bank}</p>
          </div>
          <button onClick={onClose} className="ml-2 shrink-0 rounded-lg p-1.5 hover:bg-muted text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Dual State Display */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">State Dimensions</p>
            <div className="grid grid-cols-2 gap-3">
              <div className={cn("rounded-xl border p-4 space-y-1.5", mandate.status === "ACTIVE" ? "border-emerald-200 dark:border-emerald-900 bg-emerald-500/5" : "border-border bg-muted/20")}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Mandate State</p>
                <span className={cn("inline-flex rounded-md px-2.5 py-1 text-xs font-semibold", MANDATE_STATUS_STYLE[mandate.status])}>
                  {mandate.status}
                </span>
                <p className="text-[10px] text-muted-foreground">
                  {mandate.status === "ACTIVE" ? "Debit authority active" :
                   mandate.status === "PENDING" ? "Awaiting bank approval" :
                   mandate.status === "FAILED" ? "Setup failed — needs refresh" :
                   mandate.status === "SUSPENDED" ? "Suspended — dispute/compliance" :
                   "Expired — needs renewal"}
                </p>
              </div>
              <div className={cn("rounded-xl border p-4 space-y-1.5", mandate.validationStatus === "VALIDATED" ? "border-emerald-200 dark:border-emerald-900 bg-emerald-500/5" : "border-border bg-muted/20")}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Validation State</p>
                <span className={cn("inline-flex rounded-md px-2.5 py-1 text-xs font-semibold", VALIDATION_STYLE[mandate.validationStatus])}>
                  {VALIDATION_LABEL[mandate.validationStatus]}
                </span>
                <p className="text-[10px] text-muted-foreground">
                  {mandate.validationStatus === "VALIDATED" ? "Customer verified ✓" :
                   mandate.validationStatus === "USER_ACTION_REQUIRED" ? "Waiting for customer action" :
                   mandate.validationStatus === "NOT_STARTED" ? "Validation flow not triggered" :
                   "Validation failed — retry needed"}
                </p>
              </div>
            </div>
          </div>

          {/* Failure reason */}
          {mandate.failureReason && (
            <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold", FAILURE_STYLE[mandate.failureReason])}>
                    {FAILURE_LABEL[mandate.failureReason]}
                  </span>
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400">Failure Classification</p>
                </div>
              </div>
              <p className="text-xs text-red-600/80 dark:text-red-400/80 leading-relaxed">
                → {FAILURE_ACTION[mandate.failureReason]}
              </p>
            </div>
          )}

          {/* Provider Routing */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Provider Routing</p>
            <div className="rounded-xl border border-border overflow-hidden">
              {bank ? (
                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">Active Provider</span>
                    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", RAIL_STYLE[mandate.rail])}>{mandate.rail}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">NDD Support</span>
                    <span className={cn("text-xs font-medium", bank.supportsNDD ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
                      {bank.supportsNDD ? `✓ ${bank.nddSuccessRate}% success` : "✗ Not supported"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">REMITA Support</span>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">✓ {bank.remitaSuccessRate}% success</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">Preferred Route</span>
                    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", RAIL_STYLE[bank.preferredProvider])}>{bank.preferredProvider}</span>
                  </div>
                  {mandate.providerFallback && (
                    <div className="px-4 py-2.5 bg-purple-500/5 border-t border-purple-200 dark:border-purple-900">
                      <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                        <ArrowRightLeft className="h-3.5 w-3.5 shrink-0" />
                        This mandate was routed to fallback provider — primary route was unavailable or below threshold
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="px-4 py-3 text-xs text-muted-foreground">Bank capability data not available</p>
              )}
            </div>
          </div>

          {/* Mandate Details */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Mandate Details</p>
            <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
              {[
                ["Loan ID", mandate.loanId],
                ["External Ref", mandate.externalReference ?? "—"],
                ["Max Amount", formatCurrency(mandate.maxAmount)],
                ["Frequency", mandate.frequency],
                ["Account", mandate.accountNumber.slice(0, 3) + "•••" + mandate.accountNumber.slice(-3)],
                ["Issued", formatDate(mandate.issuedAt)],
                ["Expires", formatDate(mandate.expiryDate)],
                ["Activated", mandate.activatedAt ? formatRelativeTime(mandate.activatedAt) : "Not yet activated"],
                ["Last Checked", mandate.lastCheckedAt ? formatRelativeTime(mandate.lastCheckedAt) : "Never"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 px-4 py-2">
                  <span className="text-xs text-muted-foreground shrink-0 min-w-[120px]">{k}</span>
                  <span className="text-xs font-medium text-foreground text-right font-mono">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Actions</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 justify-start h-9" onClick={refresh}>
                <RefreshCcw className="h-3.5 w-3.5" />
                Refresh Mandate
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1.5 justify-start h-9" onClick={revalidate}
                disabled={mandate.validationStatus === "VALIDATED"}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Re-validate
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1.5 justify-start h-9" onClick={switchProvider}>
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Switch Provider
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1.5 justify-start h-9" onClick={sendIgree}>
                <Zap className="h-3.5 w-3.5" />
                Send iGree Link
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────────────────────

type TabKey = "all" | "failures"

export default function MandateSetupPage() {
  const [mandates, setMandates] = useState<Mandate[]>(initialMandates)
  const [tab, setTab] = useState<TabKey>("all")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<MandateStatus | "ALL">("ALL")
  const [selectedMandate, setSelectedMandate] = useState<Mandate | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  function updateMandate(id: string, update: Partial<Mandate>) {
    setMandates(ms => ms.map(m => m.id === id ? { ...m, ...update } : m))
    setSelectedMandate(prev => prev?.id === id ? { ...prev, ...update } : prev)
  }

  const filtered = mandates.filter(m => {
    if (statusFilter !== "ALL" && m.status !== statusFilter) return false
    if (tab === "failures" && m.status !== "FAILED" && m.status !== "EXPIRED" && m.status !== "SUSPENDED") return false
    if (search) {
      const q = search.toLowerCase()
      if (!m.borrower.toLowerCase().includes(q) && !m.reference.toLowerCase().includes(q) && !m.loanId.toLowerCase().includes(q)) return false
    }
    return true
  })

  const statusCounts = {
    ALL: mandates.length,
    ACTIVE: mandates.filter(m => m.status === "ACTIVE").length,
    PENDING: mandates.filter(m => m.status === "PENDING").length,
    FAILED: mandates.filter(m => m.status === "FAILED").length,
    EXPIRED: mandates.filter(m => m.status === "EXPIRED").length,
    SUSPENDED: mandates.filter(m => m.status === "SUSPENDED").length,
  }

  const pendingValidation = mandates.filter(m => m.validationStatus === "USER_ACTION_REQUIRED").length
  const fallbackCount = mandates.filter(m => m.providerFallback).length

  return (
    <div className="flex flex-col">
      <Header
        title="Mandate Orchestration"
        description="Managing debit authority across NDD and Remita systems"
        actions={
          <div className="flex items-center gap-2">
            {pendingValidation > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-200 dark:border-amber-900 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {pendingValidation} awaiting validation
                </span>
              </div>
            )}
            <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={() => { setTab("failures"); setStatusFilter("ALL") }}>
              <AlertTriangle className="h-3.5 w-3.5" />
              Failures ({statusCounts.FAILED})
            </Button>
            <Button size="sm" className="gap-2 text-xs" onClick={() => toast.info("New mandate creation flow — coming soon")}>
              <Zap className="h-3.5 w-3.5" />
              New Mandate
            </Button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 space-y-5">

        {/* KPI Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Activation Rate */}
          <Card className={cn(mandateKPIs.activationRate >= mandateKPIs.activationRateTarget ? "" : "border-amber-200 dark:border-amber-900")}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-1">
                <p className="text-xs text-muted-foreground">Activation Rate</p>
                <span className={cn(
                  "flex items-center gap-1 text-[10px] font-semibold rounded px-1.5 py-0.5",
                  mandateKPIs.activationRate >= mandateKPIs.activationRateTarget
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                )}>
                  {mandateKPIs.activationRate >= mandateKPIs.activationRateTarget
                    ? <><TrendingUp className="h-3 w-3" /> On track</>
                    : <><TrendingDown className="h-3 w-3" /> Below target</>
                  }
                </span>
              </div>
              <p className={cn("text-2xl font-bold monospace-nums", mandateKPIs.activationRate >= mandateKPIs.activationRateTarget ? "text-foreground" : "text-amber-600 dark:text-amber-400")}>
                {mandateKPIs.activationRate}%
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", mandateKPIs.activationRate >= mandateKPIs.activationRateTarget ? "bg-emerald-500" : "bg-amber-500")}
                    style={{ width: `${(mandateKPIs.activationRate / mandateKPIs.activationRateTarget) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">Target {mandateKPIs.activationRateTarget}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Silent Failures */}
          <Card className={cn(mandateKPIs.silentFailuresDetected > 0 ? "border-red-200 dark:border-red-900" : "")}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Silent Failures Detected</p>
              <p className={cn("text-2xl font-bold monospace-nums", mandateKPIs.silentFailuresDetected > 0 ? "text-red-600 dark:text-red-400" : "text-foreground")}>
                {mandateKPIs.silentFailuresDetected}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {mandateKPIs.totalFailed} total failed mandates
              </p>
            </CardContent>
          </Card>

          {/* Avg Time to Active */}
          <Card className={cn(mandateKPIs.avgTimeToActiveHours <= mandateKPIs.avgTimeToActiveTarget ? "" : "border-amber-200 dark:border-amber-900")}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-1">
                <p className="text-xs text-muted-foreground">Avg Time to Active</p>
                <span className="text-[10px] font-semibold rounded px-1.5 py-0.5 bg-muted text-muted-foreground">
                  Target &lt;{mandateKPIs.avgTimeToActiveTarget}h
                </span>
              </div>
              <p className={cn("text-2xl font-bold monospace-nums", mandateKPIs.avgTimeToActiveHours <= mandateKPIs.avgTimeToActiveTarget ? "text-foreground" : "text-amber-600 dark:text-amber-400")}>
                {mandateKPIs.avgTimeToActiveHours}h
              </p>
              <p className="text-xs text-muted-foreground mt-1">{mandateKPIs.refreshedThisMonth} refreshed this month</p>
            </CardContent>
          </Card>

          {/* Fallback Account Rate */}
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Fallback Account Rate</p>
              <p className="text-2xl font-bold text-foreground monospace-nums">{mandateKPIs.fallbackAccountRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {fallbackCount} of {mandates.length} mandates via fallback
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bank Capability Matrix */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <p className="text-sm font-semibold text-foreground">Bank Capability Matrix</p>
              <p className="text-xs text-muted-foreground">Provider routing logic — NDD vs REMITA by bank</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-7" onClick={() => toast.info("Bank capability data refreshed")}>
              <RefreshCcw className="h-3 w-3" />
              Refresh
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-border">
                <tr>
                  {["Bank", "Code", "NDD", "NDD Rate", "REMITA Rate", "Preferred Route"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bankCapabilities.map(bank => (
                  <tr key={bank.bankCode} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="text-sm font-medium text-foreground">{bank.bankName}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-mono text-muted-foreground">{bank.bankCode}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      {bank.supportsNDD
                        ? <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ Supported</span>
                        : <span className="text-xs text-red-500 font-medium">✗ No</span>
                      }
                    </td>
                    <td className="px-4 py-2.5">
                      {bank.nddSuccessRate !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full", bank.nddSuccessRate >= 80 ? "bg-emerald-500" : bank.nddSuccessRate >= 70 ? "bg-amber-500" : "bg-red-500")}
                              style={{ width: `${bank.nddSuccessRate}%` }}
                            />
                          </div>
                          <span className={cn("text-xs font-semibold monospace-nums",
                            bank.nddSuccessRate >= 80 ? "text-emerald-600 dark:text-emerald-400" :
                            bank.nddSuccessRate >= 70 ? "text-amber-600 dark:text-amber-400" : "text-red-500"
                          )}>{bank.nddSuccessRate}%</span>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      {bank.remitaSuccessRate !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full", bank.remitaSuccessRate >= 80 ? "bg-emerald-500" : bank.remitaSuccessRate >= 70 ? "bg-amber-500" : "bg-red-500")}
                              style={{ width: `${bank.remitaSuccessRate}%` }}
                            />
                          </div>
                          <span className={cn("text-xs font-semibold monospace-nums",
                            bank.remitaSuccessRate >= 80 ? "text-emerald-600 dark:text-emerald-400" :
                            bank.remitaSuccessRate >= 70 ? "text-amber-600 dark:text-amber-400" : "text-red-500"
                          )}>{bank.remitaSuccessRate}%</span>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", RAIL_STYLE[bank.preferredProvider])}>
                        {bank.preferredProvider}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Main Mandate Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center border-b border-border">
            <div className="flex">
              {([
                { key: "all" as const, label: "All Mandates", count: mandates.length },
                { key: "failures" as const, label: "Failures & Refresh Queue", count: statusCounts.FAILED + statusCounts.EXPIRED + statusCounts.SUSPENDED },
              ]).map(t => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setSearch(""); setStatusFilter("ALL") }}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3.5 text-xs font-medium transition-colors border-b-2 -mb-px",
                    tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex-1 flex items-center justify-end gap-3 px-4 py-2">
              {tab === "all" && (
                <div className="flex gap-1.5 overflow-x-auto">
                  {(["ALL", "ACTIVE", "PENDING", "FAILED", "EXPIRED", "SUSPENDED"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap",
                        statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()} {s !== "ALL" && `(${statusCounts[s]})`}
                    </button>
                  ))}
                </div>
              )}
              <div className="relative shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs w-48" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-border">
                <tr>
                  {["Mandate", "Borrower / Loan", "Provider", "Max Amount", "Mandate State", "Validation State", "Failure", "Last Checked"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No mandates match filters
                    </td>
                  </tr>
                ) : filtered.map(m => (
                  <tr
                    key={m.id}
                    onClick={() => { setSelectedMandate(m); setDrawerOpen(true) }}
                    className="hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <p className="text-xs font-mono text-foreground">{m.reference}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{m.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{m.borrower}</p>
                      <p className="text-[11px] text-muted-foreground">{m.loanId}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", RAIL_STYLE[m.rail])}>{m.rail}</span>
                        {m.providerFallback && (
                          <ArrowRightLeft className="h-3 w-3 text-purple-500" />
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{m.bank}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold monospace-nums text-foreground">{formatCurrency(m.maxAmount)}</span>
                      <p className="text-[10px] text-muted-foreground">{m.frequency}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", MANDATE_STATUS_STYLE[m.status])}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", VALIDATION_STYLE[m.validationStatus])}>
                        {VALIDATION_LABEL[m.validationStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {m.failureReason ? (
                        <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold", FAILURE_STYLE[m.failureReason])}>
                          {FAILURE_LABEL[m.failureReason]}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        {m.lastCheckedAt ? formatRelativeTime(m.lastCheckedAt) : "Never"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border px-4 py-2.5">
              <span className="text-xs text-muted-foreground">{filtered.length} mandate{filtered.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </div>

      <MandateDrawer
        mandate={selectedMandate}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={updateMandate}
      />
    </div>
  )
}
