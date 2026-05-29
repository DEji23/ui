"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  rosters,
  weekShifts,
  leaveRequests,
  drivers,
  type Roster,
  type Shift,
  type LeaveRequest,
} from "@/lib/data"
import {
  Add,
  ArrowLeft2,
  ArrowRight2,
  TickCircle,
  Warning2,
  People,
  Send2,
  CloseCircle,
  Calendar,
  Danger,
} from "iconsax-react"

const ROUTES = [
  "Lagos Island – Oshodi",
  "Oshodi – Ikeja",
  "Lagos Island – Lekki",
  "Berger – Oshodi",
  "Ojota – CMS",
]

const WEEKS = [
  { label: "May 26 – Jun 1", start: "2026-05-26", end: "2026-06-01", rosterId: "rs1" },
  { label: "Jun 2 – 8", start: "2026-06-02", end: "2026-06-08", rosterId: "rs2" },
]

const TODAY = "2026-05-29"

function getWeekDays(startDate: string): { date: string; label: string; isToday: boolean }[] {
  const result = []
  for (let i = 0; i < 6; i++) {
    const d = new Date(startDate + "T12:00:00Z")
    d.setDate(d.getDate() + i)
    const date = d.toISOString().slice(0, 10)
    result.push({
      date,
      label: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" }),
      isToday: date === TODAY,
    })
  }
  return result
}

function driverEligibility(driverId: string): "eligible" | "risk" | "blocked" {
  const d = drivers.find((x) => x.id === driverId)
  if (!d) return "blocked"
  if (d.status === "blocked" || d.complianceStatus === "blocked") return "blocked"
  if (d.status === "on_leave") return "blocked"
  if (d.complianceStatus === "warning" || d.hoursThisWeek > 40) return "risk"
  return "eligible"
}

function ShiftChip({
  shift,
  onAssign,
}: {
  shift: Shift | undefined
  onAssign: () => void
}) {
  if (!shift) {
    return (
      <button
        onClick={onAssign}
        className="w-full h-[52px] rounded-lg border border-dashed border-line-soft flex items-center justify-center transition-colors hover:border-amber-500/40 hover:bg-amber-500/[0.04] group"
      >
        <span className="text-[10px] text-fg-dim group-hover:text-amber-400 transition-colors">+ Assign</span>
      </button>
    )
  }

  if (shift.status === "leave") {
    return (
      <div className="w-full h-[52px] rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <span className="text-[10px] font-semibold text-amber-400">Annual Leave</span>
      </div>
    )
  }

  if (shift.status === "blocked") {
    return (
      <div className="w-full h-[52px] rounded-lg bg-[var(--subtle-bg)] border border-line-soft flex items-center justify-center">
        <span className="text-[10px] font-medium text-fg-dim">Blocked</span>
      </div>
    )
  }

  if (shift.status === "conflict") {
    return (
      <button
        onClick={onAssign}
        className="w-full h-[52px] rounded-lg bg-red-500/[0.08] border border-red-500/25 p-1.5 text-left hover:bg-red-500/[0.12] transition-colors"
      >
        <p className="text-[10px] font-semibold text-red-400 flex items-center gap-1">
          <Warning2 size={9} color="currentColor" variant="Bold" />
          Conflict
        </p>
        <p className="text-[9px] text-red-300 mt-0.5 leading-tight">
          {shift.complianceFlag === "rest_violation" ? "Rest violation" : "Hours exceeded"}
        </p>
        <p className="text-[9px] text-fg-dim mt-0.5 truncate">{shift.startTime}</p>
      </button>
    )
  }

  if (shift.status === "unassigned") {
    return (
      <button
        onClick={onAssign}
        className="w-full h-[52px] rounded-lg bg-[var(--subtle-bg)] border border-dashed border-amber-500/40 p-1.5 text-left hover:bg-amber-500/[0.04] transition-colors"
      >
        <p className="text-[10px] font-semibold text-amber-400">Open</p>
        <p className="text-[9px] text-fg-dim mt-0.5 truncate">{shift.route || "No route"}</p>
      </button>
    )
  }

  const isAM = shift.shiftType === "morning"
  const isPM = shift.shiftType === "afternoon"

  return (
    <div
      className={cn(
        "w-full h-[52px] rounded-lg border p-1.5",
        isAM
          ? "bg-emerald-500/[0.08] border-emerald-500/20"
          : isPM
          ? "bg-blue-500/[0.08] border-blue-500/20"
          : "bg-purple-500/[0.08] border-purple-500/20"
      )}
    >
      <p
        className={cn(
          "text-[10px] font-semibold",
          isAM ? "text-emerald-400" : isPM ? "text-blue-400" : "text-purple-400"
        )}
      >
        {isAM ? "AM" : isPM ? "PM" : "AM/PM"}
        {shift.startTime && ` · ${shift.startTime}`}
        {shift.complianceFlag === "hours_exceeded" && (
          <span className="ml-1 text-amber-400">⚠</span>
        )}
      </p>
      <p className="text-[9px] text-fg-dim mt-0.5 leading-tight truncate">
        {shift.route.split("–")[0]?.trim() || shift.route}
      </p>
      {shift.busCode && (
        <p className="text-[9px] text-fg-dim truncate">{shift.busCode}</p>
      )}
    </div>
  )
}

type Tab = "roster" | "leave"
type AssignTarget = { driverId: string; driverName: string; date: string; existingShift?: Shift }

export default function SchedulingPage() {
  const [weekIdx, setWeekIdx] = useState(0)
  const [activeTab, setActiveTab] = useState<Tab>("roster")
  const [shifts, setShifts] = useState<Shift[]>(weekShifts)
  const [rosterList, setRosterList] = useState<Roster[]>(rosters)
  const [leaveList, setLeaveList] = useState<LeaveRequest[]>(leaveRequests)

  const [assignOpen, setAssignOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)

  const [assignDriver, setAssignDriver] = useState("")
  const [assignShiftType, setAssignShiftType] = useState("morning")
  const [assignRoute, setAssignRoute] = useState("")
  const [assignStart, setAssignStart] = useState("06:00")
  const [assignEnd, setAssignEnd] = useState("14:00")

  const [createName, setCreateName] = useState("")
  const [createWeekStart, setCreateWeekStart] = useState("")
  const [createRoutes, setCreateRoutes] = useState<string[]>([])

  const [toast, setToast] = useState<string | null>(null)
  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const week = WEEKS[weekIdx]
  const weekDays = useMemo(() => getWeekDays(week.start), [week.start])
  const currentRoster = rosterList.find((r) => r.id === week.rosterId)
  const currentShifts = shifts.filter((s) => s.date >= week.start && s.date <= week.end)

  const kpiDriversAvailable = drivers.filter(
    (d) => d.status !== "blocked" && d.status !== "on_leave" && d.status !== "deactivated"
  ).length
  const kpiOnLeave = drivers.filter((d) => d.status === "on_leave").length
  const kpiAssigned = currentShifts.filter((s) => s.status === "assigned").length
  const kpiUnassigned = currentShifts.filter((s) => s.status === "unassigned").length
  const kpiConflicts = currentShifts.filter((s) => s.status === "conflict").length

  const pendingLeave = leaveList.filter((l) => l.status === "pending")

  function openAssign(driverId: string, driverName: string, date: string) {
    const existingShift = currentShifts.find(
      (s) => s.driverId === driverId && s.date === date
    )
    setAssignTarget({ driverId, driverName, date, existingShift })
    setAssignDriver(driverId)
    setAssignRoute(existingShift?.route || "")
    setAssignShiftType(existingShift?.shiftType || "morning")
    setAssignStart(existingShift?.startTime || "06:00")
    setAssignEnd(existingShift?.endTime || "14:00")
    setAssignOpen(true)
  }

  function handleAssignShift() {
    if (!assignTarget || !assignDriver || !assignRoute) return
    const driver = drivers.find((d) => d.id === assignDriver)
    if (!driver) return
    const elig = driverEligibility(assignDriver)

    setShifts((prev) => {
      const filtered = prev.filter(
        (s) => !(s.driverId === assignTarget.driverId && s.date === assignTarget.date)
      )
      const newShift: Shift = {
        id: `sh${Date.now()}`,
        driverId: assignDriver,
        driverName: driver.name,
        driverCode: driver.code,
        date: assignTarget.date,
        dayOfWeek: weekDays.findIndex((d) => d.date === assignTarget.date),
        shiftType: assignShiftType as "morning" | "afternoon" | "split",
        route: assignRoute,
        startTime: assignStart,
        endTime: assignEnd,
        status: elig === "risk" ? "conflict" : "assigned",
        complianceFlag:
          elig === "risk"
            ? driver.hoursThisWeek > 40
              ? "hours_exceeded"
              : "rest_violation"
            : undefined,
      }
      return [...filtered, newShift]
    })
    setAssignOpen(false)
    showToast(`Shift assigned to ${driver.name}`)
  }

  function handleCreateRoster() {
    if (!createName || !createWeekStart) return
    const start = createWeekStart
    const endDate = new Date(start + "T12:00:00Z")
    endDate.setDate(endDate.getDate() + 6)
    const end = endDate.toISOString().slice(0, 10)
    const newRoster: Roster = {
      id: `rs${Date.now()}`,
      name: createName,
      weekStart: start,
      weekEnd: end,
      status: "draft",
      totalDrivers: 0,
      assignedShifts: 0,
      unassignedShifts: 0,
      conflicts: 0,
      createdAt: new Date().toISOString(),
    }
    setRosterList((prev) => [...prev, newRoster])
    setCreateOpen(false)
    setCreateName("")
    setCreateWeekStart("")
    setCreateRoutes([])
    showToast(`Roster "${createName}" created`)
  }

  function handlePublish() {
    setRosterList((prev) =>
      prev.map((r) =>
        r.id === currentRoster?.id
          ? { ...r, status: "published", publishedAt: new Date().toISOString() }
          : r
      )
    )
    setPublishOpen(false)
    showToast("Roster published — drivers will be notified")
  }

  function handleLeaveAction(id: string, action: "approved" | "declined") {
    setLeaveList((prev) => prev.map((l) => (l.id === id ? { ...l, status: action } : l)))
    showToast(action === "approved" ? "Leave request approved" : "Leave request declined")
  }

  const rosterSubtitle = currentRoster
    ? `${week.label} · ${currentRoster.status === "published" ? "Published" : "Draft"}`
    : week.label

  return (
    <>
      <Header
        title="Scheduling"
        subtitle={rosterSubtitle}
        action={
          <div className="flex gap-2 mr-1">
            {currentRoster?.status === "draft" && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setPublishOpen(true)}
              >
                <Send2 size={14} color="currentColor" />
                <span className="hidden sm:inline">Publish</span>
              </Button>
            )}
            <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
              <Add size={14} color="currentColor" />
              <span className="hidden sm:inline">Create Roster</span>
            </Button>
          </div>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-5">
        {/* Week navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              disabled={weekIdx === 0}
              onClick={() => setWeekIdx((i) => i - 1)}
              className="h-8 w-8 rounded-lg border border-line-soft flex items-center justify-center text-fg-dim hover:text-fg hover:bg-[var(--hover-bg)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft2 size={14} color="currentColor" />
            </button>
            <div className="px-4 py-1.5 rounded-lg border border-line-soft bg-[var(--subtle-bg)]">
              <span className="text-sm font-medium text-fg">{week.label}</span>
            </div>
            <button
              disabled={weekIdx === WEEKS.length - 1}
              onClick={() => setWeekIdx((i) => i + 1)}
              className="h-8 w-8 rounded-lg border border-line-soft flex items-center justify-center text-fg-dim hover:text-fg hover:bg-[var(--hover-bg)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowRight2 size={14} color="currentColor" />
            </button>
          </div>
          {currentRoster && (
            <div className="flex items-center gap-2">
              {currentRoster.status === "published" ? (
                <Badge variant="success">Published</Badge>
              ) : (
                <Badge variant="default">Draft</Badge>
              )}
            </div>
          )}
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Drivers available", value: kpiDriversAvailable, icon: <People size={14} color="#60a5fa" variant="Bold" />, bg: "bg-blue-500/10" },
            { label: "On leave", value: kpiOnLeave, icon: <Calendar size={14} color="#f59e0b" variant="Bold" />, bg: "bg-amber-500/10" },
            { label: "Shifts planned", value: kpiAssigned, icon: <TickCircle size={14} color="#34d399" variant="Bold" />, bg: "bg-emerald-500/10" },
            { label: "Unassigned", value: kpiUnassigned, icon: <CloseCircle size={14} color="#a1a1aa" variant="Bold" />, bg: "bg-[var(--hover-bg)]" },
            { label: "Conflicts", value: kpiConflicts, icon: <Danger size={14} color="#f87171" variant="Bold" />, bg: "bg-red-500/10" },
          ].map(({ label, value, icon, bg }) => (
            <div
              key={label}
              className="bg-surface border border-line-soft rounded-xl p-3.5 flex items-center gap-3"
            >
              <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0", bg)}>
                {icon}
              </div>
              <div>
                <p className="text-lg font-bold text-fg tabular-nums">{value}</p>
                <p className="text-[11px] text-fg-dim leading-tight">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Conflicts callout */}
        {kpiConflicts > 0 && (
          <div className="rounded-xl bg-red-500/[0.06] border border-red-500/20 px-4 py-3 flex items-start gap-3">
            <Warning2 size={16} color="#f87171" variant="Bold" className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-400">
                {kpiConflicts} compliance conflict{kpiConflicts > 1 ? "s" : ""} in this roster
              </p>
              <p className="text-xs text-fg-muted mt-0.5">
                Review the affected shifts below. Conflicts will block publishing unless resolved.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-line-soft">
          {(["roster", "leave"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors relative",
                activeTab === t ? "text-fg" : "text-fg-muted hover:text-fg"
              )}
            >
              {t === "roster" ? "Roster Calendar" : "Leave Management"}
              {t === "leave" && pendingLeave.length > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-amber-500/20 px-1 text-[10px] font-bold text-amber-400">
                  {pendingLeave.length}
                </span>
              )}
              {activeTab === t && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Roster Calendar */}
        {activeTab === "roster" && (
          <Card>
            <CardHeader className="px-5 py-3.5 border-b border-line-soft">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {currentRoster?.name ?? "No roster for this week"}
                </CardTitle>
                <div className="flex items-center gap-3 text-[11px] text-fg-dim">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-500/60" /> AM</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-blue-500/60" /> PM</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-500/60" /> Leave</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-500/60" /> Conflict</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div style={{ minWidth: "860px" }}>
                  <div
                    className="grid border-b border-line-soft bg-[var(--subtle-bg)]"
                    style={{ gridTemplateColumns: "172px repeat(6, 1fr)" }}
                  >
                    <div className="px-3 py-2.5 border-r border-line-soft">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-dim">Driver</span>
                    </div>
                    {weekDays.map((day) => (
                      <div
                        key={day.date}
                        className={cn(
                          "px-2 py-2.5 text-center border-r border-line-soft last:border-r-0",
                          day.isToday && "bg-amber-500/[0.04]"
                        )}
                      >
                        <span className={cn("text-[11px] font-semibold", day.isToday ? "text-amber-400" : "text-fg-dim")}>
                          {day.label}
                        </span>
                        {day.isToday && (
                          <span className="ml-1 text-[9px] text-amber-400 bg-amber-500/10 rounded px-1">Today</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {drivers.map((driver) => (
                    <div
                      key={driver.id}
                      className="grid border-b border-line-soft last:border-b-0 hover:bg-[var(--subtle-bg)] transition-colors"
                      style={{ gridTemplateColumns: "172px repeat(6, 1fr)" }}
                    >
                      <div className="px-3 py-2 flex items-center gap-2 border-r border-line-soft">
                        <Avatar name={driver.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-fg truncate">{driver.name.split(" ")[0]}</p>
                          <p className="text-[10px] text-fg-dim">{driver.code}</p>
                        </div>
                      </div>
                      {weekDays.map((day) => {
                        const shift = currentShifts.find(
                          (s) => s.driverId === driver.id && s.date === day.date
                        )
                        return (
                          <div
                            key={day.date}
                            className={cn(
                              "p-1.5 border-r border-line-soft last:border-r-0",
                              day.isToday && "bg-amber-500/[0.02]"
                            )}
                          >
                            <ShiftChip
                              shift={shift}
                              onAssign={() => openAssign(driver.id, driver.name, day.date)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leave Management */}
        {activeTab === "leave" && (
          <Card>
            <CardHeader className="px-5 py-4 border-b border-line-soft">
              <div className="flex items-center justify-between">
                <CardTitle>Leave Requests</CardTitle>
                <span className="text-xs text-fg-muted">{pendingLeave.length} pending</span>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="divide-y divide-line-soft">
                {leaveList.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--hover-bg)] transition-colors"
                  >
                    <Avatar name={req.driver} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-fg">{req.driver}</p>
                        <span className="text-fg-dim text-xs">·</span>
                        <span className="text-xs text-fg-muted capitalize">{req.type}</span>
                        <span className="text-xs text-fg-dim">{req.from} – {req.to}</span>
                      </div>
                      <p className="text-[11px] text-fg-dim mt-0.5">
                        Affects {req.affectedDuties} duties
                        {req.reason && ` · ${req.reason}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === "pending" ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleLeaveAction(req.id, "declined")}>Decline</Button>
                          <Button size="sm" onClick={() => handleLeaveAction(req.id, "approved")}>Approve</Button>
                        </>
                      ) : (
                        <Badge variant={req.status === "approved" ? "success" : req.status === "declined" ? "destructive" : "muted"}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Assign Shift Dialog */}
      <Dialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title={assignTarget?.existingShift ? "Edit Shift" : "Assign Shift"}
        description={assignTarget ? `${assignTarget.driverName} · ${assignTarget.date}` : undefined}
        className="max-w-lg"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap pb-1">
            {(["eligible", "risk", "blocked"] as const).map((e) => (
              <span key={e} className="flex items-center gap-1.5 text-[11px] text-fg-dim">
                <span className={cn("h-1.5 w-1.5 rounded-full", e === "eligible" ? "bg-emerald-400" : e === "risk" ? "bg-amber-400" : "bg-red-400")} />
                {e === "eligible" ? "Eligible" : e === "risk" ? "Risk" : "Not allowed"}
              </span>
            ))}
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-2">Select Driver</label>
            <div className="space-y-1.5 max-h-52 overflow-y-auto rounded-lg border border-line-soft p-1">
              {drivers.map((d) => {
                const elig = driverEligibility(d.id)
                return (
                  <button
                    key={d.id}
                    disabled={elig === "blocked"}
                    onClick={() => setAssignDriver(d.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors text-left",
                      assignDriver === d.id
                        ? "bg-amber-500/10 border-amber-500/30"
                        : elig === "blocked"
                        ? "border-transparent opacity-40 cursor-not-allowed"
                        : "border-transparent hover:bg-[var(--hover-bg)]"
                    )}
                  >
                    <Avatar name={d.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-fg">{d.name}</p>
                      <p className="text-[10px] text-fg-dim">{d.code} · {d.hoursThisWeek}h this week</p>
                    </div>
                    <span className={cn(
                      "text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0",
                      elig === "eligible" ? "bg-emerald-500/10 text-emerald-400" :
                      elig === "risk" ? "bg-amber-500/10 text-amber-400" :
                      "bg-red-500/10 text-red-400"
                    )}>
                      {elig === "eligible" ? "✓ Eligible" : elig === "risk" ? "⚠ Risk" : "✗ Blocked"}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">Shift Type</label>
              <Select value={assignShiftType} onChange={(e) => setAssignShiftType(e.target.value)}>
                <option value="morning">Morning (AM)</option>
                <option value="afternoon">Afternoon (PM)</option>
                <option value="split">Split (AM/PM)</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">Route</label>
              <Select value={assignRoute} onChange={(e) => setAssignRoute(e.target.value)}>
                <option value="">Select route…</option>
                {ROUTES.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">Start Time</label>
              <Input type="time" value={assignStart} onChange={(e) => setAssignStart(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">End Time</label>
              <Input type="time" value={assignEnd} onChange={(e) => setAssignEnd(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" size="sm" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={!assignDriver || !assignRoute} onClick={handleAssignShift}>Assign Shift</Button>
          </div>
        </div>
      </Dialog>

      {/* Create Roster Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Roster"
        description="Set up a weekly roster. Shifts can be assigned after creation."
        className="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Roster Name</label>
            <Input placeholder="e.g. Week 24 — Jun 9 – 15" value={createName} onChange={(e) => setCreateName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Week Start (Monday)</label>
            <Input type="date" value={createWeekStart} onChange={(e) => setCreateWeekStart(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-2">Routes to cover</label>
            <div className="space-y-1.5">
              {ROUTES.map((r) => (
                <label key={r} className="flex items-center gap-2.5 cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    className="accent-amber-500 h-3.5 w-3.5"
                    checked={createRoutes.includes(r)}
                    onChange={(e) => {
                      if (e.target.checked) setCreateRoutes((p) => [...p, r])
                      else setCreateRoutes((p) => p.filter((x) => x !== r))
                    }}
                  />
                  <span className="text-sm text-fg-muted">{r}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={!createName || !createWeekStart} onClick={handleCreateRoster}>Create Roster</Button>
          </div>
        </div>
      </Dialog>

      {/* Publish Roster Dialog */}
      <Dialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        title="Publish Roster"
        description={currentRoster?.name}
        className="max-w-md"
      >
        <div className="space-y-4 mt-1">
          {kpiConflicts > 0 || kpiUnassigned > 0 ? (
            <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/20 p-3 space-y-1">
              <p className="text-xs font-semibold text-amber-400">Review before publishing</p>
              {kpiConflicts > 0 && <p className="text-xs text-fg-muted">• {kpiConflicts} compliance conflict{kpiConflicts > 1 ? "s" : ""} detected</p>}
              {kpiUnassigned > 0 && <p className="text-xs text-fg-muted">• {kpiUnassigned} unassigned shift{kpiUnassigned > 1 ? "s" : ""} will stay open</p>}
            </div>
          ) : (
            <div className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 p-3">
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <TickCircle size={13} color="currentColor" variant="Bold" />
                All shifts assigned — ready to publish
              </p>
            </div>
          )}
          <div className="space-y-2.5 border-t border-line-soft pt-3">
            {[
              ["Shifts assigned", kpiAssigned],
              ["Unassigned", kpiUnassigned],
              ["Conflicts", kpiConflicts],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex items-center justify-between text-sm">
                <span className="text-fg-muted">{label}</span>
                <span className={cn(
                  "font-semibold tabular-nums",
                  label === "Conflicts" && Number(value) > 0 ? "text-red-400" :
                  label === "Unassigned" && Number(value) > 0 ? "text-amber-400" : "text-fg"
                )}>{value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-fg-dim">Once published, drivers will see their assigned shifts and attendance tracking starts.</p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setPublishOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handlePublish}>Publish Roster</Button>
          </div>
        </div>
      </Dialog>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[300] px-4 py-3 rounded-xl text-sm font-medium shadow-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-300 backdrop-blur-sm">
          {toast}
        </div>
      )}
    </>
  )
}
