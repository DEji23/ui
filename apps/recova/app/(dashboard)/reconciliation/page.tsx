"use client"

import { useState } from "react"
import {
  CheckCircle2, AlertTriangle, Clock, Search, RefreshCcw, ArrowRightLeft,
  FileText, Zap, ChevronRight, X, User, Building2, TrendingDown,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  reconKPIs, reconTransactions, reconSettlements, reconCases,
  type ReconCase, type ReconTransaction, type ReconClassification, type ReconCaseStatus,
  type RecoveryRail,
} from "@/lib/mock-data"
import { formatCurrency, formatRelativeTime, formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ─── Classification config ─────────────────────────────────────────────────────────────────────────

const CLASS_CONFIG: Record<ReconClassification, {
  label: string; color: string; bg: string; border: string; icon: React.ReactNode; desc: string
}> = {
  MATCHED: {
    label: "Matched",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-900",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    desc: "Transaction and settlement records agree",
  },
  MISSING_SETTLEMENT: {
    label: "Missing Settlement",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-900",
    icon: <Clock className="h-3.5 w-3.5" />,
    desc: "Debit succeeded internally — bank settlement not yet received",
  },
  MISSING_INTERNAL: {
    label: "Missing Internal",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-200 dark:border-red-900",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    desc: "Settlement received with no matching internal transaction — possible system bug",
  },
  DUPLICATE: {
    label: "Duplicate",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-200 dark:border-orange-900",
    icon: <ArrowRightLeft className="h-3.5 w-3.5" />,
    desc: "Same transaction processed more than once",
  },
  REVERSED: {
    label: "Reversed",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-200 dark:border-purple-900",
    icon: <RefreshCcw className="h-3.5 w-3.5" />,
    desc: "Settlement reversed post-confirmation — ledger adjustment required",
  },
}

const CASE_STATUS_STYLE: Record<ReconCaseStatus, string> = {
  OPEN: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  INVESTIGATING: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  RESOLVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────────────────────

function CaseDrawer({
  recase, open, onClose, onUpdate,
}: {
  recase: ReconCase | null
  open: boolean
  onClose: () => void
  onUpdate: (id: string, update: Partial<ReconCase>) => void
}) {
  const [note, setNote] = useState("")
  const [resolution, setResolution] = useState("")
  const [resolving, setResolving] = useState(false)
  const [assignee, setAssignee] = useState("")

  if (!recase || !open) return null

  const txn = reconTransactions.find(t => t.id === recase.transactionId)
  const stl = reconSettlements.find(s => s.transactionId === recase.transactionId)
  const cfg = CLASS_CONFIG[recase.classification]

  function startInvestigating() {
    const a = assignee.trim() || "Kunle Adesanya"
    onUpdate(recase!.id, { status: "INVESTIGATING", assignedTo: a })
    toast.success(`Case assigned to ${a} — investigation started`)
  }

  function resolve() {
    if (!resolution.trim()) { toast.error("Resolution note required"); return }
    onUpdate(recase!.id, {
      status: "RESOLVED",
      resolvedAt: new Date().toISOString(),
      resolution: resolution.trim(),
    })
    setResolving(false)
    setResolution("")
    toast.success("Case resolved")
  }

  function addNote() {
    if (!note.trim()) return
    onUpdate(recase!.id, { notes: (recase!.notes ? recase!.notes + "\n\n" : "") + `[${new Date().toLocaleTimeString()}] ${note.trim()}` })
    setNote("")
    toast.success("Note added")
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full sm:w-[560px] flex-col bg-background border-l border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base font-semibold">{recase.id}</p>
              <span className={cn("flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold", cfg.bg, cfg.color)}>
                {cfg.icon}
                {cfg.label}
              </span>
              <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", CASE_STATUS_STYLE[recase.status])}>
                {recase.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{cfg.desc}</p>
          </div>
          <button onClick={onClose} className="ml-2 shrink-0 rounded-lg p-1.5 hover:bg-muted text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Core fields */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Case Summary</p>
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
              {[
                ["Loan ID", recase.loanId],
                ["Borrower", recase.borrower],
                ["Amount", formatCurrency(recase.amount)],
                ["Rail", recase.rail],
                ["External Ref", recase.externalReference],
                ["Internal Status", recase.internalStatus],
                ["Bank Status", recase.bankStatus],
                ["Aging", recase.status === "RESOLVED" ? "Resolved" : `${recase.agingHours}h`],
                ["Assigned To", recase.assignedTo ?? "Unassigned"],
                ["Created", formatRelativeTime(recase.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 px-4 py-2">
                  <span className="text-xs text-muted-foreground shrink-0 min-w-[120px]">{k}</span>
                  <span className="text-xs font-medium text-foreground text-right font-mono">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Event vs Settlement Event side-by-side */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Event Comparison</p>
            <div className="grid grid-cols-2 gap-3">
              <div className={cn("rounded-xl border p-4 space-y-2", txn ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20")}>
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs font-semibold text-foreground">Transaction Event</p>
                </div>
                {txn ? (
                  <div className="space-y-1">
                    {[
                      ["ID", txn.id],
                      ["Status", txn.internalStatus],
                      ["Amount", formatCurrency(txn.amount)],
                      ["At", formatRelativeTime(txn.createdAt)],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2">
                        <span className="text-[10px] text-muted-foreground">{k}</span>
                        <span className="text-[10px] font-medium text-foreground text-right font-mono truncate">{v}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 mt-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    No internal record
                  </p>
                )}
              </div>

              <div className={cn("rounded-xl border p-4 space-y-2", stl ? "border-emerald-200 dark:border-emerald-900 bg-emerald-500/5" : "border-border bg-muted/20")}>
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-xs font-semibold text-foreground">Settlement Event</p>
                </div>
                {stl ? (
                  <div className="space-y-1">
                    {[
                      ["ID", stl.id],
                      ["Status", stl.settlementStatus],
                      ["Amount", formatCurrency(stl.amount)],
                      ["Date", formatRelativeTime(stl.settlementDate)],
                      ["Bank", stl.bank],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2">
                        <span className="text-[10px] text-muted-foreground">{k}</span>
                        <span className="text-[10px] font-medium text-foreground text-right font-mono truncate">{v}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-1">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    No settlement received
                  </p>
                )}
              </div>
            </div>

            {/* Amount mismatch indicator */}
            {txn && stl && txn.amount !== stl.amount && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-200 dark:border-red-900 px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  Amount mismatch: debited {formatCurrency(txn.amount)} vs settled {formatCurrency(stl.amount)}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {recase.notes && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Notes</p>
              <div className="rounded-xl bg-muted/30 border border-border p-4">
                <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">{recase.notes}</p>
              </div>
            </div>
          )}

          {/* Resolution */}
          {recase.status === "RESOLVED" && recase.resolution && (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Resolution</p>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">{recase.resolution}</p>
              {recase.resolvedAt && (
                <p className="text-[10px] text-muted-foreground mt-2">Resolved {formatRelativeTime(recase.resolvedAt)}</p>
              )}
            </div>
          )}

          {/* Actions */}
          {recase.status !== "RESOLVED" && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Actions</p>

              {recase.status === "OPEN" && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={assignee}
                      onChange={e => setAssignee(e.target.value)}
                      placeholder="Assign to (default: Kunle Adesanya)"
                      className="flex-1 text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <Button size="sm" className="text-xs shrink-0" onClick={startInvestigating}>
                      Start Investigation
                    </Button>
                  </div>
                </div>
              )}

              {recase.status === "INVESTIGATING" && !resolving && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Add investigation note…"
                      className="flex-1 text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <Button variant="outline" size="sm" className="text-xs shrink-0" onClick={addNote}>Add Note</Button>
                  </div>
                  <Button size="sm" className="w-full text-xs gap-1.5" onClick={() => setResolving(true)}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark Resolved
                  </Button>
                </div>
              )}

              {resolving && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-500/10 p-4 space-y-3">
                  <p className="text-xs font-semibold text-foreground">Resolve case — add resolution outcome</p>
                  <textarea
                    value={resolution}
                    onChange={e => setResolution(e.target.value)}
                    rows={3}
                    placeholder="Describe what was done to resolve this case — e.g., refund issued, ledger adjusted, root cause identified…"
                    className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="text-xs flex-1" onClick={resolve}>Confirm Resolution</Button>
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => setResolving(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────────────────────

type TabKey = "transactions" | "cases"

const AGING_STYLE = (hours: number, status: ReconCaseStatus) => {
  if (status === "RESOLVED") return "text-muted-foreground"
  if (hours >= 48) return "text-red-600 dark:text-red-400 font-semibold"
  if (hours >= 24) return "text-amber-600 dark:text-amber-400 font-semibold"
  return "text-muted-foreground"
}

export default function ReconciliationPage() {
  const [tab, setTab] = useState<TabKey>("transactions")
  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState<ReconClassification | "ALL">("ALL")
  const [statusFilter, setStatusFilter] = useState<ReconCaseStatus | "ALL">("ALL")
  const [cases, setCases] = useState<ReconCase[]>(reconCases)
  const [selectedCase, setSelectedCase] = useState<ReconCase | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  function updateCase(id: string, update: Partial<ReconCase>) {
    setCases(cs => cs.map(c => c.id === id ? { ...c, ...update } : c))
    setSelectedCase(prev => prev?.id === id ? { ...prev, ...update } : prev)
  }

  const filteredTxns = reconTransactions.filter(t => {
    if (classFilter !== "ALL" && t.classification !== classFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!t.borrower.toLowerCase().includes(q) && !t.loanId.toLowerCase().includes(q) && !t.externalReference.toLowerCase().includes(q)) return false
    }
    return true
  })

  const filteredCases = cases.filter(c => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false
    if (classFilter !== "ALL" && c.classification !== classFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!c.borrower.toLowerCase().includes(q) && !c.loanId.toLowerCase().includes(q) && !c.transactionId.toLowerCase().includes(q)) return false
    }
    return true
  })

  const classBreakdown = Object.fromEntries(
    (Object.keys(CLASS_CONFIG) as ReconClassification[]).map(k => [
      k,
      reconTransactions.filter(t => t.classification === k).length,
    ])
  ) as Record<ReconClassification, number>

  const openCount = cases.filter(c => c.status !== "RESOLVED").length
  const criticalAging = cases.filter(c => c.agingHours >= 48 && c.status !== "RESOLVED").length

  return (
    <div className="flex flex-col">
      <Header
        title="Reconciliation Engine"
        description="Match transactions against settlements and resolve discrepancies"
        actions={
          <div className="flex items-center gap-2">
            {criticalAging > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-200 dark:border-red-900 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                  {criticalAging} critical aging
                </span>
              </div>
            )}
            <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={() => toast.info("Ingesting latest settlement files…")}>
              <RefreshCcw className="h-3.5 w-3.5" />
              Ingest Reports
            </Button>
            <Button size="sm" className="gap-2 text-xs" onClick={() => { setTab("cases"); setStatusFilter("OPEN") }}>
              <Zap className="h-3.5 w-3.5" />
              Open Cases ({openCount})
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-5">

        {/* KPI bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={cn(reconKPIs.gapRate <= reconKPIs.gapRateTarget ? "" : "border-red-200 dark:border-red-900")}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-1">
                <p className="text-xs text-muted-foreground">Reconciliation Gap Rate</p>
                <span className={cn(
                  "text-[10px] font-semibold rounded px-1.5 py-0.5",
                  reconKPIs.gapRate <= reconKPIs.gapRateTarget
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                )}>
                  Target &lt;{reconKPIs.gapRateTarget}%
                </span>
              </div>
              <p className={cn("text-2xl font-bold monospace-nums", reconKPIs.gapRate <= reconKPIs.gapRateTarget ? "text-foreground" : "text-red-600 dark:text-red-400")}>
                {reconKPIs.gapRate}%
              </p>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-2">
                <div
                  className={cn("h-full rounded-full", reconKPIs.gapRate <= reconKPIs.gapRateTarget ? "bg-emerald-500" : "bg-red-500")}
                  style={{ width: `${Math.min((reconKPIs.gapRate / reconKPIs.gapRateTarget) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className={cn(reconKPIs.avgResolutionHours <= reconKPIs.resolutionTarget ? "" : "border-amber-200 dark:border-amber-900")}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-1">
                <p className="text-xs text-muted-foreground">Avg Resolution Time</p>
                <span className="text-[10px] font-semibold rounded px-1.5 py-0.5 bg-muted text-muted-foreground">
                  Target &lt;{reconKPIs.resolutionTarget}h
                </span>
              </div>
              <p className={cn("text-2xl font-bold monospace-nums", reconKPIs.avgResolutionHours <= reconKPIs.resolutionTarget ? "text-foreground" : "text-amber-600 dark:text-amber-400")}>
                {reconKPIs.avgResolutionHours}h
              </p>
              <p className="text-xs text-muted-foreground mt-1">{reconKPIs.resolvedToday} resolved today</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Match Rate</p>
              <p className="text-2xl font-bold text-foreground monospace-nums">{reconKPIs.matchRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {reconKPIs.totalSettlements.toLocaleString()} / {reconKPIs.totalTransactions.toLocaleString()} txns
              </p>
            </CardContent>
          </Card>

          <Card className={cn(reconKPIs.duplicatesDetected > 0 ? "border-orange-200 dark:border-orange-900" : "")}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Duplicates Detected</p>
              <p className={cn("text-2xl font-bold monospace-nums", reconKPIs.duplicatesDetected > 0 ? "text-orange-600 dark:text-orange-400" : "text-foreground")}>
                {reconKPIs.duplicatesDetected}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{reconKPIs.openCases} open exception cases</p>
            </CardContent>
          </Card>
        </div>

        {/* Classification summary strip */}
        <div className="grid grid-cols-5 gap-3">
          {(Object.entries(CLASS_CONFIG) as [ReconClassification, typeof CLASS_CONFIG[ReconClassification]][]).map(([k, cfg]) => (
            <button
              key={k}
              onClick={() => setClassFilter(classFilter === k ? "ALL" : k)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all hover:ring-1 hover:ring-primary",
                classFilter === k ? cfg.border + " ring-1 ring-primary " + cfg.bg : "border-border hover:border-primary/40"
              )}
            >
              <div className={cn("flex items-center gap-1.5 mb-1.5", cfg.color)}>
                {cfg.icon}
                <span className="text-[10px] font-semibold uppercase tracking-wide">{cfg.label}</span>
              </div>
              <p className={cn("text-xl font-bold monospace-nums", cfg.color)}>{classBreakdown[k]}</p>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center border-b border-border">
            <div className="flex">
              {([
                { key: "transactions" as const, label: "Transaction Matching", icon: <ArrowRightLeft className="h-3.5 w-3.5" /> },
                { key: "cases" as const, label: "Exception Cases", icon: <Zap className="h-3.5 w-3.5" /> },
              ]).map(t => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setSearch("") }}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3.5 text-xs font-medium transition-colors border-b-2 -mb-px",
                    tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex-1 flex items-center justify-end gap-3 px-4 py-2">
              {tab === "cases" && (
                <div className="flex gap-1.5">
                  {(["ALL", "OPEN", "INVESTIGATING", "RESOLVED"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
                        statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs w-48" />
              </div>
            </div>
          </div>

          {/* Transaction Matching Tab */}
          {tab === "transactions" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead className="border-b border-border">
                  <tr>
                    {["Transaction", "Borrower / Loan", "Rail", "Amount", "Internal Status", "Classification", "Settlement", "Age"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTxns.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">No transactions match filters</td></tr>
                  ) : filteredTxns.map(txn => {
                    const cfg = CLASS_CONFIG[txn.classification]
                    const stl = reconSettlements.find(s => s.transactionId === txn.id)
                    const linked = cases.find(c => c.transactionId === txn.id)
                    return (
                      <tr
                        key={txn.id}
                        onClick={() => {
                          if (linked) { setSelectedCase(linked); setDrawerOpen(true) }
                        }}
                        className={cn("hover:bg-muted/40 transition-colors", linked ? "cursor-pointer" : "")}
                      >
                        <td className="px-4 py-3">
                          <p className="text-xs font-mono text-foreground">{txn.id}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{txn.externalReference}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-foreground">{txn.borrower}</p>
                          <p className="text-[11px] text-muted-foreground">{txn.loanId}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">{txn.rail}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold monospace-nums text-foreground">{formatCurrency(txn.amount)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                            txn.internalStatus === "SUCCESS" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : txn.internalStatus === "PENDING" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-red-500/10 text-red-600 dark:text-red-400"
                          )}>
                            {txn.internalStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold w-fit", cfg.bg, cfg.color)}>
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {stl ? (
                            <div>
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{stl.settlementStatus}</span>
                              <p className="text-[10px] text-muted-foreground">{stl.bank}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(txn.createdAt)}
                          </span>
                          {linked && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <ChevronRight className="h-3 w-3 text-primary" />
                              <span className="text-[10px] text-primary">View case</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="border-t border-border px-4 py-2.5">
                <span className="text-xs text-muted-foreground">{filteredTxns.length} transactions</span>
              </div>
            </div>
          )}

          {/* Exception Cases Tab */}
          {tab === "cases" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead className="border-b border-border">
                  <tr>
                    {["Case", "Borrower / Loan", "Classification", "Amount", "Rail", "Aging", "Assigned To", "Status"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCases.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">No cases match filters</td></tr>
                  ) : filteredCases.map(c => {
                    const cfg = CLASS_CONFIG[c.classification]
                    return (
                      <tr
                        key={c.id}
                        onClick={() => { setSelectedCase(c); setDrawerOpen(true) }}
                        className="hover:bg-muted/40 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <p className="text-xs font-mono text-foreground">{c.id}</p>
                          <p className="text-[10px] font-mono text-muted-foreground">{c.transactionId}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-foreground">{c.borrower}</p>
                          <p className="text-[11px] text-muted-foreground">{c.loanId}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold w-fit", cfg.bg, cfg.color)}>
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold monospace-nums text-foreground">{formatCurrency(c.amount)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">{c.rail}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("text-xs", AGING_STYLE(c.agingHours, c.status))}>
                            {c.status === "RESOLVED" ? (
                              c.resolvedAt ? formatRelativeTime(c.resolvedAt) : "—"
                            ) : (
                              `${c.agingHours}h`
                            )}
                          </span>
                          {c.agingHours >= 48 && c.status !== "RESOLVED" && (
                            <p className="text-[10px] text-red-600 dark:text-red-400">Overdue</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">
                            {c.assignedTo ?? <span className="text-amber-600 dark:text-amber-400">Unassigned</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", CASE_STATUS_STYLE[c.status])}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="border-t border-border px-4 py-2.5">
                <span className="text-xs text-muted-foreground">{filteredCases.length} case{filteredCases.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <CaseDrawer
        recase={selectedCase}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={updateCase}
      />
    </div>
  )
}
