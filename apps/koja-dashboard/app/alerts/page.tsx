"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { alerts as initialAlerts, type Alert } from "@/lib/data"
import {
  Danger, Warning2, InfoCircle, TickCircle,
  Location, Timer1, ArrowUp2, People, Bus,
} from "iconsax-react"

type AlertFilter = "active" | "acknowledged" | "resolved" | "all"

const TYPE_LABELS: Record<Alert["type"], string> = {
  breakdown: "Breakdown",
  late_start: "Late Start",
  code_red: "Code Red",
  inspection_fail: "Inspection Fail",
  cash_discrepancy: "Cash Issue",
  no_show: "No-Show",
  bus_offline: "GPS / Offline",
  duty_missed: "Duty Missed",
  compliance_violation: "Compliance",
  low_utilisation: "Low Utilisation",
  document_expiry: "Doc Expiry",
  trip_anomaly: "Trip Anomaly",
  late_departure: "Late Departure",
  route_change: "Route Change",
}

const ACTION_OPTIONS: Partial<Record<Alert["type"], string[]>> = {
  breakdown: ["Dispatch replacement bus", "Contact driver directly", "Notify passengers"],
  no_show: ["Assign replacement driver", "Contact driver directly", "Escalate to operations manager"],
  bus_offline: ["Investigate bus/GPS status", "Contact driver", "Dispatch field agent"],
  duty_missed: ["Reassign duty", "Contact driver", "Update dispatch plan"],
  compliance_violation: ["Prevent further assignment", "Flag driver compliance record", "Notify HR"],
  cash_discrepancy: ["Flag for reconciliation", "Request resubmission from driver", "Escalate to compliance"],
  document_expiry: ["Schedule renewal", "Block bus from assignment", "Notify asset manager"],
  trip_anomaly: ["Flag duty for reconciliation", "Request driver explanation", "Cross-check AFC records"],
  late_departure: ["Notify passengers", "Adjust downstream schedule", "Log incident"],
  route_change: ["Investigate driver behaviour", "Alert operations", "Log incident"],
  late_start: ["Replace driver", "Contact driver directly", "Escalate to operations manager"],
  code_red: ["Request police assistance", "Contact driver", "Dispatch emergency support"],
  inspection_fail: ["Remove bus from service", "Schedule urgent repair", "Assign replacement bus"],
  low_utilisation: ["Review route schedule", "Adjust trip frequency", "Analyse demand data"],
}

function SeverityIcon({ severity, size = 18 }: { severity: Alert["severity"]; size?: number }) {
  if (severity === "critical") return <Danger size={size} color="#f87171" variant="Bold" />
  if (severity === "high") return <Danger size={size} color="#fb923c" variant="Bold" />
  if (severity === "warning") return <Warning2 size={size} color="#fbbf24" variant="Bold" />
  return <InfoCircle size={size} color="#60a5fa" variant="Bold" />
}

function SeverityBadge({ severity }: { severity: Alert["severity"] }) {
  if (severity === "critical") return <Badge variant="destructive">Critical</Badge>
  if (severity === "high")
    return <Badge variant="warning" className="!bg-orange-500/10 !text-orange-400 !border-orange-500/20">High</Badge>
  if (severity === "warning") return <Badge variant="warning">Medium</Badge>
  return <Badge variant="info">Low</Badge>
}

function cardBorder(a: Alert) {
  if (a.resolved) return ""
  if (a.severity === "critical" && !a.acknowledged) return "border-red-500/25 bg-red-500/[0.04]"
  if (a.severity === "high" && !a.acknowledged) return "border-orange-500/20 bg-orange-500/[0.03]"
  if (a.severity === "warning" && !a.acknowledged) return "border-yellow-500/20 bg-yellow-500/[0.03]"
  return ""
}

type Toast = { id: number; message: string; type: "success" | "error" | "info" }

export default function AlertsPage() {
  const [filter, setFilter] = useState<AlertFilter>("active")
  const [alertList, setAlertList] = useState<Alert[]>(initialAlerts)
  const [detailAlert, setDetailAlert] = useState<Alert | null>(null)
  const [actionType, setActionType] = useState("")
  const [notes, setNotes] = useState("")
  const [toasts, setToasts] = useState<Toast[]>([])

  function addToast(message: string, type: Toast["type"] = "success") {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }

  function handleAcknowledge(id: string) {
    setAlertList((list) => list.map((a) => a.id === id ? { ...a, acknowledged: true } : a))
    addToast("Alert acknowledged", "info")
  }

  function handleResolve(id: string) {
    setAlertList((list) =>
      list.map((a) =>
        a.id === id
          ? { ...a, acknowledged: true, resolved: true, resolvedBy: "Fleet Manager", resolvedAt: "Just now" }
          : a
      )
    )
    addToast("Alert resolved", "success")
    setDetailAlert(null)
  }

  function handleEscalate(id: string) {
    setAlertList((list) => list.map((a) => a.id === id ? { ...a, escalated: true, acknowledged: true } : a))
    addToast("Escalated to senior management", "info")
  }

  function handleLogAction() {
    if (!detailAlert || !actionType) return
    setAlertList((list) =>
      list.map((a) => a.id === detailAlert.id ? { ...a, acknowledged: true, note: actionType } : a)
    )
    addToast(`Action logged: ${actionType}`)
    setDetailAlert(null)
    setActionType("")
    setNotes("")
  }

  function openDetail(alert: Alert) {
    setDetailAlert(alert)
    setActionType(alert.note ?? "")
    setNotes("")
  }

  const criticalUnack = alertList.filter((a) => a.severity === "critical" && !a.acknowledged && !a.resolved).length
  const highUnack = alertList.filter((a) => a.severity === "high" && !a.acknowledged && !a.resolved).length

  const tabCounts: Record<AlertFilter, number> = {
    active: alertList.filter((a) => !a.resolved).length,
    acknowledged: alertList.filter((a) => a.acknowledged && !a.resolved).length,
    resolved: alertList.filter((a) => !!a.resolved).length,
    all: alertList.length,
  }

  const filtered = alertList.filter((a) => {
    if (filter === "active") return !a.resolved
    if (filter === "acknowledged") return a.acknowledged && !a.resolved
    if (filter === "resolved") return !!a.resolved
    return true
  })

  const tabs: { id: AlertFilter; label: string }[] = [
    { id: "active", label: "Active" },
    { id: "acknowledged", label: "Acknowledged" },
    { id: "resolved", label: "Resolved" },
    { id: "all", label: "All" },
  ]

  return (
    <>
      <Header
        title="Alerts & Incidents"
        subtitle={
          criticalUnack > 0
            ? `${criticalUnack} critical alert${criticalUnack > 1 ? "s" : ""} require immediate attention`
            : highUnack > 0
            ? `${highUnack} high-priority alert${highUnack > 1 ? "s" : ""} need action this shift`
            : "No active critical alerts"
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-5">
        {(criticalUnack > 0 || highUnack > 0) && (
          <div className="flex flex-wrap gap-3">
            {criticalUnack > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                <Danger size={13} color="currentColor" variant="Bold" />
                {criticalUnack} critical — immediate action required
              </div>
            )}
            {highUnack > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium">
                <Warning2 size={13} color="currentColor" variant="Bold" />
                {highUnack} high-priority — action needed this shift
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 flex-wrap">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={cn(
                "relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                filter === id
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "text-fg-dim hover:bg-[var(--hover-bg)] hover:text-fg-muted border-transparent"
              )}
            >
              {label}
              <span className={cn(
                "ml-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold",
                filter === id ? "bg-amber-500/20 text-amber-300" : "bg-[var(--subtle-bg)] text-fg-dim"
              )}>
                {tabCounts[id]}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="py-20 text-center text-fg-dim">
              <TickCircle size={36} color="currentColor" className="mx-auto mb-3 opacity-30" variant="Linear" />
              <p className="text-sm">No alerts in this category</p>
            </div>
          )}

          {filtered.map((alert) => (
            <Card key={alert.id} className={cn(cardBorder(alert), alert.resolved && "opacity-60")}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="mt-0.5 shrink-0">
                    <SeverityIcon severity={alert.severity} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-fg">{alert.title}</p>
                        <SeverityBadge severity={alert.severity} />
                        <Badge variant="muted">{TYPE_LABELS[alert.type]}</Badge>
                        {alert.escalated && <Badge variant="default">Escalated</Badge>}
                        {alert.resolved && <Badge variant="success">Resolved</Badge>}
                        {alert.acknowledged && !alert.resolved && <Badge variant="muted">Acknowledged</Badge>}
                      </div>
                      <div className="hidden sm:flex gap-2 shrink-0">
                        {!alert.acknowledged && !alert.resolved && (
                          <Button variant="outline" size="sm" onClick={() => handleAcknowledge(alert.id)}>
                            Acknowledge
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={
                            !alert.resolved && alert.severity === "critical"
                              ? "destructive"
                              : alert.resolved ? "ghost" : "default"
                          }
                          onClick={() => openDetail(alert)}
                        >
                          {alert.resolved ? "View" : alert.acknowledged ? "View" : "Respond"}
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-fg-muted leading-relaxed">{alert.description}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-fg-dim">
                        <Timer1 size={11} color="currentColor" variant="Linear" />
                        {alert.timestamp}
                      </div>
                      {alert.location && (
                        <div className="flex items-center gap-1.5 text-xs text-fg-dim">
                          <Location size={11} color="currentColor" variant="Linear" />
                          {alert.location}
                        </div>
                      )}
                      {alert.driver && (
                        <div className="flex items-center gap-1.5 text-xs text-fg-dim">
                          <People size={11} color="currentColor" variant="Linear" />
                          {alert.driver}
                        </div>
                      )}
                      {alert.bus && (
                        <div className="flex items-center gap-1.5 text-xs text-fg-dim">
                          <Bus size={11} color="currentColor" variant="Linear" />
                          {alert.bus}
                        </div>
                      )}
                      {alert.resolvedAt && (
                        <span className="text-xs text-emerald-500">
                          Resolved {alert.resolvedAt} · {alert.resolvedBy}
                        </span>
                      )}
                    </div>

                    {alert.suggestedAction && !alert.resolved && (
                      <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--subtle-bg)] border border-line-soft text-xs text-fg-dim">
                        <ArrowUp2 size={10} color="currentColor" />
                        Suggested: {alert.suggestedAction}
                      </div>
                    )}

                    <div className="sm:hidden flex gap-2 mt-3">
                      {!alert.acknowledged && !alert.resolved && (
                        <Button variant="outline" size="sm" onClick={() => handleAcknowledge(alert.id)}>
                          Acknowledge
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={
                          !alert.resolved && alert.severity === "critical"
                            ? "destructive"
                            : alert.resolved ? "ghost" : "default"
                        }
                        onClick={() => openDetail(alert)}
                      >
                        {alert.resolved ? "View" : alert.acknowledged ? "View" : "Respond"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Dialog
        open={!!detailAlert}
        onClose={() => { setDetailAlert(null); setActionType(""); setNotes("") }}
        title={detailAlert?.title ?? ""}
        className="max-w-lg"
      >
        {detailAlert && (
          <div className="space-y-4">
            <div className={cn(
              "rounded-lg p-3 text-xs border",
              detailAlert.severity === "critical" ? "bg-red-500/10 border-red-500/20" :
              detailAlert.severity === "high" ? "bg-orange-500/10 border-orange-500/20" :
              detailAlert.severity === "warning" ? "bg-yellow-500/10 border-yellow-500/20" :
              "bg-blue-500/10 border-blue-500/20"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <SeverityIcon severity={detailAlert.severity} size={14} />
                <SeverityBadge severity={detailAlert.severity} />
                <Badge variant="muted">{TYPE_LABELS[detailAlert.type]}</Badge>
              </div>
              <p className="text-fg-muted leading-relaxed">{detailAlert.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: "Triggered", value: detailAlert.timestamp },
                ...(detailAlert.driver ? [{ label: "Driver", value: detailAlert.driver }] : []),
                ...(detailAlert.bus ? [{ label: "Bus", value: detailAlert.bus }] : []),
                ...(detailAlert.route ? [{ label: "Route", value: detailAlert.route }] : []),
                ...(detailAlert.location ? [{ label: "Location", value: detailAlert.location }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-[var(--subtle-bg)] border border-line-soft p-2.5">
                  <p className="text-fg-dim mb-0.5">{label}</p>
                  <p className="font-medium text-fg-muted">{value}</p>
                </div>
              ))}
            </div>

            {detailAlert.resolved ? (
              <>
                <div className="rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20 p-3 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                    <TickCircle size={12} color="currentColor" variant="Bold" />
                    Resolved
                  </div>
                  <p className="text-fg-muted">By {detailAlert.resolvedBy} · {detailAlert.resolvedAt}</p>
                  {detailAlert.note && <p className="text-fg-muted mt-1">Action: {detailAlert.note}</p>}
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setDetailAlert(null)}>Close</Button>
                </div>
              </>
            ) : (
              <>
                <Separator />
                {(ACTION_OPTIONS[detailAlert.type]?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs text-fg-dim mb-2">Recommended actions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ACTION_OPTIONS[detailAlert.type]!.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setActionType(opt)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs border transition-colors",
                            actionType === opt
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "text-fg-dim border-line-soft hover:bg-[var(--hover-bg)] hover:text-fg-muted"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Select value={actionType} onChange={(e) => setActionType(e.target.value)}>
                    <option value="">Select action…</option>
                    {ACTION_OPTIONS[detailAlert.type]?.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                    <option value="Other — see notes">Other — see notes</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs text-fg-dim mb-1.5">
                    Notes <span className="opacity-50">(optional)</span>
                  </label>
                  <Textarea
                    placeholder="Document findings, decisions, or follow-up steps…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end flex-wrap">
                  {!detailAlert.escalated && (
                    <Button variant="outline" size="sm" onClick={() => handleEscalate(detailAlert.id)}>
                      Escalate
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleResolve(detailAlert.id)}>
                    <TickCircle size={12} color="currentColor" variant="Bold" />
                    Mark Resolved
                  </Button>
                  <Button
                    size="sm"
                    variant={detailAlert.severity === "critical" ? "destructive" : "default"}
                    onClick={handleLogAction}
                    disabled={!actionType}
                  >
                    Log Action
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Dialog>

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
