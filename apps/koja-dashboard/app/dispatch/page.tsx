"use client"
import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog } from "@/components/ui/dialog"
import { Sheet } from "@/components/ui/sheet"
import { ToastContainer, type Toast } from "@/components/ui/toast"
import { dispatchPlans as initial, drivers, buses, type DispatchPlan } from "@/lib/data"
import { cn } from "@/lib/utils"

type DialogMode = "new" | "edit" | "replace" | "cancel" | "delay" | null

const statusBadge: Record<string, "green" | "gray" | "red" | "yellow" | "amber"> = {
  active: "green", pending: "gray", no_show: "red", complete: "amber", cancelled: "red",
}

function DispatchInner() {
  const searchParams = useSearchParams()
  const [plans, setPlans] = useState<DispatchPlan[]>(initial)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [editTarget, setEditTarget] = useState<DispatchPlan | null>(null)
  const [formDriver, setFormDriver] = useState("")
  const [formBus, setFormBus] = useState("")
  const [formRoute, setFormRoute] = useState("")
  const [formDep, setFormDep] = useState("07:00")
  const [formTrips, setFormTrips] = useState("3")
  const [replaceDriver, setReplaceDriver] = useState("")
  const [cancelReason, setCancelReason] = useState("")
  const [delayTime, setDelayTime] = useState("")
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  useEffect(() => {
    if (searchParams.get("action") === "new") { openNew() }
  }, [searchParams])

  const toast = (message: string, type: Toast["type"] = "success") => {
    const id = ++counterRef.current
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }

  const openNew = () => {
    setEditTarget(null)
    setFormDriver(""); setFormBus(""); setFormRoute(""); setFormDep("07:00"); setFormTrips("3")
    setDialogMode("new")
  }

  const openEdit = (plan: DispatchPlan) => {
    setEditTarget(plan)
    setFormDriver(plan.driverId); setFormBus(plan.busId); setFormRoute(plan.route)
    setFormDep(plan.departure); setFormTrips(String(plan.trips))
    setDialogMode("edit")
  }

  const openReplace = (plan: DispatchPlan) => {
    setEditTarget(plan); setReplaceDriver(""); setDialogMode("replace")
  }

  const handleSave = () => {
    const driver = drivers.find((d) => d.id === formDriver)
    const bus = buses.find((b) => b.id === formBus)
    if (editTarget) {
      setPlans((p) => p.map((x) => x.id === editTarget.id ? {
        ...x,
        driver: driver?.name ?? x.driver,
        driverId: formDriver || x.driverId,
        bus: formBus || x.bus,
        busId: formBus || x.busId,
        route: formRoute || x.route,
        departure: formDep,
        trips: parseInt(formTrips),
      } : x))
      toast("Assignment updated")
    } else {
      const newPlan: DispatchPlan = {
        id: `DIS-${String(plans.length + 1).padStart(3, "0")}`,
        route: formRoute,
        driver: driver?.name ?? "TBD",
        driverId: formDriver,
        bus: bus?.plateNumber ?? formBus,
        busId: formBus,
        status: "pending",
        departure: formDep,
        trips: parseInt(formTrips),
        pax: 0,
      }
      setPlans((p) => [...p, newPlan])
      toast("Dispatch duty created")
    }
    setDialogMode(null)
  }

  const handleReplace = () => {
    if (!editTarget || !replaceDriver) return
    const driver = drivers.find((d) => d.id === replaceDriver)
    setPlans((p) => p.map((x) => x.id === editTarget.id ? {
      ...x, status: "active", driver: driver?.name ?? x.driver, driverId: replaceDriver,
    } : x))
    toast(`Driver replaced: ${driver?.name}`)
    setDialogMode(null)
  }

  const handleCancel = () => {
    if (!editTarget) return
    setPlans((p) => p.map((x) => x.id === editTarget.id ? { ...x, status: "cancelled" } : x))
    toast("Duty cancelled", "info")
    setDialogMode(null)
  }

  const handleDelay = () => {
    if (!editTarget || !delayTime) return
    setPlans((p) => p.map((x) => x.id === editTarget.id ? { ...x, departure: delayTime } : x))
    toast(`Departure updated to ${delayTime}`)
    setDialogMode(null)
  }

  const handlePublish = () => {
    const pending = plans.filter((p) => p.status === "pending").length
    if (pending === 0) { toast("No pending duties to publish", "info"); return }
    setPlans((p) => p.map((x) => x.status === "pending" ? { ...x, status: "active" } : x))
    toast(`${pending} ${pending === 1 ? "duty" : "duties"} published successfully`)
  }

  const availableDrivers = drivers.filter((d) => ["active", "inactive"].includes(d.status))
  const availableBuses = buses.filter((b) => ["active", "inactive"].includes(b.status))
  const pendingCount = plans.filter((p) => p.status === "pending").length
  const activeCount = plans.filter((p) => p.status === "active").length

  return (
    <div className="pt-14">
      <Header
        title="Dispatch"
        subtitle={`${activeCount} active · ${pendingCount} pending · ${new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "short" })}`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={openNew}>+ New Duty</Button>
            {pendingCount > 0 && (
              <Button variant="primary" size="sm" onClick={handlePublish}>
                Publish All ({pendingCount})
              </Button>
            )}
          </div>
        }
      />

      <div className="p-6">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Active", count: activeCount, color: "text-emerald-400" },
            { label: "Pending", count: pendingCount, color: "text-amber-400" },
            { label: "No Show", count: plans.filter((p) => p.status === "no_show").length, color: "text-red-400" },
            { label: "Complete", count: plans.filter((p) => p.status === "complete").length, color: "text-white/50" },
          ].map((s) => (
            <div key={s.label} className="bg-[#141518] border border-white/6 rounded-xl p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
              <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Dispatch Table */}
        <div className="bg-[#141518] border border-white/6 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_1fr_80px_80px_140px] text-[10px] font-semibold text-white/30 uppercase tracking-wider px-5 py-3 border-b border-white/6">
            <span>Route</span><span>Driver</span><span>Bus</span><span>Dep.</span><span>Trips</span><span>Actions</span>
          </div>
          {plans.map((plan) => (
            <div key={plan.id} className="grid grid-cols-[1fr_1fr_1fr_80px_80px_140px] px-5 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/2 items-center">
              <div>
                <div className="text-sm font-medium text-white/90">{plan.route}</div>
                <div className="text-[10px] text-white/30 mt-0.5">{plan.id}</div>
              </div>
              <div className="flex items-center gap-2">
                {plan.driver !== "— Unassigned —" ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400 text-[9px] font-bold shrink-0">
                      {plan.driver.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="text-sm text-white/70">{plan.driver.split(" ")[0]}</span>
                  </>
                ) : (
                  <span className="text-sm text-red-400/60">Unassigned</span>
                )}
              </div>
              <span className="text-sm text-white/60">{plan.bus}</span>
              <span className="text-sm text-white/60">{plan.departure}</span>
              <span className="text-sm text-white/60">{plan.trips}</span>
              <div className="flex items-center gap-1.5">
                <Badge variant={statusBadge[plan.status]} className="text-[9px]">{plan.status}</Badge>
                <button
                  onClick={() => openEdit(plan)}
                  className="text-[10px] text-amber-400/70 hover:text-amber-400 transition-colors px-1.5 py-1 rounded hover:bg-amber-500/8"
                >
                  Edit
                </button>
                {plan.status === "no_show" && (
                  <button onClick={() => openReplace(plan)} className="text-[10px] text-amber-400/70 hover:text-amber-400 transition-colors px-1.5 py-1 rounded hover:bg-amber-500/8">
                    Replace
                  </button>
                )}
                {plan.status === "pending" && (
                  <button onClick={() => { setEditTarget(plan); setDialogMode("cancel") }} className="text-[10px] text-red-400/70 hover:text-red-400">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New / Edit Duty Dialog */}
      <Dialog
        open={dialogMode === "new" || dialogMode === "edit"}
        onClose={() => setDialogMode(null)}
        title={dialogMode === "new" ? "Create New Duty" : "Edit Assignment"}
        description={editTarget ? `Editing ${editTarget.route}` : "Assign driver and bus to a route"}
        className="max-w-lg"
      >
        <div className="space-y-4">
          <Input label="Route" value={formRoute} onChange={(e) => setFormRoute(e.target.value)} placeholder="e.g. Island → Lekki" />
          <Select label="Assign Driver" value={formDriver} onChange={(e) => setFormDriver(e.target.value)}>
            <option value="">— Select Driver —</option>
            {availableDrivers.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </Select>
          <Select label="Assign Bus" value={formBus} onChange={(e) => setFormBus(e.target.value)}>
            <option value="">— Select Bus —</option>
            {availableBuses.map((b) => (
              <option key={b.id} value={b.id}>{b.plateNumber} — {b.model} ({b.capacity} seats)</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Departure Time" type="time" value={formDep} onChange={(e) => setFormDep(e.target.value)} />
            <Input label="Planned Trips" type="number" value={formTrips} onChange={(e) => setFormTrips(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="ghost" className="flex-1" onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleSave} disabled={!formRoute}>
              {dialogMode === "new" ? "Create Duty" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Replace Driver Dialog */}
      <Dialog open={dialogMode === "replace"} onClose={() => setDialogMode(null)} title="Replace Driver" description={`No-show: ${editTarget?.driver}. Select a replacement driver.`}>
        <div className="space-y-4">
          <Select label="Replacement Driver" value={replaceDriver} onChange={(e) => setReplaceDriver(e.target.value)}>
            <option value="">— Select Driver —</option>
            {availableDrivers.filter((d) => d.id !== editTarget?.driverId).map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.code}) — {d.shift ?? "no shift"}</option>
            ))}
          </Select>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleReplace} disabled={!replaceDriver}>Replace Driver</Button>
          </div>
        </div>
      </Dialog>

      {/* Cancel Duty Dialog */}
      <Dialog open={dialogMode === "cancel"} onClose={() => setDialogMode(null)} title="Cancel Duty" description={`Cancel ${editTarget?.route} departure at ${editTarget?.departure}?`}>
        <div className="space-y-4">
          <Textarea label="Reason" rows={2} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason for cancellation..." />
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setDialogMode(null)}>Back</Button>
            <Button variant="danger" className="flex-1" onClick={handleCancel}>Confirm Cancel</Button>
          </div>
        </div>
      </Dialog>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default function DispatchPage() {
  return (
    <Suspense>
      <DispatchInner />
    </Suspense>
  )
}
