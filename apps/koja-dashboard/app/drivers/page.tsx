"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectOption } from "@/components/ui/select"
import { Sheet } from "@/components/ui/sheet"
import { Dialog } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { cn, formatNGN } from "@/lib/utils"
import { drivers as initialDrivers, buses, type Driver, type DriverStatus, type VerificationStatus } from "@/lib/data"
import {
  Add, SearchNormal1, Star1, Call, Slash, Warning2, TickCircle, CloseCircle,
  Sms, Car, UserAdd, Grid1, RowVertical, ShieldTick, Calendar, Danger, People
} from "iconsax-react"

const statusConfig: Record<DriverStatus, { label: string; variant: "success" | "muted" | "warning" | "destructive" | "default" | "info" }> = {
  active:   { label: "Active",               variant: "success" },
  offline:  { label: "Offline",              variant: "muted" },
  late:     { label: "Late",                 variant: "warning" },
  on_leave: { label: "On Leave",             variant: "info" },
  blocked:  { label: "Suspended",            variant: "destructive" },
  pending:  { label: "Pending Verification", variant: "default" },
}

const filters = ["All", "Active", "Pending", "Late", "Offline", "On Leave", "Suspended"] as const
type Filter = (typeof filters)[number]

type Toast = { id: number; message: string; type: "success" | "error" | "info" }

type VerifData = {
  photoUploaded: boolean
  phoneVerified: boolean
  ninVerified: boolean
  licenseVerified: boolean
  licenseValid: boolean
  backgroundCheck: boolean
  agreementSigned: boolean
}

type Incident = { id: string; type: string; date: string; severity: "warning" | "critical"; resolved: boolean; notes: string }

function getDriverIncidents(driver: Driver): Incident[] {
  if (driver.id === "d3") {
    return [{ id: "i-d3-1", type: "Late Start", date: "2026-05-25", severity: "warning", resolved: false, notes: "Failed to accept shift on time (38 min late)" }]
  }
  if (driver.id === "d8") {
    return [
      { id: "i-d8-1", type: "Fraud Suspicion", date: "2026-05-20", severity: "critical", resolved: false, notes: "Under-declared cash — ₦8,500 discrepancy flagged by reconciliation" },
      { id: "i-d8-2", type: "Route Deviation", date: "2026-05-14", severity: "warning", resolved: true, notes: "Took unapproved diversion on Apapa route" },
      { id: "i-d8-3", type: "Passenger Complaint", date: "2026-05-08", severity: "warning", resolved: true, notes: "Rude behaviour reported by two commuters" },
    ]
  }
  return []
}

function CheckItem({ checked, label, sub }: { checked: boolean; label: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={cn("mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0",
        checked ? "bg-emerald-500/10" : "bg-red-500/10"
      )}>
        {checked
          ? <TickCircle size={12} color="#34d399" variant="Bold" />
          : <CloseCircle size={12} color="#f87171" variant="Outline" />
        }
      </div>
      <div>
        <p className={cn("text-xs font-medium", checked ? "text-fg-muted" : "text-fg-dim")}>{label}</p>
        {sub && <p className="text-[11px] text-fg-dim mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function DriversPage() {
  // List & UI
  const [filter, setFilter] = useState<Filter>("All")
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"grid" | "table">("grid")
  const [driverList, setDriverList] = useState<Driver[]>(initialDrivers)
  const [driverStates, setDriverStates] = useState<Record<string, DriverStatus>>(() =>
    Object.fromEntries(initialDrivers.map(d => [d.id, d.status]))
  )
  const [toasts, setToasts] = useState<Toast[]>([])

  // Profile sheet
  const [selected, setSelected] = useState<Driver | null>(null)
  const [profileTab, setProfileTab] = useState<"overview" | "verification" | "assignments" | "performance" | "incidents">("overview")

  // Verification state per driver
  const [verifications, setVerifications] = useState<Record<string, VerifData>>(() => {
    const r: Record<string, VerifData> = {}
    for (const d of initialDrivers) {
      const v = d.verificationStatus === "verified"
      r[d.id] = {
        photoUploaded: v,
        phoneVerified: !!d.phone,
        ninVerified: v && !!d.nin,
        licenseVerified: v,
        licenseValid: v,
        backgroundCheck: v,
        agreementSigned: v
      }
    }
    return r
  })

  // Assignment within profile
  const [assignBusId, setAssignBusId] = useState("")
  const [assignType, setAssignType] = useState<"primary" | "backup" | "temporary">("primary")
  const [assignStart, setAssignStart] = useState("")

  // Add driver form (3 steps)
  const [addOpen, setAddOpen] = useState(false)
  const [addStep, setAddStep] = useState(1)
  const [newFirst, setNewFirst] = useState("")
  const [newLast, setNewLast] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newAddress, setNewAddress] = useState("")
  const [newLicense, setNewLicense] = useState("")
  const [newLicenseExpiry, setNewLicenseExpiry] = useState("")
  const [newNin, setNewNin] = useState("")

  // Quick confirm (force offline / unblock)
  const [confirm, setConfirm] = useState<{ type: "force_offline" | "unblock"; driver: Driver } | null>(null)

  // Suspend dialog
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [suspendDriver, setSuspendDriver] = useState<Driver | null>(null)
  const [suspendReason, setSuspendReason] = useState("")
  const [suspendDuration, setSuspendDuration] = useState<"24h" | "7d" | "30d" | "permanent">("7d")
  const [suspendNotes, setSuspendNotes] = useState("")

  // Deactivate dialog
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [deactivateDriver, setDeactivateDriver] = useState<Driver | null>(null)
  const [deactivateReason, setDeactivateReason] = useState("")
  const [deactivateEffective, setDeactivateEffective] = useState<"immediate" | "end_of_week">("immediate")
  const [deactivateNotes, setDeactivateNotes] = useState("")

  // Flag incident dialog
  const [flagOpen, setFlagOpen] = useState(false)
  const [flagDriver, setFlagDriver] = useState<Driver | null>(null)
  const [flagType, setFlagType] = useState("")
  const [flagNotes, setFlagNotes] = useState("")

  const didAutoOpen = useRef(false)
  useEffect(() => {
    if (didAutoOpen.current) return
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("add") === "1") {
      didAutoOpen.current = true
      setAddOpen(true); setAddStep(1)
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  function addToast(message: string, type: Toast["type"] = "success") {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

  function handleAddDriver() {
    const fullName = `${newFirst.trim()} ${newLast.trim()}`.trim()
    if (!fullName || !newPhone.trim()) return
    const id = `drv${Date.now()}`
    const code = `KJA-0${String(driverList.length + 1).padStart(2, "0")}`
    const nd: Driver = {
      id, name: fullName, code, phone: newPhone.trim(), status: "pending",
      tripsToday: 0, earningsToday: 0, rating: 5.0, complianceStatus: "clear", hoursThisWeek: 0,
      address: newAddress.trim() || undefined, licenseNumber: newLicense.trim() || undefined,
      licenseExpiry: newLicenseExpiry || undefined, nin: newNin.trim() || undefined,
      verificationStatus: "unverified", joinedDate: new Date().toISOString().split("T")[0],
      incidentCount: 0,
    }
    setDriverList(dl => [...dl, nd])
    setDriverStates(s => ({ ...s, [id]: "pending" }))
    setVerifications(v => ({
      ...v, [id]: {
        photoUploaded: false, phoneVerified: true, ninVerified: false,
        licenseVerified: false, licenseValid: false, backgroundCheck: false, agreementSigned: false
      }
    }))
    addToast(`${nd.name} added — pending verification (${code})`)
    setAddOpen(false); setAddStep(1)
    setNewFirst(""); setNewLast(""); setNewPhone(""); setNewAddress(""); setNewLicense(""); setNewLicenseExpiry(""); setNewNin("")
  }

  function handleConfirm() {
    if (!confirm) return
    const { type, driver } = confirm
    if (type === "force_offline") {
      setDriverStates(s => ({ ...s, [driver.id]: "offline" }))
      addToast(`${driver.name} forced offline`)
    } else if (type === "unblock") {
      setDriverStates(s => ({ ...s, [driver.id]: "offline" }))
      addToast(`${driver.name} reinstated — set to offline`, "info")
    }
    setConfirm(null); setSelected(null)
  }

  function handleSuspend() {
    if (!suspendDriver || !suspendReason) return
    setDriverStates(s => ({ ...s, [suspendDriver.id]: "blocked" }))
    const dur: Record<string, string> = { "24h": "24 hours", "7d": "7 days", "30d": "30 days", "permanent": "permanently" }
    addToast(`${suspendDriver.name} suspended for ${dur[suspendDuration]}`, "error")
    setSuspendOpen(false); setSuspendDriver(null); setSuspendReason(""); setSuspendNotes("")
    setSelected(null)
  }

  function handleDeactivate() {
    if (!deactivateDriver || !deactivateReason) return
    setDriverList(dl => dl.filter(d => d.id !== deactivateDriver.id))
    addToast(`${deactivateDriver.name} deactivated from the system`, "error")
    setDeactivateOpen(false); setDeactivateDriver(null); setDeactivateReason(""); setDeactivateNotes("")
    setSelected(null)
  }

  function handleMarkVerified(driver: Driver) {
    setVerifications(v => ({
      ...v, [driver.id]: {
        photoUploaded: true, phoneVerified: true, ninVerified: false,
        licenseVerified: true, licenseValid: true, backgroundCheck: true, agreementSigned: true
      }
    }))
    setDriverList(dl => dl.map(d => d.id === driver.id ? { ...d, verificationStatus: "verified" as VerificationStatus } : d))
    if (driverStates[driver.id] === "pending") {
      setDriverStates(s => ({ ...s, [driver.id]: "offline" }))
    }
    addToast(`${driver.name} marked as verified`)
  }

  function handleAssignBus(driver: Driver) {
    if (!assignBusId) return
    const bus = buses.find(b => b.id === assignBusId)
    if (!bus) return
    setDriverList(dl => dl.map(d => d.id === driver.id ? { ...d, bus: bus.code, busId: bus.id, assignmentType: assignType } : d))
    addToast(`${driver.name} assigned to ${bus.code} as ${assignType} driver`)
    setAssignBusId(""); setAssignStart("")
  }

  function handleFlagIncident() {
    if (!flagDriver || !flagType) return
    setDriverList(dl => dl.map(d => d.id === flagDriver.id ? { ...d, incidentCount: (d.incidentCount ?? 0) + 1, complianceStatus: "warning" } : d))
    addToast(`Incident flagged for ${flagDriver.name}`)
    setFlagOpen(false); setFlagDriver(null); setFlagType(""); setFlagNotes("")
  }

  const mergedDrivers = driverList.map(d => ({ ...d, status: driverStates[d.id] ?? d.status }))

  const filtered = mergedDrivers.filter(d => {
    const f = filter
    const matchFilter = f === "All" ||
      (f === "Active" && d.status === "active") ||
      (f === "Pending" && d.status === "pending") ||
      (f === "Late" && d.status === "late") ||
      (f === "Offline" && d.status === "offline") ||
      (f === "On Leave" && d.status === "on_leave") ||
      (f === "Suspended" && d.status === "blocked")
    const matchSearch = !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      (d.phone && d.phone.includes(search))
    return matchFilter && matchSearch
  })

  const selectedDriver = selected ? mergedDrivers.find(d => d.id === selected.id) ?? selected : null
  const activeCount = mergedDrivers.filter(d => d.status === "active").length

  const verifData = selectedDriver ? (verifications[selectedDriver.id] ?? {
    photoUploaded: false, phoneVerified: false, ninVerified: false,
    licenseVerified: false, licenseValid: false, backgroundCheck: false, agreementSigned: false
  }) : null

  const isLicenseExpired = (expiry?: string) => {
    if (!expiry) return false
    return new Date(expiry) < new Date("2026-05-25")
  }

  return (
    <>
      <Header
        title="Drivers"
        subtitle={`${activeCount} of ${driverList.length} on shift`}
        action={
          <Button
            size="sm"
            className="gap-1.5 mr-1"
            onClick={() => {
              setAddOpen(true); setAddStep(1)
              setNewFirst(""); setNewLast(""); setNewPhone(""); setNewAddress(""); setNewLicense(""); setNewLicenseExpiry(""); setNewNin("")
            }}
          >
            <Add size={14} color="currentColor" />
            Add Driver
          </Button>
        }
      />
      <main className="flex-1 p-4 sm:p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <SearchNormal1 size={14} color="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-fg-dim" />
            <Input placeholder="Search name, code or phone…" className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-1">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                  filter === f
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "text-fg-dim hover:bg-[var(--hover-bg)] hover:text-fg-muted border-transparent"
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
                view === "grid" ? "bg-[var(--hover-bg)] text-fg-muted" : "text-fg-dim hover:text-fg-muted"
              )}
              title="Grid view"
            >
              <Grid1 size={14} color="currentColor" />
            </button>
            <button
              onClick={() => setView("table")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                view === "table" ? "bg-[var(--hover-bg)] text-fg-muted" : "text-fg-dim hover:text-fg-muted"
              )}
              title="Table view"
            >
              <RowVertical size={14} color="currentColor" />
            </button>
          </div>
        </div>

        {/* Grid View */}
        {view === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(driver => {
              const sc = statusConfig[driver.status]
              const weekFill = (driver.hoursThisWeek / 60) * 100
              return (
                <Card
                  key={driver.id}
                  className="hover:border-line transition-colors cursor-pointer"
                  onClick={() => { setSelected(driver); setProfileTab("overview") }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={driver.name} size="lg" />
                        <div>
                          <p className="text-sm font-semibold text-fg">{driver.name}</p>
                          <p className="text-xs text-fg-dim">{driver.code}</p>
                          {driver.verificationStatus && driver.verificationStatus !== "verified" && (
                            <p className={cn(
                              "text-[10px] mt-0.5 font-medium",
                              driver.verificationStatus === "rejected" ? "text-red-400" : "text-amber-400"
                            )}>
                              {driver.verificationStatus === "unverified" ? "Unverified"
                                : driver.verificationStatus === "pending_docs" ? "Docs Pending"
                                : "Rejected"}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant={sc.variant}>{sc.label}</Badge>
                    </div>

                    {driver.route && (
                      <div className="mb-3 rounded-lg bg-[var(--subtle-bg)] border border-line-soft px-3 py-2">
                        <p className="text-[10px] text-fg-dim uppercase tracking-wider mb-0.5">Current Route</p>
                        <p className="text-xs font-medium text-fg-muted">{driver.route}</p>
                        {driver.bus && <p className="text-[11px] text-fg-dim mt-0.5">{driver.bus}</p>}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="rounded-lg bg-[var(--subtle-bg)] border border-line-soft p-2 text-center">
                        <p className="text-base font-bold text-fg">{driver.tripsToday}</p>
                        <p className="text-[10px] text-fg-dim">Trips</p>
                      </div>
                      <div className="rounded-lg bg-[var(--subtle-bg)] border border-line-soft p-2 text-center">
                        <p className="text-base font-bold text-fg">{formatNGN(driver.earningsToday)}</p>
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

                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={
                        driver.complianceStatus === "clear" ? "success" :
                          driver.complianceStatus === "warning" ? "warning" : "destructive"
                      }>
                        {driver.complianceStatus === "clear" ? "Clear" :
                          driver.complianceStatus === "warning" ? "Warning" : "Blocked"}
                      </Badge>
                      {driver.hoursThisWeek > 0 && (
                        <span className="text-[11px] text-fg-dim">{driver.hoursThisWeek}h / 60h</span>
                      )}
                    </div>

                    {driver.hoursThisWeek > 0 && (
                      <Progress
                        value={weekFill}
                        colorClass={weekFill > 83 ? "bg-red-500" : weekFill > 67 ? "bg-yellow-500" : "bg-amber-500"}
                      />
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Table View */}
        {view === "table" && (
          <div className="rounded-xl border border-line-soft overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft bg-[var(--subtle-bg)]">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Driver</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Route</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Compliance</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Trips</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Earned</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Rating</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider w-40">Hours / Week</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {filtered.map(driver => {
                  const sc = statusConfig[driver.status]
                  const weekFill = (driver.hoursThisWeek / 60) * 100
                  return (
                    <tr
                      key={driver.id}
                      className="hover:bg-[var(--hover-bg)] transition-colors cursor-pointer group"
                      onClick={() => { setSelected(driver); setProfileTab("overview") }}
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
                            <p className="text-xs text-fg-muted">{driver.route}</p>
                            {driver.bus && <p className="text-[11px] text-fg-dim">{driver.bus}</p>}
                          </div>
                        ) : (
                          <span className="text-xs text-fg-dim">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={
                          driver.complianceStatus === "clear" ? "success" :
                            driver.complianceStatus === "warning" ? "warning" : "destructive"
                        }>
                          {driver.complianceStatus === "clear" ? "Clear" :
                            driver.complianceStatus === "warning" ? "Warning" : "Blocked"}
                        </Badge>
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

      {/* ─── Add Driver Sheet ─── */}
      <Sheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Driver"
        subtitle={`Step ${addStep} of 3`}
        footer={
          addStep === 1 ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button size="sm" className="ml-auto" onClick={() => setAddStep(2)} disabled={!newFirst.trim() || !newPhone.trim()}>
                Next
              </Button>
            </>
          ) : addStep === 2 ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setAddStep(1)}>Back</Button>
              <Button size="sm" className="ml-auto" onClick={() => setAddStep(3)}>
                Next
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
          {addStep === 1 && (
            <div className="space-y-5">
              <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider mb-4">Personal Details</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-fg-muted mb-1.5">First Name *</label>
                    <Input placeholder="e.g. Emeka" value={newFirst} onChange={e => setNewFirst(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-fg-muted mb-1.5">Last Name *</label>
                    <Input placeholder="e.g. Okafor" value={newLast} onChange={e => setNewLast(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-fg-muted mb-1.5">Phone Number *</label>
                  <Input placeholder="e.g. 0801 234 5678" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-fg-muted mb-1.5">Address (optional)</label>
                  <Input placeholder="e.g. 12 Broad St, Lagos Island" value={newAddress} onChange={e => setNewAddress(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {addStep === 2 && (
            <div className="space-y-5">
              <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider mb-4">Driving Documents</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-fg-muted mb-1.5">License Number (optional)</label>
                  <Input placeholder="e.g. DL-LG-00123" value={newLicense} onChange={e => setNewLicense(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-fg-muted mb-1.5">License Expiry Date (optional)</label>
                  <Input type="date" value={newLicenseExpiry} onChange={e => setNewLicenseExpiry(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-fg-muted mb-1.5">NIN (optional)</label>
                  <Input placeholder="11-digit NIN" value={newNin} onChange={e => setNewNin(e.target.value)} />
                </div>
              </div>
              <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-4">
                <p className="text-[11px] text-fg-dim">Documents can be added later. The driver will start with <span className="text-fg-muted">Pending Verification</span> status until verified by an admin.</p>
              </div>
            </div>
          )}

          {addStep === 3 && (
            <div className="space-y-5">
              <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider mb-4">Confirm Details</p>
              <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft divide-y divide-line-soft">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-fg-muted">Full Name</span>
                  <span className="text-sm font-medium text-fg">{`${newFirst} ${newLast}`.trim()}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-fg-muted">Phone</span>
                  <span className="text-sm font-medium text-fg">{newPhone}</span>
                </div>
                {newLicense && (
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-fg-muted">License</span>
                    <span className="text-sm font-medium text-fg">{newLicense}</span>
                  </div>
                )}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-fg-muted">Assigned Code</span>
                  <span className="text-sm font-medium text-amber-400">KJA-0{String(driverList.length + 1).padStart(2, "0")}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-fg-muted">Initial Status</span>
                  <span className="text-sm font-medium text-fg-muted">Pending Verification</span>
                </div>
              </div>
              <div className="rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 p-4">
                <div className="flex items-center gap-2">
                  <TickCircle size={14} color="#34d399" variant="Bold" />
                  <p className="text-xs text-emerald-400 font-medium">Ready to add</p>
                </div>
                <p className="text-[11px] text-fg-dim mt-1">The driver will appear in the Drivers list and can be assigned to dispatch plans after verification.</p>
              </div>
            </div>
          )}
        </div>
      </Sheet>

      {/* ─── Driver Profile Sheet ─── */}
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
                onClick={() => { addToast(`Calling ${selectedDriver.phone}…`, "info"); setSelected(null) }}
              >
                <Call size={14} color="currentColor" />
                Call
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
              <div className="ml-auto flex items-center gap-2">
                {selectedDriver.status !== "blocked" && selectedDriver.status !== "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10"
                    onClick={() => { setSuspendDriver(selectedDriver); setSuspendReason(""); setSuspendDuration("7d"); setSuspendNotes(""); setSuspendOpen(true) }}
                  >
                    <Warning2 size={14} color="currentColor" />
                    Suspend
                  </Button>
                )}
                {selectedDriver.status === "blocked" && (
                  <Button
                    variant="success"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setConfirm({ type: "unblock", driver: selectedDriver })}
                  >
                    <TickCircle size={14} color="currentColor" />
                    Reinstate
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => { setDeactivateDriver(selectedDriver); setDeactivateReason(""); setDeactivateNotes(""); setDeactivateOpen(true) }}
                >
                  Deactivate
                </Button>
              </div>
            </>
          ) : undefined
        }
      >
        {selectedDriver && (
          <>
            {/* Tab navigation */}
            <div className="sticky top-0 z-10 bg-panel border-b border-line-soft flex items-center px-4 overflow-x-auto shrink-0">
              {([
                { id: "overview", label: "Overview" },
                { id: "verification", label: "Verification" },
                { id: "assignments", label: "Assignments" },
                { id: "performance", label: "Performance" },
                { id: "incidents", label: "Incidents" },
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setProfileTab(tab.id)}
                  className={cn(
                    "px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                    profileTab === tab.id
                      ? "text-amber-400 border-amber-500"
                      : "text-fg-dim hover:text-fg-muted border-transparent"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* ── OVERVIEW TAB ── */}
              {profileTab === "overview" && (
                <>
                  {/* Identity */}
                  <div className="flex items-center gap-4">
                    <Avatar name={selectedDriver.name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-fg">{selectedDriver.name}</p>
                      <p className="text-sm text-fg-muted">{selectedDriver.code}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Sms size={12} color="currentColor" className="text-fg-dim" variant="Linear" />
                        <p className="text-xs text-fg-muted">{selectedDriver.phone}</p>
                      </div>
                      {selectedDriver.joinedDate && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Calendar size={12} color="currentColor" className="text-fg-dim" variant="Linear" />
                          <p className="text-xs text-fg-dim">Joined {selectedDriver.joinedDate}</p>
                        </div>
                      )}
                    </div>
                    <Badge variant={statusConfig[selectedDriver.status].variant}>
                      {statusConfig[selectedDriver.status].label}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Current Assignment */}
                  {selectedDriver.route ? (
                    <div>
                      <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider mb-3">Current Assignment</p>
                      <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Car size={14} color="#f59e0b" variant="Bold" />
                          <span className="text-sm text-fg-muted">{selectedDriver.bus}</span>
                          {selectedDriver.assignmentType && (
                            <Badge variant="default" className="ml-auto text-[10px]">{selectedDriver.assignmentType}</Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-fg">{selectedDriver.route}</p>
                        {selectedDriver.shiftStart && (
                          <p className="text-xs text-fg-dim">Shift started {selectedDriver.shiftStart}</p>
                        )}
                        {selectedDriver.currentPassengers !== undefined && (
                          <div className="pt-1">
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-fg-dim">Passengers onboard</span>
                              <span className="text-fg-muted">{selectedDriver.currentPassengers} pax</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-4 text-center text-fg-dim text-sm">
                      No active assignment
                    </div>
                  )}

                  {/* Today's Performance */}
                  <div>
                    <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider mb-3">Today&apos;s Performance</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-3 text-center">
                        <p className="text-xl font-bold text-fg">{selectedDriver.tripsToday}</p>
                        <p className="text-[11px] text-fg-dim mt-0.5">Trips</p>
                      </div>
                      <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-3 text-center">
                        <p className="text-base font-bold text-emerald-400">{formatNGN(selectedDriver.earningsToday)}</p>
                        <p className="text-[11px] text-fg-dim mt-0.5">Earned</p>
                      </div>
                      <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star1 size={14} color="#f59e0b" variant="Bold" />
                          <p className="text-xl font-bold text-fg">{selectedDriver.rating}</p>
                        </div>
                        <p className="text-[11px] text-fg-dim mt-0.5">Rating</p>
                      </div>
                    </div>
                  </div>

                  {/* Compliance */}
                  <div>
                    <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider mb-3">Compliance</p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-fg-muted">Hours this week</span>
                          <span className={cn("font-medium", selectedDriver.hoursThisWeek > 50 ? "text-red-400" : "text-fg-muted")}>
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
                </>
              )}

              {/* ── VERIFICATION TAB ── */}
              {profileTab === "verification" && verifData && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Verification Checklist</p>
                    <Badge variant={
                      selectedDriver.verificationStatus === "verified" ? "success" :
                        selectedDriver.verificationStatus === "rejected" ? "destructive" :
                          selectedDriver.verificationStatus === "pending_docs" ? "warning" : "muted"
                    }>
                      {selectedDriver.verificationStatus === "verified" ? "Verified" :
                        selectedDriver.verificationStatus === "rejected" ? "Rejected" :
                          selectedDriver.verificationStatus === "pending_docs" ? "Docs Pending" : "Unverified"}
                    </Badge>
                  </div>

                  {/* Identity */}
                  <div>
                    <p className="text-[11px] text-fg-dim uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <People size={12} color="currentColor" variant="Linear" />
                      Identity
                    </p>
                    <div className="rounded-xl border border-line-soft divide-y divide-line-soft">
                      <div className="px-3">
                        <CheckItem checked={verifData.photoUploaded} label="Driver Photo Uploaded" />
                      </div>
                      <div className="px-3">
                        <CheckItem checked={verifData.phoneVerified} label="Phone Verified" sub={selectedDriver.phone} />
                      </div>
                      <div className="px-3">
                        <CheckItem
                          checked={verifData.ninVerified}
                          label="NIN Verified (optional)"
                          sub={selectedDriver.nin ? `NIN on file` : "No NIN provided"}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Driving Legality */}
                  <div>
                    <p className="text-[11px] text-fg-dim uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Car size={12} color="currentColor" variant="Linear" />
                      Driving Legality
                    </p>
                    <div className="rounded-xl border border-line-soft divide-y divide-line-soft">
                      <div className="px-3">
                        <CheckItem
                          checked={verifData.licenseVerified}
                          label="License Number Registered"
                          sub={selectedDriver.licenseNumber ?? "Not provided"}
                        />
                      </div>
                      <div className="px-3">
                        <CheckItem
                          checked={verifData.licenseValid && !isLicenseExpired(selectedDriver.licenseExpiry)}
                          label="License Valid"
                          sub={selectedDriver.licenseExpiry
                            ? `Expires ${selectedDriver.licenseExpiry}${isLicenseExpired(selectedDriver.licenseExpiry) ? " — EXPIRED" : ""}`
                            : "No expiry date on file"
                          }
                        />
                      </div>
                      <div className="px-3">
                        <CheckItem checked={verifData.licenseVerified} label="License Verified by Owner" />
                      </div>
                    </div>
                  </div>

                  {/* Employment */}
                  <div>
                    <p className="text-[11px] text-fg-dim uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <ShieldTick size={12} color="currentColor" variant="Linear" />
                      Employment
                    </p>
                    <div className="rounded-xl border border-line-soft divide-y divide-line-soft">
                      <div className="px-3">
                        <CheckItem checked={verifData.backgroundCheck} label="Background Check Completed" />
                      </div>
                      <div className="px-3">
                        <CheckItem checked={verifData.agreementSigned} label="Driver Agreement Signed" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* CTAs */}
                  <div className="flex flex-col gap-2">
                    {selectedDriver.verificationStatus !== "verified" && (
                      <Button
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={() => handleMarkVerified(selectedDriver)}
                      >
                        <ShieldTick size={14} color="currentColor" />
                        Mark as Verified
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => addToast(`Document request sent to ${selectedDriver.name}`, "info")}>
                      Request Document
                    </Button>
                    {selectedDriver.verificationStatus !== "rejected" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10"
                        onClick={() => {
                          setDriverList(dl => dl.map(d => d.id === selectedDriver.id ? { ...d, verificationStatus: "rejected" as VerificationStatus } : d))
                          addToast(`${selectedDriver.name} verification rejected`, "error")
                        }}
                      >
                        <CloseCircle size={14} color="currentColor" variant="Outline" />
                        Reject Driver
                      </Button>
                    )}
                  </div>
                </>
              )}

              {/* ── ASSIGNMENTS TAB ── */}
              {profileTab === "assignments" && (
                <>
                  {/* Current Assignment */}
                  <div>
                    <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider mb-3">Current Assignment</p>
                    {selectedDriver.bus ? (
                      <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Car size={16} color="#f59e0b" variant="Bold" />
                            <span className="text-sm font-semibold text-fg">{selectedDriver.bus}</span>
                          </div>
                          {selectedDriver.assignmentType && (
                            <Badge variant="default">{selectedDriver.assignmentType}</Badge>
                          )}
                        </div>
                        {selectedDriver.route && (
                          <p className="text-xs text-fg-muted">{selectedDriver.route}</p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10"
                          onClick={() => {
                            setDriverList(dl => dl.map(d => d.id === selectedDriver.id ? { ...d, bus: undefined, busId: undefined, route: undefined, assignmentType: undefined } : d))
                            addToast(`${selectedDriver.name} unassigned from ${selectedDriver.bus}`, "info")
                          }}
                        >
                          Unassign
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-4 text-center text-fg-dim text-sm">
                        No bus assigned
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* New Assignment Form */}
                  <div>
                    <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider mb-3">New Assignment</p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-fg-muted mb-1.5">Select Bus</label>
                        <Select value={assignBusId} onChange={e => setAssignBusId(e.target.value)}>
                          <SelectOption value="">Choose a bus…</SelectOption>
                          {buses.map(bus => (
                            <SelectOption key={bus.id} value={bus.id}>
                              {bus.code} — {bus.model} ({bus.status})
                            </SelectOption>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <label className="block text-xs text-fg-muted mb-1.5">Assignment Type</label>
                        <Select value={assignType} onChange={e => setAssignType(e.target.value as "primary" | "backup" | "temporary")}>
                          <SelectOption value="primary">Primary Driver</SelectOption>
                          <SelectOption value="backup">Backup Driver</SelectOption>
                          <SelectOption value="temporary">Temporary Driver</SelectOption>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-xs text-fg-muted mb-1.5">Start Date</label>
                        <Input type="date" value={assignStart} onChange={e => setAssignStart(e.target.value)} />
                      </div>
                      <Button
                        size="sm"
                        className="w-full gap-1.5"
                        disabled={!assignBusId}
                        onClick={() => handleAssignBus(selectedDriver)}
                      >
                        <Car size={14} color="currentColor" />
                        Assign Driver
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* ── PERFORMANCE TAB ── */}
              {profileTab === "performance" && (
                <>
                  {/* This Week */}
                  <div>
                    <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider mb-3">This Week</p>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-fg-muted">Hours worked</span>
                          <span className="text-fg-muted font-medium">{selectedDriver.hoursThisWeek}h / 60h</span>
                        </div>
                        <Progress
                          value={(selectedDriver.hoursThisWeek / 60) * 100}
                          colorClass={
                            selectedDriver.hoursThisWeek > 50 ? "bg-red-500" :
                              selectedDriver.hoursThisWeek > 40 ? "bg-yellow-500" : "bg-amber-500"
                          }
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-fg-muted">On-time start rate</span>
                          <span className={cn("font-medium", (selectedDriver.onTimeRate ?? 100) < 80 ? "text-red-400" : "text-fg-muted")}>
                            {selectedDriver.onTimeRate ?? "—"}%
                          </span>
                        </div>
                        <Progress
                          value={selectedDriver.onTimeRate ?? 0}
                          colorClass={(selectedDriver.onTimeRate ?? 100) < 80 ? "bg-red-500" : (selectedDriver.onTimeRate ?? 100) < 90 ? "bg-yellow-500" : "bg-emerald-500"}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-fg-muted">Trip completion rate</span>
                          <span className={cn("font-medium", (selectedDriver.completionRate ?? 100) < 80 ? "text-red-400" : "text-fg-muted")}>
                            {selectedDriver.completionRate ?? "—"}%
                          </span>
                        </div>
                        <Progress
                          value={selectedDriver.completionRate ?? 0}
                          colorClass={(selectedDriver.completionRate ?? 100) < 80 ? "bg-red-500" : (selectedDriver.completionRate ?? 100) < 90 ? "bg-yellow-500" : "bg-emerald-500"}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Ratings Breakdown */}
                  <div>
                    <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider mb-3">Ratings Breakdown</p>
                    <div className="space-y-3">
                      {[
                        { label: "Driving Safety", value: Math.min(5, selectedDriver.rating * 0.97) },
                        { label: "Punctuality", value: Math.min(5, (selectedDriver.onTimeRate ?? 80) / 20) },
                        { label: "Professionalism", value: Math.min(5, selectedDriver.rating * 1.02) },
                        { label: "Cleanliness", value: Math.min(5, selectedDriver.rating * 0.99) },
                      ].map(item => (
                        <div key={item.label}>
                          <div className="flex justify-between items-center text-xs mb-1.5">
                            <span className="text-fg-muted">{item.label}</span>
                            <div className="flex items-center gap-1">
                              <Star1 size={11} color="#f59e0b" variant="Bold" />
                              <span className="text-fg-muted font-medium">{item.value.toFixed(1)}</span>
                            </div>
                          </div>
                          <Progress value={(item.value / 5) * 100} colorClass="bg-amber-500" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Overall Stats */}
                  <div>
                    <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider mb-3">Overall Stats</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Trips Today", value: String(selectedDriver.tripsToday) },
                        { label: "Weekly Hours", value: `${selectedDriver.hoursThisWeek}h` },
                        { label: "Rating", value: String(selectedDriver.rating) },
                        { label: "Incidents", value: String(selectedDriver.incidentCount ?? 0) },
                      ].map(stat => (
                        <div key={stat.label} className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-3">
                          <p className="text-base font-bold text-fg">{stat.value}</p>
                          <p className="text-[11px] text-fg-dim mt-0.5">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── INCIDENTS TAB ── */}
              {profileTab === "incidents" && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-fg-dim uppercase tracking-wider">Incident Log</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10"
                      onClick={() => { setFlagDriver(selectedDriver); setFlagType(""); setFlagNotes(""); setFlagOpen(true) }}
                    >
                      <Danger size={14} color="currentColor" />
                      Flag Incident
                    </Button>
                  </div>

                  {(() => {
                    const incidents = getDriverIncidents(selectedDriver)
                    if (incidents.length === 0) {
                      return (
                        <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-6 text-center">
                          <ShieldTick size={28} color="#34d399" variant="Bold" className="mx-auto mb-2" />
                          <p className="text-sm font-medium text-fg-muted">No incidents on record</p>
                          <p className="text-xs text-fg-dim mt-1">This driver has a clean record.</p>
                        </div>
                      )
                    }
                    return (
                      <div className="space-y-3">
                        {incidents.map(inc => (
                          <div
                            key={inc.id}
                            className={cn(
                              "rounded-xl border p-4",
                              inc.severity === "critical"
                                ? "border-red-500/20 bg-red-500/[0.04]"
                                : "border-yellow-500/20 bg-yellow-500/[0.04]"
                            )}
                          >
                            <div className="flex items-start justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <Danger
                                  size={14}
                                  color={inc.severity === "critical" ? "#f87171" : "#facc15"}
                                  variant="Bold"
                                />
                                <span className={cn(
                                  "text-xs font-semibold",
                                  inc.severity === "critical" ? "text-red-400" : "text-yellow-400"
                                )}>{inc.type}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-fg-dim">{inc.date}</span>
                                <Badge variant={inc.resolved ? "success" : inc.severity === "critical" ? "destructive" : "warning"}>
                                  {inc.resolved ? "Resolved" : "Open"}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-[12px] text-fg-muted leading-relaxed">{inc.notes}</p>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </>
              )}
            </div>
          </>
        )}
      </Sheet>

      {/* ─── Confirm Dialog ─── */}
      <Dialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.type === "unblock" ? "Reinstate Driver" : "Force Offline"}
        description={
          confirm?.type === "unblock"
            ? `${confirm?.driver.name} will be reinstated and set to offline. They can resume accepting shifts.`
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
            {confirm?.type === "unblock" ? "Reinstate" : "Force Offline"}
          </Button>
        </div>
      </Dialog>

      {/* ─── Suspend Dialog ─── */}
      <Dialog
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        title={`Suspend ${suspendDriver?.name ?? "Driver"}`}
        description="The driver will be suspended and removed from dispatch availability. Scheduled shifts will be flagged as unassigned."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Reason *</label>
            <Select value={suspendReason} onChange={e => setSuspendReason(e.target.value)}>
              <SelectOption value="">Select a reason…</SelectOption>
              <SelectOption value="passenger_complaint">Passenger Complaint</SelectOption>
              <SelectOption value="reckless_driving">Reckless Driving</SelectOption>
              <SelectOption value="fraud_suspicion">Fraud Suspicion</SelectOption>
              <SelectOption value="assault_report">Assault / Harassment Report</SelectOption>
              <SelectOption value="accident">Bus Accident</SelectOption>
              <SelectOption value="route_deviation">Repeated Route Deviation</SelectOption>
              <SelectOption value="other">Other</SelectOption>
            </Select>
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Duration</label>
            <div className="grid grid-cols-4 gap-2">
              {(["24h", "7d", "30d", "permanent"] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setSuspendDuration(d)}
                  className={cn("py-2 rounded-lg text-xs font-medium border transition-colors",
                    suspendDuration === d
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "text-fg-dim border-line-soft hover:bg-[var(--hover-bg)]"
                  )}
                >
                  {d === "24h" ? "24 hrs" : d === "7d" ? "7 days" : d === "30d" ? "30 days" : "Permanent"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Notes (optional)</label>
            <Input placeholder="Additional context…" value={suspendNotes} onChange={e => setSuspendNotes(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setSuspendOpen(false)}>Cancel</Button>
            <Button size="sm" variant="destructive" disabled={!suspendReason} onClick={handleSuspend}>
              Confirm Suspension
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ─── Deactivate Dialog ─── */}
      <Dialog
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        title={`Deactivate ${deactivateDriver?.name ?? "Driver"}`}
        description="This will permanently remove the driver from operations. All trip history is preserved for audit. This action cannot be undone."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Reason *</label>
            <Select value={deactivateReason} onChange={e => setDeactivateReason(e.target.value)}>
              <SelectOption value="">Select a reason…</SelectOption>
              <SelectOption value="resigned">Driver Resigned</SelectOption>
              <SelectOption value="terminated">Terminated</SelectOption>
              <SelectOption value="fraud">Fraud / Misconduct</SelectOption>
              <SelectOption value="license_expired">License Expired</SelectOption>
              <SelectOption value="performance">Poor Performance</SelectOption>
            </Select>
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Effective Date</label>
            <div className="flex gap-2">
              {(["immediate", "end_of_week"] as const).map(e => (
                <button
                  key={e}
                  onClick={() => setDeactivateEffective(e)}
                  className={cn("flex-1 py-2 rounded-lg text-xs font-medium border transition-colors",
                    deactivateEffective === e
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "text-fg-dim border-line-soft hover:bg-[var(--hover-bg)]"
                  )}
                >
                  {e === "immediate" ? "Immediate" : "End of Week"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Notes (optional)</label>
            <Input placeholder="Reason details, handover notes…" value={deactivateNotes} onChange={e => setDeactivateNotes(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeactivateOpen(false)}>Cancel</Button>
            <Button size="sm" variant="destructive" disabled={!deactivateReason} onClick={handleDeactivate}>
              Deactivate Driver
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ─── Flag Incident Dialog ─── */}
      <Dialog
        open={flagOpen}
        onClose={() => setFlagOpen(false)}
        title="Flag Incident"
        description={`Log a new incident for ${flagDriver?.name ?? "this driver"}.`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Incident Type *</label>
            <Select value={flagType} onChange={e => setFlagType(e.target.value)}>
              <SelectOption value="">Select type…</SelectOption>
              <SelectOption value="passenger_complaint">Passenger Complaint</SelectOption>
              <SelectOption value="reckless_driving">Reckless Driving</SelectOption>
              <SelectOption value="fraud_suspicion">Fraud Suspicion</SelectOption>
              <SelectOption value="assault">Assault / Harassment</SelectOption>
              <SelectOption value="accident">Bus Accident</SelectOption>
              <SelectOption value="route_deviation">Route Deviation</SelectOption>
            </Select>
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Notes</label>
            <Input placeholder="Describe the incident…" value={flagNotes} onChange={e => setFlagNotes(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setFlagOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={!flagType} onClick={handleFlagIncident} className="gap-1.5">
              <Warning2 size={14} color="currentColor" />
              Flag Incident
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ─── Toasts ─── */}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
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
