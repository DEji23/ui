"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog } from "@/components/ui/dialog"
import { Sheet } from "@/components/ui/sheet"
import { ToastContainer, type Toast } from "@/components/ui/toast"
import { buses as initialBuses, drivers, type Bus, type BusStatus } from "@/lib/data"
import { formatNGNFull, formatDate, cn } from "@/lib/utils"

const statusConfig: Record<BusStatus, { label: string; badge: "green" | "yellow" | "red" | "gray" }> = {
  active: { label: "Active", badge: "green" },
  inactive: { label: "Available", badge: "gray" },
  maintenance: { label: "Maintenance", badge: "yellow" },
  decommissioned: { label: "Decommissioned", badge: "red" },
}

type DialogMode = "status" | "unassign" | null

interface AddBusForm {
  plateNumber: string; vin: string; type: string; manufacturer: string; model: string
  year: string; color: string; capacity: string; hasStanding: boolean
  insuranceExpiry: string; roadworthinessExpiry: string; licenseExpiry: string
  gpsDevice: string; depot: string
}

const emptyForm: AddBusForm = {
  plateNumber: "", vin: "", type: "midi", manufacturer: "Toyota", model: "Coaster",
  year: "2023", color: "White/Blue", capacity: "30", hasStanding: false,
  insuranceExpiry: "", roadworthinessExpiry: "", licenseExpiry: "",
  gpsDevice: "", depot: "Lagos Island",
}

const busDetailTabs = ["overview", "trips", "compliance", "maintenance"] as const
type BusDetailTab = typeof busDetailTabs[number]

function FleetInner() {
  const searchParams = useSearchParams()
  const [buses, setBuses] = useState(initialBuses)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<BusStatus | "all">("all")
  const [selected, setSelected] = useState<Bus | null>(null)
  const [detailTab, setDetailTab] = useState<BusDetailTab>("overview")
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [newStatus, setNewStatus] = useState<BusStatus>("inactive")
  const [statusReason, setStatusReason] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [addStep, setAddStep] = useState(1)
  const [form, setForm] = useState<AddBusForm>(emptyForm)
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  useEffect(() => {
    if (searchParams.get("action") === "add") setAddOpen(true)
  }, [searchParams])

  const toast = (message: string, type: Toast["type"] = "success") => {
    const id = ++counterRef.current
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }

  const filtered = buses.filter((b) => {
    const matchFilter = filter === "all" || b.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || b.plateNumber.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || b.model.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const updateBus = (id: string, patch: Partial<Bus>) => {
    setBuses((prev) => prev.map((b) => b.id === id ? { ...b, ...patch } : b))
    if (selected?.id === id) setSelected((s) => s ? { ...s, ...patch } : null)
  }

  const handleStatusChange = () => {
    if (!selected) return
    updateBus(selected.id, { status: newStatus, assignedDriver: newStatus !== "active" ? null : selected.assignedDriver })
    toast(`${selected.plateNumber} status updated to ${newStatus}`)
    setDialogMode(null)
    setStatusReason("")
  }

  const handleUnassign = () => {
    if (!selected) return
    updateBus(selected.id, { assignedDriver: null, assignedRoute: null })
    toast(`Driver unassigned from ${selected.plateNumber}`, "info")
    setDialogMode(null)
  }

  const handleAddBus = () => {
    const code = `KJB-${String(buses.length + 1).padStart(3, "0")}`
    const newBus: Bus = {
      id: `BUS-${String(buses.length + 1).padStart(2, "0")}`,
      plateNumber: form.plateNumber,
      vin: form.vin,
      code,
      type: form.type as Bus["type"],
      manufacturer: form.manufacturer,
      model: form.model,
      year: parseInt(form.year),
      color: form.color,
      status: "inactive",
      capacity: parseInt(form.capacity),
      assignedDriver: null,
      assignedRoute: null,
      depot: form.depot,
      gpsDevice: form.gpsDevice || null,
      documents: {
        insurance: { expiry: form.insuranceExpiry, status: (form.insuranceExpiry ? "verified" : "pending") as "verified" | "pending" | "expired" },
        roadworthiness: { expiry: form.roadworthinessExpiry, status: (form.roadworthinessExpiry ? "verified" : "pending") as "verified" | "pending" | "expired" },
        license: { expiry: form.licenseExpiry, status: (form.licenseExpiry ? "verified" : "pending") as "verified" | "pending" | "expired" },
      },
      earnings: { today: 0, week: 0, month: 0 },
      trips: { today: 0, total: 0 },
      lastMaintenance: "",
      nextMaintenance: "",
      fuelLevel: 100,
      mileage: 0,
    }
    setBuses((prev) => [...prev, newBus])
    toast(`${form.plateNumber} (${code}) registered successfully`)
    setAddOpen(false)
    setForm(emptyForm)
    setAddStep(1)
  }

  const counts = {
    all: buses.length,
    active: buses.filter((b) => b.status === "active").length,
    inactive: buses.filter((b) => b.status === "inactive").length,
    maintenance: buses.filter((b) => b.status === "maintenance").length,
    decommissioned: buses.filter((b) => b.status === "decommissioned").length,
  }

  const assignedDriver = selected ? drivers.find((d) => d.id === selected.assignedDriver) : null

  const addStepLabels = ["Bus Identity", "Capacity", "Documents", "GPS & Device", "Confirm"]

  return (
    <div className="pt-14">
      <Header
        title="Fleet"
        subtitle={`${counts.active} active · ${counts.maintenance} in maintenance · ${counts.inactive} available`}
        actions={
          <Button variant="primary" size="sm" onClick={() => { setAddOpen(true); setAddStep(1); setForm(emptyForm) }}>
            + Add Bus
          </Button>
        }
      />

      <div className="p-6">
        {/* Search & Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <svg viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plate, code, or model..."
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40"
            />
          </div>
          <div className="flex items-center gap-1 bg-white/4 rounded-lg p-1">
            {(["all", "active", "inactive", "maintenance"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s === "inactive" ? "inactive" : s)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  filter === s ? "bg-white/12 text-white" : "text-white/40 hover:text-white/70"
                )}
              >
                {s === "inactive" ? "Available" : s.charAt(0).toUpperCase() + s.slice(1)}
                <span className="ml-1.5 text-white/30">{counts[s]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bus Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">No buses found{search ? ` for "${search}"` : ""}</div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filtered.map((bus) => {
              const sc = statusConfig[bus.status]
              const hasExpiredDoc = Object.values(bus.documents).some((d) => d.status === "expired")
              return (
                <button
                  key={bus.id}
                  onClick={() => { setSelected(bus); setDetailTab("overview") }}
                  className="text-left bg-[#141518] border border-white/6 rounded-xl p-4 hover:border-amber-500/30 hover:bg-[#1a1b1f] transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{bus.plateNumber}</div>
                      <div className="text-[11px] text-white/40">{bus.code} · {bus.manufacturer} {bus.model} {bus.year}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={sc.badge} className="text-[9px]">{sc.label}</Badge>
                      {hasExpiredDoc && <Badge variant="red" className="text-[9px]">Docs Expired</Badge>}
                    </div>
                  </div>

                  {/* Fuel bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-white/40 mb-1">
                      <span>Fuel</span>
                      <span>{bus.fuelLevel}%</span>
                    </div>
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${bus.fuelLevel > 50 ? "bg-emerald-500" : bus.fuelLevel > 20 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${bus.fuelLevel}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-white/50">
                    <div className="flex justify-between">
                      <span>Driver</span>
                      <span className="text-white/70">{bus.assignedDriver ? drivers.find(d => d.id === bus.assignedDriver)?.name || bus.assignedDriver : "Unassigned"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Route</span>
                      <span className="text-white/70 truncate ml-2">{bus.assignedRoute || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Today</span>
                      <span className="text-emerald-400 font-medium">{formatNGNFull(bus.earnings.today)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Capacity</span>
                      <span className="text-white/70">{bus.capacity} seats</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Bus Detail Sheet */}
      <Sheet
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.plateNumber}` : ""}
        subtitle={selected ? `${selected.code} · ${selected.manufacturer} ${selected.model} ${selected.year}` : ""}
        footer={
          selected ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => { setNewStatus("maintenance"); setDialogMode("status") }}>
                {selected.status === "maintenance" ? "End Maintenance" : "Mark Maintenance"}
              </Button>
              {selected.assignedDriver && (
                <Button variant="outline" size="sm" onClick={() => setDialogMode("unassign")}>Unassign Driver</Button>
              )}
              <Button variant="danger" size="sm" onClick={() => { setNewStatus("inactive"); setDialogMode("status") }}>
                {selected.status === "active" ? "Take Offline" : selected.status === "inactive" ? "Decommission" : "Restore"}
              </Button>
            </>
          ) : undefined
        }
        wide
      >
        {selected && (
          <div>
            {/* Status Row */}
            <div className="flex items-center gap-2 mb-5">
              <Badge variant={statusConfig[selected.status].badge}>{statusConfig[selected.status].label}</Badge>
              {Object.entries(selected.documents).map(([key, doc]) => (
                doc.status === "expired" && (
                  <Badge key={key} variant="red" className="text-[9px]">{key} expired</Badge>
                )
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 bg-white/4 rounded-lg p-1">
              {busDetailTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={cn(
                    "flex-1 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
                    detailTab === tab ? "bg-white/12 text-white" : "text-white/40 hover:text-white/70"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {detailTab === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Today", value: formatNGNFull(selected.earnings.today), sub: `${selected.trips.today} trips` },
                    { label: "This Week", value: formatNGNFull(selected.earnings.week), sub: "7 days" },
                    { label: "Total Trips", value: selected.trips.total, sub: "all time" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/4 rounded-lg p-3 text-center">
                      <div className="text-base font-bold text-white">{s.value}</div>
                      <div className="text-[10px] text-white/50 mt-0.5">{s.label}</div>
                      <div className="text-[10px] text-white/30">{s.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Fuel gauge */}
                <div className="bg-white/4 rounded-lg p-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-white/50">Fuel Level</span>
                    <span className={selected.fuelLevel < 20 ? "text-red-400" : "text-white/70"}>{selected.fuelLevel}%</span>
                  </div>
                  <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${selected.fuelLevel > 50 ? "bg-emerald-500" : selected.fuelLevel > 20 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${selected.fuelLevel}%` }}
                    />
                  </div>
                </div>

                {/* Assignment */}
                {assignedDriver ? (
                  <div className="bg-white/4 rounded-lg p-4">
                    <p className="text-xs text-white/40 mb-2">Assigned Driver</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 font-bold text-sm">
                        {assignedDriver.photo}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{assignedDriver.name}</div>
                        <div className="text-xs text-white/40">{assignedDriver.code} · {assignedDriver.phone}</div>
                      </div>
                      <Badge variant={assignedDriver.compliance === "verified" ? "green" : "yellow"} className="ml-auto text-[9px]">
                        {assignedDriver.compliance}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/4 rounded-lg p-4 text-center text-sm text-white/30">No driver assigned</div>
                )}

                <div className="space-y-2.5">
                  {[
                    { label: "VIN", value: selected.vin },
                    { label: "Type", value: `${selected.type} · ${selected.capacity} seats` },
                    { label: "Color", value: selected.color },
                    { label: "Depot", value: selected.depot },
                    { label: "GPS Device", value: selected.gpsDevice || "Not linked" },
                    { label: "Mileage", value: `${selected.mileage.toLocaleString()} km` },
                  ].map((f) => (
                    <div key={f.label} className="flex justify-between text-sm">
                      <span className="text-white/40">{f.label}</span>
                      <span className="text-white/80">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailTab === "compliance" && (
              <div className="space-y-3">
                {Object.entries(selected.documents).map(([key, doc]) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-white/6 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-white/80 capitalize">{key}</div>
                      <div className="text-xs text-white/40 mt-0.5">
                        {doc.expiry ? `Expires: ${formatDate(doc.expiry)}` : "No expiry recorded"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={doc.status === "verified" ? "green" : doc.status === "expired" ? "red" : "yellow"}>
                        {doc.status}
                      </Badge>
                      <button className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors border border-amber-500/20 px-2 py-1 rounded-md">
                        Update
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {detailTab === "maintenance" && (
              <div className="space-y-4">
                {[
                  { label: "Last Maintenance", value: selected.lastMaintenance ? formatDate(selected.lastMaintenance) : "—" },
                  { label: "Next Due", value: selected.nextMaintenance ? formatDate(selected.nextMaintenance) : "—" },
                ].map((f) => (
                  <div key={f.label} className="flex justify-between text-sm py-2 border-b border-white/6">
                    <span className="text-white/40">{f.label}</span>
                    <span className="text-white/80">{f.value}</span>
                  </div>
                ))}
                <Button variant="secondary" size="sm" onClick={() => toast("Maintenance record added")}>
                  + Log Maintenance Record
                </Button>
              </div>
            )}

            {detailTab === "trips" && (
              <div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/4 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-white">{selected.trips.today}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">Today</div>
                  </div>
                  <div className="bg-white/4 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-white">{selected.trips.total}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">All Time</div>
                  </div>
                </div>
                <p className="text-xs text-white/30 text-center py-4">Full trip history available with live data connection.</p>
              </div>
            )}
          </div>
        )}
      </Sheet>

      {/* Status Change Dialog */}
      <Dialog open={dialogMode === "status"} onClose={() => setDialogMode(null)} title="Change Bus Status" description={selected ? `Update status for ${selected.plateNumber}` : ""}>
        <div className="space-y-4">
          <Select label="New Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value as BusStatus)}>
            <option value="active">Active</option>
            <option value="inactive">Available (Inactive)</option>
            <option value="maintenance">Under Maintenance</option>
            <option value="decommissioned">Decommissioned</option>
          </Select>
          <Textarea label="Reason" rows={2} value={statusReason} onChange={(e) => setStatusReason(e.target.value)} placeholder="Reason for status change..." />
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleStatusChange}>Confirm</Button>
          </div>
        </div>
      </Dialog>

      {/* Unassign Driver Dialog */}
      <Dialog open={dialogMode === "unassign"} onClose={() => setDialogMode(null)} title="Unassign Driver" description={`Remove ${assignedDriver?.name} from ${selected?.plateNumber}?`}>
        <div className="flex gap-2 pt-1">
          <Button variant="ghost" className="flex-1" onClick={() => setDialogMode(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={handleUnassign}>Unassign</Button>
        </div>
      </Dialog>

      {/* Add Bus Sheet (5-step wizard) */}
      <Sheet
        open={addOpen}
        onClose={() => { setAddOpen(false); setAddStep(1); setForm(emptyForm) }}
        title="Register New Bus"
        subtitle={`${addStepLabels[addStep - 1]} · Step ${addStep} of 5`}
        wide
        footer={
          <div className="flex gap-2 w-full">
            {addStep > 1 && <Button variant="ghost" onClick={() => setAddStep(s => s - 1)}>Back</Button>}
            <div className="flex-1" />
            {addStep < 5 ? (
              <Button
                variant="primary"
                onClick={() => setAddStep(s => s + 1)}
                disabled={addStep === 1 && (!form.plateNumber || !form.manufacturer || !form.model)}
              >
                Continue →
              </Button>
            ) : (
              <Button variant="primary" onClick={handleAddBus} disabled={!form.plateNumber}>
                Register Bus
              </Button>
            )}
          </div>
        }
      >
        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {addStepLabels.map((label, i) => (
            <div key={label} className="flex-1">
              <div className={cn("h-1 rounded-full mb-1.5", i + 1 <= addStep ? "bg-amber-500" : "bg-white/10")} />
              <span className={cn("text-[10px]", i + 1 === addStep ? "text-amber-400" : "text-white/25")}>{label}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Bus Identity */}
        {addStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Plate Number *" value={form.plateNumber} onChange={(e) => setForm(f => ({ ...f, plateNumber: e.target.value.toUpperCase() }))} placeholder="LND 000 KJ" />
              <Input label="VIN Number" value={form.vin} onChange={(e) => setForm(f => ({ ...f, vin: e.target.value.toUpperCase() }))} placeholder="17-character VIN" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Bus Type *" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="mini">Mini (12–18 seats)</option>
                <option value="midi">Midi (20–35 seats)</option>
                <option value="full">Full-size (36–55 seats)</option>
                <option value="brt">BRT (56+ seats)</option>
              </Select>
              <Input label="Year" type="number" value={form.year} onChange={(e) => setForm(f => ({ ...f, year: e.target.value }))} placeholder="2023" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Manufacturer *" value={form.manufacturer} onChange={(e) => setForm(f => ({ ...f, manufacturer: e.target.value }))} placeholder="Toyota, Nissan, Higer..." />
              <Input label="Model *" value={form.model} onChange={(e) => setForm(f => ({ ...f, model: e.target.value }))} placeholder="Coaster, Urvan, Rosa..." />
            </div>
            <Input label="Color" value={form.color} onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))} placeholder="White/Blue" />
          </div>
        )}

        {/* Step 2: Capacity */}
        {addStep === 2 && (
          <div className="space-y-4">
            <Input label="Seat Capacity *" type="number" value={form.capacity} onChange={(e) => setForm(f => ({ ...f, capacity: e.target.value }))} placeholder="30" hint="Number of passenger seats" />
            <div className="flex items-center justify-between py-3 border border-white/8 rounded-lg px-4">
              <div>
                <div className="text-sm font-medium text-white/80">Standing Passengers</div>
                <div className="text-xs text-white/40 mt-0.5">Allow standing pax during peak hours</div>
              </div>
              <button
                onClick={() => setForm(f => ({ ...f, hasStanding: !f.hasStanding }))}
                className={cn(
                  "w-10 h-6 rounded-full transition-all relative",
                  form.hasStanding ? "bg-amber-500" : "bg-white/15"
                )}
              >
                <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all", form.hasStanding ? "left-5" : "left-1")} />
              </button>
            </div>
            <div className="bg-white/4 rounded-xl p-4 space-y-2">
              <p className="text-xs text-white/50 font-medium">Capacity Preview</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-6 bg-white/8 rounded-md overflow-hidden flex">
                  <div className="bg-amber-500/30 h-full" style={{ width: `${Math.min(100, (parseInt(form.capacity) || 0) / 60 * 100)}%` }} />
                </div>
                <span className="text-sm font-bold text-white">{form.capacity} seats</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Documents */}
        {addStep === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-white/40">Enter document expiry dates. You can upload files later from the bus profile.</p>
            <Input label="Insurance Expiry" type="date" value={form.insuranceExpiry} onChange={(e) => setForm(f => ({ ...f, insuranceExpiry: e.target.value }))} />
            <Input label="Roadworthiness Expiry" type="date" value={form.roadworthinessExpiry} onChange={(e) => setForm(f => ({ ...f, roadworthinessExpiry: e.target.value }))} />
            <Input label="Vehicle License Expiry" type="date" value={form.licenseExpiry} onChange={(e) => setForm(f => ({ ...f, licenseExpiry: e.target.value }))} />
            <div className="border border-white/8 rounded-xl p-4 space-y-3">
              <p className="text-xs font-medium text-white/50">Upload Documents</p>
              {["Insurance Certificate", "Roadworthiness Certificate", "Vehicle License"].map((doc) => (
                <div key={doc} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-sm text-white/60">{doc}</span>
                  <label className="cursor-pointer text-xs text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-md hover:bg-amber-500/8">
                    Upload
                    <input type="file" className="hidden" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: GPS & Device */}
        {addStep === 4 && (
          <div className="space-y-4">
            <Input label="GPS Device ID" value={form.gpsDevice} onChange={(e) => setForm(f => ({ ...f, gpsDevice: e.target.value }))} placeholder="GPS-XXX" hint="Scan QR code or enter device ID manually" />
            <Select label="Depot Assignment" value={form.depot} onChange={(e) => setForm(f => ({ ...f, depot: e.target.value }))}>
              <option>Lagos Island</option>
              <option>Oshodi</option>
              <option>Berger</option>
              <option>Ikeja</option>
              <option>Lekki</option>
            </Select>
            <div className="border border-white/8 rounded-xl p-5 text-center space-y-3">
              <div className="w-16 h-16 bg-white/4 rounded-xl mx-auto flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-white/20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <p className="text-xs text-white/40">Auto-generated bus QR code will be available after registration</p>
            </div>
          </div>
        )}

        {/* Step 5: Confirm */}
        {addStep === 5 && (
          <div className="space-y-4">
            <div className="bg-amber-500/8 border border-amber-500/15 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-amber-400 mb-3">Registration Summary</p>
              {[
                { label: "Plate Number", value: form.plateNumber },
                { label: "Type", value: `${form.type} · ${form.capacity} seats` },
                { label: "Vehicle", value: `${form.manufacturer} ${form.model} ${form.year}` },
                { label: "Color", value: form.color },
                { label: "GPS Device", value: form.gpsDevice || "Not linked" },
                { label: "Depot", value: form.depot },
                { label: "Insurance", value: form.insuranceExpiry ? formatDate(form.insuranceExpiry) : "Not provided" },
                { label: "Roadworthiness", value: form.roadworthinessExpiry ? formatDate(form.roadworthinessExpiry) : "Not provided" },
              ].map((f) => (
                <div key={f.label} className="flex justify-between text-sm">
                  <span className="text-white/40">{f.label}</span>
                  <span className="text-white/80">{f.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/30">
              Bus will be registered with <strong className="text-white/50">Available</strong> status. Assign a driver from the driver profile to activate.
            </p>
          </div>
        )}
      </Sheet>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default function FleetPage() {
  return (
    <Suspense>
      <FleetInner />
    </Suspense>
  )
}
