"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Sheet } from "@/components/ui/sheet"
import { Dialog } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { cn, formatNGN } from "@/lib/utils"
import { drivers as initialDrivers, type Driver, type DriverStatus } from "@/lib/data"
import { Add, SearchNormal1, Star1, Call, Slash, Warning2, TickCircle, Sms, Car, UserAdd } from "iconsax-react"

const statusConfig: Record<
  DriverStatus,
  { label: string; variant: "success" | "muted" | "warning" | "destructive" | "default" | "info" }
> = {
  active: { label: "Active", variant: "success" },
  offline: { label: "Offline", variant: "muted" },
  late: { label: "Late", variant: "warning" },
  on_leave: { label: "On Leave", variant: "info" },
  blocked: { label: "Blocked", variant: "destructive" },
}

const filters = ["All", "Active", "Late", "Offline", "On Leave", "Blocked"] as const
type Filter = (typeof filters)[number]

type Toast = { id: number; message: string; type: "success" | "error" | "info" }
type ConfirmAction = { type: "force_offline" | "block" | "unblock"; driver: Driver }

export default function DriversPage() {
  const [filter, setFilter] = useState<Filter>("All")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Driver | null>(null)
  const [driverList, setDriverList] = useState<Driver[]>(initialDrivers)
  const [driverStates, setDriverStates] = useState<Record<string, DriverStatus>>(() =>
    Object.fromEntries(initialDrivers.map((d) => [d.id, d.status]))
  )
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Add driver form
  const [addOpen, setAddOpen] = useState(false)
  const [addStep, setAddStep] = useState(1)
  const [newName, setNewName] = useState("")
  const [newPhone, setNewPhone] = useState("")

  function addToast(message: string, type: Toast["type"] = "success") {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }

  function handleAddDriver() {
    if (!newName.trim() || !newPhone.trim()) return
    const id = `drv${Date.now()}`
    const code = `KJA-0${String(driverList.length + 1).padStart(2, "0")}`
    const newDriver: Driver = {
      id,
      name: newName.trim(),
      code,
      phone: newPhone.trim(),
      status: "offline",
      tripsToday: 0,
      earningsToday: 0,
      rating: 5.0,
      complianceStatus: "clear",
      hoursThisWeek: 0,
    }
    setDriverList((dl) => [...dl, newDriver])
    setDriverStates((s) => ({ ...s, [id]: "offline" }))
    addToast(`${newDriver.name} added as a driver (${code})`)
    setAddOpen(false)
    setAddStep(1)
    setNewName("")
    setNewPhone("")
  }

  const mergedDrivers = driverList.map((d) => ({ ...d, status: driverStates[d.id] ?? d.status }))

  const filtered = mergedDrivers.filter((d) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Active" && d.status === "active") ||
      (filter === "Late" && d.status === "late") ||
      (filter === "Offline" && d.status === "offline") ||
      (filter === "On Leave" && d.status === "on_leave") ||
      (filter === "Blocked" && d.status === "blocked")
    const matchesSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const selectedDriver = selected ? mergedDrivers.find((d) => d.id === selected.id) ?? selected : null
  const activeCount = mergedDrivers.filter((d) => d.status === "active").length

  function handleConfirm() {
    if (!confirm) return
    const { type, driver } = confirm
    if (type === "force_offline") {
      setDriverStates((s) => ({ ...s, [driver.id]: "offline" }))
      addToast(`${driver.name} forced offline`)
    } else if (type === "block") {
      setDriverStates((s) => ({ ...s, [driver.id]: "blocked" }))
      addToast(`${driver.name} has been blocked`, "error")
    } else if (type === "unblock") {
      setDriverStates((s) => ({ ...s, [driver.id]: "offline" }))
      addToast(`${driver.name} unblocked — set to offline`, "info")
    }
    setConfirm(null)
    setSelected(null)
  }

  return (
    <>
      <Header
        title="Drivers"
        subtitle={`${activeCount} of ${driverList.length} on shift`}
        action={
          <Button size="sm" className="gap-1.5 mr-1" onClick={() => { setAddOpen(true); setAddStep(1); setNewName(""); setNewPhone("") }}>
            <Add size={14} color="currentColor" />
            Add Driver
          </Button>
        }
      />
      <main className="flex-1 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="relative max-w-xs">
            <SearchNormal1 size={14} color="#52525b" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input placeholder="Search name or code…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1">
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
        </div>

        <div className="grid grid-cols-3 gap-4">
          {filtered.map((driver) => {
            const sc = statusConfig[driver.status]
            const weekFill = (driver.hoursThisWeek / 60) * 100
            return (
              <Card
                key={driver.id}
                className="hover:border-white/[0.18] transition-colors cursor-pointer"
                onClick={() => setSelected(driver)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={driver.name} size="lg" />
                      <div>
                        <p className="text-sm font-semibold text-zinc-100">{driver.name}</p>
                        <p className="text-xs text-zinc-500">{driver.code}</p>
                      </div>
                    </div>
                    <Badge variant={sc.variant}>{sc.label}</Badge>
                  </div>

                  {driver.route && (
                    <div className="mb-3 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Current Route</p>
                      <p className="text-xs font-medium text-zinc-300">{driver.route}</p>
                      {driver.bus && <p className="text-[11px] text-zinc-600 mt-0.5">{driver.bus}</p>}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2 text-center">
                      <p className="text-base font-bold text-zinc-200">{driver.tripsToday}</p>
                      <p className="text-[10px] text-zinc-600">Trips</p>
                    </div>
                    <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2 text-center">
                      <p className="text-base font-bold text-zinc-200">{formatNGN(driver.earningsToday)}</p>
                      <p className="text-[10px] text-zinc-600">Earned</p>
                    </div>
                    <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star1 size={12} color="#f59e0b" variant="Bold" />
                        <p className="text-base font-bold text-zinc-200">{driver.rating}</p>
                      </div>
                      <p className="text-[10px] text-zinc-600">Rating</p>
                    </div>
                  </div>

                  {driver.hoursThisWeek > 0 && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Hours This Week</p>
                        <p className="text-[11px] text-zinc-500">{driver.hoursThisWeek}h / 60h</p>
                      </div>
                      <Progress
                        value={weekFill}
                        colorClass={weekFill > 83 ? "bg-red-500" : weekFill > 67 ? "bg-yellow-500" : "bg-amber-500"}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-zinc-600">
            <p className="text-sm">No drivers match your filter</p>
          </div>
        )}
      </main>

      {/* Add driver sheet */}
      <Sheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Driver"
        subtitle={`Step ${addStep} of 2`}
        footer={
          addStep === 1 ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button size="sm" className="ml-auto" onClick={() => setAddStep(2)} disabled={!newName.trim() || !newPhone.trim()}>
                Next
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setAddStep(1)}>Back</Button>
              <Button size="sm" className="ml-auto gap-1.5" onClick={handleAddDriver}>
                <UserAdd size={14} color="currentColor" />
                Add Driver
              </Button>
            </>
          )
        }
      >
        <div className="px-6 py-5">
          {addStep === 1 && (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-4">Personal Details</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Full Name</label>
                    <Input
                      placeholder="e.g. Emeka Okafor"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Phone Number</label>
                    <Input
                      placeholder="e.g. 0801 234 5678"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
                <p className="text-[11px] text-zinc-600">Driver code will be auto-assigned. The driver will start with <span className="text-zinc-400">Offline</span> status until their first shift is dispatched.</p>
              </div>
            </div>
          )}

          {addStep === 2 && (
            <div className="space-y-5">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-4">Confirm Details</p>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] divide-y divide-white/[0.05]">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-zinc-500">Full Name</span>
                  <span className="text-sm font-medium text-zinc-200">{newName}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-zinc-500">Phone</span>
                  <span className="text-sm font-medium text-zinc-200">{newPhone}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-zinc-500">Assigned Code</span>
                  <span className="text-sm font-medium text-amber-400">KJA-0{String(driverList.length + 1).padStart(2, "0")}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-zinc-500">Initial Status</span>
                  <span className="text-sm font-medium text-zinc-400">Offline</span>
                </div>
              </div>
              <div className="rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 p-4">
                <div className="flex items-center gap-2">
                  <TickCircle size={14} color="#34d399" variant="Bold" />
                  <p className="text-xs text-emerald-400 font-medium">Ready to add</p>
                </div>
                <p className="text-[11px] text-zinc-600 mt-1">The driver will appear on the Drivers page and can be assigned to dispatch plans.</p>
              </div>
            </div>
          )}
        </div>
      </Sheet>

      {/* Driver detail sheet */}
      <Sheet
        open={!!selectedDriver}
        onClose={() => setSelected(null)}
        title={selectedDriver?.name ?? ""}
        subtitle={selectedDriver ? `${selectedDriver.code} · ${statusConfig[selectedDriver.status].label}` : ""}
        footer={
          selectedDriver ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  addToast(`Calling ${selectedDriver.phone}…`, "info")
                  setSelected(null)
                }}
              >
                <Call size={14} color="currentColor" />
                Call Driver
              </Button>
              {selectedDriver.status === "active" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setConfirm({ type: "force_offline", driver: selectedDriver })}
                >
                  <Slash size={14} color="currentColor" />
                  Force Offline
                </Button>
              )}
              <div className="ml-auto">
                {selectedDriver.status === "blocked" ? (
                  <Button
                    variant="success"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setConfirm({ type: "unblock", driver: selectedDriver })}
                  >
                    <TickCircle size={14} color="currentColor" />
                    Unblock Driver
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setConfirm({ type: "block", driver: selectedDriver })}
                  >
                    <Warning2 size={14} color="currentColor" />
                    Block Driver
                  </Button>
                )}
              </div>
            </>
          ) : undefined
        }
      >
        {selectedDriver && (
          <div className="px-6 py-5 space-y-5">
            {/* Identity */}
            <div className="flex items-center gap-4">
              <Avatar name={selectedDriver.name} size="xl" />
              <div>
                <p className="text-base font-bold text-zinc-100">{selectedDriver.name}</p>
                <p className="text-sm text-zinc-500">{selectedDriver.code}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Sms size={12} color="#71717a" variant="Linear" />
                  <p className="text-xs text-zinc-400">{selectedDriver.phone}</p>
                </div>
              </div>
              <Badge variant={statusConfig[selectedDriver.status].variant} className="ml-auto">
                {statusConfig[selectedDriver.status].label}
              </Badge>
            </div>

            <Separator />

            {/* Current assignment */}
            {selectedDriver.route ? (
              <div>
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Current Assignment</p>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Car size={14} color="#f59e0b" variant="Bold" />
                    <span className="text-sm text-zinc-300">{selectedDriver.bus}</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-100">{selectedDriver.route}</p>
                  {selectedDriver.shiftStart && (
                    <p className="text-xs text-zinc-500">Shift started {selectedDriver.shiftStart}</p>
                  )}
                  {selectedDriver.currentPassengers !== undefined && (
                    <div className="pt-1">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-zinc-600">Passengers onboard</span>
                        <span className="text-zinc-400">{selectedDriver.currentPassengers} pax</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center text-zinc-600 text-sm">
                No active assignment
              </div>
            )}

            {/* Stats */}
            <div>
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Today’s Performance</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3 text-center">
                  <p className="text-xl font-bold text-zinc-100">{selectedDriver.tripsToday}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Trips</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3 text-center">
                  <p className="text-lg font-bold text-emerald-400">{formatNGN(selectedDriver.earningsToday)}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Earned</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star1 size={14} color="#f59e0b" variant="Bold" />
                    <p className="text-xl font-bold text-zinc-100">{selectedDriver.rating}</p>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Rating</p>
                </div>
              </div>
            </div>

            {/* Compliance */}
            <div>
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Compliance</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-zinc-400">Hours this week</span>
                    <span className={cn(
                      "font-medium",
                      selectedDriver.hoursThisWeek > 50 ? "text-red-400" : "text-zinc-300"
                    )}>
                      {selectedDriver.hoursThisWeek}h / 60h
                    </span>
                  </div>
                  <Progress
                    value={(selectedDriver.hoursThisWeek / 60) * 100}
                    colorClass={
                      selectedDriver.hoursThisWeek > 50 ? "bg-red-500" :
                      selectedDriver.hoursThisWeek > 40 ? "bg-yellow-500" : "bg-amber-500"
                    }
                  />
                  {selectedDriver.hoursThisWeek > 50 && (
                    <p className="text-[11px] text-red-400 mt-1">Approaching weekly hour limit</p>
                  )}
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2.5">
                  <span className="text-xs text-zinc-400">Compliance status</span>
                  <Badge variant={
                    selectedDriver.complianceStatus === "clear" ? "success" :
                    selectedDriver.complianceStatus === "warning" ? "warning" : "destructive"
                  }>
                    {selectedDriver.complianceStatus === "clear" ? "Clear" :
                     selectedDriver.complianceStatus === "warning" ? "Warning" : "Blocked"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Incidents */}
            <div>
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Recent Incidents</p>
              {selectedDriver.complianceStatus === "blocked" ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-3">
                  <p className="text-xs text-red-400 font-medium">Driver blocked — pending review</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Account suspended. Contact compliance to resolve.</p>
                </div>
              ) : selectedDriver.complianceStatus === "warning" ? (
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.04] p-3">
                  <p className="text-xs text-yellow-400 font-medium">Late start — {selectedDriver.name}</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Did not accept shift on time. Logged today.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                  <p className="text-xs text-zinc-600">No incidents recorded</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Sheet>

      {/* Confirm action dialog */}
      <Dialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={
          confirm?.type === "block" ? "Block Driver" :
          confirm?.type === "unblock" ? "Unblock Driver" : "Force Offline"
        }
        description={
          confirm?.type === "block"
            ? `${confirm.driver.name} will be blocked immediately and cannot accept any trips. This action is logged.`
            : confirm?.type === "unblock"
            ? `${confirm?.driver.name} will be unblocked and set to offline. They can resume accepting shifts.`
            : `${confirm?.driver.name} will be marked offline immediately. Any active trip will be flagged.`
        }
      >
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button
            size="sm"
            variant={confirm?.type === "unblock" ? "success" : "destructive"}
            onClick={handleConfirm}
          >
            {confirm?.type === "block" ? "Block Driver" :
             confirm?.type === "unblock" ? "Unblock" : "Force Offline"}
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
