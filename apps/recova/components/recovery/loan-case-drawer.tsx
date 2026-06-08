"use client"

import { useState } from "react"
import {
  X, Phone, Mail, MapPin, CreditCard, CheckCircle2,
  Clock, ChevronRight, RefreshCcw, FileText, MessageSquare,
  AlertTriangle, ChevronDown,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { LoanStateBadge } from "@/components/recovery/loan-state-badge"
import { type Loan, type EscalationTier } from "@/lib/mock-data"
import { formatCurrency, formatDate, maskBVN, maskAccount, formatRelativeTime } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface LoanCaseDrawerProps {
  loan: Loan | null
  open: boolean
  onClose: () => void
}

const RAIL_COLORS: Record<string, string> = {
  NDD: "bg-primary/10 text-primary",
  REMITA: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  EASY_PAY: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  MANUAL: "bg-muted text-muted-foreground",
}

const TIER_COLORS: Record<EscalationTier, string> = {
  TIER_1: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  TIER_2: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  TIER_3: "bg-red-500/10 text-red-600 dark:text-red-400",
  LEGAL: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
}

const NEXT_TIER: Record<EscalationTier, EscalationTier | null> = {
  TIER_1: "TIER_2",
  TIER_2: "TIER_3",
  TIER_3: "LEGAL",
  LEGAL: null,
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-xs text-muted-foreground shrink-0 min-w-[120px]">{label}</span>
      <span className={cn("text-xs font-medium text-foreground text-right truncate", mono && "monospace-nums")}>{value}</span>
    </div>
  )
}

function RetryDialog({ open, loan, onClose, onConfirm }: {
  open: boolean; loan: Loan | null; onClose: () => void; onConfirm: () => void
}) {
  if (!loan) return null
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Trigger Manual Retry</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="rounded-xl border border-border divide-y divide-border overflow-hidden text-sm">
            <div className="flex justify-between px-3 py-2.5">
              <span className="text-xs text-muted-foreground">Borrower</span>
              <span className="text-xs font-medium">{loan.borrower}</span>
            </div>
            <div className="flex justify-between px-3 py-2.5">
              <span className="text-xs text-muted-foreground">Loan</span>
              <span className="text-xs font-mono">{loan.loanId}</span>
            </div>
            <div className="flex justify-between px-3 py-2.5">
              <span className="text-xs text-muted-foreground">Rail</span>
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", RAIL_COLORS[loan.rail])}>{loan.rail}</span>
            </div>
            <div className="flex justify-between px-3 py-2.5">
              <span className="text-xs text-muted-foreground">Amount</span>
              <span className="text-xs font-bold monospace-nums">{formatCurrency(loan.outstanding)}</span>
            </div>
            <div className="flex justify-between px-3 py-2.5">
              <span className="text-xs text-muted-foreground">Attempt</span>
              <span className="text-xs font-medium">{loan.retryCount + 1} of {loan.maxRetries}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This will immediately queue a debit attempt on the borrower's account. Only proceed if you have confirmed sufficient funds.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="text-xs gap-1.5" onClick={onConfirm}>
            <RefreshCcw className="h-3.5 w-3.5" />
            Confirm Retry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EscalateDialog({ open, loan, onClose, onConfirm }: {
  open: boolean; loan: Loan | null; onClose: () => void; onConfirm: (tier: EscalationTier, reason: string) => void
}) {
  const [reason, setReason] = useState("")
  if (!loan) return null
  const nextTier = NEXT_TIER[loan.tier]

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Escalate Case</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
            <div className="flex justify-between px-3 py-2.5">
              <span className="text-xs text-muted-foreground">Current Tier</span>
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", TIER_COLORS[loan.tier])}>{loan.tier.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between px-3 py-2.5 items-center">
              <span className="text-xs text-muted-foreground">Escalate To</span>
              {nextTier ? (
                <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", TIER_COLORS[nextTier])}>{nextTier.replace("_", " ")}</span>
              ) : (
                <span className="text-xs text-muted-foreground">Already at highest tier</span>
              )}
            </div>
          </div>

          {nextTier ? (
            <>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-foreground">Escalation reason <span className="text-destructive">*</span></p>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={3}
                  placeholder="Describe why this case needs escalation…"
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
              </div>
              {nextTier === "LEGAL" && (
                <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                    Escalating to Legal will initiate demand letter procedures and may require maker-checker approval.
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">This case is already in the highest escalation tier. Use the Legal Review page to manage next steps.</p>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={onClose}>Cancel</Button>
          {nextTier && (
            <Button
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => { if (!reason.trim()) { toast.error("Please enter a reason"); return } onConfirm(nextTier, reason) }}
            >
              <ChevronRight className="h-3.5 w-3.5" />
              Escalate to {nextTier.replace("_", " ")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function LoanCaseDrawer({ loan, open, onClose }: LoanCaseDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [retryOpen, setRetryOpen] = useState(false)
  const [escalateOpen, setEscalateOpen] = useState(false)
  const [localLoan, setLocalLoan] = useState<Loan | null>(null)

  if (!loan) return null
  const l = localLoan ?? loan

  const recoveryPct = Math.min(100, Math.round(((l.disbursed - l.outstanding) / l.disbursed) * 100))

  const timelineEvents = [
    { date: l.disbursedAt, label: "Loan disbursed", icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> },
    { date: l.dueDate, label: "Due date", icon: <Clock className="h-3.5 w-3.5 text-amber-500" /> },
    ...(l.lastAttempt ? [{ date: l.lastAttempt, label: "Last collection attempt", icon: <RefreshCcw className="h-3.5 w-3.5 text-primary" /> }] : []),
    { date: l.updatedAt, label: "Last updated", icon: <Clock className="h-3.5 w-3.5 text-muted-foreground" /> },
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <>
      <Sheet open={open} onOpenChange={v => !v && onClose()}>
        <SheetContent className="w-full sm:w-[520px] sm:max-w-none p-0 flex flex-col gap-0">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-border">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <SheetTitle className="text-base font-semibold">{l.borrower}</SheetTitle>
                <LoanStateBadge state={l.state} />
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-muted-foreground monospace-nums">{l.loanId}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold border-0", RAIL_COLORS[l.rail])}>{l.rail}</span>
                <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold border-0", TIER_COLORS[l.tier])}>{l.tier.replace("_", " ")}</span>
              </div>
            </div>
            <button onClick={onClose} className="ml-2 shrink-0 rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress */}
          <div className="px-5 py-4 bg-muted/30 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">Recovery Progress</span>
              <span className="text-xs font-bold text-foreground">{recoveryPct}%</span>
            </div>
            <Progress value={recoveryPct} className="h-2" />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">Collected: {formatCurrency(l.disbursed - l.outstanding)}</span>
              <span className="text-xs text-muted-foreground">Outstanding: <span className="font-semibold text-destructive">{formatCurrency(l.outstanding)}</span></span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full rounded-none border-b border-border bg-transparent h-auto px-5 gap-0 justify-start">
              {["overview", "mandates", "timeline", "notes"].map(tab => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2.5 text-xs capitalize font-medium"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="overview" className="mt-0 p-5 space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Borrower</p>
                  <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                    <InfoRow label="Full Name" value={l.borrower} />
                    <InfoRow label="BVN" value={maskBVN(l.bvn)} mono />
                    <InfoRow label="Account" value={maskAccount(l.accountNumber)} mono />
                    <InfoRow label="Bank" value={l.bank} />
                    <InfoRow label="Phone" value={l.phone} mono />
                    <InfoRow label="Email" value={l.email} />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Loan Details</p>
                  <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                    <InfoRow label="Disbursed" value={formatCurrency(l.disbursed)} mono />
                    <InfoRow label="Outstanding" value={formatCurrency(l.outstanding)} mono />
                    <InfoRow label="Interest Rate" value={`${l.interestRate}% p.a.`} />
                    <InfoRow label="Due Date" value={formatDate(l.dueDate)} />
                    <InfoRow label="Days Past Due" value={`${l.dpd} days`} />
                    <InfoRow label="Product" value={l.product} />
                    <InfoRow label="Branch" value={l.branch} />
                    <InfoRow label="Retries" value={`${l.retryCount} / ${l.maxRetries}`} />
                    {l.lastAttempt && <InfoRow label="Last Attempt" value={formatRelativeTime(l.lastAttempt)} />}
                    {l.nextRetry && <InfoRow label="Next Retry" value={formatDate(l.nextRetry)} />}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="gap-2 h-9 text-xs" onClick={() => { toast.info("Calling " + l.phone) }}>
                    <Phone className="h-3.5 w-3.5" />Call Borrower
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 h-9 text-xs" onClick={() => { toast.info("Email drafted to " + l.email) }}>
                    <Mail className="h-3.5 w-3.5" />Send Email
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 h-9 text-xs" onClick={() => { toast.info("SMS sent to " + l.phone) }}>
                    <MessageSquare className="h-3.5 w-3.5" />Send SMS
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 h-9 text-xs" onClick={() => { setActiveTab("notes") }}>
                    <FileText className="h-3.5 w-3.5" />Add Note
                  </Button>
                </div>

                {l.dro && (
                  <div className="rounded-xl border border-border p-4 bg-muted/30">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Assigned Officer</p>
                    <p className="text-sm font-medium text-foreground">{l.dro}</p>
                    <p className="text-xs text-muted-foreground">Debt Recovery Officer</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="mandates" className="mt-0 p-5 space-y-4">
                {l.mandateRef ? (
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active Mandate</span>
                      <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold",
                        l.mandateStatus === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                        l.mandateStatus === "PENDING" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                        l.mandateStatus === "FAILED" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                        "bg-muted text-muted-foreground"
                      )}>{l.mandateStatus}</span>
                    </div>
                    <div className="divide-y divide-border">
                      <InfoRow label="Reference" value={l.mandateRef} mono />
                      <InfoRow label="Rail" value={l.rail} />
                      <InfoRow label="Account" value={maskAccount(l.accountNumber)} mono />
                      <InfoRow label="Bank" value={l.bank} />
                      <InfoRow label="Max Amount" value={formatCurrency(l.outstanding)} mono />
                      <InfoRow label="Frequency" value="Monthly" />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center">
                    <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">No active mandate</p>
                    <p className="text-xs text-muted-foreground mt-1">Set up a mandate to automate collections</p>
                    <Button size="sm" className="mt-4 gap-2 text-xs" onClick={() => toast.info("Opening mandate setup wizard…")}>
                      <CreditCard className="h-3.5 w-3.5" />Setup Mandate
                    </Button>
                  </div>
                )}

                {l.iGreeConsent && (
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">iGree Consent Active</p>
                        <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70 mt-0.5">Borrower has authorised direct debit via iGree</p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="timeline" className="mt-0 p-5">
                <div className="relative pl-5 space-y-5">
                  <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
                  {timelineEvents.map((event, i) => (
                    <div key={i} className="relative flex gap-3">
                      <div className="absolute -left-5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-background border border-border">
                        {event.icon}
                      </div>
                      <div className="min-w-0 pb-1">
                        <p className="text-sm font-medium text-foreground leading-none">{event.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(event.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="mt-0 p-5">
                <NoteTab borrower={l.borrower} />
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer */}
          <div className="border-t border-border p-4 flex gap-2 bg-background">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 text-xs"
              disabled={l.retryCount >= l.maxRetries || l.state === "DISPUTE_OPEN" || l.state === "LEGAL_REVIEW"}
              onClick={() => setRetryOpen(true)}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Trigger Retry
              {l.retryCount >= l.maxRetries && <span className="text-[10px] opacity-60">(Max)</span>}
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-2 text-xs"
              disabled={NEXT_TIER[l.tier] === null}
              onClick={() => setEscalateOpen(true)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
              Escalate
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <RetryDialog
        open={retryOpen}
        loan={l}
        onClose={() => setRetryOpen(false)}
        onConfirm={() => {
          setLocalLoan({ ...l, retryCount: l.retryCount + 1, lastAttempt: new Date().toISOString() })
          setRetryOpen(false)
          toast.success("Retry queued for " + l.borrower)
        }}
      />
      <EscalateDialog
        open={escalateOpen}
        loan={l}
        onClose={() => setEscalateOpen(false)}
        onConfirm={(tier, reason) => {
          setLocalLoan({ ...l, tier })
          setEscalateOpen(false)
          toast.success(`Case escalated to ${tier.replace("_", " ")}`)
        }}
      />
    </>
  )
}

function NoteTab({ borrower }: { borrower: string }) {
  const [notes, setNotes] = useState<{ id: string; text: string; ts: string }[]>([])
  const [text, setText] = useState("")

  function add() {
    if (!text.trim()) return
    setNotes(n => [{ id: String(Date.now()), text: text.trim(), ts: new Date().toISOString() }, ...n])
    setText("")
    toast.success("Note saved")
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-end">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          placeholder={`Add a note about ${borrower}…`}
          className="flex-1 text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
        />
        <Button size="sm" className="h-9 gap-1.5 text-xs shrink-0" onClick={add}>
          <MessageSquare className="h-3.5 w-3.5" />Add
        </Button>
      </div>
      {notes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No notes yet</p>
          <p className="text-xs text-muted-foreground mt-1">Notes are saved locally for this session</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map(n => (
            <div key={n.id} className="rounded-xl bg-muted/50 px-3 py-2.5">
              <p className="text-xs text-foreground/80 leading-relaxed">{n.text}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{formatRelativeTime(n.ts)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
