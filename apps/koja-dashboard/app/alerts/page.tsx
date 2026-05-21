"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { alerts, type Alert } from "@/lib/data"
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

const filterOptions = ["All", "Critical", "Warning", "Acknowledged"] as const
type AlertFilter = (typeof filterOptions)[number]

export default function AlertsPage() {
  const [filter, setFilter] = useState<AlertFilter>("All")
  const [dismissed, setDismissed] = useState<string[]>([])

  const criticalUnack = alerts.filter((a) => a.severity === "critical" && !a.acknowledged).length

  const filtered = alerts
    .filter((a) => {
      if (filter === "Critical") return a.severity === "critical"
      if (filter === "Warning") return a.severity === "warning"
      if (filter === "Acknowledged") return a.acknowledged
      return true
    })
    .filter((a) => !dismissed.includes(a.id))

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
      <main className="flex-1 p-6 space-y-5">
        {/* Filters */}
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

        {/* Alert list */}
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
                alert.severity === "critical" && !alert.acknowledged
                  ? "border-red-500/25 bg-red-500/[0.04]"
                  : alert.severity === "warning" && !alert.acknowledged
                  ? "border-yellow-500/25 bg-yellow-500/[0.04]"
                  : "",
                alert.acknowledged && "opacity-60"
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 shrink-0">
                    <SeverityIcon severity={alert.severity} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <p className="text-sm font-semibold text-zinc-100">{alert.title}</p>
                      {severityBadge(alert.severity)}
                      <Badge variant="muted">{typeLabels[alert.type]}</Badge>
                      {alert.acknowledged && <Badge variant="muted">Acknowledged</Badge>}
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
                      {alert.driver && (
                        <span className="text-xs text-zinc-600">Driver: {alert.driver}</span>
                      )}
                      {alert.bus && (
                        <span className="text-xs text-zinc-600">Bus: {alert.bus}</span>
                      )}
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDismissed((d) => [...d, alert.id])}
                      >
                        Dismiss
                      </Button>
                      {alert.severity === "critical" && (
                        <Button size="sm" variant="destructive">Respond</Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  )
}
