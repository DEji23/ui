"use client"

import { useState, useEffect } from "react"
import { X, Clock, AlertTriangle, CheckCircle2, XCircle, MessageSquare, User } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { type Dispute, type DisputeNote, disputeNotes } from "@/lib/mock-data"
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
  INVESTIGATING: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  ESCALATED: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  RESOLVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400",
  CLOSED: "bg-muted text-muted-foreground",
}

const SLA_STYLE: Record<string, string> = {
  safe: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  warning: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  urgent: "text-orange-600 dark:text-orange-400 bg-orange-500/10",
  breached: "text-red-600 dark:text-red-400 bg-red-500/10",
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-xs text-muted-foreground shrink-0 min-w-[120px]">{label}</span>
      <span className="text-xs font-medium text-foreground text-right">{value}</span>
    </div>
  )
}

export function DisputeDetailDrawer({ dispute, open, onClose, onStatusChange }: DisputeDetailDrawerProps) {
  const [note, setNote] = useState("")
  const [localNotes, setLocalNotes] = useState<DisputeNote[]>([])
  const [localStatus, setLocalStatus] = useState<Dispute["status"] | null>(null)
  const [resolving, setResolving] = useState<"resolve" | "reject" | null>(null)
  const [resolution, setResolution] = useState("")

  useEffect(() => {
    if (dispute) {
      setLocalNotes(disputeNotes[dispute.id] ?? [])
      setLocalStatus(null)
      setNote("")
      setResolving(null)
      setResolution("")
    }
  }, [dispute])

  if (!dispute) return null

  const status = localStatus ?? dispute.status
  const canInvestigate = status === "OPEN"
  const canEscalate = status === "OPEN" || status === "INVESTIGATING"
  const canResolve = status !== "RESOLVED" && status !== "REJECTED" && status !== "CLOSED"

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
    onStatusChange?.(dispute.id, s)
    toast.success(`Status updated to ${s}`)
  }

  function submitResolution() {
    if (!resolution.trim()) { toast.error("Please enter a resolution note"); return }
    const s = resolving === "resolve" ? "RESOLVED" : "REJECTED"
    changeStatus(s)
    setLocalNotes(n => [...n, {
      id: `n${Date.now()}`,
      author: "Adaora Nwosu",
      role: "Recovery Manager",
      timestamp: new Date().toISOString(),
      text: `[${s}] ${resolution.trim()}`,
    }])
    setResolving(null)
    setResolution("")
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-full sm:w-[520px] sm:max-w-none p-0 flex flex-col gap-0">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <SheetTitle className="text-base font-semibold">{dispute.id}</SheetTitle>
              <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", STATUS_STYLE[status])}>
                {status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{dispute.type}</p>
          </div>
          <button onClick={onClose} className="ml-2 shrink-0 rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* SLA bar */}
        {status !== "RESOLVED" && status !== "REJECTED" && status !== "CLOSED" && (
          <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">SLA Deadline: {formatDate(dispute.slaDeadline)}</span>
            <SLACountdown deadline={dispute.slaDeadline} />
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Borrower + dispute details */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Dispute Details</p>
              <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                <InfoRow label="Borrower" value={dispute.borrower} />
                <InfoRow label="Phone" value={dispute.phone} />
                <InfoRow label="Loan ID" value={dispute.loanId} />
                <InfoRow label="Amount in Dispute" value={formatCurrency(dispute.amount)} />
                <InfoRow label="Rail" value={dispute.rail} />
                <InfoRow label="Filed" value={formatRelativeTime(dispute.filedAt)} />
                <InfoRow label="Assigned To" value={dispute.assignedTo} />
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl border border-border p-4 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Borrower Statement</p>
                  <p className="text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed">{dispute.description}</p>
                </div>
              </div>
            </div>

            {/* Status actions */}
            {canResolve && !resolving && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Actions</p>
                <div className="flex gap-2 flex-wrap">
                  {canInvestigate && (
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => changeStatus("INVESTIGATING")}>
                      Mark Investigating
                    </Button>
                  )}
                  {canEscalate && (
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => changeStatus("ESCALATED")}>
                      Escalate
                    </Button>
                  )}
                  <Button size="sm" className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setResolving("resolve")}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Resolve (Upheld)
                  </Button>
                  <Button size="sm" variant="destructive" className="gap-1.5 text-xs" onClick={() => setResolving("reject")}>
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {/* Resolution form */}
            {resolving && (
              <div className={cn(
                "rounded-xl border p-4 space-y-3",
                resolving === "resolve" ? "border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20"
              )}>
                <p className="text-xs font-semibold text-foreground">
                  {resolving === "resolve" ? "Resolve dispute — add resolution note" : "Reject dispute — add reason"}
                </p>
                <textarea
                  value={resolution}
                  onChange={e => setResolution(e.target.value)}
                  rows={3}
                  placeholder={resolving === "resolve" ? "Describe the resolution outcome…" : "Reason for rejection…"}
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="text-xs gap-1.5" onClick={submitResolution}>
                    Confirm {resolving === "resolve" ? "Resolution" : "Rejection"}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => setResolving(null)}>Cancel</Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Notes / Timeline */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Investigation Notes</p>
              {localNotes.length === 0 ? (
                <p className="text-xs text-muted-foreground">No notes yet.</p>
              ) : (
                <div className="space-y-3">
                  {localNotes.map(n => (
                    <div key={n.id} className="flex items-start gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 rounded-xl bg-muted/50 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
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
            </div>

            {/* Add note */}
            <div className="flex gap-2 items-end">
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                placeholder="Add a note or update…"
                className="flex-1 text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
              <Button size="sm" className="h-9 gap-1.5 text-xs shrink-0" onClick={addNote}>
                <MessageSquare className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
