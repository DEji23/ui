"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Sheet } from "@/components/ui/sheet"
import { Dialog } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { buses as initialBuses, type Bus, type BusStatus } from "@/lib/data"
import { Add, Bus as BusIcon, TickCircle, CloseCircle, Warning2, Setting2, UserRemove, Grid1, RowVertical } from "iconsax-react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

const statusConfig: Record<BusStatus, { label: string; variant: "success" | "muted" | "warning" | "destructive" | "default" }> = {
  active: { label: "On Route", variant: "success" },
  available: { label: "Available", variant: "default" },
  blocked: { label: "Blocked", variant: "destructive" },
  maintenance: { label: "Maintenance", variant: "warning" },
}

const filters = ["All", "On Route", "Available", "Blocked", "Maintenance"] as const
type Filter = (typeof filters)[number]
type Toast = { id: number; message: string; type: "success" | "error" | "info" }
type ConfirmAction = { type: "block" | "unblock" | "maintenance" | "unassign"; bus: Bus }

export default function FleetPage() {
  const [filter, setFilter] = useState<Filter>("All")
  const [selected, setSelected] = useState<Bus | null>(null)
  const [busList, setBusList] = useState<Bus[]>(initialBuses)
  const [busStates, setBusStates] = useState<Record<string, BusStatus>>(() =>
    Object.fromEntries(initialBuses.map((b) => [b.id, b.status]))
  )
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [view, setView] = useState<"grid" | "table">("grid")

  // Register bus wizard
  const [regOpen, setRegOpen] = useState(false)
  const [regStep, setRegStep] = useState(1)
  const [regCode, setRegCode] = useState("")
  const [regModel, setRegModel] = useState("")
  const [regPlate, setRegPlate] = useState("")
  const [regCapacity, setRegCapacity] = useState("45")
  const [regInspection, setRegInspection] = useState<"pass" | "fail" | "pending">("pending")
  const [regInspDate, setRegInspDate] = useState("")

  function addToast(message: string, type: Toast["type"] = "success") {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }

  const didAutoOpen = useRef(false)
  useEffect(() => {
    if (didAutoOpen.current) return
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("add") === "1") {
      didAutoOpen.current = true
      openRegister()
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  function openRegister() {
    setRegCode(""); setRegModel(""); setRegPlate(""); setRegCapacity("45")
    setRegInspection("pending"); setRegInspDate("")
    setRegStep(1); setRegOpen(true)
  }

  function handleRegisterBus() {
    if (!regCode.trim() || !regModel.trim() || !regPlate.trim()) return
    const id = `bus${Date.now()}`
    const newBus: Bus = {
      id,
      code: regCode.trim().toUpperCase(),
      model: regModel.trim(),
      plate: regPlate.trim().toUpperCase(),
      status: "available",
      capacity: parseInt(regCapacity) || 45,
      lastInspection: regInspDate || "Not inspected",
      inspectionResult: regInspection,
    }
    setBusList((bl) => [...bl, newBus])
    setBusStates((s) => ({ ...s, [id]: "available" }))
    addToast(`${newBus.code} registered and set to Available`)
    setRegOpen(false)
  }

  const mergedBuses = busList.map((b) => ({ ...b, status: busStates[b.id] ?? b.status }))

  const filtered = mergedBuses.filter((b) => {
    if (filter === "All") return true
    if (filter === "On Route") return b.status === "active"
    if (filter === "Available") return b.status === "available"
    if (filter === "Blocked") return b.status === "blocked"
    if (filter === "Maintenance") return b.status === "maintenance"
    return true
  })

  const selectedBus = selected ? mergedBuses.find((b) => b.id === selected.id) ?? selected : null

  function handleConfirm() {
    if (!confirm) return
    const { type, bus } = confirm
    if (type === "block") {
      setBusStates((s) => ({ ...s, [bus.id]: "blocked" }))
      addToast(`${bus.code} blocked`, "error")
    } else if (type === "unblock") {
      setBusStates((s) => ({ ...s, [bus.id]: "available" }))
      addToast(`${bus.code} unblocked — now available`)
    } else if (type === "maintenance") {
      setBusStates((s) => ({ ...s, [bus.id]: "maintenance" }))
      addToast(`${bus.code} sent to maintenance`, "info")
    } else if (type === "unassign") {
      addToast(`Driver unassigned from ${bus.code}`, "info")
    }
    setConfirm(null)
    setSelected(null)
  }

  const summaryItems = [
    { label: "On Route", count: mergedBuses.filter((b) => b.status === "active").length, iconColor: "#34d399", bg: "bg-emerald-500/10" },
    { label: "Available", count: mergedBuses.filter((b) => b.status === "available").length, iconColor: "#f59e0b", bg: "bg-amber-500/10" },
    { label: "Blocked", count: mergedBuses.filter((b) => b.status === "blocked").length, iconColor: "#f87171", bg: "bg-red-500/10" },
    { label: "Maintenance", count: mergedBuses.filter((b) => b.status === "maintenance").length, iconColor: "#fbbf24", bg: "bg-yellow-500/10" },
  ]

  return (
    <>
      <Header
        title="Fleet"
        subtitle={`${mergedBuses.filter((b) => b.status === "active").length} of ${busList.length} buses active`}
        action={
          <Button size="sm" className="gap-1.5 mr-1" onClick={openRegister}>
            <Add size={14} color="currentColor" />
            Register Bus
          </Button>
        }
      />
      <main className="flex-1 p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryItems.map((s) => (
            <Card key={s.label} className="p-4 flex items-center gap-3">
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", s.bg)}>
                <BusIcon size={16} color={s.iconColor} variant="Bold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">{s.count}</p>
                <p className="text-xs text-zinc-500">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                  filter === f
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300 border-transparent"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-lg border border-white/[0.08] p-1">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                view === "grid" ? "bg-white/10 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
              )}
              title="Grid view"
            >
              <Grid1 size={14} color="currentColor" />
            </button>
            <button
              onClick={() => setView("table")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                view === "table" ? "bg-white/10 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
              )}
              title="Table view"
            >
              <RowVertical size={14} color="currentColor" />
            </button>
          </div>
        </div>

        {view === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((bus) => {
              const sc = statusConfig[bus.status]
              const fill = bus.currentPassengers !== undefined ? (bus.currentPassengers / bus.capacity) * 100 : 0
              return (
                <Card key={bus.id} className="hover:border-white/[0.18] transition-colors cursor-pointer" onClick={() => setSelected(bus)}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-bold text-zinc-100">{bus.code}</p>
                          <Badge variant={sc.variant}>{sc.label}</Badge>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">{bus.model} · {bus.plate}</p>
                      </div>
                    </div>

                    {bus.driver && (
                      <div className="flex items-center gap-2 mb-3 bg-white/[0.03] rounded-lg p-2 border border-white/[0.05]">
                        <Avatar name={bus.driver} size="xs" />
                        <div>
                          <p className="text-xs font-medium text-zinc-300">{bus.driver}</p>
                          {bus.route && <p className="text-[11px] text-zinc-600">{bus.route}</p>}
                        </div>
                      </div>
                    )}

                    {bus.status === "active" && (
                      <div className="mb-3">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-zinc-600">Passengers</span>
                          <span className="text-zinc-400">{bus.currentPassengers}/{bus.capacity}</span>
                        </div>
                        <Progress value={fill} colorClass={fill > 85 ? "bg-emerald-500" : "bg-amber-500"} />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Inspection</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {bus.inspectionResult === "pass"
                            ? <TickCircle size={12} color="#34d399" variant="Bold" />
                            : bus.inspectionResult === "fail"
                            ? <CloseCircle size={12} color="#f87171" variant="Bold" />
                            : null}
                          <p className="text-xs font-medium text-zinc-300 capitalize">{bus.inspectionResult}</p>
                        </div>
                        <p className="text-[10px] text-zinc-600 mt-0.5">{bus.lastInspection}</p>
                      </div>
                      {bus.fuelLevel !== undefined && (
                        <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2">
                          <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Fuel</p>
                          <p className="text-sm font-bold text-zinc-200 mt-0.5">{bus.fuelLevel}%</p>
                          <Progress
                            value={bus.fuelLevel}
                            colorClass={bus.fuelLevel < 25 ? "bg-red-500" : bus.fuelLevel < 40 ? "bg-yellow-500" : "bg-emerald-500"}
                            className="mt-1 h-1"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {view === "table" && (
          <div className="rounded-xl border border-white/[0.08] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Bus</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Driver</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Route</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider w-36">Passengers</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider w-32">Fuel</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filtered.map((bus) => {
                  const sc = statusConfig[bus.status]
                  const fill = bus.currentPassengers !== undefined ? (bus.currentPassengers / bus.capacity) * 100 : 0
                  return (
                    <tr
                      key={bus.id}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                      onClick={() => setSelected(bus)}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100 transition-colors">{bus.code}</p>
                        <p className="text-[11px] text-zinc-600">{bus.model} · {bus.plate}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {bus.driver ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={bus.driver} size="xs" />
                            <span className="text-xs text-zinc-300">{bus.driver}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-zinc-400">{bus.route ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        {bus.status === "active" && bus.currentPassengers !== undefined ? (
                          <div className="flex items-center gap-2">
                            <Progress value={fill} colorClass={fill > 85 ? "bg-emerald-500" : "bg-amber-500"} />
                            <span className="text-[11px] text-zinc-600 whitespace-nowrap">{bus.currentPassengers}/{bus.capacity}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {bus.fuelLevel !== undefined ? (
                          <div className="flex items-center gap-2">
                            <Progress
                              value={bus.fuelLevel}
                              colorClass={bus.fuelLevel < 25 ? "bg-red-500" : bus.fuelLevel < 40 ? "bg-yellow-500" : "bg-emerald-500"}
                            />
                            <span className={cn(
                              "text-[11px] whitespace-nowrap",
                              bus.fuelLevel < 25 ? "text-red-400" : bus.fuelLevel < 40 ? "text-yellow-400" : "text-zinc-500"
                            )}>{bus.fuelLevel}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {bus.inspectionResult === "pass"
                            ? <TickCircle size={12} color="#34d399" variant="Bold" />
                            : bus.inspectionResult === "fail"
                            ? <CloseCircle size={12} color="#f87171" variant="Bold" />
                            : null}
                          <span className={cn(
                            "text-xs capitalize",
                            bus.inspectionResult === "pass" ? "text-emerald-400" :
                            bus.inspectionResult === "fail" ? "text-red-400" : "text-zinc-500"
                          )}>{bus.inspectionResult}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Register bus wizard sheet */}
      <Sheet
        open={regOpen}
        onClose={() => setRegOpen(false)}
        title="Register New Bus"
        subtitle={`Step ${regStep} of 3`}
        footer={
          regStep === 1 ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setRegOpen(false)}>Cancel</Button>
              <Button size="sm" className="ml-auto" onClick={() => setRegStep(2)} disabled={!regCode.trim() || !regModel.trim() || !regPlate.trim()}>
                Next
              </Button>
            </>
          ) : regStep === 2 ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setRegStep(1)}>Back</Button>
              <Button size="sm" className="ml-auto" onClick={() => setRegStep(3)}>
                Review
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setRegStep(2)}>Back</Button>
              <Button size="sm" className="ml-auto gap-1.5" onClick={handleRegisterBus}>
                <Add size={14} color="currentColor" />
                Register Bus
              </Button>
            </>
          )
        }
      >
        <div className="px-6 py-5">
          {regStep === 1 && (
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-4">Vehicle Details</p>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Bus Code</label>
                <Input placeholder="e.g. KJA-015" value={regCode} onChange={(e) => setRegCode(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Make &amp; Model</label>
                <Input placeholder="e.g. Toyota Coaster" value={regModel} onChange={(e) => setRegModel(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">License Plate</label>
                <Input placeholder="e.g. LND-234-AA" value={regPlate} onChange={(e) => setRegPlate(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Seating Capacity</label>
                <Input type="number" min="10" max="100" value={regCapacity} onChange={(e) => setRegCapacity(e.target.value)} />
              </div>
            </div>
          )}

          {regStep === 2 && (
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-4">Inspection &amp; Compliance</p>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Last Inspection Date</label>
                <Input type="date" value={regInspDate} onChange={(e) => setRegInspDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Inspection Result</label>
                <Select value={regInspection} onChange={(e) => setRegInspection(e.target.value as "pass" | "fail" | "pending")}>
                  <option value="pending">Pending</option>
                  <option value="pass">Pass</option>
                  <option value="fail">Fail</option>
                </Select>
              </div>
              {regInspection === "fail" && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-3">
                  <p className="text-xs text-red-400 font-medium">Inspection failed</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Bus will be registered but marked as blocked until maintenance clears it.</p>
                </div>
              )}
            </div>
          )}

          {regStep === 3 && (
            <div className="space-y-5">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-4">Confirm &amp; Register</p>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] divide-y divide-white/[0.05]">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-zinc-500">Bus Code</span>
                  <span className="text-sm font-medium text-amber-400">{regCode.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-zinc-500">Model</span>
                  <span className="text-sm font-medium text-zinc-200">{regModel}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-zinc-500">License Plate</span>
                  <span className="text-sm font-medium text-zinc-200">{regPlate.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-zinc-500">Capacity</span>
                  <span className="text-sm font-medium text-zinc-200">{regCapacity} seats</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-zinc-500">Inspection</span>
                  <span className={cn(
                    "text-sm font-medium capitalize",
                    regInspection === "pass" ? "text-emerald-400" :
                    regInspection === "fail" ? "text-red-400" : "text-zinc-400"
                  )}>
                    {regInspection}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-zinc-500">Initial Status</span>
                  <span className="text-sm font-medium text-zinc-400">Available</span>
                </div>
              </div>
              <div className="rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 p-4">
                <div className="flex items-center gap-2">
                  <TickCircle size={14} color="#34d399" variant="Bold" />
                  <p className="text-xs text-emerald-400 font-medium">Ready to register</p>
                </div>
                <p className="text-[11px] text-zinc-600 mt-1">The bus will be added to the fleet and can be assigned to dispatch plans.</p>
              </div>
            </div>
          )}
        </div>
      </Sheet>

      {/* Bus detail sheet */}
      <Sheet
        open={!!selectedBus}
        onClose={() => setSelected(null)}
        title={selectedBus ? `${selectedBus.code} — ${selectedBus.model}` : ""}
        subtitle={selectedBus?.plate}
        footer={
          selectedBus ? (
            <>
              {selectedBus.driver && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setConfirm({ type: "unassign", bus: selectedBus })}
                >
                  <UserRemove size={14} color="currentColor" />
                  Unassign Driver
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setConfirm({ type: "maintenance", bus: selectedBus })}
              >
                <Setting2 size={14} color="currentColor" />
                Mark Maintenance
              </Button>
              <div className="ml-auto">
                {selectedBus.status === "blocked" ? (
                  <Button variant="success" size="sm" onClick={() => setConfirm({ type: "unblock", bus: selectedBus })}>
                    Unblock Bus
                  </Button>
                ) : (
                  <Button variant="destructive" size="sm" onClick={() => setConfirm({ type: "block", bus: selectedBus })}>
                    Block Bus
                  </Button>
                )}
              </div>
            </>
          ) : undefined
        }
      >
        {selectedBus && (
          <div className="px-6 py-5 space-y-5">
            {/* Status + specs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4">
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Status</p>
                <Badge variant={statusConfig[selectedBus.status].variant}>{statusConfig[selectedBus.status].label}</Badge>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4">
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Capacity</p>
                <p className="text-sm font-semibold text-zinc-200">{selectedBus.capacity} seats</p>
              </div>
            </div>

            {/* Driver assignment */}
            {selectedBus.driver ? (
              <div>
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Assigned Driver</p>
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                  <Avatar name={selectedBus.driver} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{selectedBus.driver}</p>
                    {selectedBus.route && <p className="text-xs text-zinc-500 mt-0.5">{selectedBus.route}</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center text-zinc-600 text-sm">
                No driver assigned
              </div>
            )}

            {/* Passengers */}
            {selectedBus.status === "active" && selectedBus.currentPassengers !== undefined && (
              <div>
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Passenger Load</p>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400">Onboard</span>
                    <span className="font-semibold text-zinc-100">{selectedBus.currentPassengers} / {selectedBus.capacity}</span>
                  </div>
                  <Progress
                    value={(selectedBus.currentPassengers / selectedBus.capacity) * 100}
                    colorClass="bg-amber-500"
                  />
                </div>
              </div>
            )}

            <Separator />

            {/* Inspection */}
            <div>
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Inspection Record</p>
              <div className={cn(
                "rounded-xl border p-4",
                selectedBus.inspectionResult === "pass" ? "border-emerald-500/20 bg-emerald-500/[0.04]" :
                selectedBus.inspectionResult === "fail" ? "border-red-500/20 bg-red-500/[0.04]" :
                "border-white/[0.06] bg-white/[0.02]"
              )}>
                <div className="flex items-center gap-2 mb-1">
                  {selectedBus.inspectionResult === "pass"
                    ? <TickCircle size={16} color="#34d399" variant="Bold" />
                    : <CloseCircle size={16} color="#f87171" variant="Bold" />}
                  <p className={cn(
                    "text-sm font-semibold capitalize",
                    selectedBus.inspectionResult === "pass" ? "text-emerald-400" : "text-red-400"
                  )}>
                    Pre-trip inspection {selectedBus.inspectionResult}
                  </p>
                </div>
                <p className="text-xs text-zinc-500 ml-6">{selectedBus.lastInspection}</p>
                {selectedBus.inspectionResult === "fail" && (
                  <p className="text-xs text-red-400 mt-2 ml-6">Bus must not operate until cleared by maintenance</p>
                )}
              </div>
            </div>

            {/* Fuel */}
            {selectedBus.fuelLevel !== undefined && (
              <div>
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Fuel Level</p>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400">Current level</span>
                    <span className={cn(
                      "font-semibold",
                      selectedBus.fuelLevel < 25 ? "text-red-400" : selectedBus.fuelLevel < 40 ? "text-yellow-400" : "text-emerald-400"
                    )}>
                      {selectedBus.fuelLevel}%
                    </span>
                  </div>
                  <Progress
                    value={selectedBus.fuelLevel}
                    colorClass={selectedBus.fuelLevel < 25 ? "bg-red-500" : selectedBus.fuelLevel < 40 ? "bg-yellow-500" : "bg-emerald-500"}
                  />
                  {selectedBus.fuelLevel < 25 && (
                    <p className="text-xs text-red-400 mt-2">Low fuel — schedule refuelling before next trip</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Sheet>

      {/* Confirm dialog */}
      <Dialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={
          confirm?.type === "block" ? "Block Bus" :
          confirm?.type === "unblock" ? "Unblock Bus" :
          confirm?.type === "maintenance" ? "Send to Maintenance" : "Unassign Driver"
        }
        description={
          confirm?.type === "block" ? `${confirm.bus.code} will be taken offline immediately. Any active trips will be flagged.` :
          confirm?.type === "unblock" ? `${confirm?.bus.code} will be set to Available.` :
          confirm?.type === "maintenance" ? `${confirm?.bus.code} will be marked as under maintenance and removed from dispatch.` :
          `The assigned driver will be removed from ${confirm?.bus.code}.`
        }
      >
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button
            size="sm"
            variant={confirm?.type === "unblock" ? "success" : confirm?.type === "block" ? "destructive" : "default"}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
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
