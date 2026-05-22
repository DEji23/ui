"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { alerts as initialAlerts, type Alert } from "@/lib/data"
import { Danger, Warning2, InfoCircle, TickCircle, Location, Timer1 } from "iconsax-react"

function SeverityIcon({ severity }: { severity: Alert["severity"] }) {
  if (severity === "critical") return <Danger size={20} color="#f87171" variant="Bold" />
  if (severity === "warning") return <Warning2 size={20} color="#fbbf24" variant="Bold" />
  return <InfoCircle size={20} color="#60a5fa" variant="Bold" />
}

function severityBadge(severity: Alert["severity"]) {
  if (severity === "critical") return <Badge variant="destructive">Critical</Badge>
  if (severity === "warning") return <Badge variant="warning">Warning</Badge>
  return <Badge variant="info">Info</Badge>
}

const typeLabels: Record<Alert["type"], string> = {
  breakdown: "Breakdown",
  late_start: "Late Start",
  code_red: "Code Red",
  inspection_fail: "Inspection Fail",
  cash_discrepancy: "Cash Issue",
  no_show: "No-Show",
}

const ACTION_OPTIONS = [
  "Dispatch replacement bus",
  "Contact driver directly",
  "Escalate to operations manager",
  "Mark as resolved",
  "Request police assistance",
]

const filterOptions = ["All", "Critical", "Warning", "Acknowledged"] as const
type AlertFilter = (typeof filterOptions)[number]
type Toast = { id: number; message: string; type: "success" | "error" | "info" }

export default function AlertsPage() {
  const [filter, setFilter] = useState<AlertFilter>("All")
  const [alertList, setAlertList] = useState<Alert[]>(initialAlerts)
  const [respondTarget, setRespondTarget] = useState<Alert | null>(null)
  const [actionType, setActionType] = useState("")
  const [notes, setNotes] = useState("")
  const [toasts, setToasts] = useState<Toast[]>([])

  function addToast(message: string, type: Toast["type"] = "success") {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }

  const criticalUnack = alertList.filter((a) => a.severity === "critical" && !a.acknowledged).length

  const filtered = alertList.filter((a) => {
    if (filter === "Critical") return a.severity === "critical"
    if (filter === "Warning") return a.severity === "warning"
    if (filter === "Acknowledged") return a.acknowledged
    return true
  })

  function handleAcknowledge(id: string) {
    setAlertList((list) => list.map((a) => a.id === id ? { ...a, acknowledged: true } : a))
    addToast("Alert acknowledged", "info")
  }

  function handleRespond() {
    if (!respondTarget || !actionType) return
    setAlertList((list) =>
      list.map((a) => a.id === respondTarget.id ? { ...a, acknowledged: true } : a)
    )
    addToast(`Response logged: ${actionType}`)
    setRespondTarget(null)
    setActionType("")
    setNotes("")
  }

  function openRespond(alert: Alert) {
    setRespondTarget(alert)
    setActionType("")
    setNotes("")
  }

  return (
    <>
      <Header
        title="Alerts & Incidents"
        subtitle={
          criticalUnack > 0
            ? `${criticalUnack} critical alert${criticalUnack > 1 ? "s" : ""} require attention`
            : "All clear — no active critical alerts"
        }
      />
      <main className="flex-1 p-4 sm:p-6 space-y-5">
        <div className="flex items-center gap-1.5">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                filter === f
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300 border-transparent"
              )}
            >
              {f}
              {f === "Critical" && criticalUnack > 0 && (
                <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {criticalUnack}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="py-20 text-center text-zinc-600">
              <TickCircle size={36} color="currentColor" className="mx-auto mb-3 opacity-30" variant="Linear" />
              <p className="text-sm">No alerts in this category</p>
            </div>
          )}
          {filtered.map((alert) => (
            <Card
              key={alert.id}
              className={cn(
                alert.severity === "critical" && !alert.acknowledged ? "border-red-500/25 bg-red-500/[0.04]" :
                alert.severity === "warning" && !alert.acknowledged ? "border-yellow-500/25 bg-yellow-500/[0.04]" : "",
                alert.acknowledged && "opacity-60"
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="mt-0.5 shrink-0">
                    <SeverityIcon severity={alert.severity} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-zinc-100">{alert.title}</p>
                        {severityBadge(alert.severity)}
                        <Badge variant="muted">{typeLabels[alert.type]}</Badge>
                        {alert.acknowledged && <Badge variant="muted">Acknowledged</Badge>}
                      </div>
                      {/* Desktop buttons */}
                      <div className="hidden sm:flex gap-2 shrink-0">
                        {!alert.acknowledged && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleAcknowledge(alert.id)}>Acknowledge</Button>
                            <Button size="sm" variant={alert.severity === "critical" ? "destructive" : "default"} onClick={() => openRespond(alert)}>Respond</Button>
                          </>
                        )}
                        {alert.acknowledged && (
                          <Button variant="ghost" size="sm" onClick={() => openRespond(alert)}>View</Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">{alert.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                        <Timer1 size={12} color="currentColor" variant="Linear" />
                        <span>{alert.timestamp}</span>
                      </div>
                      {alert.location && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                          <Location size={12} color="currentColor" variant="Linear" />
                          <span>{alert.location}</span>
                        </div>
                      )}
                      {alert.driver && <span className="text-xs text-zinc-600">Driver: {alert.driver}</span>}
                      {alert.bus && <span className="text-xs text-zinc-600">Bus: {alert.bus}</span>}
                    </div>
                    {/* Mobile buttons */}
                    <div className="sm:hidden flex gap-2 mt-3">
                      {!alert.acknowledged && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleAcknowledge(alert.id)}>Acknowledge</Button>
                          <Button size="sm" variant={alert.severity === "critical" ? "destructive" : "default"} onClick={() => openRespond(alert)}>Respond</Button>
                        </>
                      )}
                      {alert.acknowledged && (
                        <Button variant="ghost" size="sm" onClick={() => openRespond(alert)}>View</Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Respond dialog */}
      <Dialog
        open={!!respondTarget}
        onClose={() => setRespondTarget(null)}
        title={respondTarget ? `Respond — ${respondTarget.title}` : ""}
        description={respondTarget?.description}
        className="max-w-lg"
      >
        {respondTarget && (
          <div className="space-y-4">
            <div className={cn(
              "rounded-lg p-3 text-xs",
              respondTarget.severity === "critical" ? "bg-red-500/10 border border-red-500/20 text-red-300" :
              respondTarget.severity === "warning" ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-300" :
              "bg-blue-500/10 border border-blue-500/20 text-blue-300"
            )}>
              <div className="flex gap-3">
                {respondTarget.driver && <span><span className="text-zinc-500">Driver:</span> {respondTarget.driver}</span>}
                {respondTarget.bus && <span><span className="text-zinc-500">Bus:</span> {respondTarget.bus}</span>}
                {respondTarget.location && <span><span className="text-zinc-500">Location:</span> {respondTarget.location}</span>}
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Action</label>
              <Select value={actionType} onChange={(e) => setActionType(e.target.value)}>
                <option value="">Select action…</option>
                {ACTION_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Notes <span className="text-zinc-700">(optional)</span></label>
              <Textarea
                placeholder="Add context, decisions, or follow-up steps…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setRespondTarget(null)}>Cancel</Button>
              <Button
                size="sm"
                variant={respondTarget.severity === "critical" ? "destructive" : "default"}
                onClick={handleRespond}
                disabled={!actionType}
              >
                Log Response
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "px-4 py-3 rounded-xl text-sm font-medium shadow-xl border backdrop-blur-sm",
              t.type === "success" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
              t.type === "error" && "bg-red-500/10 border-red-500/20 text-red-300",
              t.type === "info" && "bg-blue-500/10 border-blue-500/20 text-blue-300"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </>
  )
}
