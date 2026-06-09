"use client"

import { useState } from "react"
import {
  X,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  RefreshCcw,
  FileText,
  MessageSquare,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { LoanStateBadge } from "@/components/recovery/loan-state-badge"
import { type Loan } from "@/lib/mock-data"
import { formatCurrency, formatDate, maskBVN, maskAccount } from "@/lib/utils"
import { cn } from "@/lib/utils"

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

const TIER_COLORS: Record<string, string> = {
  TIER_1: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  TIER_2: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  TIER_3: "bg-red-500/10 text-red-600 dark:text-red-400",
  LEGAL: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-xs text-muted-foreground shrink-0 min-w-[120px]">{label}</span>
      <span className={cn("text-xs font-medium text-foreground text-right truncate", mono && "monospace-nums")}>{value}</span>
    </div>
  )
}

export function LoanCaseDrawer({ loan, open, onClose }: LoanCaseDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!loan) return null

  const recoveryPct = Math.round(((loan.disbursed - loan.outstanding) / loan.disbursed) * 100)

  const timelineEvents = [
    { date: loan.disbursedAt, label: "Loan disbursed", icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> },
    { date: loan.dueDate, label: "Due date", icon: <Clock className="h-3.5 w-3.5 text-amber-500" /> },
    { date: loan.updatedAt, label: "Last activity", icon: <RefreshCcw className="h-3.5 w-3.5 text-primary" /> },
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-full sm:w-[520px] sm:max-w-none p-0 flex flex-col gap-0">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <SheetTitle className="text-base font-semibold">{loan.borrower}</SheetTitle>
              <LoanStateBadge state={loan.state} />
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-muted-foreground monospace-nums">{loan.loanId}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <Badge variant="outline" className={cn("text-[10px] border-0", RAIL_COLORS[loan.rail])}>
                {loan.rail}
              </Badge>
              <Badge variant="outline" className={cn("text-[10px] border-0", TIER_COLORS[loan.tier])}>
                {loan.tier.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-2 shrink-0 rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Recovery progress */}
        <div className="px-5 py-4 bg-muted/30 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground">Recovery Progress</span>
            <span className="text-xs font-bold text-foreground">{recoveryPct}%</span>
          </div>
          <Progress value={recoveryPct} className="h-2" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              Collected: {formatCurrency(loan.disbursed - loan.outstanding)}
            </span>
            <span className="text-xs text-muted-foreground">
              Outstanding: <span className="font-semibold text-destructive">{formatCurrency(loan.outstanding)}</span>
            </span>
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
              {/* Borrower info */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Borrower</p>
                <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                  <InfoRow label="Full Name" value={loan.borrower} />
                  <InfoRow label="BVN" value={maskBVN(loan.bvn)} mono />
                  <InfoRow label="Account" value={maskAccount(loan.accountNumber)} mono />
                  <InfoRow label="Bank" value={loan.bank} />
                  <InfoRow label="Phone" value={loan.phone} mono />
                  <InfoRow label="Email" value={loan.email} />
                </div>
              </div>

              {/* Loan details */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Loan Details</p>
                <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                  <InfoRow label="Disbursed" value={formatCurrency(loan.disbursed)} mono />
                  <InfoRow label="Outstanding" value={formatCurrency(loan.outstanding)} mono />
                  <InfoRow label="Interest Rate" value={`${loan.interestRate}% p.a.`} />
                  <InfoRow label="Due Date" value={formatDate(loan.dueDate)} />
                  <InfoRow label="Days Past Due" value={`${loan.dpd} days`} />
                  <InfoRow label="Product" value={loan.product} />
                  <InfoRow label="Branch" value={loan.branch} />
                </div>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-2 h-9 text-xs">
                  <Phone className="h-3.5 w-3.5" />
                  Call Borrower
                </Button>
                <Button variant="outline" size="sm" className="gap-2 h-9 text-xs">
                  <Mail className="h-3.5 w-3.5" />
                  Send Email
                </Button>
                <Button variant="outline" size="sm" className="gap-2 h-9 text-xs">
                  <FileText className="h-3.5 w-3.5" />
                  Add Note
                </Button>
                <Button variant="outline" size="sm" className="gap-2 h-9 text-xs">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Send SMS
                </Button>
              </div>

              {/* DRO */}
              <div className="rounded-xl border border-border p-4 bg-muted/30">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Assigned Officer
                </p>
                <p className="text-sm font-medium text-foreground">{loan.dro}</p>
                <p className="text-xs text-muted-foreground">Debt Recovery Officer</p>
              </div>
            </TabsContent>

            <TabsContent value="mandates" className="mt-0 p-5 space-y-4">
              {loan.mandateRef ? (
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Active Mandate
                      </span>
                      <Badge variant="success" className="text-[10px]">ACTIVE</Badge>
                    </div>
                  </div>
                  <div className="divide-y divide-border">
                    <InfoRow label="Reference" value={loan.mandateRef} mono />
                    <InfoRow label="Rail" value={loan.rail} />
                    <InfoRow label="Account" value={maskAccount(loan.accountNumber)} mono />
                    <InfoRow label="Bank" value={loan.bank} />
                    <InfoRow label="Max Amount" value={formatCurrency(loan.outstanding)} mono />
                    <InfoRow label="Frequency" value="Monthly" />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">No active mandate</p>
                  <p className="text-xs text-muted-foreground mt-1">Set up a mandate to automate collections</p>
                  <Button size="sm" className="mt-4 gap-2 text-xs">
                    <CreditCard className="h-3.5 w-3.5" />
                    Setup Mandate
                  </Button>
                </div>
              )}

              {loan.iGreeConsent && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">iGree Consent Active</p>
                      <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70 mt-0.5">
                        Borrower has authorised direct debit via iGree platform
                      </p>
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
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">No notes yet</p>
                <p className="text-xs text-muted-foreground mt-1">Add notes to track borrower interactions</p>
                <Button size="sm" className="mt-4 gap-2 text-xs">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Add Note
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer actions */}
        <div className="border-t border-border p-4 flex gap-2 bg-background">
          <Button variant="outline" size="sm" className="flex-1 gap-2 text-xs">
            <RefreshCcw className="h-3.5 w-3.5" />
            Trigger Retry
          </Button>
          <Button size="sm" className="flex-1 gap-2 text-xs">
            <ChevronRight className="h-3.5 w-3.5" />
            Escalate
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
