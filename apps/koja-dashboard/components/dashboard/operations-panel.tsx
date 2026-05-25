"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Warning2, TickCircle } from "iconsax-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { drivers, dispatchPlans, buses, activeTrips, nextDepartures } from "@/lib/data"

const scheduledToday = dispatchPlans.length
const onLeaveToday = drivers.filter(d => d.status === "on_leave").length
const complianceIssues = drivers.filter(d => d.complianceStatus !== "clear").length
const unassignedDuties = dispatchPlans.filter(d => d.status === "no_show").length

const uniqueActiveRoutes = new Set(
  dispatchPlans.filter(d => d.status === "active").map(d => d.route)
).size
const busesDispatched = buses.filter(b => b.status === "active").length
const totalBuses = buses.length
const tripsRunning = activeTrips.filter(t => ["en_route", "boarding"].includes(t.status)).length

const checkedIn = drivers.filter(d => d.status === "active").length
const lateDrivers = drivers.filter(d => d.status === "late").length
const driversOnLeave = drivers.filter(d => d.status === "on_leave").length
const endedEarly = drivers.filter(d => d.status === "offline" && d.tripsToday > 0).length

type Tab = "schedule" | "dispatch" | "attendance"

function StatusPill({ status }: { status: "green" | "amber" | "red" }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
      status === "green" && "bg-emerald-500/10 text-emerald-400",
      status === "amber" && "bg-amber-500/10 text-amber-400",
      status === "red" && "bg-red-500/10 text-red-400",
    )}>
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        status === "green" && "bg-emerald-400",
        status === "amber" && "bg-amber-400",
        status === "red" && "bg-red-400",
      )} />
      {status === "green" ? "All Good" : status === "amber" ? "Needs Attention" : "Critical Issues"}
    </span>
  )
}

function MetricRow({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-line-soft last:border-0">
      <span className="text-sm text-fg-muted">{label}</span>
      <span className={cn("text-sm font-semibold tabular-nums", highlight ? "text-amber-400" : "text-fg")}>{value}</span>
    </div>
  )
}

export function OperationsPanel() {
  const [tab, setTab] = useState<Tab>("schedule")

  const scheduleStatus: "green" | "amber" | "red" = unassignedDuties > 1 || complianceIssues > 2 ? "red" : unassignedDuties > 0 || complianceIssues > 0 ? "amber" : "green"
  const dispatchStatus: "green" | "amber" | "red" = busesDispatched < totalBuses * 0.5 ? "red" : busesDispatched < totalBuses ? "amber" : "green"
  const attendanceStatus: "green" | "amber" | "red" = lateDrivers > 2 ? "red" : lateDrivers > 0 ? "amber" : "green"

  const tabs: { id: Tab; label: string; status: "green" | "amber" | "red" }[] = [
    { id: "schedule", label: "Schedule Health", status: scheduleStatus },
    { id: "dispatch", label: "Dispatch Status", status: dispatchStatus },
    { id: "attendance", label: "Shift & Attendance", status: attendanceStatus },
  ]

  return (
    <Card>
      <CardHeader className="border-b border-line-soft">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle>Today's Operations</CardTitle>
          <div className="flex gap-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  tab === t.id
                    ? "bg-amber-500/10 text-amber-400"
                    : "text-fg-muted hover:text-fg hover:bg-[var(--hover-bg)]"
                )}
              >
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full shrink-0",
                  t.status === "green" && "bg-emerald-400",
                  t.status === "amber" && "bg-amber-400",
                  t.status === "red" && "bg-red-400",
                )} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {tab === "schedule" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusPill status={scheduleStatus} />
              <Link href="/dispatch">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  Fix Schedule
                  <ArrowRight size={12} color="currentColor" variant="Linear" />
                </Button>
              </Link>
            </div>
            <div>
              <MetricRow label="Drivers scheduled today" value={scheduledToday} />
              <MetricRow label="Drivers on leave" value={onLeaveToday} />
              <MetricRow label="Compliance issues" value={complianceIssues} highlight={complianceIssues > 0} />
              <MetricRow label="Unassigned duties" value={unassignedDuties} highlight={unassignedDuties > 0} />
            </div>
            {complianceIssues > 0 && (
              <div className="rounded-lg bg-amber-500/[0.06] border border-amber-500/20 p-3 space-y-1.5">
                <p className="text-xs font-semibold text-amber-400">Compliance issues detected</p>
                {drivers.filter(d => d.complianceStatus !== "clear").map(d => (
                  <div key={d.id} className="flex items-center justify-between">
                    <p className="text-xs text-fg-muted">{d.name}</p>
                    <span className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded",
                      d.complianceStatus === "blocked" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                    )}>
                      {d.complianceStatus === "blocked" ? "Blocked" : "Rest time violation"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "dispatch" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusPill status={dispatchStatus} />
              <Link href="/dispatch">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  Dispatch Planner
                  <ArrowRight size={12} color="currentColor" variant="Linear" />
                </Button>
              </Link>
            </div>
            <div>
              <MetricRow label="Routes active now" value={uniqueActiveRoutes} />
              <MetricRow label="Buses dispatched" value={`${busesDispatched} / ${totalBuses}`} highlight={busesDispatched < totalBuses} />
              <MetricRow label="Trips currently running" value={tripsRunning} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-dim mb-2">Next Departures</p>
              <div className="space-y-2">
                {nextDepartures.map((dep, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-[var(--subtle-bg)] border border-line-soft px-3 py-2.5">
                    <div>
                      <p className="text-xs font-medium text-fg">{dep.route}</p>
                      <p className="text-[11px] text-fg-dim mt-0.5">{dep.bus} · {dep.driver}</p>
                    </div>
                    <span className="text-xs font-semibold text-amber-400 shrink-0 ml-3">{dep.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "attendance" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusPill status={attendanceStatus} />
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                Report Issue
              </Button>
            </div>
            <div>
              <MetricRow label="Drivers checked in" value={checkedIn} />
              <MetricRow label="Drivers late" value={lateDrivers} highlight={lateDrivers > 0} />
              <MetricRow label="Drivers on leave" value={driversOnLeave} />
              <MetricRow label="Ended shift early" value={endedEarly} highlight={endedEarly > 0} />
            </div>
            {lateDrivers > 0 && (
              <div className="rounded-lg bg-amber-500/[0.06] border border-amber-500/20 p-3 space-y-2">
                <p className="text-xs font-semibold text-amber-400">Late drivers — action required</p>
                {drivers.filter(d => d.status === "late").map(d => (
                  <div key={d.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-fg">{d.name}</p>
                      <p className="text-[11px] text-fg-dim">{d.code}</p>
                    </div>
                    <Link href="/drivers">
                      <button className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium">
                        Replace →
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
