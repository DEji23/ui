"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
  AlertTriangle, RefreshCcw, UserPlus, PauseCircle, ChevronRight,
  Search, Zap, CheckCircle2, Clock, ExternalLink, CreditCard,
  FileSearch, XCircle,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  failedRecoveries as initialFR,
  mandates,
  reconciliationExceptions as initialRecon,
  disputes as initialDisputes,
  type FailedRecovery,
  type ReconciliationException,
  type Dispute,
} from "@/lib/mock-data"
import { formatCurrency, formatRelativeTime } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const TABS = [
  { key: "failed", label: "Failed Recoveries", count: initialFR.length },
  { key: "mandates", label: "Mandate Issues", count: mandates.filter(m => m.status === "FAILED" || m.status === "EXPIRED").length },
  { key: "recon", label: "Recon Exceptions", count: initialRecon.length },
  { key: "disputes", label: "Dispute Queue", count: initialDisputes.filter(d => d.status === "OPEN" || d.status === "INVESTIGATING").length },
] as const
type TabKey = typeof TABS[number]["key"]

const FAILURE_REASON_LABEL: Record<FailedRecovery["failureReason"], string> = {
  INSUFFICIENT_FUNDS: "Insufficient Funds",
  ACCOUNT_DORMANT: "Account Dormant",
  MANDATE_EXPIRED: "Mandate Expired",
  BANK_TIMEOUT: "Bank Timeout",
  INVALID_ACCOUNT: "Invalid Account",
  DAILY_LIMIT_EXCEEDED: "Daily Limit Exceeded",
}

const FAILURE_REASON_STYLE: Record<FailedRecovery["failureReason"], string> = {
  INSUFFICIENT_FUNDS: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  ACCOUNT_DORMANT: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  MANDATE_EXPIRED: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  BANK_TIMEOUT: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  INVALID_ACCOUNT: "bg-red-500/10 text-red-600 dark:text-red-400",
  DAILY_LIMIT_EXCEEDED: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
}

const CONFIDENCE_STYLE: Record<string, string> = {
  HIGH: "text-emerald-600 dark:text-emerald-400",
  MEDIUM: "text-amber-600 dark:text-amber-400",
  LOW: "text-muted-foreground",
}

const EXCEPTION_STYLE: Record<string, string> = {
  STATUS_MISMATCH: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  DUPLICATE_DEBIT: "bg-red-500/10 text-red-600 dark:text-red-400",
  AMOUNT_MISMATCH: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  MISSING_CREDIT: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
}

// ── Intervention Modal ─────────────────────────────────────────────────────────
interface InterventionModalProps {
  open: boolean
  onClose: () => void
  title: string
  body: React.ReactNode
  onConfirm: () => void
  confirmLabel: string
  confirmVariant?: "default" | "destructive"
  requireReason?: boolean
}

function InterventionModal({ open, onClose, title, body, onConfirm, confirmLabel, confirmVariant = "default", requireReason }: InterventionModalProps) {
  const [reason, setReason] = useState("")
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="text-base">{title}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-1">
          {body}
          {requireReason && (
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={2}
              placeholder="Reason (required)…"
              className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            variant={confirmVariant}
            className="text-xs"
            onClick={() => {
              if (requireReason && !reason.trim()) { toast.error("Reason required"); return }
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Failed Recovery Queue ──────────────────────────────────────────────────────
function FailedRecoveryQueue() {
  const [items, setItems] = useState<FailedRecovery[]>(initialFR)
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<{ type: string; id: string } | null>(null)

  const open = items.filter(i => i.status === "OPEN" || i.status === "IN_PROGRESS")
  const filtered = open.filter(i => !search || i.borrower.toLowerCase().includes(search.toLowerCase()) || i.loanId.toLowerCase().includes(search.toLowerCase()))

  function act(id: string, action: "retry" | "pause" | "escalate" | "assign") {
    setItems(it => it.map(i => i.id === id ? { ...i, status: action === "pause" ? "PAUSED" : "IN_PROGRESS" } : i))
    const msgs = { retry: "Retry queued", pause: "Recovery paused", escalate: "Case escalated", assign: "Case assigned" }
    toast.success(msgs[action])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Search failed recoveries…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-xs" />
        </div>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} open</span>
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">All clear</p>
          </div>
        )}
        {filtered.map(item => (
          <div key={item.id} className="p-5 hover:bg-muted/30 transition-colors">
            <div className="flex items-start gap-4">
              {/* Left: loan info */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{item.borrower}</span>
                  <span className="text-xs font-mono text-muted-foreground">{item.loanId}</span>
                  <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold", FAILURE_REASON_STYLE[item.failureReason])}>
                    {FAILURE_REASON_LABEL[item.failureReason]}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-bold text-foreground monospace-nums">{formatCurrency(item.amount)}</span>
                  <span>·</span>
                  <span>{item.attempts}/{item.maxAttempts} attempts</span>
                  <span>·</span>
                  <span>Last: {formatRelativeTime(item.lastAttempt)}</span>
                  <span>·</span>
                  <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold",
                    item.rail === "NDD" ? "bg-primary/10 text-primary" :
                    item.rail === "REMITA" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
                    "bg-pink-500/10 text-pink-600 dark:text-pink-400"
                  )}>{item.rail}</span>
                </div>

                {/* System recommendations */}
                <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">System Recommendations</p>
                  {item.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={cn("text-[10px] font-bold shrink-0 mt-0.5", CONFIDENCE_STYLE[rec.confidence])}>
                        {rec.confidence}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground">→ {rec.action}</p>
                        <p className="text-[11px] text-muted-foreground">{rec.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex flex-col gap-1.5 shrink-0">
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1.5"
                  disabled={item.attempts >= item.maxAttempts}
                  onClick={() => setModal({ type: "retry", id: item.id })}
                >
                  <RefreshCcw className="h-3 w-3" />
                  Retry Now
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => act(item.id, "escalate")}>
                  <ChevronRight className="h-3 w-3" />
                  Escalate
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => act(item.id, "pause")}>
                  <PauseCircle className="h-3 w-3" />
                  Pause
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setModal({ type: "assign", id: item.id })}>
                  <UserPlus className="h-3 w-3" />
                  Assign
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Retry confirm */}
      <InterventionModal
        open={modal?.type === "retry"}
        onClose={() => setModal(null)}
        title="Confirm Retry"
        body={
          <div className="rounded-xl border border-border p-3 text-sm text-muted-foreground">
            Retry will immediately queue a debit attempt. Only proceed if you have confirmed funds are available.
          </div>
        }
        confirmLabel="Confirm Retry"
        onConfirm={() => act(modal!.id, "retry")}
      />

      {/* Assign modal */}
      <InterventionModal
        open={modal?.type === "assign"}
        onClose={() => setModal(null)}
        title="Assign Case"
        body={
          <div className="space-y-2">
            {["Fatima Bello", "Chidi Okeke", "Yusuf Ibrahim", "Kemi Okonkwo"].map(officer => (
              <button
                key={officer}
                className="w-full text-left rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors flex items-center justify-between"
                onClick={() => {
                  setItems(it => it.map(i => i.id === modal!.id ? { ...i, assignedTo: officer, status: "IN_PROGRESS" } : i))
                  toast.success(`Assigned to ${officer}`)
                  setModal(null)
                }}
              >
                {officer}
                <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        }
        confirmLabel=""
        onConfirm={() => {}}
      />
    </div>
  )
}

// ── Mandate Issues Queue ───────────────────────────────────────────────────────
function MandateIssueQueue() {
  const issues = mandates.filter(m => m.status === "FAILED" || m.status === "EXPIRED")

  return (
    <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
      {issues.map(m => (
        <div key={m.id} className="flex items-start gap-4 p-5 hover:bg-muted/30 transition-colors">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{m.borrower}</span>
              <span className="text-xs font-mono text-muted-foreground">{m.reference}</span>
              <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold",
                m.status === "FAILED" ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
              )}>
                MANDATE_{m.status}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {m.bank} · {m.accountNumber.slice(-4).padStart(m.accountNumber.length, "•")} · {m.rail} · Max {formatCurrency(m.maxAmount)}
            </div>
            <div className="rounded-lg bg-muted/50 border border-border px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Recommended Action</p>
              {m.status === "FAILED" && <p className="text-xs text-foreground">→ Remove failed account, trigger iGree for new account consent</p>}
              {m.status === "EXPIRED" && <p className="text-xs text-foreground">→ Renew mandate — send iGree consent link to borrower</p>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            <Button size="sm" className="h-7 text-xs gap-1.5" onClick={() => toast.info("Opening mandate renewal flow")}>
              <CreditCard className="h-3 w-3" />
              {m.status === "FAILED" ? "Replace" : "Renew"}
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => toast.info("iGree consent link sent")}>
              <Zap className="h-3 w-3" />
              iGree Link
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Reconciliation Exception Queue ─────────────────────────────────────────────
function ReconQueue() {
  const [items, setItems] = useState<ReconciliationException[]>(initialRecon)
  const open = items.filter(i => !i.assignedTo || true) // show all

  function resolve(id: string) {
    setItems(it => it.filter(i => i.id !== id))
    toast.success("Exception resolved")
  }

  return (
    <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
      {open.map(exc => (
        <div key={exc.id} className="flex items-start gap-4 p-5 hover:bg-muted/30 transition-colors">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{exc.borrower}</span>
              <span className="text-xs font-mono text-muted-foreground">{exc.transactionId}</span>
              <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold", EXCEPTION_STYLE[exc.exceptionType])}>
                {exc.exceptionType.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-bold text-foreground monospace-nums">{formatCurrency(exc.amount)}</span>
              <span>·</span>
              <span>Internal: <span className={cn("font-semibold", exc.internalStatus === "SUCCESS" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>{exc.internalStatus}</span></span>
              <span>·</span>
              <span>Bank: <span className={cn("font-semibold", exc.bankStatus === "CONFIRMED" ? "text-emerald-600 dark:text-emerald-400" : exc.bankStatus === "REJECTED" ? "text-red-500" : "text-amber-500")}>{exc.bankStatus}</span></span>
              <span>·</span>
              <span>{exc.rail}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            <Button size="sm" className="h-7 text-xs gap-1.5" onClick={() => toast.info("Bank confirmation request sent")}>
              <FileSearch className="h-3 w-3" />
              Investigate
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/20" onClick={() => resolve(exc.id)}>
              <CheckCircle2 className="h-3 w-3" />
              Resolve
            </Button>
            {exc.exceptionType === "DUPLICATE_DEBIT" && (
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => toast.info("Reversal initiated")}>
                <XCircle className="h-3 w-3" />
                Reverse
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Dispute Queue ──────────────────────────────────────────────────────────────
function DisputeQueue() {
  const active = initialDisputes.filter(d => d.status === "OPEN" || d.status === "INVESTIGATING")
  return (
    <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
      {active.map(d => (
        <div key={d.id} className="flex items-start gap-4 p-5 hover:bg-muted/30 transition-colors">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{d.borrower}</span>
              <span className="text-xs font-mono text-muted-foreground">{d.id}</span>
              <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold",
                d.status === "OPEN" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              )}>{d.status}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{d.type}</span>
              <span>·</span>
              <span className="font-bold text-foreground monospace-nums">{formatCurrency(d.amount)}</span>
              <span>·</span>
              <span>Filed {formatRelativeTime(d.filedAt)}</span>
            </div>
            <p className="text-xs text-muted-foreground italic">{d.description}</p>
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            <Button size="sm" className="h-7 text-xs gap-1.5" asChild>
              <a href="/disputes">
                <ExternalLink className="h-3 w-3" />
                Review
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ActionQueuesPage() {
  const params = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabKey>((params.get("tab") as TabKey) ?? "failed")

  useEffect(() => {
    const t = params.get("tab") as TabKey
    if (t) setActiveTab(t)
  }, [params])

  const totalOpen = TABS.reduce((a, t) => a + t.count, 0)

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Action Queues"
        description={`${totalOpen} items requiring intervention`}
      />

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* Tab bar */}
        <div className="flex border-b border-border gap-0 overflow-x-auto no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors",
                activeTab === tab.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                activeTab === tab.key ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Queue content */}
        {activeTab === "failed" && <FailedRecoveryQueue />}
        {activeTab === "mandates" && <MandateIssueQueue />}
        {activeTab === "recon" && <ReconQueue />}
        {activeTab === "disputes" && <DisputeQueue />}
      </div>
    </div>
  )
}
