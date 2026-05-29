"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Dialog } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  dispatchPlans,
  vehicleBlocks,
  drivers,
  buses,
  type DispatchPlan,
  type VehicleBlock,
} from "@/lib/data"
import { Add, Send2, TickCircle, CloseCircle, Warning2, Bus, ArrowRight } from "iconsax-react"

const ROUTES = [
  "Lagos Island – Oshodi",
  "Oshodi – Ikeja",
  "Lagos Island – Lekki",
  "Berger – Oshodi",
  "Ojota – CMS",
]

type Toast = { id: number; message: string; type: "success" | "error" | "info" }
type DialogMode = "new" | "edit" | "replace" | "block" | "assign_block" | null
type StatusFilter = "all" | "active" | "no_show" | "completed"
type CheckInStatus = "checked_in" | "late" | "not_checked_in"

function dispatchStatusBadge(status: string) {
  switch (status) {
    case "active": return <Badge variant="success">Active</Badge>
    case "completed": return <Badge variant="muted">Completed</Badge>
    case "no_show": return <Badge variant="destructive">No-Show</Badge>
    case "pending": return <Badge variant="default">Pending</Badge>
    default: return null
  }
}

function checkInBadge(status: CheckInStatus) {
  if (status === "checked_in")
    return <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 rounded px-1.5 py-0.5">Checked in</span>
  if (status === "late")
    return <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 rounded px-1.5 py-0.5">Late</span>
  return <span className="text-[10px] font-medium text-fg-dim bg-[var(--hover-bg)] rounded px-1.5 py-0.5">Not checked in</span>
}

const INITIAL_CHECK_INS: Record<string, CheckInStatus> = {
  dp1: "checked_in",
  dp2: "checked_in",
  dp3: "checked_in",
  dp4: "not_checked_in",
  dp5: "late",
  dp6: "checked_in",
}

export default function DispatchPage() {
  const [plans, setPlans] = useState<DispatchPlan[]>(dispatchPlans)
  const [blocks, setBlocks] = useState<VehicleBlock[]>(vehicleBlocks)
  const [checkIns, setCheckIns] = useState<Record<string, CheckInStatus>>(INITIAL_CHECK_INS)
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [editTarget, setEditTarget] = useState<DispatchPlan | null>(null)
  const [blockTarget, setBlockTarget] = useState<VehicleBlock | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const [formDriver, setFormDriver] = useState("")
  const [formBus, setFormBus] = useState("")
  const [formRoute, setFormRoute] = useState("")
  const [formTrips, setFormTrips] = useState("3")
  const [formDep, setFormDep] = useState("06:00")
  const [replaceDriver, setReplaceDriver] = useState("")

  const [blockBus, setBlockBus] = useState("")
  const [blockRoute, setBlockRoute] = useState("")
  const [blockTrips, setBlockTrips] = useState("3")
  const [blockDep, setBlockDep] = useState("06:00")
  const [blockAssignDriver, setBlockAssignDriver] = useState("")

  function addToast(message: string, type: Toast["type"] = "success") {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }

  function openNew() {
    setFormDriver(""); setFormBus(""); setFormRoute(""); setFormTrips("3"); setFormDep("06:00")
    setEditTarget(null)
    setDialogMode("new")
  }

  function openEdit(plan: DispatchPlan) {
    setFormDriver(plan.driver); setFormBus(plan.bus); setFormRoute(plan.route)
    setFormTrips(String(plan.trips)); setFormDep(plan.departure)
    setEditTarget(plan)
    setDialogMode("edit")
  }

  function openReplace(plan: DispatchPlan) {
    setEditTarget(plan); setReplaceDriver("")
    setDialogMode("replace")
  }

  function openAssignBlock(block: VehicleBlock) {
    setBlockTarget(block); setBlockAssignDriver("")
    setDialogMode("assign_block")
  }

  function handleSave() {
    const driver = drivers.find((d) => d.name === formDriver)
    if (!formDriver || !formBus || !formRoute) return
    if (dialogMode === "new") {
      const newPlan: DispatchPlan = {
        id: `dp${Date.now()}`,
        driver: formDriver,
        driverCode: driver?.code ?? "KJA-00X",
        bus: formBus,
        route: formRoute,
        trips: parseInt(formTrips) || 3,
        departure: formDep,
        status: "pending",
      }
      setPlans((p) => [...p, newPlan])
      setCheckIns((c) => ({ ...c, [newPlan.id]: "not_checked_in" }))
      addToast(`Assignment created for ${formDriver}`)
    } else if (dialogMode === "edit" && editTarget) {
      setPlans((p) =>
        p.map((x) =>
          x.id === editTarget.id
            ? { ...x, driver: formDriver, driverCode: driver?.code ?? x.driverCode, bus: formBus, route: formRoute, trips: parseInt(formTrips) || 3, departure: formDep }
            : x
        )
      )
      addToast("Assignment updated", "info")
    }
    setDialogMode(null)
  }

  function handleReplace() {
    if (!replaceDriver || !editTarget) return
    const driver = drivers.find((d) => d.name === replaceDriver)
    setPlans((p) =>
      p.map((x) =>
        x.id === editTarget.id
          ? { ...x, driver: replaceDriver, driverCode: driver?.code ?? x.driverCode, status: "active" }
          : x
      )
    )
    setCheckIns((c) => ({ ...c, [editTarget.id]: "not_checked_in" }))
    addToast(`${replaceDriver} assigned as replacement`)
    setDialogMode(null)
  }

  function handleCreateBlock() {
    if (!blockBus || !blockRoute) return
    const driver = drivers.find((d) => d.id === blockAssignDriver)
    const newBlock: VehicleBlock = {
      id: `vb${Date.now()}`,
      busCode: blockBus,
      route: blockRoute,
      date: "2026-05-29",
      trips: parseInt(blockTrips) || 3,
      departure: blockDep,
      driverId: blockAssignDriver || undefined,
      driverName: driver?.name,
      status: blockAssignDriver ? "assigned" : "unassigned",
    }
    setBlocks((b) => [...b, newBlock])
    setBlockBus(""); setBlockRoute(""); setBlockTrips("3"); setBlockDep("06:00"); setBlockAssignDriver("")
    addToast("Vehicle block created")
    setDialogMode(null)
  }

  function handleAssignBlock() {
    if (!blockAssignDriver || !blockTarget) return
    const driver = drivers.find((d) => d.id === blockAssignDriver)
    setBlocks((b) =>
      b.map((x) =>
        x.id === blockTarget.id
          ? { ...x, driverId: blockAssignDriver, driverName: driver?.name, status: "assigned" }
          : x
      )
    )
    addToast(`${driver?.name} assigned to ${blockTarget.busCode}`)
    setDialogMode(null)
  }

  function handlePublish() {
    const pending = plans.filter((p) => p.status === "pending").length
    setPlans((p) => p.map((x) => (x.status === "pending" ? { ...x, status: "active" } : x)))
    addToast(pending > 0 ? `${pending} assignment${pending > 1 ? "s" : ""} published` : "All assignments already active")
  }

  function handleCheckIn(planId: string) {
    setCheckIns((c) => ({ ...c, [planId]: "checked_in" }))
    addToast("Check-in recorded", "info")
  }

  const activeCount = plans.filter((d) => d.status === "active").length
  const noShowCount = plans.filter((d) => d.status === "no_show").length
  const completedCount = plans.filter((d) => d.status === "completed").length
  const unassignedBlocks = blocks.filter((b) => b.status === "unassigned")

  const availableDrivers = drivers.filter((d) => d.status !== "blocked" && d.status !== "on_leave")
  const availableBuses = buses.filter((b) => b.status === "available" || b.status === "active")

  const filteredPlans = plans.filter((p) => filter === "all" || p.status === filter)

  const filterTabs: { id: StatusFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: plans.length },
    { id: "active", label: "Active", count: activeCount },
    { id: "no_show", label: "No-Show", count: noShowCount },
    { id: "completed", label: "Completed", count: completedCount },
  ]

  return (
    <>
      <Header
        title="Dispatch"
        subtitle="Today — Thursday 29 May 2026"
        action={
          <div className="flex gap-2 mr-1">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={handlePublish}>
              <Send2 size={14} color="currentColor" />
              <span className="hidden sm:inline">Publish All</span>
            </Button>
            <Button size="sm" className="gap-1.5" onClick={openNew}>
              <Add size={14} color="currentColor" />
              <span className="hidden sm:inline">New Assignment</span>
            </Button>
          </div>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-5">
        {/* Exceptions callout */}
        {noShowCount > 0 && (
          <div className="rounded-xl bg-red-500/[0.06] border border-red-500/20 px-4 py-3 flex items-start gap-3">
            <Warning2 size={16} color="#f87171" variant="Bold" className="mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-400">
                {noShowCount} no-show{noShowCount > 1 ? "s" : ""} flagged — action required
              </p>
              <p className="text-xs text-fg-muted mt-0.5">
                {plans.filter((p) => p.status === "no_show").map((p) => `${p.driver} (${p.route})`).join(", ")}
              </p>
            </div>
            <Button size="sm" variant="outline" className="shrink-0 gap-1" onClick={() => setFilter("no_show")}>
              View <ArrowRight size={12} color="currentColor" variant="Linear" />
            </Button>
          </div>
        )}

        {/* Unassigned blocks callout */}
        {unassignedBlocks.length > 0 && (
          <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/20 px-4 py-3 flex items-start gap-3">
            <Bus size={16} color="#f59e0b" variant="Bold" className="mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-400">
                {unassignedBlocks.length} vehicle block{unassignedBlocks.length > 1 ? "s" : ""} without a driver
              </p>
              <p className="text-xs text-fg-muted mt-0.5">
                {unassignedBlocks.map((b) => `${b.busCode} · ${b.route}`).join("  ·  ")}
              </p>
            </div>
          </div>
        )}

        {/* KPI tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-line-soft rounded-xl p-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TickCircle size={16} color="#34d399" variant="Bold" />
            </div>
            <div>
              <p className="text-xl font-bold text-fg tabular-nums">{activeCount}</p>
              <p className="text-xs text-fg-muted">Active assignments</p>
            </div>
          </div>
          <div className="bg-surface border border-line-soft rounded-xl p-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <CloseCircle size={16} color="#f87171" variant="Bold" />
            </div>
            <div>
              <p className="text-xl font-bold text-fg tabular-nums">{noShowCount}</p>
              <p className="text-xs text-fg-muted">No-shows flagged</p>
            </div>
          </div>
          <div className="bg-surface border border-line-soft rounded-xl p-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Warning2 size={16} color="#f59e0b" variant="Bold" />
            </div>
            <div>
              <p className="text-xl font-bold text-fg tabular-nums">{completedCount}</p>
              <p className="text-xs text-fg-muted">Completed today</p>
            </div>
          </div>
        </div>

        {/* Assignments */}
        <Card>
          <CardHeader className="px-5 py-4 border-b border-line-soft">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle>Today&apos;s Assignments</CardTitle>
              <div className="flex gap-1">
                {filterTabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilter(t.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                      filter === t.id
                        ? "bg-amber-500/10 text-amber-400"
                        : "text-fg-muted hover:text-fg hover:bg-[var(--hover-bg)]"
                    )}
                  >
                    {t.label}
                    <span className={cn(
                      "inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold",
                      filter === t.id ? "bg-amber-500 text-black" : "bg-[var(--hover-bg)] text-fg-dim"
                    )}>{t.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <div className="hidden sm:block">
            <div className="grid grid-cols-[2fr_1fr_2fr_1fr_auto_1fr_auto] gap-3 px-5 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider border-b border-line-soft">
              <span>Driver</span><span>Bus</span><span>Route</span><span>Trips / Dep.</span><span>Check-in</span><span>Status</span><span />
            </div>
            <div className="divide-y divide-line-soft">
              {filteredPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "grid grid-cols-[2fr_1fr_2fr_1fr_auto_1fr_auto] gap-3 items-center px-5 py-4 hover:bg-[var(--hover-bg)] transition-colors",
                    plan.status === "no_show" && "bg-red-500/[0.03]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={plan.driver} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-fg">{plan.driver}</p>
                      <p className="text-xs text-fg-dim">{plan.driverCode}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-fg-muted">{plan.bus}</p>
                  <p className="text-sm text-fg-muted">{plan.route}</p>
                  <div>
                    <p className="text-sm text-fg-muted">{plan.trips} trips</p>
                    <p className="text-xs text-fg-dim">Dep {plan.departure}</p>
                  </div>
                  <div>{checkInBadge(checkIns[plan.id] ?? "not_checked_in")}</div>
                  <div>{dispatchStatusBadge(plan.status)}</div>
                  <div className="flex gap-1.5">
                    {checkIns[plan.id] === "not_checked_in" && plan.status !== "completed" && (
                      <Button variant="ghost" size="sm" onClick={() => handleCheckIn(plan.id)}>Check In</Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(plan)}>Edit</Button>
                    {plan.status === "no_show" && (
                      <Button variant="destructive" size="sm" onClick={() => openReplace(plan)}>Replace</Button>
                    )}
                  </div>
                </div>
              ))}
              {filteredPlans.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-fg-dim">No assignments in this view</div>
              )}
            </div>
          </div>

          <div className="sm:hidden divide-y divide-line-soft">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className={cn("px-5 py-4 space-y-3", plan.status === "no_show" && "bg-red-500/[0.03]")}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={plan.driver} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-fg">{plan.driver}</p>
                      <p className="text-xs text-fg-dim">{plan.driverCode}</p>
                    </div>
                  </div>
                  {dispatchStatusBadge(plan.status)}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><p className="text-fg-dim mb-0.5">Bus</p><p className="text-fg-muted font-medium">{plan.bus}</p></div>
                  <div><p className="text-fg-dim mb-0.5">Trips</p><p className="text-fg-muted font-medium">{plan.trips}</p></div>
                  <div><p className="text-fg-dim mb-0.5">Dep.</p><p className="text-fg-muted font-medium">{plan.departure}</p></div>
                </div>
                <p className="text-xs text-fg-muted">{plan.route}</p>
                <div className="flex items-center justify-between">
                  {checkInBadge(checkIns[plan.id] ?? "not_checked_in")}
                  <div className="flex gap-2">
                    {checkIns[plan.id] === "not_checked_in" && plan.status !== "completed" && (
                      <Button variant="ghost" size="sm" onClick={() => handleCheckIn(plan.id)}>Check In</Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(plan)}>Edit</Button>
                    {plan.status === "no_show" && (
                      <Button variant="destructive" size="sm" onClick={() => openReplace(plan)}>Replace</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredPlans.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-fg-dim">No assignments in this view</div>
            )}
          </div>
        </Card>

        {/* Vehicle Blocks */}
        <Card>
          <CardHeader className="px-5 py-4 border-b border-line-soft">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Vehicle Blocks</CardTitle>
                <p className="text-xs text-fg-dim mt-0.5">Bus–route assignments for today. Assign drivers to unallocated blocks.</p>
              </div>
              <Button
                size="sm" variant="outline" className="gap-1.5"
                onClick={() => { setBlockBus(""); setBlockRoute(""); setBlockTrips("3"); setBlockDep("06:00"); setBlockAssignDriver(""); setDialogMode("block") }}
              >
                <Add size={13} color="currentColor" /> New Block
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="divide-y divide-line-soft">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className={cn(
                    "flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--hover-bg)] transition-colors",
                    block.status === "unassigned" && "bg-amber-500/[0.02]"
                  )}
                >
                  <div className="h-8 w-8 rounded-lg bg-[var(--hover-bg)] flex items-center justify-center shrink-0">
                    <Bus size={15} color={block.status === "unassigned" ? "#f59e0b" : "#a1a1aa"} variant="Bold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-fg">{block.busCode}</p>
                      <span className="text-fg-dim text-xs">·</span>
                      <p className="text-xs text-fg-muted truncate">{block.route}</p>
                    </div>
                    <p className="text-[11px] text-fg-dim mt-0.5">
                      {block.trips} trips · Dep {block.departure}
                      {block.driverName && ` · ${block.driverName}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {block.status === "unassigned" ? (
                      <Button size="sm" variant="outline" className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10" onClick={() => openAssignBlock(block)}>
                        Assign Driver
                      </Button>
                    ) : (
                      <Badge variant={block.status === "dispatched" ? "success" : block.status === "completed" ? "muted" : "default"}>
                        {block.status.charAt(0).toUpperCase() + block.status.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog
        open={dialogMode === "new" || dialogMode === "edit"}
        onClose={() => setDialogMode(null)}
        title={dialogMode === "edit" ? "Edit Assignment" : "New Assignment"}
        description="Assign a driver and bus to a route for today."
        className="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Driver</label>
            <Select value={formDriver} onChange={(e) => setFormDriver(e.target.value)}>
              <option value="">Select driver…</option>
              {availableDrivers.map((d) => <option key={d.id} value={d.name}>{d.name} ({d.code})</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Bus</label>
            <Select value={formBus} onChange={(e) => setFormBus(e.target.value)}>
              <option value="">Select bus…</option>
              {availableBuses.map((b) => <option key={b.id} value={b.code}>{b.code} — {b.model}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Route</label>
            <Select value={formRoute} onChange={(e) => setFormRoute(e.target.value)}>
              <option value="">Select route…</option>
              {ROUTES.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">Trips</label>
              <Input type="number" min="1" max="6" value={formTrips} onChange={(e) => setFormTrips(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">Departure</label>
              <Input type="time" value={formDep} onChange={(e) => setFormDep(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" size="sm" onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={!formDriver || !formBus || !formRoute}>
              {dialogMode === "edit" ? "Save Changes" : "Create Assignment"}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={dialogMode === "replace"}
        onClose={() => setDialogMode(null)}
        title="Replace Driver"
        description={editTarget ? `${editTarget.driver} is a no-show on ${editTarget.route}. Assign a replacement.` : ""}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Replacement Driver</label>
            <Select value={replaceDriver} onChange={(e) => setReplaceDriver(e.target.value)}>
              <option value="">Select driver…</option>
              {availableDrivers.filter((d) => d.name !== editTarget?.driver).map((d) => (
                <option key={d.id} value={d.name}>{d.name} ({d.code})</option>
              ))}
            </Select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button size="sm" onClick={handleReplace} disabled={!replaceDriver}>Assign Replacement</Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={dialogMode === "block"}
        onClose={() => setDialogMode(null)}
        title="New Vehicle Block"
        description="Create a bus–route allocation. Assign a driver now or later."
        className="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Bus</label>
            <Select value={blockBus} onChange={(e) => setBlockBus(e.target.value)}>
              <option value="">Select bus…</option>
              {availableBuses.map((b) => <option key={b.id} value={b.code}>{b.code} — {b.model}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Route</label>
            <Select value={blockRoute} onChange={(e) => setBlockRoute(e.target.value)}>
              <option value="">Select route…</option>
              {ROUTES.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">Trips</label>
              <Input type="number" min="1" max="6" value={blockTrips} onChange={(e) => setBlockTrips(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">Departure</label>
              <Input type="time" value={blockDep} onChange={(e) => setBlockDep(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Assign Driver (optional)</label>
            <Select value={blockAssignDriver} onChange={(e) => setBlockAssignDriver(e.target.value)}>
              <option value="">Leave unassigned</option>
              {availableDrivers.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
            </Select>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" size="sm" onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button size="sm" disabled={!blockBus || !blockRoute} onClick={handleCreateBlock}>Create Block</Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={dialogMode === "assign_block"}
        onClose={() => setDialogMode(null)}
        title="Assign Driver to Block"
        description={blockTarget ? `${blockTarget.busCode} · ${blockTarget.route} · ${blockTarget.trips} trips · Dep ${blockTarget.departure}` : ""}
        className="max-w-sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Driver</label>
            <Select value={blockAssignDriver} onChange={(e) => setBlockAssignDriver(e.target.value)}>
              <option value="">Select driver…</option>
              {availableDrivers.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
            </Select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button size="sm" disabled={!blockAssignDriver} onClick={handleAssignBlock}>Assign</Button>
          </div>
        </div>
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
