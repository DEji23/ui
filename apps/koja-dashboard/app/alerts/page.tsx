"use client"
import { useState, useRef } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog } from "@/components/ui/dialog"
import { ToastContainer, type Toast } from "@/components/ui/toast"
import { alerts as initial, type Alert, type AlertSeverity } from "@/lib/data"
import { cn } from "@/lib/utils"

const severityConfig: Record<AlertSeverity, { badge: "red" | "yellow" | "gray"; bar: string }> = {
  critical: { badge: "red", bar: "bg-red-500" },
  high: { badge: "yellow", bar: "bg-yellow-500" },
  medium: { badge: "gray", bar: "bg-white/25" },
}

export default function AlertsPage() {
  const [alertList, setAlertList] = useState<Alert[]>(initial)
  const [filter, setFilter] = useState<AlertSeverity | "all" | "unacked">("unacked")
  const [respondTarget, setRespondTarget] = useState<Alert | null>(null)
  const [actionType, setActionType] = useState("")
  const [notes, setNotes] = useState("")
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  const toast = (message: string, type: Toast["type"] = "success") => {
    const id = ++counterRef.current
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }

  const filtered = alertList.filter((a) => {
    if (filter === "unacked") return !a.acknowledged
    if (filter === "all") return true
    return a.severity === filter
  })

  const acknowledge = (id: string) => {
    setAlertList((al) => al.map((a) => a.id === id ? { ...a, acknowledged: true, acknowledgedBy: "Fleet Manager", acknowledgedAt: new Date().toISOString() } : a))
    toast("Alert acknowledged", "info")
  }

  const handleRespond = () => {
    if (!respondTarget || !actionType) return
    acknowledge(respondTarget.id)
    setAlertList((al) => al.map((a) => a.id === respondTarget.id ? { ...a, acknowledged: true } : a))
    toast(`Response logged: ${actionType}`)
    setRespondTarget(null)
    setActionType("")
    setNotes("")
  }

  const unacked = alertList.filter((a) => !a.acknowledged).length
  const critical = alertList.filter((a) => a.severity === "critical" && !a.acknowledged).length

  return (
    <div className="pt-14">
      <Header
        title="Alerts"
        subtitle={`${unacked} unacknowledged · ${critical} critical`}
      />

      <div className="p-6">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-5 bg-white/4 rounded-lg p-1 w-fit">
          {(["unacked", "all", "critical", "high", "medium"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
                filter === f ? "bg-white/12 text-white" : "text-white/40 hover:text-white/70"
              )}
            >
              {f === "unacked" ? "Unacknowledged" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xl mx-auto mb-3">✓</div>
            <p className="text-white/40 text-sm">All clear — no alerts in this view</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((alert) => {
              const sc = severityConfig[alert.severity]
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "bg-[#141518] border rounded-xl p-4 flex items-start gap-3 transition-all",
                    alert.acknowledged ? "border-white/5 opacity-60" : "border-white/8 hover:border-white/12"
                  )}
                >
                  <div className={`w-0.5 h-full min-h-[40px] rounded-full shrink-0 ${sc.bar}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white/90">{alert.title}</span>
                        <Badge variant={sc.badge} className="text-[9px]">{alert.severity}</Badge>
                      </div>
                      <span className="text-xs text-white/30 shrink-0">
                        {new Date(alert.timestamp).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mb-3">{alert.message}</p>
                    <div className="flex items-center gap-2">
                      {!alert.acknowledged ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => acknowledge(alert.id)}>
                            Acknowledge
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => { setRespondTarget(alert); setActionType(""); setNotes("") }}>
                            Respond
                          </Button>
                        </>
                      ) : (
                        <div className="text-[10px] text-white/30">
                          Acknowledged by {alert.acknowledgedBy || "Fleet Manager"} ·{" "}
                          {alert.acknowledgedAt ? new Date(alert.acknowledgedAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Respond Dialog */}
      <Dialog
        open={!!respondTarget}
        onClose={() => setRespondTarget(null)}
        title="Respond to Alert"
        description={respondTarget?.title}
      >
        <div className="space-y-4">
          <div className="bg-white/4 rounded-lg p-3 text-xs text-white/50">{respondTarget?.message}</div>
          <Select label="Action Taken *" value={actionType} onChange={(e) => setActionType(e.target.value)}>
            <option value="">— Select action —</option>
            <option value="dispatched_replacement">Dispatched Replacement</option>
            <option value="contacted_driver">Contacted Driver</option>
            <option value="contacted_mechanic">Contacted Mechanic</option>
            <option value="escalated">Escalated to Management</option>
            <option value="monitoring">Monitoring Situation</option>
            <option value="resolved">Marked as Resolved</option>
          </Select>
          <Textarea label="Notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes about the response..." />
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setRespondTarget(null)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleRespond} disabled={!actionType}>
              Log Response
            </Button>
          </div>
        </div>
      </Dialog>

      <ToastContainer toasts={toasts} />
    </div>
  )
}
