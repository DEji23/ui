"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Sheet } from "@/components/ui/sheet"
import { Dialog } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { cn, formatNGN } from "@/lib/utils"
import {
  drivers as initialDrivers, buses, dispatchPlans, leaveRequests,
  driverIncidents as initialIncidents,
  type Driver, type DriverStatus, type DriverIncident, type DriverIncidentType,
} from "@/lib/data"
import {
  Add, SearchNormal1, Star1, Call, Warning2, TickCircle, Sms, Car,
  UserAdd, Grid1, RowVertical, ArrowRight, Clock, Danger, DocumentText,
  CloseCircle,
} from "iconsax-react"

// ─── Types ───────────────────────────────────────────────────────────────────

type DriverDetailTab = "overview" | "compliance" | "assignments" | "schedule" | "performance"
const detailTabs: { key: DriverDetailTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "compliance", label: "Compliance" },
  { key: "assignments", label: "Assignments" },
  { key: "schedule", label: "Schedule" },
  { key: "performance", label: "Performance" },
]

type Toast = { id: number; message: string; type: "success" | "error" | "info" }

const statusConfig: Record<DriverStatus, { label: string; variant: "success" | "muted" | "warning" | "destructive" | "default" | "info" }> = {
  active: { label: "Active", variant: "success" },
  offline: { label: "Offline", variant: "muted" },
  late: { label: "Late", variant: "warning" },
  on_leave: { label: "On Leave", variant: "info" },
  blocked: { label: "Suspended", variant: "destructive" },
  deactivated: { label: "Deactivated", variant: "muted" },
}

const filters = ["All", "Active", "Late", "Offline", "On Leave", "Suspended", "Deactivated"] as const
type Filter = (typeof filters)[number]

const incidentTypeLabels: Record<DriverIncidentType, string> = {
  complaint: "Passenger Complaint",
  reckless_driving: "Reckless Driving",
  fraud_suspicion: "Fraud Suspicion",
  late_start: "Late Start",
  route_deviation: "Route Deviation",
  no_show: "No-Show",
  accident: "Accident",
}

const leaveTypeLabels: Record<string, string> = {
  annual: "Annual Leave",
  sick: "Sick Leave",
  emergency: "Emergency",
  personal: "Personal",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function licenseStatus(expiry?: string): "valid" | "expiring" | "expired" | "missing" {
  if (!expiry) return "missing"
  const diff = (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return "expired"
  if (diff < 60) return "expiring"
  return "valid"
}

function fmtDate(d?: string) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function CheckRow({ label, ok, note }: { label: string; ok: boolean; note?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-line-soft last:border-0">
      <span className="text-sm text-fg-muted">{label}</span>
      <div className="flex items-center gap-2">
        {note && <span className="text-[11px] text-fg-dim">{note}</span>}
        {ok
          ? <TickCircle size={14} color="#34d399" variant="Bold" />
          : <CloseCircle size={14} color="#f87171" variant="Bold" />}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DriversPage() {
  const [filter, setFilter] = useState<Filter>("All")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Driver | null>(null)
  const [driverList, setDriverList] = useState<Driver[]>(initialDrivers)
  const [driverStates, setDriverStates] = useState<Record<string, DriverStatus>>(() =>
    Object.fromEntries(initialDrivers.map((d) => [d.id, d.status]))
  )
  const [view, setView] = useState<"grid" | "table">("grid")
  const [toasts, setToasts] = useState<Toast[]>([])

  // Detail sheet
  const [detailTab, setDetailTab] = useState<DriverDetailTab>("overview")

  // Add driver wizard
  const [addOpen, setAddOpen] = useState(false)
  const [addStep, setAddStep] = useState(1)
  const [addSuccess, setAddSuccess] = useState(false)
  const [newCode, setNewCode] = useState("")
  const [newName, setNewName] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newAddress, setNewAddress] = useState("")
  const [newLicense, setNewLicense] = useState("")
  const [newLicenseExpiry, setNewLicenseExpiry] = useState("")
  const [newNextOfKin, setNewNextOfKin] = useState("")

  // Status change dialog
  const [statusChangeOpen, setStatusChangeOpen] = useState(false)
  const [statusChangeTarget, setStatusChangeTarget] = useState<Driver | null>(null)
  const [newStatus, setNewStatus] = useState<DriverStatus>("offline")
  const [suspendReason, setSuspendReason] = useState("")
  const [suspendDuration, setSuspendDuration] = useState("24h")
  const [deactivateReason, setDeactivateReason] = useState("")
  const [deactivateNotes, setDeactivateNotes] = useState("")

  // Log incident dialog
  const [logIncidentOpen, setLogIncidentOpen] = useState(false)
  const [incidentTarget, setIncidentTarget] = useState<Driver | null>(null)
  const [incidentType, setIncidentType] = useState<DriverIncidentType>("complaint")
  const [incidentDesc, setIncidentDesc] = useState("")
  const [incidentDate, setIncidentDate] = useState("")
  const [incidentSeverity, setIncidentSeverity] = useState<"critical" | "warning" | "info">("warning")
  const [incidentList, setIncidentList] = useState<DriverIncident[]>(initialIncidents)

  // Assign bus
  const [assignBusId, setAssignBusId] = useState("")
  const [assignType, setAssignType] = useState("primary")

  const didAutoOpen = useRef(false)
  useEffect(() => {
    if (didAutoOpen.current) return
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("add") === "1") {
      didAutoOpen.current = true
      openAddDriver()
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function addToast(message: string, type: Toast["type"] = "success") {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }

  function openAddDriver() {
    setAddOpen(true)
    setAddStep(1)
    setAddSuccess(false)
    setNewCode("")
    setNewName("")
    setNewPhone("")
    setNewAddress("")
    setNewLicense("")
    setNewLicenseExpiry("")
    setNewNextOfKin("")
  }

  function handleAddDriver() {
    if (!newName.trim() || !newPhone.trim() || !newLicense.trim() || !newLicenseExpiry) return
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
      verificationStatus: "pending",
      licenseNumber: newLicense.trim(),
      licenseExpiry: newLicenseExpiry,
      address: newAddress.trim() || undefined,
      nextOfKin: newNextOfKin.trim() || undefined,
      joinDate: new Date().toISOString().split("T")[0],
    }
    setDriverList((dl) => [...dl, newDriver])
    setDriverStates((s) => ({ ...s, [id]: "offline" }))
    setNewCode(code)
    setAddSuccess(true)
  }

  function openStatusChange(driver: Driver) {
    setStatusChangeTarget(driver)
    setNewStatus(driver.status)
    setSuspendReason("")
    setSuspendDuration("24h")
    setDeactivateReason("")
    setDeactivateNotes("")
    setStatusChangeOpen(true)
  }

  function handleStatusChange() {
    if (!statusChangeTarget) return
    setDriverStates((s) => ({ ...s, [statusChangeTarget.id]: newStatus }))
    if (newStatus === "blocked") {
      addToast(`${statusChangeTarget.name} suspended (${suspendDuration})`, "error")
    } else if (newStatus === "deactivated") {
      addToast(`${statusChangeTarget.name} deactivated`, "error")
    } else {
      addToast(`${statusChangeTarget.name} status updated to ${statusConfig[newStatus].label}`, "info")
    }
    setStatusChangeOpen(false)
    setStatusChangeTarget(null)
    setSelected(null)
  }

  function handleMarkVerified(driver: Driver) {
    setDriverList((dl) =>
      dl.map((d) => d.id === driver.id ? { ...d, verificationStatus: "verified" as const } : d)
    )
    addToast(`${driver.name} marked as verified`)
  }

  function handleAssignBus() {
    if (!selected || !assignBusId) return
    const bus = buses.find((b) => b.id === assignBusId)
    if (!bus) return
    setDriverList((dl) =>
      dl.map((d) => d.id === selected.id ? { ...d, bus: bus.code, route: bus.route } : d)
    )
    setAssignBusId("")
    addToast(`${selected.name} assigned to ${bus.code}`)
  }

  function handleRemoveAssignment() {
    if (!selected) return
    setDriverList((dl) =>
      dl.map((d) => d.id === selected.id ? { ...d, bus: undefined, route: undefined } : d)
    )
    addToast(`${selected.name} unassigned from bus`, "info")
  }

  function handleLogIncident() {
    if (!incidentTarget || !incidentDesc.trim()) return
    const incident: DriverIncident = {
      id: `di${Date.now()}`,
      driverId: incidentTarget.id,
      driverCode: incidentTarget.code,
      type: incidentType,
      description: incidentDesc.trim(),
      date: incidentDate || new Date().toISOString().split("T")[0],
      severity: incidentSeverity,
      status: "open",
    }
    setIncidentList((il) => [incident, ...il])
    setLogIncidentOpen(false)
    setIncidentDesc("")
    setIncidentDate("")
    addToast(`Incident logged for ${incidentTarget.name}`)
  }

  // ─── Derived state ──────────────────────────────────────────────────────────

  const mergedDrivers = driverList.map((d) => ({ ...d, status: driverStates[d.id] ?? d.status }))

  const filtered = mergedDrivers.filter((d) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Active" && d.status === "active") ||
      (filter === "Late" && d.status === "late") ||
      (filter === "Offline" && d.status === "offline") ||
      (filter === "On Leave" && d.status === "on_leave") ||
      (filter === "Suspended" && d.status === "blocked") ||
      (filter === "Deactivated" && d.status === "deactivated")
    const matchesSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const selectedDriver = selected ? mergedDrivers.find((d) => d.id === selected.id) ?? selected : null
  const activeCount = mergedDrivers.filter((d) => d.status === "active").length
  const availableBuses = buses.filter((b) => b.status === "available")

  // ─── JSX ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Header
        title="Drivers"
        subtitle={`${activeCount} of ${driverList.length} on shift`}
        action={
          <Button size="sm" className="gap-1.5 mr-1" onClick={openAddDriver}>
            <Add size={14} color="currentColor" />
            Add Driver
          </Button>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-5">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <SearchNormal1 size={14} color="var(--fg-dim)" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input placeholder="Search name or code…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                  filter === f
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "text-fg-muted hover:bg-[var(--hover-bg)] hover:text-fg border-transparent"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-lg border border-line-soft p-1">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                view === "grid" ? "bg-[var(--hover-bg)] text-fg" : "text-fg-dim hover:text-fg-muted"
              )}
              title="Grid view"
            >
              <Grid1 size={14} color="currentColor" />
            </button>
            <button
              onClick={() => setView("table")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                view === "table" ? "bg-[var(--hover-bg)] text-fg" : "text-fg-dim hover:text-fg-muted"
              )}
              title="Table view"
            >
              <RowVertical size={14} color="currentColor" />
            </button>
          </div>
        </div>

        {/* Grid view */}
        {view === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((driver) => {
              const sc = statusConfig[driver.status]
              const weekFill = (driver.hoursThisWeek / 60) * 100
              return (
                <Card
                  key={driver.id}
                  className="hover:border-amber-500/20 transition-colors cursor-pointer"
                  onClick={() => { setSelected(driver); setDetailTab("overview") }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={driver.name} size="lg" />
                        <div>
                          <p className="text-sm font-semibold text-fg">{driver.name}</p>
                          <p className="text-xs text-fg-muted">{driver.code}</p>
                        </div>
                      </div>
                      <Badge variant={sc.variant}>{sc.label}</Badge>
                    </div>

                    {driver.route && (
                      <div className="mb-3 rounded-lg bg-[var(--subtle-bg)] border border-line-soft px-3 py-2">
                        <p className="text-[10px] text-fg-dim uppercase tracking-wider mb-0.5">Current Route</p>
                        <p className="text-xs font-medium text-fg">{driver.route}</p>
                        {driver.bus && <p className="text-[11px] text-fg-dim mt-0.5">{driver.bus}</p>}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="rounded-lg bg-[var(--subtle-bg)] border border-line-soft p-2 text-center">
                        <p className="text-base font-bold text-fg">{driver.tripsToday}</p>
                        <p className="text-[10px] text-fg-dim">Trips</p>
                      </div>
                      <div className="rounded-lg bg-[var(--subtle-bg)] border border-line-soft p-2 text-center">
                        <p className="text-sm font-bold text-fg">{formatNGN(driver.earningsToday)}</p>
                        <p className="text-[10px] text-fg-dim">Earned</p>
                      </div>
                      <div className="rounded-lg bg-[var(--subtle-bg)] border border-line-soft p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star1 size={12} color="#f59e0b" variant="Bold" />
                          <p className="text-base font-bold text-fg">{driver.rating}</p>
                        </div>
                        <p className="text-[10px] text-fg-dim">Rating</p>
                      </div>
                    </div>

                    {driver.hoursThisWeek > 0 && (
                      <div>
                        <div className="flex justify-between mb-1">
                          <p className="text-[10px] text-fg-dim uppercase tracking-wider">Hours This Week</p>
                          <p className="text-[11px] text-fg-muted">{driver.hoursThisWeek}h / 60h</p>
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
        )}

        {/* Table view */}
        {view === "table" && (
          <div className="rounded-xl border border-line-soft overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft bg-[var(--subtle-bg)]">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Driver</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Route / Bus</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Trips</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Earned</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Rating</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider w-40">Hours / Week</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {filtered.map((driver) => {
                  const sc = statusConfig[driver.status]
                  const weekFill = (driver.hoursThisWeek / 60) * 100
                  return (
                    <tr
                      key={driver.id}
                      className="hover:bg-[var(--hover-bg)] transition-colors cursor-pointer group"
                      onClick={() => { setSelected(driver); setDetailTab("overview") }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={driver.name} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-fg group-hover:text-fg transition-colors">{driver.name}</p>
                            <p className="text-[11px] text-fg-dim">{driver.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {driver.route ? (
                          <div>
                            <p className="text-xs text-fg">{driver.route}</p>
                            {driver.bus && <p className="text-[11px] text-fg-dim">{driver.bus}</p>}
                          </div>
                        ) : (
                          <span className="text-xs text-fg-dim">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-fg">{driver.tripsToday}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-fg">{formatNGN(driver.earningsToday)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star1 size={11} color="#f59e0b" variant="Bold" />
                          <span className="text-sm font-medium text-fg">{driver.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={weekFill}
                            colorClass={weekFill > 83 ? "bg-red-500" : weekFill > 67 ? "bg-yellow-500" : "bg-amber-500"}
                          />
                          <span className="text-[11px] text-fg-dim whitespace-nowrap">{driver.hoursThisWeek}h</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-fg-dim">
            <p className="text-sm">No drivers match your filter</p>
          </div>
        )}
      </main>

      {/* ─── Add Driver Sheet ──────────────────────────────────────────────── */}
      <Sheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Driver"
        subtitle={addSuccess ? "Driver registered" : `Step ${addStep} of 3`}
        footer={
          addSuccess ? (
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Close</Button>
          ) : addStep === 1 ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button
                size="sm"
                className="ml-auto"
                onClick={() => setAddStep(2)}
                disabled={!newName.trim() || !newPhone.trim()}
              >
                Next →
              </Button>
            </>
          ) : addStep === 2 ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setAddStep(1)}>Back</Button>
              <Button
                size="sm"
                className="ml-auto"
                onClick={() => setAddStep(3)}
                disabled={!newLicense.trim() || !newLicenseExpiry}
              >
                Next →
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setAddStep(2)}>Back</Button>
              <Button size="sm" className="ml-auto gap-1.5" onClick={handleAddDriver}>
                <UserAdd size={14} color="currentColor" />
                Add Driver
              </Button>
            </>
          )
        }
      >
        <div className="px-6 py-5">
          {/* Progress bar */}
          {!addSuccess && (
            <div className="flex gap-1 mb-6">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    s <= addStep ? "bg-amber-500" : "bg-[var(--subtle-bg)]"
                  )}
                />
              ))}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {!addSuccess && addStep === 1 && (
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Personal Details</p>
              <div>
                <label className="block text-xs text-fg-muted mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="e.g. Emeka Okafor"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1.5">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="e.g. 0801 234 5678"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1.5">
                  Address <span className="text-fg-dim">(optional)</span>
                </label>
                <Input
                  placeholder="e.g. 12 Allen Avenue, Ikeja, Lagos"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                />
              </div>
              <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-4">
                <p className="text-[11px] text-fg-dim">
                  Driver code will be auto-assigned. The driver starts with{" "}
                  <span className="text-fg-muted">Pending Verification</span> status until their documents are reviewed.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: License & Docs */}
          {!addSuccess && addStep === 2 && (
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider">License & Documentation</p>
              <div>
                <label className="block text-xs text-fg-muted mb-1.5">
                  Driver License Number <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="e.g. FED-2020-001234"
                  value={newLicense}
                  onChange={(e) => setNewLicense(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1.5">
                  License Expiry Date <span className="text-red-400">*</span>
                </label>
                <Input
                  type="date"
                  value={newLicenseExpiry}
                  onChange={(e) => setNewLicenseExpiry(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1.5">
                  Next of Kin <span className="text-fg-dim">(optional)</span>
                </label>
                <Input
                  placeholder="Full name of emergency contact"
                  value={newNextOfKin}
                  onChange={(e) => setNewNextOfKin(e.target.value)}
                />
              </div>
              <div className="rounded-xl bg-amber-500/[0.04] border border-amber-500/20 p-4">
                <p className="text-[11px] text-amber-400">
                  The driver will be set to <strong>Pending Verification</strong> until you manually verify their documents in the Compliance tab.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {!addSuccess && addStep === 3 && (
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Review Details</p>
              <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft divide-y divide-line-soft">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-fg-muted">Full Name</span>
                  <span className="text-sm font-medium text-fg">{newName}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-fg-muted">Phone</span>
                  <span className="text-sm font-medium text-fg">{newPhone}</span>
                </div>
                {newAddress && (
                  <div className="flex items-center justify-between px-4 py-3 gap-4">
                    <span className="text-xs text-fg-muted shrink-0">Address</span>
                    <span className="text-sm font-medium text-fg text-right">{newAddress}</span>
                  </div>
                )}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-fg-muted">License No.</span>
                  <span className="text-sm font-medium text-fg">{newLicense}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-fg-muted">License Expiry</span>
                  <span className="text-sm font-medium text-fg">{fmtDate(newLicenseExpiry)}</span>
                </div>
                {newNextOfKin && (
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-fg-muted">Next of Kin</span>
                    <span className="text-sm font-medium text-fg">{newNextOfKin}</span>
                  </div>
                )}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-fg-muted">Assigned Code</span>
                  <span className="text-sm font-semibold text-amber-400">
                    KJA-0{String(driverList.length + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-fg-muted">Initial Status</span>
                  <span className="text-sm text-fg-muted">Pending Verification</span>
                </div>
              </div>
            </div>
          )}

          {/* Success */}
          {addSuccess && (
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center py-4">
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                  <TickCircle size={28} color="#34d399" variant="Bold" />
                </div>
                <p className="text-base font-semibold text-fg">{newName} has been registered</p>
                <p className="text-sm text-fg-muted mt-1">What would you like to do next?</p>
              </div>
              <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-4 text-center">
                <p className="text-[10px] text-fg-dim uppercase tracking-wider mb-1">Driver Code</p>
                <p className="font-mono text-lg font-bold text-amber-400">{newCode}</p>
                <p className="text-[11px] text-fg-dim mt-1">Status: Pending Verification</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={openAddDriver}
                  className="rounded-xl border border-line-soft bg-[var(--subtle-bg)] py-3 px-4 text-left hover:bg-[var(--hover-bg)] transition-colors"
                >
                  <p className="text-xs font-medium text-fg">Add Another</p>
                  <p className="text-[11px] text-fg-dim mt-0.5">Register another driver</p>
                </button>
                <button
                  onClick={() => setAddOpen(false)}
                  className="rounded-xl border border-line-soft bg-[var(--subtle-bg)] py-3 px-4 text-left hover:bg-[var(--hover-bg)] transition-colors"
                >
                  <p className="text-xs font-medium text-fg">Done</p>
                  <p className="text-[11px] text-fg-dim mt-0.5">Back to Drivers list</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </Sheet>

      {/* ─── Driver Detail Sheet ───────────────────────────────────────────── */}
      <Sheet
        open={!!selectedDriver}
        onClose={() => setSelected(null)}
        title={selectedDriver?.name ?? ""}
        subtitle={selectedDriver ? `${selectedDriver.code} · ${statusConfig[selectedDriver.status].label}` : ""}
        footer={
          selectedDriver ? (
            <>
              {selectedDriver.status !== "deactivated" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => addToast(`Calling ${selectedDriver.phone}…`, "info")}
                >
                  <Call size={14} color="currentColor" />
                  Call Driver
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="ml-auto gap-1.5"
                onClick={() => openStatusChange(selectedDriver)}
              >
                Change Status
              </Button>
            </>
          ) : undefined
        }
      >
        {selectedDriver && (
          <div className="flex flex-col h-full">
            {/* Tab bar */}
            <div className="flex gap-1 border-b border-line-soft px-6 pt-2 shrink-0">
              {detailTabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setDetailTab(t.key)}
                  className={cn(
                    "px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px",
                    detailTab === t.key
                      ? "border-amber-500 text-amber-400"
                      : "border-transparent text-fg-muted hover:text-fg"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Overview ── */}
            {detailTab === "overview" && (
              <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
                {/* Identity header */}
                <div className="flex items-center gap-4">
                  <Avatar name={selectedDriver.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-fg">{selectedDriver.name}</p>
                    <p className="text-sm text-fg-muted">{selectedDriver.code}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Sms size={12} color="var(--fg-dim)" variant="Linear" />
                      <p className="text-xs text-fg-muted">{selectedDriver.phone}</p>
                    </div>
                    {selectedDriver.joinDate && (
                      <p className="text-[11px] text-fg-dim mt-0.5">Joined {fmtDate(selectedDriver.joinDate)}</p>
                    )}
                  </div>
                  <Badge variant={statusConfig[selectedDriver.status].variant}>
                    {statusConfig[selectedDriver.status].label}
                  </Badge>
                </div>

                <Separator />

                {/* Current assignment */}
                {selectedDriver.route ? (
                  <div>
                    <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider mb-3">Current Assignment</p>
                    <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Car size={14} color="#f59e0b" variant="Bold" />
                        <span className="text-sm text-fg">{selectedDriver.bus}</span>
                      </div>
                      <p className="text-sm font-medium text-fg">{selectedDriver.route}</p>
                      {selectedDriver.shiftStart && (
                        <p className="text-xs text-fg-muted">Shift started {selectedDriver.shiftStart}</p>
                      )}
                      {selectedDriver.currentPassengers !== undefined && (
                        <p className="text-[11px] text-fg-dim">{selectedDriver.currentPassengers} passengers onboard</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-4 text-center text-fg-dim text-sm">
                    No active assignment
                  </div>
                )}

                {/* Today's performance */}
                <div>
                  <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider mb-3">Today's Performance</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-3 text-center">
                      <p className="text-xl font-bold text-fg">{selectedDriver.tripsToday}</p>
                      <p className="text-[11px] text-fg-muted mt-0.5">Trips</p>
                    </div>
                    <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-3 text-center">
                      <p className="text-base font-bold text-emerald-400">{formatNGN(selectedDriver.earningsToday)}</p>
                      <p className="text-[11px] text-fg-muted mt-0.5">Earned</p>
                    </div>
                    <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star1 size={14} color="#f59e0b" variant="Bold" />
                        <p className="text-xl font-bold text-fg">{selectedDriver.rating}</p>
                      </div>
                      <p className="text-[11px] text-fg-muted mt-0.5">Rating</p>
                    </div>
                  </div>
                </div>

                {/* Address / next of kin */}
                {(selectedDriver.address || selectedDriver.nextOfKin) && (
                  <div>
                    <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider mb-3">Contact & Personal</p>
                    <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft divide-y divide-line-soft">
                      {selectedDriver.address && (
                        <div className="flex justify-between items-start px-4 py-3 gap-4">
                          <span className="text-xs text-fg-muted shrink-0">Address</span>
                          <span className="text-xs text-fg text-right">{selectedDriver.address}</span>
                        </div>
                      )}
                      {selectedDriver.nextOfKin && (
                        <div className="flex justify-between px-4 py-3">
                          <span className="text-xs text-fg-muted">Next of Kin</span>
                          <span className="text-xs text-fg">{selectedDriver.nextOfKin}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Compliance ── */}
            {detailTab === "compliance" && (
              <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
                {/* Verification checklist */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Verification</p>
                    <Badge variant={
                      selectedDriver.verificationStatus === "verified" ? "success" :
                      selectedDriver.verificationStatus === "rejected" ? "destructive" : "warning"
                    }>
                      {selectedDriver.verificationStatus === "verified" ? "Verified"
                        : selectedDriver.verificationStatus === "rejected" ? "Rejected"
                        : "Pending"}
                    </Badge>
                  </div>
                  <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft px-4">
                    <CheckRow label="Phone on file" ok={!!selectedDriver.phone} />
                    <CheckRow
                      label="License on file"
                      ok={!!selectedDriver.licenseNumber}
                      note={selectedDriver.licenseNumber ?? undefined}
                    />
                    <CheckRow
                      label="License validity"
                      ok={licenseStatus(selectedDriver.licenseExpiry) === "valid" || licenseStatus(selectedDriver.licenseExpiry) === "expiring"}
                      note={
                        licenseStatus(selectedDriver.licenseExpiry) === "expired" ? `Expired ${fmtDate(selectedDriver.licenseExpiry)}` :
                        licenseStatus(selectedDriver.licenseExpiry) === "expiring" ? `Expiring ${fmtDate(selectedDriver.licenseExpiry)}` :
                        licenseStatus(selectedDriver.licenseExpiry) === "valid" ? `Valid until ${fmtDate(selectedDriver.licenseExpiry)}` :
                        "Not provided"
                      }
                    />
                    <CheckRow
                      label="Next of kin on file"
                      ok={!!selectedDriver.nextOfKin}
                      note={selectedDriver.nextOfKin ? "On file" : undefined}
                    />
                  </div>
                  {selectedDriver.verificationStatus === "pending" && (
                    <Button
                      size="sm"
                      className="mt-3 gap-1.5"
                      onClick={() => handleMarkVerified(selectedDriver)}
                    >
                      <TickCircle size={14} color="currentColor" />
                      Mark as Verified
                    </Button>
                  )}
                  {selectedDriver.verificationStatus === "rejected" && (
                    <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/[0.04] p-3">
                      <p className="text-xs text-red-400 font-medium">Verification rejected</p>
                      <p className="text-[11px] text-fg-muted mt-1">Driver cannot be dispatched until re-verified.</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Hours compliance */}
                <div>
                  <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider mb-3">Hours Compliance</p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-fg-muted">Hours this week</span>
                        <span className={cn("font-medium", selectedDriver.hoursThisWeek > 50 ? "text-red-400" : "text-fg")}>
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
                        <p className="text-[11px] text-red-400 mt-1">Approaching weekly hour limit (60h max)</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-[var(--subtle-bg)] border border-line-soft px-3 py-2.5">
                      <span className="text-xs text-fg-muted">Compliance status</span>
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

                <Separator />

                {/* Leave requests */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Leave Requests</p>
                    <Link href="/leave" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                      Manage in Leave module →
                    </Link>
                  </div>
                  {(() => {
                    const driverLeaves = leaveRequests.filter((l) => l.driverCode === selectedDriver.code).slice(0, 3)
                    if (driverLeaves.length === 0) {
                      return (
                        <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-4 text-center">
                          <p className="text-xs text-fg-dim">No leave requests</p>
                        </div>
                      )
                    }
                    return (
                      <div className="space-y-2">
                        {driverLeaves.map((l) => (
                          <div key={l.id} className="flex items-center justify-between rounded-lg bg-[var(--subtle-bg)] border border-line-soft px-3 py-2.5">
                            <div>
                              <p className="text-xs font-medium text-fg">{leaveTypeLabels[l.type] ?? l.type}</p>
                              <p className="text-[11px] text-fg-dim mt-0.5">{fmtDate(l.from)} – {fmtDate(l.to)}</p>
                            </div>
                            <Badge variant={
                              l.status === "approved" ? "success" :
                              l.status === "pending" ? "warning" :
                              l.status === "declined" ? "destructive" : "muted"
                            }>
                              {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* ── Assignments ── */}
            {detailTab === "assignments" && (
              <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
                {/* Current assignment */}
                <div>
                  <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider mb-3">Current Assignment</p>
                  {selectedDriver.bus ? (
                    <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-fg">{selectedDriver.bus}</p>
                          <p className="text-xs text-fg-muted mt-0.5">{selectedDriver.route ?? "No route assigned"}</p>
                        </div>
                        <Badge variant="success">Active</Badge>
                      </div>
                      {selectedDriver.shiftStart && (
                        <p className="text-[11px] text-fg-dim">Shift started at {selectedDriver.shiftStart}</p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={handleRemoveAssignment}
                      >
                        Remove Assignment
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-4 text-center">
                      <p className="text-sm text-fg-dim mb-1">No active bus assignment</p>
                      <p className="text-[11px] text-fg-dim">Assign this driver to a bus below</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Assign to bus */}
                <div>
                  <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider mb-3">Assign to Bus</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-fg-muted mb-1.5">Select Bus</label>
                      <Select
                        value={assignBusId}
                        onChange={(e) => setAssignBusId(e.target.value)}
                      >
                        <option value="">— Choose available bus —</option>
                        {availableBuses.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.code} · {b.model} · {b.capacity} seats
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs text-fg-muted mb-1.5">Assignment Type</label>
                      <Select value={assignType} onChange={(e) => setAssignType(e.target.value)}>
                        <option value="primary">Primary Driver</option>
                        <option value="backup">Backup Driver</option>
                        <option value="temporary">Temporary Driver</option>
                      </Select>
                    </div>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      disabled={!assignBusId}
                      onClick={handleAssignBus}
                    >
                      <Car size={14} color="currentColor" />
                      Assign Driver
                    </Button>
                  </div>
                  {availableBuses.length === 0 && (
                    <p className="text-[11px] text-fg-dim mt-2">No available buses right now. Check the Fleet module.</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Schedule ── */}
            {detailTab === "schedule" && (
              <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Dispatch Plans</p>
                  <Link href="/dispatch" className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
                    Go to Dispatch
                    <ArrowRight size={12} color="currentColor" variant="Linear" />
                  </Link>
                </div>
                {(() => {
                  const plans = dispatchPlans.filter((p) => p.driver === selectedDriver.name)
                  if (plans.length === 0) {
                    return (
                      <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-8 text-center">
                        <Clock size={24} color="var(--fg-dim)" variant="Linear" className="mx-auto mb-3" />
                        <p className="text-sm text-fg-muted">No shifts scheduled</p>
                        <p className="text-[11px] text-fg-dim mt-1">Create a schedule in the Dispatch module</p>
                      </div>
                    )
                  }
                  const planStatusConfig: Record<string, { label: string; variant: "success" | "muted" | "destructive" | "default" }> = {
                    active: { label: "Active", variant: "success" },
                    completed: { label: "Completed", variant: "muted" },
                    no_show: { label: "No Show", variant: "destructive" },
                    pending: { label: "Pending", variant: "default" },
                  }
                  return (
                    <div className="space-y-2">
                      {plans.map((plan) => {
                        const pc = planStatusConfig[plan.status] ?? { label: plan.status, variant: "muted" as const }
                        return (
                          <div key={plan.id} className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-sm font-medium text-fg">{plan.route}</p>
                                <p className="text-[11px] text-fg-dim mt-0.5">{plan.bus} · Dep. {plan.departure}</p>
                              </div>
                              <Badge variant={pc.variant}>{pc.label}</Badge>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-fg-muted">
                              <span>{plan.trips} trip{plan.trips !== 1 ? "s" : ""} scheduled</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            )}

            {/* ── Performance & Incidents ── */}
            {detailTab === "performance" && (
              <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
                {/* Stats */}
                <div>
                  <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider mb-3">Performance Summary</p>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-3 text-center">
                      <p className="text-xl font-bold text-fg">{selectedDriver.tripsToday}</p>
                      <p className="text-[11px] text-fg-muted mt-0.5">Trips Today</p>
                    </div>
                    <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-3 text-center">
                      <p className="text-base font-bold text-emerald-400">{formatNGN(selectedDriver.earningsToday)}</p>
                      <p className="text-[11px] text-fg-muted mt-0.5">Earned Today</p>
                    </div>
                    <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star1 size={14} color="#f59e0b" variant="Bold" />
                        <p className="text-xl font-bold text-fg">{selectedDriver.rating}</p>
                      </div>
                      <p className="text-[11px] text-fg-muted mt-0.5">Rating</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-[var(--subtle-bg)] border border-line-soft px-3 py-2.5 flex items-center justify-between">
                    <span className="text-xs text-fg-muted">Weekly hours</span>
                    <span className={cn("text-xs font-medium", selectedDriver.hoursThisWeek > 50 ? "text-red-400" : "text-fg")}>
                      {selectedDriver.hoursThisWeek}h / 60h
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Incidents */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Incident Log</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        setIncidentTarget(selectedDriver)
                        setIncidentType("complaint")
                        setIncidentDesc("")
                        setIncidentDate("")
                        setIncidentSeverity("warning")
                        setLogIncidentOpen(true)
                      }}
                    >
                      <Warning2 size={12} color="currentColor" />
                      Log Incident
                    </Button>
                  </div>
                  {(() => {
                    const driverInc = incidentList.filter((i) => i.driverId === selectedDriver.id)
                    if (driverInc.length === 0) {
                      return (
                        <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-6 text-center">
                          <p className="text-xs text-fg-dim">No incidents recorded</p>
                        </div>
                      )
                    }
                    return (
                      <div className="space-y-2">
                        {driverInc.map((inc) => (
                          <div
                            key={inc.id}
                            className={cn(
                              "rounded-lg border p-3",
                              inc.severity === "critical" ? "bg-red-500/[0.06] border-red-500/20" :
                              inc.severity === "warning" ? "bg-amber-500/[0.06] border-amber-500/20" :
                              "bg-blue-500/[0.06] border-blue-500/20"
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <div className="mt-0.5">
                                {inc.severity === "critical"
                                  ? <Danger size={13} color="#f87171" variant="Bold" />
                                  : inc.severity === "warning"
                                  ? <Warning2 size={13} color="#fbbf24" variant="Bold" />
                                  : <DocumentText size={13} color="#60a5fa" variant="Bold" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={cn(
                                    "text-xs font-semibold",
                                    inc.severity === "critical" ? "text-red-400" :
                                    inc.severity === "warning" ? "text-amber-400" : "text-blue-400"
                                  )}>
                                    {incidentTypeLabels[inc.type]}
                                  </p>
                                  <span className="text-[10px] text-fg-dim shrink-0">{fmtDate(inc.date)}</span>
                                </div>
                                <p className="text-[11px] text-fg-muted mt-1 leading-snug">{inc.description}</p>
                                <p className={cn(
                                  "text-[10px] font-medium mt-1",
                                  inc.status === "open" ? "text-amber-400" :
                                  inc.status === "resolved" ? "text-emerald-400" : "text-fg-dim"
                                )}>
                                  {inc.status.charAt(0).toUpperCase() + inc.status.slice(1)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </Sheet>

      {/* ─── Status Change Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={statusChangeOpen}
        onClose={() => setStatusChangeOpen(false)}
        title="Change Driver Status"
        description={statusChangeTarget ? `Update operational status for ${statusChangeTarget.name}` : ""}
      >
        <div className="space-y-4 mt-1">
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">New Status</label>
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value as DriverStatus)}>
              <option value="active">Active</option>
              <option value="offline">Offline</option>
              <option value="on_leave">On Leave</option>
              <option value="blocked">Suspended</option>
              <option value="deactivated">Deactivated</option>
            </Select>
          </div>

          {newStatus === "blocked" && (
            <>
              <div>
                <label className="block text-xs text-fg-muted mb-1.5">Suspension Duration</label>
                <Select value={suspendDuration} onChange={(e) => setSuspendDuration(e.target.value)}>
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="permanent">Permanent</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1.5">
                  Reason <span className="text-fg-dim">(optional)</span>
                </label>
                <Textarea
                  placeholder="Describe the reason for suspension…"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="min-h-[70px]"
                />
              </div>
            </>
          )}

          {newStatus === "on_leave" && (
            <div className="rounded-lg bg-blue-500/[0.06] border border-blue-500/20 p-3">
              <p className="text-xs text-blue-400 font-medium">Leave managed in the Leave module</p>
              <p className="text-[11px] text-fg-muted mt-1">
                For proper tracking, manage leave requests in the{" "}
                <Link href="/leave" className="text-amber-400 hover:underline" onClick={() => setStatusChangeOpen(false)}>
                  Leave module →
                </Link>
              </p>
            </div>
          )}

          {newStatus === "deactivated" && (
            <>
              <div>
                <label className="block text-xs text-fg-muted mb-1.5">Reason for Deactivation</label>
                <Select value={deactivateReason} onChange={(e) => setDeactivateReason(e.target.value)}>
                  <option value="">— Select reason —</option>
                  <option value="resigned">Resigned</option>
                  <option value="terminated">Terminated</option>
                  <option value="fraud">Fraud</option>
                  <option value="license_expired">License Expired</option>
                  <option value="performance">Performance Issues</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1.5">
                  Notes <span className="text-fg-dim">(optional)</span>
                </label>
                <Textarea
                  placeholder="Additional notes…"
                  value={deactivateNotes}
                  onChange={(e) => setDeactivateNotes(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
              <div className="rounded-lg border border-red-500/20 bg-red-500/[0.04] p-3">
                <p className="text-xs text-red-400 font-medium">This will deactivate the driver account</p>
                <p className="text-[11px] text-fg-muted mt-1">
                  The driver will be removed from all active schedules and will not be able to log in. Trip history is preserved.
                </p>
              </div>
            </>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" size="sm" onClick={() => setStatusChangeOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              variant={newStatus === "blocked" || newStatus === "deactivated" ? "destructive" : "default"}
              onClick={handleStatusChange}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ─── Log Incident Dialog ───────────────────────────────────────────── */}
      <Dialog
        open={logIncidentOpen}
        onClose={() => setLogIncidentOpen(false)}
        title="Log Incident"
        description={incidentTarget ? incidentTarget.name : ""}
      >
        <div className="space-y-4 mt-1">
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Incident Type</label>
            <Select value={incidentType} onChange={(e) => setIncidentType(e.target.value as DriverIncidentType)}>
              {(Object.entries(incidentTypeLabels) as [DriverIncidentType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">
              Description <span className="text-red-400">*</span>
            </label>
            <Textarea
              placeholder="Describe what happened…"
              value={incidentDesc}
              onChange={(e) => setIncidentDesc(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">Date</label>
              <Input type="date" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">Severity</label>
              <Select value={incidentSeverity} onChange={(e) => setIncidentSeverity(e.target.value as "critical" | "warning" | "info")}>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
                <option value="info">Info</option>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" size="sm" onClick={() => setLogIncidentOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              disabled={!incidentDesc.trim()}
              onClick={handleLogIncident}
            >
              Log Incident
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ─── Toasts ────────────────────────────────────────────────────────── */}
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
