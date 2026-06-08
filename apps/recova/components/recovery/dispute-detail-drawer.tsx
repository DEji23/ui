"use client"

import { useState, useEffect } from "react"
import {
  X, Clock, AlertTriangle, CheckCircle2, XCircle, MessageSquare, User,
  FileText, Shield, Zap, ChevronRight, ExternalLink, Lock, PauseCircle,
  Building2, UserCircle,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  type Dispute, type DisputeNote, type DisputeDecisionOutcome, disputeNotes,
} from "@/lib/mock-data"
import { formatCurrency, formatDate, formatRelativeTime, getSLAStatus } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface DisputeDetailDrawerProps {
  dispute: Dispute | null
  open: boolean
  onClose: () => void
  onStatusChange?: (id: string, status: Dispute["status"]) => void
}

const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  EVIDENCE_COMPILED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  DECISION_PENDING: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  VALID_DEBIT: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  PARTIAL_REFUND: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  FULL_REFUND: "bg-red-500/10 text-red-600 dark:text-red-400",
  ESCALATED: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  CLOSED: "bg-muted text-muted-foreground",
}

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  EVIDENCE_COMPILED: "Evidence Compiled",
  DECISION_PENDING: "Decision Pending",
  VALID_DEBIT: "Valid Debit",
  PARTIAL_REFUND: "Partial Refund",
  FULL_REFUND: "Full Refund",
  ESCALATED: "Escalated",
  CLOSED: "Closed",
}

const SLA_STYLE: Record<string, string> = {
  safe: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  warning: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  urgent: "text-orange-600 dark:text-orange-400 bg-orange-500/10",
  breached: "text-red-600 dark:text-red-400 bg-red-500/10",
}

const OUTCOME_CONFIG: Record<NonNullable<DisputeDecisionOutcome>, {
  label: string; desc: string; color: string; bg: string; border: string; action: string
}> = {
  VALID_DEBIT: {
    label: "Valid Debit",
    desc: "Evidence confirms debit is correct. Dispute rejected — no refund required. Recovery resumes.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-900",
    action: "Confirm as Valid",
  },
  PARTIAL_ERROR: {
    label: "Partial Error",
    desc: "Debit was partially incorrect. Refund of excess amount required. Mandate cap review triggered.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-900",
    action: "Issue Partial Refund",
  },
  INVALID: {
    label: "Invalid Debit",
    desc: "Debit is fully invalid. Full reversal required. Recovery paused. Compliance notified.",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-200 dark:border-red-900",
    action: "Issue Full Refund",
  },
}

function SLACountdown({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState("")
  const sla = getSLAStatus(deadline)

  useEffect(() => {
    function update() {
      const diff = new Date(deadline).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft("Breached"); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      if (h >= 48) setTimeLeft(`${Math.floor(h / 24)}d ${h % 24}h`)
      else setTimeLeft(`${h}h ${m}m`)
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [deadline])

  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold", SLA_STYLE[sla])}>
      <Clock className="h-3.5 w-3.5" />
      {timeLeft} remaining
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-xs text-muted-foreground shrink-0 min-w-[130px]">{label}</span>
      <span className={cn("text-xs font-medium text-foreground text-right", mono && "font-mono")}>{value}</span>
    </div>
  )
}

type Tab = "overview" | "evidence" | "decision"

export function DisputeDetailDrawer({ dispute, open, onClose, onStatusChange }: DisputeDetailDrawerProps) {
  const [tab, setTab] = useState<Tab>("overview")
  const [note, setNote] = useState("")
  const [localNotes, setLocalNotes] = useState<DisputeNote[]>([])
  const [localStatus, setLocalStatus] = useState<Dispute["status"] | null>(null)
  const [localDispute, setLocalDispute] = useState<Dispute | null>(null)
  const [selectedOutcome, setSelectedOutcome] = useState<DisputeDecisionOutcome>(null)
  const [decisionNote, setDecisionNote] = useState("")
  const [confirmingDecision, setConfirmingDecision] = useState(false)

  useEffect(() => {
    if (dispute) {
      setLocalNotes(disputeNotes[dispute.id] ?? [])
      setLocalStatus(null)
      setLocalDispute(dispute)
      setNote("")
      setSelectedOutcome(dispute.decisionOutcome)
      setDecisionNote(dispute.decisionNote ?? "")
      setConfirmingDecision(false)
      setTab("overview")
    }
  }, [dispute])

  if (!dispute || !localDispute) return null

  const status = localStatus ?? dispute.status
  const isResolved = ["VALID_DEBIT", "PARTIAL_REFUND", "FULL_REFUND", "CLOSED"].includes(status)
  const canCompileEvidence = status === "OPEN"
  const canDecide = status === "EVIDENCE_COMPILED" || status === "DECISION_PENDING"
  const canEscalate = !isResolved && status !== "ESCALATED"

  function addNote() {
    if (!note.trim()) return
    setLocalNotes(n => [...n, {
      id: `n${Date.now()}`,
      author: "Adaora Nwosu",
      role: "Recovery Manager",
      timestamp: new Date().toISOString(),
      text: note.trim(),
    }])
    setNote("")
    toast.success("Note added")
  }

  function changeStatus(s: Dispute["status"]) {
    setLocalStatus(s)
    onStatusChange?.(dispute!.id, s)
  }

  function compileEvidence() {
    changeStatus("EVIDENCE_COMPILED")
    setLocalNotes(n => [...n, {
      id: `n${Date.now()}`,
      author: "System",
      role: "Automated",
      timestamp: new Date().toISOString(),
      text: "[AUTO] Evidence compilation complete. Consent log, mandate details, debit trace, and notification history compiled and ready for review.",
    }])
    toast.success("Evidence compiled — review on the Evidence tab")
    setTab("evidence")
  }

  function submitDecision() {
    if (!selectedOutcome) { toast.error("Select an outcome first"); return }
    if (!decisionNote.trim()) { toast.error("Decision note is required"); return }

    const outcomeToStatus: Record<NonNullable<DisputeDecisionOutcome>, Dispute["status"]> = {
      VALID_DEBIT: "VALID_DEBIT",
      PARTIAL_ERROR: "PARTIAL_REFUND",
      INVALID: "FULL_REFUND",
    }

    const newStatus = outcomeToStatus[selectedOutcome]
    changeStatus(newStatus)
    setLocalDispute(d => d ? { ...d, decisionOutcome: selectedOutcome, decisionNote, decisionAt: new Date().toISOString(), decisionBy: "Adaora Nwosu" } : d)
    setLocalNotes(n => [...n, {
      id: `n${Date.now()}`,
      author: "Adaora Nwosu",
      role: "Recovery Manager",
      timestamp: new Date().toISOString(),
      text: `[DECISION: ${OUTCOME_CONFIG[selectedOutcome].label}] ${decisionNote}`,
    }])
    setConfirmingDecision(false)

    const msgs: Record<NonNullable<DisputeDecisionOutcome>, string> = {
      VALID_DEBIT: "Dispute closed — debit confirmed valid",
      PARTIAL_ERROR: "Partial refund authorised — pending maker-checker",
      INVALID: "Full refund authorised — recovery paused",
    }
    toast.success(msgs[selectedOutcome])
  }

  function escalate() {
    changeStatus("ESCALATED")
    setLocalNotes(n => [...n, {
      id: `n${Date.now()}`,
      author: "Adaora Nwosu",
      role: "Recovery Manager",
      timestamp: new Date().toISOString(),
      text: "[ESCALATED] Dispute escalated to compliance team for further review.",
    }])
    toast.warning("Dispute escalated to compliance")
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: "evidence", label: "Evidence", icon: <Shield className="h-3.5 w-3.5" /> },
    { id: "decision", label: "Decision", icon: <Zap className="h-3.5 w-3.5" /> },
  ]

  const ev = dispute.evidence

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-full sm:w-[580px] sm:max-w-none p-0 flex flex-col gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <SheetTitle className="text-base font-semibold">{dispute.id}</SheetTitle>
              <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", STATUS_STYLE[status])}>
                {STATUS_LABEL[status] ?? status}
              </span>
              {dispute.isIndemnity && (
                <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Indemnity
                </span>
              )}
              <span className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-semibold flex items-center gap-1",
                dispute.initiatedBy === "CUSTOMER"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
              )}>
                {dispute.initiatedBy === "CUSTOMER" ? <UserCircle className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                {dispute.initiatedBy === "CUSTOMER" ? "Customer" : "Bank"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{dispute.type}</p>
          </div>
          <button onClick={onClose} className="ml-2 shrink-0 rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* SLA + lock indicators */}
        {!isResolved && (
          <div className="px-5 py-2.5 border-b border-border bg-muted/20 flex items-center justify-between gap-3 flex-wrap shrink-0">
            <div className="flex items-center gap-3">
              {dispute.recoveryPaused && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
                  <PauseCircle className="h-3.5 w-3.5" />
                  Recovery Paused
                </span>
              )}
              {dispute.mandateLocked && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  <Lock className="h-3.5 w-3.5" />
                  Mandate Locked
                </span>
              )}
            </div>
            <SLACountdown deadline={dispute.slaDeadline} />
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-5 py-3 text-xs font-medium transition-colors border-b-2 -mb-px",
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">

          {/* OVERVIEW TAB */}
          {tab === "overview" && (
            <div className="p-5 space-y-5">
              {/* Dispute Details */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Dispute Details</p>
                <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                  <InfoRow label="Borrower" value={dispute.borrower} />
                  <InfoRow label="Phone" value={dispute.phone} />
                  <InfoRow label="Loan ID" value={dispute.loanId} mono />
                  <InfoRow label="Transaction ID" value={dispute.transactionId} mono />
                  <InfoRow label="Amount in Dispute" value={formatCurrency(dispute.amount)} />
                  <InfoRow label="Rail" value={dispute.rail} />
                  <InfoRow label="Filed" value={formatRelativeTime(dispute.filedAt)} />
                  <InfoRow label="Assigned To" value={dispute.assignedTo} />
                  {dispute.isIndemnity && dispute.indemnityAmount && (
                    <InfoRow label="Indemnity Claim" value={formatCurrency(dispute.indemnityAmount)} />
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl border border-amber-200 dark:border-amber-900 p-4 bg-amber-50/50 dark:bg-amber-950/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                      {dispute.initiatedBy === "CUSTOMER" ? "Customer Statement" : "Bank Escalation Reason"}
                    </p>
                    <p className="text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed">{dispute.description}</p>
                  </div>
                </div>
              </div>

              {/* Decision outcome (if decided) */}
              {(localDispute.decisionOutcome || dispute.decisionOutcome) && (
                <div className={cn(
                  "rounded-xl border p-4",
                  localDispute.decisionOutcome
                    ? OUTCOME_CONFIG[localDispute.decisionOutcome!].border + " " + OUTCOME_CONFIG[localDispute.decisionOutcome!].bg
                    : "border-border bg-muted/20"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <p className="text-xs font-semibold text-foreground">
                      Decision: {OUTCOME_CONFIG[localDispute.decisionOutcome ?? dispute.decisionOutcome!]?.label}
                    </p>
                  </div>
                  <p className="text-xs text-foreground/70 leading-relaxed">
                    {localDispute.decisionNote ?? dispute.decisionNote}
                  </p>
                  {(localDispute.decisionBy ?? dispute.decisionBy) && (
                    <p className="text-[11px] text-muted-foreground mt-2">
                      By {localDispute.decisionBy ?? dispute.decisionBy} · {formatRelativeTime(localDispute.decisionAt ?? dispute.decisionAt ?? "")}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              {!isResolved && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Actions</p>
                  <div className="flex gap-2 flex-wrap">
                    {canCompileEvidence && (
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={compileEvidence}>
                        <Shield className="h-3.5 w-3.5" />
                        Compile Evidence
                      </Button>
                    )}
                    {canDecide && (
                      <Button size="sm" className="gap-1.5 text-xs" onClick={() => setTab("decision")}>
                        <Zap className="h-3.5 w-3.5" />
                        Go to Decision Engine
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    )}
                    {canEscalate && (
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={escalate}>
                        Escalate to Compliance
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              {/* Notes */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Investigation Notes</p>
                {localNotes.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No notes yet.</p>
                ) : (
                  <div className="space-y-3">
                    {localNotes.map(n => (
                      <div key={n.id} className="flex items-start gap-2.5">
                        <div className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                          n.author === "System" ? "bg-muted" : "bg-primary/10"
                        )}>
                          {n.author === "System"
                            ? <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                            : <User className="h-3.5 w-3.5 text-primary" />
                          }
                        </div>
                        <div className="flex-1 rounded-xl bg-muted/50 px-3 py-2.5">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-xs font-semibold text-foreground">{n.author}</span>
                            <span className="text-[10px] text-muted-foreground">{n.role}</span>
                            <span className="text-[10px] text-muted-foreground ml-auto">{formatRelativeTime(n.timestamp)}</span>
                          </div>
                          <p className="text-xs text-foreground/80 leading-relaxed">{n.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!isResolved && (
                  <div className="flex gap-2 mt-3">
                    <input
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && addNote()}
                      placeholder="Add investigation note…"
                      className="flex-1 text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <Button variant="outline" size="sm" className="text-xs h-8 shrink-0 gap-1" onClick={addNote}>
                      <MessageSquare className="h-3.5 w-3.5" />
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EVIDENCE TAB */}
          {tab === "evidence" && (
            <div className="p-5 space-y-5">
              {status === "OPEN" && (
                <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-start gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-1">Evidence not yet compiled</p>
                    <p className="text-xs text-muted-foreground">Click "Compile Evidence" on the Overview tab to auto-gather all supporting records.</p>
                  </div>
                </div>
              )}

              {/* Consent Log */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Consent Log</p>
                  {ev.consentLog.exists
                    ? <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Found</span>
                    : <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400">Not Found</span>
                  }
                </div>
                <div className="rounded-xl border border-border overflow-hidden">
                  {ev.consentLog.exists ? (
                    <>
                      <div className="divide-y divide-border">
                        <InfoRow label="Reference" value={ev.consentLog.reference ?? "—"} mono />
                        <InfoRow label="Signed At" value={ev.consentLog.signedAt ? formatDate(ev.consentLog.signedAt) : "—"} />
                        <InfoRow label="Channel" value={ev.consentLog.channel ?? "—"} />
                        <InfoRow label="IP Address" value={ev.consentLog.ipAddress ?? "—"} mono />
                      </div>
                    </>
                  ) : (
                    <div className="p-4 flex items-center gap-2.5 text-red-600 dark:text-red-400">
                      <XCircle className="h-4 w-4 shrink-0" />
                      <p className="text-xs">No digital consent record found in iGree system for this mandate.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mandate Authority */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mandate Authority</p>
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="divide-y divide-border">
                    <InfoRow label="Reference" value={ev.mandateDetails.reference ?? "—"} mono />
                    <InfoRow label="Status" value={ev.mandateDetails.status ?? "—"} />
                    <InfoRow label="Max Amount" value={ev.mandateDetails.maxAmount ? formatCurrency(ev.mandateDetails.maxAmount) : "—"} />
                    <InfoRow label="Setup Date" value={ev.mandateDetails.setupDate ?? "—"} />
                    <InfoRow label="Bank" value={ev.mandateDetails.bank ?? "—"} />
                    <InfoRow label="Auth Method" value={ev.mandateDetails.authMethod ?? "—"} />
                  </div>
                </div>
                {ev.mandateDetails.maxAmount && ev.mandateDetails.maxAmount < dispute.amount && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-200 dark:border-red-900 px-3 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                      Debit ({formatCurrency(dispute.amount)}) exceeds mandate cap ({formatCurrency(ev.mandateDetails.maxAmount)}) by {formatCurrency(dispute.amount - ev.mandateDetails.maxAmount)}
                    </p>
                  </div>
                )}
              </div>

              {/* Debit Attempt Trace */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Debit Attempt Trace</p>
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="divide-y divide-border">
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-3 py-2 bg-muted/30">
                      {["Reference", "Channel", "Amount", "Status"].map(h => (
                        <span key={h} className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</span>
                      ))}
                    </div>
                    {ev.debitAttemptTrace.map((t, i) => (
                      <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-3 py-2.5 items-center">
                        <div>
                          <span className="text-xs font-mono text-foreground">{t.reference}</span>
                          <p className="text-[10px] text-muted-foreground">{formatRelativeTime(t.timestamp)}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{t.channel}</span>
                        <span className="text-xs font-semibold text-foreground monospace-nums">{formatCurrency(t.amount)}</span>
                        <span className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                          t.status === "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        )}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {ev.debitAttemptTrace.filter(t => t.status === "SUCCESS").length > 1 && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-200 dark:border-red-900 px-3 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                      Multiple successful debits detected — possible duplicate processing
                    </p>
                  </div>
                )}
              </div>

              {/* Notification History */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notification History</p>
                <div className="rounded-xl border border-border overflow-hidden">
                  {ev.notificationHistory.length === 0 ? (
                    <div className="px-4 py-3">
                      <p className="text-xs text-muted-foreground">No notifications on record.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {ev.notificationHistory.map((n, i) => (
                        <div key={i} className="flex items-start gap-3 px-3 py-2.5">
                          <span className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-semibold shrink-0 mt-0.5",
                            n.status === "DELIVERED" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
                          )}>
                            {n.channel}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground leading-snug">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{formatRelativeTime(n.timestamp)}</p>
                          </div>
                          <span className={cn(
                            "text-[10px] font-semibold shrink-0",
                            n.status === "DELIVERED" ? "text-emerald-500" : "text-red-500"
                          )}>
                            {n.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {canCompileEvidence && (
                <Button size="sm" className="w-full text-xs gap-2" variant="outline" onClick={compileEvidence}>
                  <Shield className="h-3.5 w-3.5" />
                  Mark Evidence as Compiled
                </Button>
              )}
              {canDecide && !isResolved && (
                <Button size="sm" className="w-full text-xs gap-2" onClick={() => setTab("decision")}>
                  <Zap className="h-3.5 w-3.5" />
                  Proceed to Decision Engine
                  <ChevronRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {/* DECISION TAB */}
          {tab === "decision" && (
            <div className="p-5 space-y-5">
              {isResolved ? (
                <div className="space-y-4">
                  <div className={cn(
                    "rounded-xl border p-5",
                    (localDispute.decisionOutcome ?? dispute.decisionOutcome)
                      ? OUTCOME_CONFIG[localDispute.decisionOutcome ?? dispute.decisionOutcome!].border
                      + " " + OUTCOME_CONFIG[localDispute.decisionOutcome ?? dispute.decisionOutcome!].bg
                      : "border-border bg-muted/20"
                  )}>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <p className="text-sm font-semibold text-foreground">Decision Recorded</p>
                    </div>
                    <p className={cn("text-lg font-bold mb-2", (localDispute.decisionOutcome ?? dispute.decisionOutcome) ? OUTCOME_CONFIG[localDispute.decisionOutcome ?? dispute.decisionOutcome!].color : "text-foreground")}>
                      {(localDispute.decisionOutcome ?? dispute.decisionOutcome)
                        ? OUTCOME_CONFIG[localDispute.decisionOutcome ?? dispute.decisionOutcome!].label
                        : status}
                    </p>
                    <p className="text-xs text-foreground/70 leading-relaxed">
                      {localDispute.decisionNote ?? dispute.decisionNote}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-3">
                      Decided by {localDispute.decisionBy ?? dispute.decisionBy} · {formatRelativeTime(localDispute.decisionAt ?? dispute.decisionAt ?? "")}
                    </p>
                  </div>
                </div>
              ) : !canDecide ? (
                <div className="rounded-xl border border-border bg-muted/30 p-5 flex items-start gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-1">Evidence required first</p>
                    <p className="text-xs text-muted-foreground">Compile evidence before recording a decision. Go to the Evidence tab to gather and review all supporting records.</p>
                    <Button size="sm" variant="outline" className="text-xs gap-1.5 mt-3" onClick={() => setTab("evidence")}>
                      <Shield className="h-3.5 w-3.5" />
                      Go to Evidence
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Decision Engine</p>
                    <p className="text-xs text-muted-foreground">Review the evidence and select the appropriate outcome. This action will be logged and may trigger maker-checker approval.</p>
                  </div>

                  {/* Outcome cards */}
                  <div className="space-y-3">
                    {(Object.entries(OUTCOME_CONFIG) as [NonNullable<DisputeDecisionOutcome>, typeof OUTCOME_CONFIG[keyof typeof OUTCOME_CONFIG]][]).map(([outcome, cfg]) => (
                      <button
                        key={outcome}
                        onClick={() => setSelectedOutcome(outcome)}
                        className={cn(
                          "w-full text-left rounded-xl border p-4 transition-all",
                          selectedOutcome === outcome
                            ? cfg.border + " " + cfg.bg + " ring-1 ring-primary"
                            : "border-border hover:border-primary/40 hover:bg-muted/20"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "flex h-5 w-5 shrink-0 mt-0.5 items-center justify-center rounded-full border-2 transition-colors",
                            selectedOutcome === outcome ? "border-primary bg-primary" : "border-muted-foreground"
                          )}>
                            {selectedOutcome === outcome && <span className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                          <div>
                            <p className={cn("text-sm font-semibold", selectedOutcome === outcome ? cfg.color : "text-foreground")}>
                              {cfg.label}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{cfg.desc}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Decision note */}
                  {selectedOutcome && !confirmingDecision && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">
                        Decision Note <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={decisionNote}
                        onChange={e => setDecisionNote(e.target.value)}
                        rows={3}
                        placeholder="Explain the basis for this decision — key evidence, reasoning, any conditions…"
                        className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                      />
                      <Button
                        size="sm"
                        className="w-full text-xs gap-2"
                        onClick={() => {
                          if (!decisionNote.trim()) { toast.error("Decision note is required"); return }
                          setConfirmingDecision(true)
                        }}
                      >
                        <Zap className="h-3.5 w-3.5" />
                        {OUTCOME_CONFIG[selectedOutcome].action}
                      </Button>
                    </div>
                  )}

                  {/* Confirmation */}
                  {confirmingDecision && selectedOutcome && (
                    <div className={cn(
                      "rounded-xl border p-4 space-y-3",
                      OUTCOME_CONFIG[selectedOutcome].border,
                      OUTCOME_CONFIG[selectedOutcome].bg
                    )}>
                      <p className="text-xs font-semibold text-foreground">
                        Confirm: {OUTCOME_CONFIG[selectedOutcome].label}
                      </p>
                      <p className="text-xs text-foreground/70 leading-relaxed">{decisionNote}</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="text-xs flex-1 gap-1.5" onClick={submitDecision}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Confirm Decision
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => setConfirmingDecision(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
