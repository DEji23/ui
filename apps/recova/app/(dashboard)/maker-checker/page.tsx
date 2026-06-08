"use client"

import { useState } from "react"
import { Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { ApprovalModal } from "@/components/maker-checker/approval-modal"
import { approvalRequests as initial, type ApprovalRequest } from "@/lib/mock-data"
import { formatCurrency, formatRelativeTime } from "@/lib/utils"
import { cn } from "@/lib/utils"

const TYPE_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  WRITE_OFF: { label: "Write-off", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
  POLICY_CHANGE: { label: "Policy Change", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
  MANDATE_SETUP: { label: "Mandate Setup", color: "text-primary", bg: "bg-primary/10" },
  ESCALATION: { label: "Escalation", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  SETTLEMENT_REVERSAL: { label: "Settlement Reversal", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
  RATE_CHANGE: { label: "Rate Change", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pending", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", icon: <Clock className="h-3 w-3" /> },
  APPROVED: { label: "Approved", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", icon: <CheckCircle2 className="h-3 w-3" /> },
  REJECTED: { label: "Rejected", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10", icon: <XCircle className="h-3 w-3" /> },
  EXPIRED: { label: "Expired", color: "text-muted-foreground", bg: "bg-muted", icon: <AlertTriangle className="h-3 w-3" /> },
}

const TABS = ["Pending Approval", "My Requests", "All Requests"] as const
type Tab = typeof TABS[number]

export default function MakerCheckerPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>(initial)
  const [activeTab, setActiveTab] = useState<Tab>("Pending Approval")
  const [selected, setSelected] = useState<ApprovalRequest | null>(null)

  const ME = "Adaora Nwosu"

  const filtered = requests.filter(r => {
    if (activeTab === "Pending Approval") return r.status === "PENDING" && r.initiator !== ME
    if (activeTab === "My Requests") return r.initiator === ME
    return true
  })

  const pendingCount = requests.filter(r => r.status === "PENDING" && r.initiator !== ME).length

  function handleApprove(id: string) {
    setRequests(rs => rs.map(r => r.id === id ? { ...r, status: "APPROVED", checker: ME, checkedAt: new Date().toISOString() } : r))
  }

  function handleReject(id: string, reason: string) {
    setRequests(rs => rs.map(r => r.id === id ? { ...r, status: "REJECTED", checker: ME, checkedAt: new Date().toISOString(), rejectionReason: reason } : r))
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Maker-Checker"
        description="Review and approve pending requests"
      />

      <div className="p-6 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Pending Approval", value: requests.filter(r => r.status === "PENDING").length, color: "text-amber-500", icon: <Clock className="h-4 w-4" /> },
            { label: "Approved (30d)", value: requests.filter(r => r.status === "APPROVED").length, color: "text-emerald-500", icon: <CheckCircle2 className="h-4 w-4" /> },
            { label: "Rejected (30d)", value: requests.filter(r => r.status === "REJECTED").length, color: "text-red-500", icon: <XCircle className="h-4 w-4" /> },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", s.color === "text-amber-500" ? "bg-amber-500/10" : s.color === "text-emerald-500" ? "bg-emerald-500/10" : "bg-red-500/10")}>
                  <span className={s.color}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs + list */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Tab bar */}
          <div className="border-b border-border flex">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors",
                  activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
                {tab === "Pending Approval" && pendingCount > 0 && (
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", activeTab === tab ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Request list */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">All clear</p>
              <p className="text-xs text-muted-foreground mt-1">No requests in this queue</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(req => {
                const typeStyle = TYPE_STYLE[req.type] ?? TYPE_STYLE.POLICY_CHANGE
                const statusStyle = STATUS_STYLE[req.status]
                const canAct = req.status === "PENDING" && req.initiator !== ME
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelected(req)}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <div className={cn("flex h-9 w-9 shrink-0 mt-0.5 items-center justify-center rounded-xl", typeStyle.bg)}>
                      <span className={cn("text-xs font-bold", typeStyle.color)}>
                        {req.type === "WRITE_OFF" ? "WO" : req.type === "POLICY_CHANGE" ? "PC" : req.type === "MANDATE_SETUP" ? "MS" : req.type === "ESCALATION" ? "ES" : req.type === "SETTLEMENT_REVERSAL" ? "SR" : "RC"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold", typeStyle.bg, typeStyle.color)}>
                          {typeStyle.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">{req.id}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground mt-1 leading-snug">{req.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{req.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">by {req.initiator}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(req.initiatedAt)}</span>
                        {req.amount && (
                          <>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs font-semibold text-foreground monospace-nums">{formatCurrency(req.amount)}</span>
                          </>
                        )}
                      </div>

                      {req.rejectionReason && (
                        <p className="text-xs text-red-500 mt-1.5 italic">Rejected: {req.rejectionReason}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className={cn("flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold", statusStyle.bg, statusStyle.color)}>
                        {statusStyle.icon}
                        {statusStyle.label}
                      </div>
                      {canAct && (
                        <span className="text-[10px] text-primary font-medium">Tap to review →</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="border-t border-border px-5 py-2.5">
            <span className="text-xs text-muted-foreground">{filtered.length} request{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      <ApprovalModal
        request={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
