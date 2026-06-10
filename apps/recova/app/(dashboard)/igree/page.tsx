"use client"

import { useState } from "react"
import { Link, Copy, RefreshCcw, CheckCircle2, XCircle, Clock, AlertTriangle, Send } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { igreeCases as initial, type IgreeCase } from "@/lib/mock-data"
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const STATUS_CONFIG: Record<IgreeCase["consentStatus"], { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  NOT_SENT: { label: "Not Sent", color: "text-muted-foreground", bg: "bg-muted", icon: <Clock className="h-3 w-3" /> },
  LINK_SENT: { label: "Link Sent", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", icon: <Send className="h-3 w-3" /> },
  OPENED: { label: "Opened", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", icon: <Clock className="h-3 w-3" /> },
  CONSENTED: { label: "Consented", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", icon: <CheckCircle2 className="h-3 w-3" /> },
  DECLINED: { label: "Declined", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10", icon: <XCircle className="h-3 w-3" /> },
  EXPIRED: { label: "Expired", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10", icon: <AlertTriangle className="h-3 w-3" /> },
}

export default function IgreePage() {
  const [cases, setCases] = useState<IgreeCase[]>(initial)

  const counts = cases.reduce<Record<string, number>>((acc, c) => {
    acc[c.consentStatus] = (acc[c.consentStatus] || 0) + 1
    return acc
  }, {})

  function sendLink(id: string) {
    setCases(cs => cs.map(c => c.id === id ? {
      ...c,
      consentStatus: "LINK_SENT",
      sentAt: new Date().toISOString(),
      linkExpiry: new Date(Date.now() + 7 * 86400000).toISOString(),
    } : c))
    toast.success("iGree consent link sent via SMS and email")
  }

  function resendLink(id: string) {
    setCases(cs => cs.map(c => c.id === id ? {
      ...c,
      consentStatus: "LINK_SENT",
      sentAt: new Date().toISOString(),
      linkExpiry: new Date(Date.now() + 7 * 86400000).toISOString(),
    } : c))
    toast.success("Consent link resent")
  }

  function copyLink(borrower: string) {
    navigator.clipboard?.writeText("https://igree.vfdbank.ng/consent/mock-token-xxxxx")
    toast.success("Consent link copied to clipboard")
  }

  return (
    <div className="flex flex-col">
      <Header
        title="iGree Consent"
        description="Manage borrower direct debit consent via iGree platform"
      />

      <div className="p-4 sm:p-6 space-y-5">
        {/* Status summary */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {(["NOT_SENT", "LINK_SENT", "OPENED", "CONSENTED", "DECLINED", "EXPIRED"] as IgreeCase["consentStatus"][]).map(s => {
            const cfg = STATUS_CONFIG[s]
            return (
              <Card key={s}>
                <CardContent className="p-3">
                  <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg mb-2", cfg.bg)}>
                    <span className={cfg.color}>{cfg.icon}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{cfg.label}</p>
                  <p className={cn("text-xl font-bold", cfg.color)}>{counts[s] || 0}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Cases table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="border-b border-border">
                <tr>
                  {["Borrower", "Loan", "Outstanding", "Rail", "DRO", "Sent", "Expires", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cases.map(c => {
                  const cfg = STATUS_CONFIG[c.consentStatus]
                  const canSend = c.consentStatus === "NOT_SENT"
                  const canResend = c.consentStatus === "DECLINED" || c.consentStatus === "EXPIRED"
                  const canCopy = c.consentStatus === "LINK_SENT" || c.consentStatus === "OPENED"

                  return (
                    <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{c.borrower}</p>
                          <p className="text-[11px] text-muted-foreground">{c.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-muted-foreground">{c.loanId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-foreground monospace-nums">{formatCurrency(c.outstanding)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-foreground">{c.rail}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{c.dro.split(" ")[0]}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{c.sentAt ? formatRelativeTime(c.sentAt) : "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{c.linkExpiry ? formatDate(c.linkExpiry) : "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold", cfg.bg, cfg.color)}>
                          {cfg.icon}
                          {cfg.label}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {canSend && (
                            <Button size="sm" className="h-7 text-xs gap-1" onClick={() => sendLink(c.id)}>
                              <Send className="h-3 w-3" />Send Link
                            </Button>
                          )}
                          {canResend && (
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => resendLink(c.id)}>
                              <RefreshCcw className="h-3 w-3" />Resend
                            </Button>
                          )}
                          {canCopy && (
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => copyLink(c.borrower)}>
                              <Copy className="h-3 w-3" />Copy Link
                            </Button>
                          )}
                          {c.consentStatus === "CONSENTED" && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {c.consentedAt ? formatDate(c.consentedAt) : "Done"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border px-4 py-2.5">
            <span className="text-xs text-muted-foreground">{cases.length} borrowers</span>
          </div>
        </div>
      </div>
    </div>
  )
}
