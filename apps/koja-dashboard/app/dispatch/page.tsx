"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Dialog } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { dispatchPlans, drivers, buses, type DispatchPlan } from "@/lib/data"
import { Add, Send2, TickCircle, CloseCircle, Warning2 } from "iconsax-react"

const ROUTES = [
  "Lagos Island – Oshodi",
  "Oshodi – Ikeja",
  "Lagos Island – Lekki",
  "Berger – Oshodi",
  "Ojota – CMS",
]

type Toast = { id: number; message: string; type: "success" | "error" | "info" }
type DialogMode = "new" | "edit" | "replace" | null

function dispatchStatusBadge(status: string) {
  switch (status) {
    case "active": return <Badge variant="success">Active</Badge>
    case "completed": return <Badge variant="muted">Completed</Badge>
    case "no_show": return <Badge variant="destructive">No-Show</Badge>
    case "pending": return <Badge variant="default">Pending</Badge>
    default: return null
  }
}

export default function DispatchPage() {
  const [plans, setPlans] = useState<DispatchPlan[]>(dispatchPlans)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [editTarget, setEditTarget] = useState<DispatchPlan | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Form state
  const [formDriver, setFormDriver] = useState("")
  const [formBus, setFormBus] = useState("")
  const [formRoute, setFormRoute] = useState("")
  const [formTrips, setFormTrips] = useState("3")
  const [formDep, setFormDep] = useState("06:00")
  const [replaceDriver, setReplaceDriver] = useState("")

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
      addToast(`Assignment created for ${formDriver}`)
    } else if (dialogMode === "edit" && editTarget) {
      setPlans((p) =>
        p.map((x) =>
          x.id === editTarget.id
            ? { ...x, driver: formDriver, driverCode: driver?.code ?? x.driverCode, bus: formBus, route: formRoute, trips: parseInt(formTrips) || 3, departure: formDep }
            : x
        )
      )
      addToast(`Assignment updated`, "info")
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
    addToast(`${replaceDriver} assigned as replacement`)
    setDialogMode(null)
  }

  function handlePublish() {
    const pending = plans.filter((p) => p.status === "pending").length
    setPlans((p) => p.map((x) => (x.status === "pending" ? { ...x, status: "active" } : x)))
    addToast(pending > 0 ? `${pending} assignment${pending > 1 ? "s" : ""} published` : "All assignments already active")
  }

  const activeCount = plans.filter((d) => d.status === "active").length
  const noShowCount = plans.filter((d) => d.status === "no_show").length
  const completedCount = plans.filter((d) => d.status === "completed").length

  const availableDrivers = drivers.filter((d) => d.status !== "blocked" && d.status !== "on_leave")
  const availableBuses = buses.filter((b) => b.status === "available" || b.status === "active")

  return (
    <>
      <Header
        title="Dispatch"
        subtitle="Today’s plan — Thursday 22 May 2026"
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#111214] border border-white/[0.07] rounded-xl p-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TickCircle size={16} color="#34d399" variant="Bold" />
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-100">{activeCount}</p>
              <p className="text-xs text-zinc-500">Active assignments</p>
            </div>
          </div>
          <div className="bg-[#111214] border border-white/[0.07] rounded-xl p-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <CloseCircle size={16} color="#f87171" variant="Bold" />
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-100">{noShowCount}</p>
              <p className="text-xs text-zinc-500">No-shows flagged</p>
            </div>
          </div>
          <div className="bg-[#111214] border border-white/[0.07] rounded-xl p-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Warning2 size={16} color="#f59e0b" variant="Bold" />
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-100">{completedCount}</p>
              <p className="text-xs text-zinc-500">Completed today</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="px-5 py-4 border-b border-white/[0.05]">
            <CardTitle>Today’s Assignments</CardTitle>
          </CardHeader>
          {/* Desktop table */}
          <div className="hidden sm:block">
            <div className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3 text-[11px] font-semibold text-zinc-600 uppercase tracking-wider border-b border-white/[0.04]">
              <span>Driver</span><span>Bus</span><span>Route</span><span>Trips / Dep.</span><span>Status</span><span></span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "grid grid-cols-[2fr_1fr_2fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors",
                    plan.status === "no_show" && "bg-red-500/[0.03]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={plan.driver} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{plan.driver}</p>
                      <p className="text-xs text-zinc-600">{plan.driverCode}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-zinc-300">{plan.bus}</p>
                  <p className="text-sm text-zinc-300">{plan.route}</p>
                  <div>
                    <p className="text-sm text-zinc-300">{plan.trips} trips</p>
                    <p className="text-xs text-zinc-600">Dep {plan.departure}</p>
                  </div>
                  <div>{dispatchStatusBadge(plan.status)}</div>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(plan)}>Edit</Button>
                    {plan.status === "no_show" && (
                      <Button variant="destructive" size="sm" onClick={() => openReplace(plan)}>Replace</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-white/[0.04]">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "px-5 py-4 space-y-3",
                  plan.status === "no_show" && "bg-red-500/[0.03]"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={plan.driver} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{plan.driver}</p>
                      <p className="text-xs text-zinc-600">{plan.driverCode}</p>
                    </div>
                  </div>
                  {dispatchStatusBadge(plan.status)}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-zinc-600 mb-0.5">Bus</p>
                    <p className="text-zinc-300 font-medium">{plan.bus}</p>
                  </div>
                  <div>
                    <p className="text-zinc-600 mb-0.5">Trips</p>
                    <p className="text-zinc-300 font-medium">{plan.trips}</p>
                  </div>
                  <div>
                    <p className="text-zinc-600 mb-0.5">Dep.</p>
                    <p className="text-zinc-300 font-medium">{plan.departure}</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-400">{plan.route}</p>
                <div className="flex gap-2 pt-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(plan)}>Edit</Button>
                  {plan.status === "no_show" && (
                    <Button variant="destructive" size="sm" onClick={() => openReplace(plan)}>Replace</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>

      {/* New / Edit assignment dialog */}
      <Dialog
        open={dialogMode === "new" || dialogMode === "edit"}
        onClose={() => setDialogMode(null)}
        title={dialogMode === "edit" ? "Edit Assignment" : "New Assignment"}
        description="Assign a driver and bus to a route for today’s dispatch."
        className="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Driver</label>
            <Select value={formDriver} onChange={(e) => setFormDriver(e.target.value)}>
              <option value="">Select driver…</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.name}>{d.name} ({d.code})</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Bus</label>
            <Select value={formBus} onChange={(e) => setFormBus(e.target.value)}>
              <option value="">Select bus…</option>
              {availableBuses.map((b) => (
                <option key={b.id} value={b.code}>{b.code} — {b.model}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Route</label>
            <Select value={formRoute} onChange={(e) => setFormRoute(e.target.value)}>
              <option value="">Select route…</option>
              {ROUTES.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Trips</label>
              <Input type="number" min="1" max="6" value={formTrips} onChange={(e) => setFormTrips(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Departure</label>
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

      {/* Replace driver dialog */}
      <Dialog
        open={dialogMode === "replace"}
        onClose={() => setDialogMode(null)}
        title="Replace Driver"
        description={editTarget ? `${editTarget.driver} is a no-show on ${editTarget.route}. Assign a replacement driver.` : ""}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Replacement Driver</label>
            <Select value={replaceDriver} onChange={(e) => setReplaceDriver(e.target.value)}>
              <option value="">Select driver…</option>
              {availableDrivers
                .filter((d) => d.name !== editTarget?.driver)
                .map((d) => <option key={d.id} value={d.name}>{d.name} ({d.code})</option>)}
            </Select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button size="sm" onClick={handleReplace} disabled={!replaceDriver}>Assign Replacement</Button>
          </div>
        </div>
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
