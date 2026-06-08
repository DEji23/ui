"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, AlertTriangle, Clock, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { type ApprovalRequest } from "@/lib/mock-data"
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ApprovalModalProps {
  request: ApprovalRequest | null
  open: boolean
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string, reason: string) => void
}

const TYPE_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  WRITE_OFF: { label: "Write-off", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
  POLICY_CHANGE: { label: "Policy Change", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
  MANDATE_SETUP: { label: "Mandate Setup", color: "text-primary", bg: "bg-primary/10" },
  ESCALATION: { label: "Escalation", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  SETTLEMENT_REVERSAL: { label: "Settlement Reversal", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
  RATE_CHANGE: { label: "Rate Change", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
}

export function ApprovalModal({ request, open, onClose, onApprove, onReject }: ApprovalModalProps) {
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [reason, setReason] = useState("")

  if (!request) return null

  const typeStyle = TYPE_STYLE[request.type] ?? TYPE_STYLE.POLICY_CHANGE
  const expiresIn = Math.max(0, Math.ceil((new Date(request.expiresAt).getTime() - Date.now()) / 86400000))

  function handleApprove() {
    onApprove(request.id)
    toast.success("Request approved successfully")
    onClose()
  }

  function handleReject() {
    if (!reason.trim()) { toast.error("Please provide a rejection reason"); return }
    onReject(request.id, reason.trim())
    toast.success("Request rejected")
    onClose()
  }

  function resetAndClose() {
    setAction(null)
    setReason("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && resetAndClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", typeStyle.bg, typeStyle.color)}>
              {typeStyle.label}
            </span>
            <span className="text-xs text-muted-foreground font-mono">{request.id}</span>
          </div>
          <DialogTitle className="text-base leading-snug">{request.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">{request.description}</p>

          {/* Key details */}
          <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
            <div className="flex justify-between px-3 py-2.5">
              <span className="text-xs text-muted-foreground">Initiated by</span>
              <div className="text-right">
                <p className="text-xs font-medium text-foreground">{request.initiator}</p>
                <p className="text-[11px] text-muted-foreground">{request.initiatorRole}</p>
              </div>
            </div>
            <div className="flex justify-between px-3 py-2.5">
              <span className="text-xs text-muted-foreground">Initiated</span>
              <span className="text-xs font-medium text-foreground">{formatRelativeTime(request.initiatedAt)}</span>
            </div>
            <div className="flex justify-between px-3 py-2.5">
              <span className="text-xs text-muted-foreground">Entity</span>
              <span className="text-xs font-mono font-medium text-foreground">{request.entityId}</span>
            </div>
            {request.amount && (
              <div className="flex justify-between px-3 py-2.5">
                <span className="text-xs text-muted-foreground">Amount</span>
                <span className="text-sm font-bold text-foreground monospace-nums">{formatCurrency(request.amount)}</span>
              </div>
            )}
            <div className="flex justify-between px-3 py-2.5">
              <span className="text-xs text-muted-foreground">Expires</span>
              <div className={cn("flex items-center gap-1.5 text-xs font-medium", expiresIn <= 1 ? "text-red-500" : "text-muted-foreground")}>
                <Clock className="h-3 w-3" />
                {expiresIn === 0 ? "Expires today" : `${expiresIn}d remaining`}
              </div>
            </div>
          </div>

          {/* Risk callout for write-offs */}
          {request.type === "WRITE_OFF" && (
            <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                Approving this will permanently write off the outstanding balance. This action cannot be undone without a new loan request.
              </p>
            </div>
          )}

          {/* Reject reason input */}
          {action === "reject" && (
            <div className="space-y-2">
              <Separator />
              <p className="text-xs font-semibold text-foreground">Rejection reason <span className="text-destructive">*</span></p>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                placeholder="Explain why this request is being rejected…"
                className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          {!action ? (
            <>
              <Button variant="outline" size="sm" onClick={resetAndClose} className="text-xs">Cancel</Button>
              <Button size="sm" variant="destructive" className="text-xs gap-1.5" onClick={() => setAction("reject")}>
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </Button>
              <Button size="sm" className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => setAction("approve")}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve
              </Button>
            </>
          ) : action === "approve" ? (
            <>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setAction(null)}>Back</Button>
              <Button size="sm" className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={handleApprove}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Confirm Approval
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setAction(null)}>Back</Button>
              <Button size="sm" variant="destructive" className="text-xs gap-1.5" onClick={handleReject}>
                <XCircle className="h-3.5 w-3.5" />
                Confirm Rejection
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
