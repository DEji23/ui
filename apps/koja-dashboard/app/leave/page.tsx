"use client"
import { useState, useRef } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog } from "@/components/ui/dialog"
import { ToastContainer, type Toast } from "@/components/ui/toast"
import { leaveRequests as initial, type LeaveRequest, type LeaveStatus } from "@/lib/data"
import { formatDate, cn } from "@/lib/utils"

type DialogMode = "approve" | "decline" | null

const typeBadge: Record<string, "green" | "red" | "yellow" | "blue" | "amber"> = {
  annual: "blue", sick: "yellow", emergency: "red", maternity: "amber",
}
const statusBadge: Record<LeaveStatus, "green" | "red" | "yellow"> = {
  approved: "green", declined: "red", pending: "yellow",
}

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>(initial)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [target, setTarget] = useState<LeaveRequest | null>(null)
  const [declineReason, setDeclineReason] = useState("")
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  const toast = (message: string, type: Toast["type"] = "success") => {
    const id = ++counterRef.current
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }

  const pending = requests.filter((r) => r.status === "pending")
  const history = requests.filter((r) => r.status !== "pending")

  const handleApprove = () => {
    if (!target) return
    setRequests((r) => r.map((x) => x.id === target.id ? { ...x, status: "approved" as LeaveStatus } : x))
    toast(`Leave approved for ${target.driver.split(" ")[0]}`)
    setDialogMode(null)
  }

  const handleDecline = () => {
    if (!target) return
    setRequests((r) => r.map((x) => x.id === target.id ? { ...x, status: "declined" as LeaveStatus, declineReason } : x))
    toast(`Leave declined for ${target.driver.split(" ")[0]}`, "info")
    setDialogMode(null)
    setDeclineReason("")
  }

  return (
    <div className="pt-14">
      <Header
        title="Leave Requests"
        subtitle={`${pending.length} pending · ${requests.filter((r) => r.status === "approved").length} approved`}
      />

      <div className="p-6 space-y-6">
        {/* Pending Requests */}
        {pending.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
              Pending Approval ({pending.length})
            </h3>
            <div className="space-y-3">
              {pending.map((req) => (
                <div key={req.id} className="bg-[#141518] border border-amber-500/20 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 font-bold text-sm">
                        {req.driver.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{req.driver}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant={typeBadge[req.type]} className="text-[9px]">{req.type}</Badge>
                          <span className="text-xs text-white/40">{req.days} day{req.days !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </div>
                    {req.dutiesAffected > 1 && (
                      <Badge variant="yellow" className="text-[9px]">⚠ {req.dutiesAffected} duties affected</Badge>
                    )}
                  </div>
                  <div className="text-xs text-white/50 mb-1">
                    {formatDate(req.startDate)} — {formatDate(req.endDate)}
                  </div>
                  <p className="text-xs text-white/40 mb-3 italic">&ldquo;{req.reason}&rdquo;</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => { setTarget(req); setDialogMode("decline") }}>
                      Decline
                    </Button>
                    <Button size="sm" variant="primary" onClick={() => { setTarget(req); setDialogMode("approve") }}>
                      Approve Leave
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Table */}
        <div>
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">History</h3>
          <div className="bg-[#141518] border border-white/6 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_80px_130px_60px_80px_100px] text-[10px] font-semibold text-white/30 uppercase tracking-wider px-5 py-3 border-b border-white/6">
              <span>Driver</span><span>Type</span><span>Period</span><span>Days</span><span>Status</span><span>Submitted</span>
            </div>
            {history.map((req) => (
              <div key={req.id} className="grid grid-cols-[1fr_80px_130px_60px_80px_100px] px-5 py-3 border-b border-white/5 last:border-0 items-center hover:bg-white/2">
                <div>
                  <div className="text-sm font-medium text-white/80">{req.driver}</div>
                  {req.declineReason && <div className="text-[10px] text-red-400/60 mt-0.5">{req.declineReason}</div>}
                </div>
                <Badge variant={typeBadge[req.type]} className="text-[9px] w-fit">{req.type}</Badge>
                <span className="text-xs text-white/50">{formatDate(req.startDate)} →</span>
                <span className="text-xs text-white/50">{req.days}d</span>
                <Badge variant={statusBadge[req.status]} className="text-[9px] w-fit">{req.status}</Badge>
                <span className="text-xs text-white/30">{formatDate(req.submittedAt)}</span>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-8 text-white/25 text-sm">No history yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={dialogMode === "approve"} onClose={() => setDialogMode(null)} title="Approve Leave" description={target ? `${target.driver} · ${target.type} leave` : ""}>
        {target && (
          <div className="space-y-4">
            <div className="bg-white/4 rounded-lg p-4 space-y-2">
              {[
                { label: "Period", value: `${formatDate(target.startDate)} — ${formatDate(target.endDate)}` },
                { label: "Duration", value: `${target.days} day${target.days !== 1 ? "s" : ""}` },
                { label: "Reason", value: target.reason },
                { label: "Duties Affected", value: target.dutiesAffected },
              ].map((f) => (
                <div key={f.label} className="flex justify-between text-sm">
                  <span className="text-white/40">{f.label}</span>
                  <span className="text-white/80 text-right max-w-[60%]">{f.value}</span>
                </div>
              ))}
            </div>
            {target.dutiesAffected > 1 && (
              <div className="bg-yellow-500/8 border border-yellow-500/15 rounded-lg p-3 text-xs text-yellow-300">
                ⚠ Approving will affect {target.dutiesAffected} scheduled duties. Ensure replacements are assigned.
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setDialogMode(null)}>Cancel</Button>
              <Button variant="primary" className="flex-1" onClick={handleApprove}>Confirm Approval</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={dialogMode === "decline"} onClose={() => setDialogMode(null)} title="Decline Leave" description={target ? `${target.driver} · ${target.type} leave` : ""}>
        {target && (
          <div className="space-y-4">
            <div className="text-sm text-white/50">
              {formatDate(target.startDate)} — {formatDate(target.endDate)} · {target.days} days
            </div>
            <Textarea label="Reason for decline (optional)" rows={3} value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} placeholder="Explain why the leave cannot be approved..." />
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setDialogMode(null)}>Cancel</Button>
              <Button variant="danger" className="flex-1" onClick={handleDecline}>Decline Leave</Button>
            </div>
          </div>
        )}
      </Dialog>

      <ToastContainer toasts={toasts} />
    </div>
  )
}
