"use client"

import { useState } from "react"
import {
  AlertTriangle, Clock, CheckCircle2, Search, Shield, TrendingDown, TrendingUp,
  UserCircle, Building2, Lock, PauseCircle, Target,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DisputeDetailDrawer } from "@/components/recovery/dispute-detail-drawer"
import { FlagDisputeModal } from "@/components/disputes/flag-dispute-modal"
import {
  disputes as initialDisputes, disputeKPIs,
  type Dispute, type DisputeStatus,
} from "@/lib/mock-data"
import { formatCurrency, formatDate, formatRelativeTime, getSLAStatus } from "@/lib/utils"
import { cn } from "@/lib/utils"

const STATUS_STYLE: Record<DisputeStatus, string> = {
  OPEN: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  EVIDENCE_COMPILED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  DECISION_PENDING: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  VALID_DEBIT: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  PARTIAL_REFUND: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  FULL_REFUND: "bg-red-500/10 text-red-600 dark:text-red-400",
  ESCALATED: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  CLOSED: "bg-muted text-muted-foreground",
}

const STATUS_LABEL: Record<DisputeStatus, string> = {
  OPEN: "Open",
  EVIDENCE_COMPILED: "Evidence Compiled",
  DECISION_PENDING: "Decision Pending",
  VALID_DEBIT: "Valid Debit",
  PARTIAL_REFUND: "Partial Refund",
  FULL_REFUND: "Full Refund",
  ESCALATED: "Escalated",
  CLOSED: "Closed",
}

const SLA_BADGE: Record<string, string> = {
  safe: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  urgent: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  breached: "bg-red-500/10 text-red-600 dark:text-red-400",
}

const SLA_TEXT: Record<string, string> = {
  safe: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  urgent: "text-orange-600 dark:text-orange-400",
  breached: "text-red-600 dark:text-red-400",
}

type TabKey = "customer" | "bank"

let idCounter = 8

export default function DisputesPage() {
  const [allDisputes, setAllDisputes] = useState<Dispute[]>(initialDisputes)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<TabKey>("customer")
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [flagOpen, setFlagOpen] = useState(false)

  const customerDisputes = allDisputes.filter(d => d.initiatedBy === "CUSTOMER")
  const bankDisputes = allDisputes.filter(d => d.initiatedBy === "BANK")
  const activeTab = tab === "customer" ? customerDisputes : bankDisputes

  const filtered = activeTab.filter(d => {
    const q = search.toLowerCase()
    return !q
      || d.borrower.toLowerCase().includes(q)
      || d.loanId.toLowerCase().includes(q)
      || d.type.toLowerCase().includes(q)
      || d.transactionId.toLowerCase().includes(q)
  })

  function handleStatusChange(id: string, status: DisputeStatus) {
    setAllDisputes(ds => ds.map(d => d.id === id ? { ...d, status } : d))
    if (selectedDispute?.id === id) {
      setSelectedDispute(prev => prev ? { ...prev, status } : prev)
    }
  }

  function handleNewDispute(partial: Omit<Dispute, "id" | "evidence" | "decisionOutcome" | "decisionNote" | "decisionAt" | "decisionBy">) {
    const newDispute: Dispute = {
      ...partial,
      id: `DSP-${String(idCounter++).padStart(3, "0")}`,
      evidence: {
        consentLog: { exists: false, signedAt: null, channel: null, reference: null, ipAddress: null },
        mandateDetails: { reference: null, status: null, maxAmount: null, setupDate: null, bank: null, authMethod: null },
        debitAttemptTrace: [],
        notificationHistory: [],
      },
      decisionOutcome: null,
      decisionNote: null,
      decisionAt: null,
      decisionBy: null,
    }
    setAllDisputes(ds => [newDispute, ...ds])
    setTab(newDispute.initiatedBy === "BANK" ? "bank" : "customer")
    setSelectedDispute(newDispute)
    setDrawerOpen(true)
  }

  const openCount = allDisputes.filter(d => d.status === "OPEN" || d.status === "EVIDENCE_COMPILED" || d.status === "DECISION_PENDING").length
  const slaBreached = allDisputes.filter(d => getSLAStatus(d.slaDeadline) === "breached" && !("VALID_DEBIT,FULL_REFUND,PARTIAL_REFUND,CLOSED".includes(d.status))).length
  const indemnityTotal = allDisputes.filter(d => d.isIndemnity && d.indemnityAmount).reduce((s, d) => s + (d.indemnityAmount ?? 0), 0)

  return (
    <div className="flex flex-col">
      <Header
        title="Dispute & Indemnity"
        description="Manage borrower disputes, evidence, decisions, and bank indemnity claims"
        actions={
          <Button size="sm" className="gap-2 text-xs bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setFlagOpen(true)}>
            <AlertTriangle className="h-3.5 w-3.5" />
            Flag Dispute
          </Button>
        }
      />

      <div className="p-6 space-y-5">

        {/* KPI bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Dispute Rate */}
          <Card className={cn(disputeKPIs.disputeRate <= disputeKPIs.disputeRateTarget ? "" : "border-red-200 dark:border-red-900")}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-muted-foreground">Dispute Rate</p>
                <span className={cn(
                  "flex items-center gap-1 text-[10px] font-semibold rounded px-1.5 py-0.5",
                  disputeKPIs.disputeRate <= disputeKPIs.disputeRateTarget
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                )}>
                  {disputeKPIs.disputeRate <= disputeKPIs.disputeRateTarget
                    ? <><TrendingDown className="h-3 w-3" /> Under target</>
                    : <><TrendingUp className="h-3 w-3" /> Over target</>
                  }
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground monospace-nums">{disputeKPIs.disputeRate}%</p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", disputeKPIs.disputeRate <= disputeKPIs.disputeRateTarget ? "bg-emerald-500" : "bg-red-500")}
                    style={{ width: `${Math.min((disputeKPIs.disputeRate / disputeKPIs.disputeRateTarget) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">Target &lt;{disputeKPIs.disputeRateTarget}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Indemnity Loss */}
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">Indemnity Loss (MTD)</p>
              <p className="text-2xl font-bold text-foreground monospace-nums">{formatCurrency(indemnityTotal || disputeKPIs.indemnityLossTotal)}</p>
              <p className="text-xs text-muted-foreground mt-1">{disputeKPIs.indemnityLossRate}% of disbursed</p>
            </CardContent>
          </Card>

          {/* SLA Compliance */}
          <Card className={cn(disputeKPIs.slaCompliance >= disputeKPIs.slaComplianceTarget ? "" : "border-amber-200 dark:border-amber-900")}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-muted-foreground">SLA Compliance</p>
                {slaBreached > 0 && (
                  <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
                    {slaBreached} breached
                  </span>
                )}
              </div>
              <p className={cn(
                "text-2xl font-bold monospace-nums",
                disputeKPIs.slaCompliance >= disputeKPIs.slaComplianceTarget ? "text-foreground" : "text-amber-600 dark:text-amber-400"
              )}>
                {disputeKPIs.slaCompliance}%
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", disputeKPIs.slaCompliance >= disputeKPIs.slaComplianceTarget ? "bg-emerald-500" : "bg-amber-500")}
                    style={{ width: `${disputeKPIs.slaCompliance}%` }}
                  />
                </div>
                <Target className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{disputeKPIs.slaComplianceTarget}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Open Count */}
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">Open Disputes</p>
              <p className="text-2xl font-bold text-foreground monospace-nums">{openCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {disputeKPIs.resolvedThisMonth} resolved this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs + Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center border-b border-border">
            <div className="flex">
              {([
                { key: "customer" as const, label: "Customer Disputes", icon: <UserCircle className="h-3.5 w-3.5" />, count: customerDisputes.length },
                { key: "bank" as const, label: "Bank Claims (Indemnity)", icon: <Building2 className="h-3.5 w-3.5" />, count: bankDisputes.length },
              ]).map(t => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setSearch("") }}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3.5 text-xs font-medium transition-colors border-b-2 -mb-px",
                    tab === t.key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.icon}
                  {t.label}
                  <span className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <div className="px-4 py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search disputes…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs w-56"
                />
              </div>
            </div>
          </div>

          {tab === "bank" && (
            <div className="px-5 py-3 border-b border-border bg-orange-50/50 dark:bg-orange-950/20 flex items-center gap-2.5">
              <Shield className="h-4 w-4 text-orange-500 shrink-0" />
              <p className="text-xs text-orange-700 dark:text-orange-400">
                Bank-initiated indemnity claims are filed with the payment processor when the bank identifies AT_RISK transactions or processing errors.
              </p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-border">
                <tr>
                  {["Borrower", "Loan / TXN", "Type", "Amount", "Filed", "SLA", "Status", "Assigned"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        {search ? "No disputes match your search" : tab === "bank" ? "No bank claims filed" : "No customer disputes"}
                      </p>
                    </td>
                  </tr>
                ) : filtered.map(dispute => {
                  const sla = getSLAStatus(dispute.slaDeadline)
                  const resolved = ["VALID_DEBIT", "FULL_REFUND", "PARTIAL_REFUND", "CLOSED"].includes(dispute.status)
                  return (
                    <tr
                      key={dispute.id}
                      onClick={() => { setSelectedDispute(dispute); setDrawerOpen(true) }}
                      className="hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <div>
                            <p className="text-sm font-medium text-foreground">{dispute.borrower}</p>
                            <p className="text-[11px] text-muted-foreground">{dispute.phone}</p>
                          </div>
                          {dispute.isIndemnity && (
                            <Shield className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-mono text-muted-foreground">{dispute.loanId}</p>
                        <p className="text-[11px] font-mono text-muted-foreground/70">{dispute.transactionId}</p>
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
                        {resolved ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize", SLA_BADGE[sla])}>
                              {sla}
                            </span>
                            {sla === "breached" && <AlertTriangle className="h-3 w-3 text-red-500" />}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", STATUS_STYLE[dispute.status])}>
                            {STATUS_LABEL[dispute.status]}
                          </span>
                          {dispute.recoveryPaused && !resolved && (
                            <span title="Recovery Paused"><PauseCircle className="h-3.5 w-3.5 text-red-500" /></span>
                          )}
                          {dispute.mandateLocked && !resolved && (
                            <span title="Mandate Locked"><Lock className="h-3.5 w-3.5 text-amber-500" /></span>
                          )}
                        </div>
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

          <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{filtered.length} dispute{filtered.length !== 1 ? "s" : ""}</span>
            {tab === "bank" && (
              <span className="text-xs text-muted-foreground">
                Total indemnity: <span className="font-semibold text-foreground">{formatCurrency(indemnityTotal)}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <DisputeDetailDrawer
        dispute={selectedDispute}
        open={drawerOpen && !!selectedDispute}
        onClose={() => setDrawerOpen(false)}
        onStatusChange={(id, status) => handleStatusChange(id, status as DisputeStatus)}
      />

      <FlagDisputeModal
        open={flagOpen}
        onClose={() => setFlagOpen(false)}
        onSubmit={handleNewDispute}
      />
    </div>
  )
}
