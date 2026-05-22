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
import { drivers as initialDrivers, type Driver, type DriverStatus } from "@/lib/data"
import { formatNGNFull, formatDate, cn } from "@/lib/utils"

const statusConfig: Record<DriverStatus, { label: string; badge: "green" | "yellow" | "red" | "gray" }> = {
  active: { label: "Active", badge: "green" },
  inactive: { label: "Inactive", badge: "gray" },
  suspended: { label: "Suspended", badge: "red" },
  on_leave: { label: "On Leave", badge: "yellow" },
}

type DialogMode = "suspend" | "deactivate" | "assign" | null

interface NewDriverForm {
  name: string; phone: string; email: string; license: string; licenseExpiry: string
  nin: string; address: string; emergencyContact: string; depot: string; shift: string; notes: string
}

const emptyForm: NewDriverForm = {
  name: "", phone: "", email: "", license: "", licenseExpiry: "",
  nin: "", address: "", emergencyContact: "", depot: "Lagos Island", shift: "morning", notes: ""
}

function DriversInner() {
  const searchParams = useSearchParams()
  const [drivers, setDrivers] = useState(initialDrivers)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<DriverStatus | "all">("all")
  const [selected, setSelected] = useState<Driver | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [suspendReason, setSuspendReason] = useState("")
  const [suspendDuration, setSuspendDuration] = useState("7d")
  const [toasts, setToasts] = useState<Toast[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [addStep, setAddStep] = useState(1)
  const [form, setForm] = useState<NewDriverForm>(emptyForm)
  const [profileTab, setProfileTab] = useState<"overview" | "compliance" | "trips" | "incidents">("overview")
  const counterRef = useRef(0)

  useEffect(() => {
    if (searchParams.get("action") === "add") setAddOpen(true)
  }, [searchParams])

  const toast = (message: string, type: Toast["type"] = "success") => {
    const id = ++counterRef.current
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }

  const filtered = drivers.filter((d) => {
    const matchFilter = filter === "all" || d.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.phone.includes(q)
    return matchFilter && matchSearch
  })

  const updateDriver = (id: string, patch: Partial<Driver>) => {
    setDrivers((prev) => prev.map((d) => d.id === id ? { ...d, ...patch } : d))
    if (selected?.id === id) setSelected((s) => s ? { ...s, ...patch } : null)
  }

  const handleSuspend = () => {
    if (!selected || !suspendReason) return
    updateDriver(selected.id, { status: "suspended", assignedBus: null })
    toast(`${selected.name} suspended`)
    setDialogMode(null)
    setSuspendReason("")
  }

  const handleDeactivate = () => {
    if (!selected) return
    updateDriver(selected.id, { status: "inactive", assignedBus: null })
    toast(`${selected.name} deactivated`, "info")
    setDialogMode(null)
    setSelected(null)
  }

  const handleUnsuspend = (d: Driver) => {
    updateDriver(d.id, { status: "inactive" })
    toast(`${d.name} reactivated`)
  }

  const handleAddDriver = () => {
    if (!form.name || !form.phone || !form.license) return
    const newDriver: Driver = {
      id: `DRV-${String(drivers.length + 1).padStart(3, "0")}`,
      name: form.name,
      code: `KJA-${String(drivers.length + 1).padStart(3, "0")}`,
      phone: form.phone,
      email: form.email,
      status: "inactive",
      photo: form.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
      license: form.license,
      licenseExpiry: form.licenseExpiry,
      nin: form.nin || "Pending",
      compliance: "pending",
      assignedBus: null,
      assignedRoute: null,
      shift: form.shift as Driver["shift"],
      earnings: { today: 0, week: 0, month: 0 },
      trips: { today: 0, week: 0, month: 0, onTimeRate: 0 },
      incidents: 0,
      joinDate: new Date().toISOString().split("T")[0],
      depot: form.depot,
      address: form.address,
      emergencyContact: form.emergencyContact,
    }
    setDrivers((prev) => [...prev, newDriver])
    toast(`${form.name} added successfully`)
    setAddOpen(false)
    setForm(emptyForm)
    setAddStep(1)
  }

  const counts = {
    all: drivers.length,
    active: drivers.filter((d) => d.status === "active").length,
    inactive: drivers.filter((d) => d.status === "inactive").length,
    suspended: drivers.filter((d) => d.status === "suspended").length,
    on_leave: drivers.filter((d) => d.status === "on_leave").length,
  }

  return (
    <div className="pt-14">
      <Header
        title="Drivers"
        subtitle={`${counts.active} active · ${counts.on_leave} on leave · ${counts.suspended} suspended`}
        actions={
          <Button variant="primary" size="sm" onClick={() => { setAddOpen(true); setAddStep(1); setForm(emptyForm) }}>
            + Add Driver
          </Button>
        }
      />

      <div className="p-6">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <svg viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, or phone..."
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40"
            />
          </div>
          <div className="flex items-center gap-1 bg-white/4 rounded-lg p-1">
            {(["all", "active", "inactive", "suspended", "on_leave"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  filter === s ? "bg-white/12 text-white" : "text-white/40 hover:text-white/70"
                )}
              >
                {s === "all" ? "All" : s === "on_leave" ? "On Leave" : s.charAt(0).toUpperCase() + s.slice(1)}
                <span className="ml-1.5 text-white/30">{counts[s]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Driver Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">
            No drivers found{search ? ` for "${search}"` : ""}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filtered.map((driver) => {
              const sc = statusConfig[driver.status]
              return (
                <button
                  key={driver.id}
                  onClick={() => { setSelected(driver); setProfileTab("overview") }}
                  className="text-left bg-[#141518] border border-white/6 rounded-xl p-4 hover:border-amber-500/30 hover:bg-[#1a1b1f] transition-all group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                      {driver.photo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate">{driver.name}</span>
                      </div>
                      <div className="text-[11px] text-white/40">{driver.code}</div>
                    </div>
                    <Badge variant={sc.badge} className="shrink-0 text-[9px]">{sc.label}</Badge>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-white/50">
                    <div className="flex justify-between">
                      <span>Bus</span>
                      <span className="text-white/70">{driver.assignedBus || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Route</span>
                      <span className="text-white/70 truncate ml-2">{driver.assignedRoute || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Today</span>
                      <span className="text-emerald-400 font-medium">{formatNGNFull(driver.earnings.today)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Compliance</span>
                      <Badge
                        variant={driver.compliance === "verified" ? "green" : driver.compliance === "pending" ? "yellow" : "red"}
                        className="text-[9px]"
                      >
                        {driver.compliance}
                      </Badge>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Driver Profile Sheet */}
      <Sheet
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        subtitle={`${selected?.code} · ${selected?.depot}`}
        footer={
          selected ? (
            <>
              <a href={`tel:${selected.phone}`} className="flex-1">
                <Button variant="secondary" size="sm" className="w-full">Call Driver</Button>
              </a>
              {selected.status === "active" && (
                <Button variant="outline" size="sm" onClick={() => setDialogMode("suspend")}>
                  Suspend
                </Button>
              )}
              {selected.status === "suspended" && (
                <Button variant="secondary" size="sm" onClick={() => handleUnsuspend(selected)}>
                  Unsuspend
                </Button>
              )}
              {selected.status !== "inactive" && (
                <Button variant="danger" size="sm" onClick={() => setDialogMode("deactivate")}>
                  Deactivate
                </Button>
              )}
            </>
          ) : undefined
        }
      >
        {selected && (
          <div>
            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/8">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-400 font-bold text-xl">
                {selected.photo}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={statusConfig[selected.status].badge}>{statusConfig[selected.status].label}</Badge>
                  <Badge variant={selected.compliance === "verified" ? "green" : selected.compliance === "pending" ? "yellow" : "red"}>
                    {selected.compliance}
                  </Badge>
                </div>
                <div className="text-xs text-white/40 mt-1">{selected.phone} · {selected.email}</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 bg-white/4 rounded-lg p-1">
              {(["overview", "compliance", "trips", "incidents"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setProfileTab(tab)}
                  className={cn(
                    "flex-1 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
                    profileTab === tab ? "bg-white/12 text-white" : "text-white/40 hover:text-white/70"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {profileTab === "overview" && (
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Today", value: formatNGNFull(selected.earnings.today), sub: `${selected.trips.today} trips` },
                    { label: "This Week", value: formatNGNFull(selected.earnings.week), sub: `${selected.trips.week} trips` },
                    { label: "On-Time Rate", value: `${selected.trips.onTimeRate}%`, sub: "last 30 days" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/4 rounded-lg p-3 text-center">
                      <div className="text-base font-bold text-white">{s.value}</div>
                      <div className="text-[10px] text-white/50 mt-0.5">{s.label}</div>
                      <div className="text-[10px] text-white/30">{s.sub}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: "Assigned Bus", value: selected.assignedBus || "Unassigned" },
                    { label: "Route", value: selected.assignedRoute || "—" },
                    { label: "Shift", value: selected.shift ? selected.shift.charAt(0).toUpperCase() + selected.shift.slice(1) : "—" },
                    { label: "Depot", value: selected.depot },
                    { label: "License No.", value: selected.license },
                    { label: "License Expiry", value: formatDate(selected.licenseExpiry) },
                    { label: "Join Date", value: formatDate(selected.joinDate) },
                    { label: "Address", value: selected.address },
                    { label: "Emergency", value: selected.emergencyContact },
                  ].map((f) => (
                    <div key={f.label} className="flex justify-between text-sm">
                      <span className="text-white/40">{f.label}</span>
                      <span className="text-white/80 text-right max-w-[60%]">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profileTab === "compliance" && (
              <div className="space-y-3">
                {[
                  { label: "Profile Photo", done: true },
                  { label: "Phone Verified", done: true },
                  { label: "Driver's License", done: selected.compliance !== "pending", expiry: selected.licenseExpiry },
                  { label: "NIN Verification", done: selected.nin !== "Pending" },
                  { label: "Background Check", done: selected.compliance === "verified" },
                  { label: "Employment Agreement", done: selected.status !== "inactive" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-white/6 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${item.done ? "bg-emerald-500/20 text-emerald-400" : "bg-white/8 text-white/30"}`}>
                        {item.done ? "✓" : "·"}
                      </div>
                      <span className="text-sm text-white/70">{item.label}</span>
                    </div>
                    {item.expiry && (
                      <span className="text-xs text-white/40">Exp: {formatDate(item.expiry)}</span>
                    )}
                    <Badge variant={item.done ? "green" : "gray"} className="text-[9px]">
                      {item.done ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {profileTab === "trips" && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Total Trips", value: selected.trips.month },
                    { label: "Monthly Earnings", value: formatNGNFull(selected.earnings.month) },
                    { label: "Incidents", value: selected.incidents },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/4 rounded-lg p-3 text-center">
                      <div className={`text-lg font-bold ${s.label === "Incidents" && selected.incidents > 0 ? "text-red-400" : "text-white"}`}>{s.value}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/30 text-center py-4">Detailed trip history available with live data connection.</p>
              </div>
            )}

            {profileTab === "incidents" && (
              <div>
                {selected.incidents === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xl mx-auto mb-2">✓</div>
                    <p className="text-sm text-white/50">No incidents recorded</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50">Total Incidents</span>
                      <span className="text-red-400 font-semibold">{selected.incidents}</span>
                    </div>
                    <p className="text-xs text-white/30 py-4 text-center">Full incident log available with live data connection.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Sheet>

      {/* Suspend Dialog */}
      <Dialog open={dialogMode === "suspend"} onClose={() => setDialogMode(null)} title="Suspend Driver" description={`This will remove ${selected?.name} from active duty.`}>
        <div className="space-y-4">
          <Select label="Suspension Duration" value={suspendDuration} onChange={(e) => setSuspendDuration(e.target.value)}>
            <option value="24h">24 Hours</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="permanent">Permanent</option>
          </Select>
          <Textarea label="Reason (required)" rows={3} value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} placeholder="Describe the reason for suspension..." />
          <div className="flex gap-2 pt-1">
            <Button variant="ghost" className="flex-1" onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={handleSuspend} disabled={!suspendReason}>Suspend Driver</Button>
          </div>
        </div>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={dialogMode === "deactivate"} onClose={() => setDialogMode(null)} title="Deactivate Driver" description={`${selected?.name} will be removed from all schedules and cannot be dispatched.`}>
        <div className="space-y-4">
          <div className="bg-red-500/8 border border-red-500/15 rounded-lg p-3 text-xs text-red-300">
            This action cannot be reversed automatically. The driver will need to go through re-onboarding.
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={handleDeactivate}>Confirm Deactivation</Button>
          </div>
        </div>
      </Dialog>

      {/* Add Driver Sheet */}
      <Sheet
        open={addOpen}
        onClose={() => { setAddOpen(false); setAddStep(1); setForm(emptyForm) }}
        title="Add New Driver"
        subtitle={`Step ${addStep} of 3`}
        wide
        footer={
          <div className="flex gap-2 w-full">
            {addStep > 1 && <Button variant="ghost" onClick={() => setAddStep(s => s - 1)}>Back</Button>}
            <div className="flex-1" />
            {addStep < 3 ? (
              <Button variant="primary" onClick={() => setAddStep(s => s + 1)} disabled={addStep === 1 && (!form.name || !form.phone)}>
                Continue →
              </Button>
            ) : (
              <Button variant="primary" onClick={handleAddDriver} disabled={!form.license}>
                Add Driver
              </Button>
            )}
          </div>
        }
      >
        {/* Step indicators */}
        <div className="flex gap-2 mb-6">
          {["Personal Info", "License & Docs", "Assignment"].map((label, i) => (
            <div key={label} className="flex-1">
              <div className={cn("h-1 rounded-full mb-1.5", i + 1 <= addStep ? "bg-amber-500" : "bg-white/10")} />
              <span className={cn("text-[10px]", i + 1 === addStep ? "text-amber-400" : "text-white/30")}>{label}</span>
            </div>
          ))}
        </div>

        {addStep === 1 && (
          <div className="space-y-4">
            <Input label="Full Name *" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Oluwaseun Adeyemi" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Phone Number *" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+234 800 000 0000" />
              <Input label="Email Address" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="driver@koja.ng" />
            </div>
            <Input label="Home Address" value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street, Area, City" />
            <Input label="Emergency Contact" value={form.emergencyContact} onChange={(e) => setForm(f => ({ ...f, emergencyContact: e.target.value }))} placeholder="+234 800 000 0000" />
            <Textarea label="Additional Notes" rows={2} value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any additional context..." />
          </div>
        )}

        {addStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Driver's License No. *" value={form.license} onChange={(e) => setForm(f => ({ ...f, license: e.target.value }))} placeholder="LAS-YYYY-XXXXXX" />
              <Input label="License Expiry" type="date" value={form.licenseExpiry} onChange={(e) => setForm(f => ({ ...f, licenseExpiry: e.target.value }))} />
            </div>
            <Input label="NIN (optional)" value={form.nin} onChange={(e) => setForm(f => ({ ...f, nin: e.target.value }))} placeholder="12345678901" hint="National Identification Number" />
            <div className="border border-white/8 rounded-xl p-4 space-y-3">
              <p className="text-xs font-medium text-white/60">Required Documents</p>
              {["Profile Photo", "Driver's License Copy", "Vehicle Licence"].map((doc) => (
                <div key={doc} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-sm text-white/70">{doc}</span>
                  <label className="cursor-pointer text-xs text-amber-400 hover:text-amber-300 transition-colors border border-amber-500/30 px-2.5 py-1 rounded-md">
                    Upload
                    <input type="file" className="hidden" />
                  </label>
                </div>
              ))}
              {["Background Check", "NIN Document"].map((doc) => (
                <div key={doc} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 opacity-50">
                  <span className="text-sm text-white/50">{doc} <span className="text-[10px] text-white/30">(optional)</span></span>
                  <label className="cursor-pointer text-xs text-white/30 border border-white/10 px-2.5 py-1 rounded-md">
                    Upload
                    <input type="file" className="hidden" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {addStep === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Depot" value={form.depot} onChange={(e) => setForm(f => ({ ...f, depot: e.target.value }))}>
                <option>Lagos Island</option>
                <option>Oshodi</option>
                <option>Berger</option>
                <option>Ikeja</option>
                <option>Lekki</option>
              </Select>
              <Select label="Default Shift" value={form.shift} onChange={(e) => setForm(f => ({ ...f, shift: e.target.value }))}>
                <option value="morning">Morning (06:00–12:00)</option>
                <option value="afternoon">Afternoon (12:00–18:00)</option>
                <option value="evening">Evening (18:00–00:00)</option>
              </Select>
            </div>
            <div className="bg-amber-500/8 border border-amber-500/15 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-amber-400">Summary</p>
              {[
                { label: "Name", value: form.name },
                { label: "Phone", value: form.phone },
                { label: "License", value: form.license },
                { label: "Depot", value: form.depot },
                { label: "Shift", value: form.shift },
              ].map((f) => (
                <div key={f.label} className="flex justify-between text-sm">
                  <span className="text-white/40">{f.label}</span>
                  <span className="text-white/80">{f.value || "—"}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/30">
              The driver will be added with <strong className="text-white/50">Pending</strong> status. Verify compliance documents before setting to Active.
            </p>
          </div>
        )}
      </Sheet>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default function DriversPage() {
  return (
    <Suspense>
      <DriversInner />
    </Suspense>
  )
}
