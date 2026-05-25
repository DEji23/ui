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
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  buses as initialBuses,
  maintenanceRecords as initialMaintenance,
  type Bus,
  type BusStatus,
  type MaintenanceRecord,
  type MaintenanceType,
  type BusType,
} from "@/lib/data"
import {
  Add, Bus as BusIcon, TickCircle, CloseCircle, Warning2,
  Setting2, UserRemove, Grid1, RowVertical, SearchNormal1,
  Timer1, Calendar, Money,
} from "iconsax-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "buses" | "maintenance" | "documents" | "devices"
type StatusFilter = "All" | "On Route" | "Available" | "Blocked" | "Maintenance" | "Decommissioned"
type Toast = { id: number; message: string; type: "success" | "error" | "info" }
type DetailTab = "overview" | "compliance" | "devices" | "history"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function complianceStatus(expiry?: string): "valid" | "expiring" | "expired" | "unknown" {
  if (!expiry) return "unknown"
  const days = Math.floor((new Date(expiry).getTime() - Date.now()) / 86400000)
  if (days < 0) return "expired"
  if (days <= 30) return "expiring"
  return "valid"
}

function maintenanceDueStatus(nextDue?: string): "ok" | "due-soon" | "overdue" {
  if (!nextDue || nextDue === "Overdue") return "overdue"
  const days = Math.floor((new Date(nextDue).getTime() - Date.now()) / 86400000)
  if (days < 0) return "overdue"
  if (days <= 14) return "due-soon"
  return "ok"
}

function fmtDate(d?: string) {
  if (!d) return "—"
  try { return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) }
  catch { return d }
}

function genBusUniqueCode(code: string) {
  return `B-${code.replace(/\D/g, "").slice(-2).padStart(2, "0")}-JEHGO`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ComplianceBadge({ expiry }: { expiry?: string }) {
  const s = complianceStatus(expiry)
  if (s === "expired") return <Badge variant="destructive">Expired</Badge>
  if (s === "expiring") return <Badge variant="warning">Expiring Soon</Badge>
  if (s === "valid") return <Badge variant="success">Valid</Badge>
  return <Badge variant="muted">—</Badge>
}

function MaintBadge({ nextDue }: { nextDue?: string }) {
  const s = maintenanceDueStatus(nextDue)
  if (s === "overdue") return <Badge variant="destructive">Overdue</Badge>
  if (s === "due-soon") return <Badge variant="warning">Due Soon</Badge>
  return <Badge variant="success">OK</Badge>
}

// ─── Constants ────────────────────────────────────────────────────────────────

const statusConfig: Record<BusStatus, { label: string; variant: "success" | "muted" | "warning" | "destructive" | "default" | "info" }> = {
  active: { label: "On Route", variant: "success" },
  available: { label: "Available", variant: "default" },
  blocked: { label: "Blocked", variant: "destructive" },
  maintenance: { label: "Maintenance", variant: "warning" },
  decommissioned: { label: "Decommissioned", variant: "muted" },
}

const statusFilters: StatusFilter[] = ["All", "On Route", "Available", "Blocked", "Maintenance", "Decommissioned"]

const busTypeLabels: Record<BusType, string> = {
  coaster: "Coaster", hiace: "Hiace", sienna: "Sienna", brt: "BRT", minibus: "Minibus",
}

const maintTypeLabels: Record<MaintenanceType, string> = {
  routine: "Routine Service", tyre: "Tyre Change", engine: "Engine Repair",
  brake: "Brake Repair", electrical: "Electrical", other: "Other",
}

const tabs: { key: Tab; label: string }[] = [
  { key: "buses", label: "All Buses" },
  { key: "maintenance", label: "Maintenance" },
  { key: "documents", label: "Documents & Compliance" },
  { key: "devices", label: "Devices / Tracking" },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FleetPage() {
  // ── Core state
  const [activeTab, setActiveTab] = useState<Tab>("buses")
  const [busList, setBusList] = useState<Bus[]>(initialBuses)
  const [busStates, setBusStates] = useState<Record<string, BusStatus>>(() =>
    Object.fromEntries(initialBuses.map((b) => [b.id, b.status]))
  )
  const [records, setRecords] = useState<MaintenanceRecord[]>(initialMaintenance)
  const [toasts, setToasts] = useState<Toast[]>([])

  // ── Buses tab state
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [view, setView] = useState<"grid" | "table">("grid")

  // ── Bus detail
  const [selected, setSelected] = useState<Bus | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTab>("overview")

  // ── Status change
  const [statusChangeOpen, setStatusChangeOpen] = useState(false)
  const [statusChangeTarget, setStatusChangeTarget] = useState<Bus | null>(null)
  const [newStatus, setNewStatus] = useState<BusStatus>("available")
  const [statusReason, setStatusReason] = useState("")
  const [statusReturnDate, setStatusReturnDate] = useState("")
  const [statusNote, setStatusNote] = useState("")

  // ── Register wizard
  const [regOpen, setRegOpen] = useState(false)
  const [regStep, setRegStep] = useState(1)
  const [regSuccess, setRegSuccess] = useState(false)
  const [regCode, setRegCode] = useState("")
  const [regBusType, setRegBusType] = useState<string>("coaster")
  const [regManufacturer, setRegManufacturer] = useState("")
  const [regModel, setRegModel] = useState("")
  const [regYear, setRegYear] = useState("")
  const [regPlate, setRegPlate] = useState("")
  const [regVin, setRegVin] = useState("")
  const [regColour, setRegColour] = useState("")
  const [regCapacity, setRegCapacity] = useState("30")
  const [regStanding, setRegStanding] = useState("no")
  const [regInsuranceExpiry, setRegInsuranceExpiry] = useState("")
  const [regRoadworthinessExpiry, setRegRoadworthinessExpiry] = useState("")
  const [regVehicleLicenseExpiry, setRegVehicleLicenseExpiry] = useState("")
  const [regGpsId, setRegGpsId] = useState("")
  const [regPairingMethod, setRegPairingMethod] = useState("list")
  const [regInspection, setRegInspection] = useState<"pass" | "fail" | "pending">("pending")
  const [regInspDate, setRegInspDate] = useState("")
  const [plateError, setPlateError] = useState("")

  // ── Add maintenance
  const [maintOpen, setMaintOpen] = useState(false)
  const [maintBusId, setMaintBusId] = useState("")
  const [maintType, setMaintType] = useState<MaintenanceType>("routine")
  const [maintDate, setMaintDate] = useState("")
  const [maintNextDue, setMaintNextDue] = useState("")
  const [maintCost, setMaintCost] = useState("")
  const [maintVendor, setMaintVendor] = useState("")
  const [maintNotes, setMaintNotes] = useState("")

  // ── Unassign confirm
  const [unassignTarget, setUnassignTarget] = useState<Bus | null>(null)

  // ── Auto-open from query param
  const didAutoOpen = useRef(false)
  useEffect(() => {
    if (didAutoOpen.current) return
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("add") === "1") {
      didAutoOpen.current = true
      openRegister()
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  // ─── Computed ───────────────────────────────────────────────────────────────

  const mergedBuses = busList.map((b) => ({ ...b, status: busStates[b.id] ?? b.status }))

  const filteredBuses = mergedBuses.filter((b) => {
    const matchStatus =
      statusFilter === "All" ? true :
      statusFilter === "On Route" ? b.status === "active" :
      statusFilter === "Available" ? b.status === "available" :
      statusFilter === "Blocked" ? b.status === "blocked" :
      statusFilter === "Maintenance" ? b.status === "maintenance" :
      statusFilter === "Decommissioned" ? b.status === "decommissioned" : true
    const matchType = typeFilter === "all" || b.busType === typeFilter
    const q = search.toLowerCase()
    const matchSearch = !q || b.code.toLowerCase().includes(q) || b.plate.toLowerCase().includes(q) ||
      b.model.toLowerCase().includes(q) || (b.driver ?? "").toLowerCase().includes(q) ||
      (b.vin ?? "").toLowerCase().includes(q)
    return matchStatus && matchType && matchSearch
  })

  const selectedBus = selected ? mergedBuses.find((b) => b.id === selected.id) ?? selected : null
  const busRecords = selectedBus ? records.filter((r) => r.busId === selectedBus.id) : []

  const summaryItems = [
    { label: "On Route", count: mergedBuses.filter((b) => b.status === "active").length, iconColor: "#34d399", bg: "bg-emerald-500/10" },
    { label: "Available", count: mergedBuses.filter((b) => b.status === "available").length, iconColor: "#f59e0b", bg: "bg-amber-500/10" },
    { label: "Blocked", count: mergedBuses.filter((b) => b.status === "blocked").length, iconColor: "#f87171", bg: "bg-red-500/10" },
    { label: "Maintenance", count: mergedBuses.filter((b) => b.status === "maintenance").length, iconColor: "#fbbf24", bg: "bg-yellow-500/10" },
  ]

  // ─── Toast helper ───────────────────────────────────────────────────────────

  function addToast(message: string, type: Toast["type"] = "success") {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }

  // ─── Register wizard ────────────────────────────────────────────────────────

  function openRegister() {
    setRegCode(""); setRegBusType("coaster"); setRegManufacturer(""); setRegModel("")
    setRegYear(""); setRegPlate(""); setRegVin(""); setRegColour(""); setRegCapacity("30")
    setRegStanding("no"); setRegInsuranceExpiry(""); setRegRoadworthinessExpiry("")
    setRegVehicleLicenseExpiry(""); setRegGpsId(""); setRegPairingMethod("list")
    setRegInspection("pending"); setRegInspDate(""); setPlateError("")
    setRegStep(1); setRegSuccess(false); setRegOpen(true)
  }

  function validateStep1() {
    if (!regCode.trim() || !regModel.trim() || !regPlate.trim()) return false
    const dupe = mergedBuses.find((b) => b.plate.toLowerCase() === regPlate.trim().toLowerCase())
    if (dupe) { setPlateError(`Plate already registered to ${dupe.code}`); return false }
    setPlateError("")
    return true
  }

  function handleRegisterBus() {
    if (!regCode.trim() || !regModel.trim() || !regPlate.trim()) return
    const id = `bus${Date.now()}`
    const uniqueCode = genBusUniqueCode(regCode)
    const newBus: Bus = {
      id,
      code: regCode.trim().toUpperCase(),
      model: `${regManufacturer.trim()} ${regModel.trim()}`.trim(),
      plate: regPlate.trim().toUpperCase(),
      status: regInspection === "fail" ? "blocked" : "available",
      capacity: parseInt(regCapacity) || 30,
      standingAllowed: regStanding === "yes",
      lastInspection: regInspDate || "Not inspected",
      inspectionResult: regInspection,
      fuelLevel: undefined,
      vin: regVin.trim() || undefined,
      busType: regBusType as BusType,
      manufacturer: regManufacturer.trim() || undefined,
      year: regYear ? parseInt(regYear) : undefined,
      colour: regColour.trim() || undefined,
      busUniqueCode: uniqueCode,
      insuranceExpiry: regInsuranceExpiry || undefined,
      roadworthinessExpiry: regRoadworthinessExpiry || undefined,
      vehicleLicenseExpiry: regVehicleLicenseExpiry || undefined,
      gpsDeviceId: regGpsId.trim() || undefined,
      gpsPaired: !!regGpsId.trim(),
      driverAppPaired: false,
      qrActive: true,
    }
    setBusList((bl) => [...bl, newBus])
    setBusStates((s) => ({ ...s, [id]: newBus.status }))
    setRegSuccess(true)
  }

  // ─── Status change ──────────────────────────────────────────────────────────

  function openStatusChange(bus: Bus) {
    setStatusChangeTarget(bus)
    setNewStatus(bus.status)
    setStatusReason(""); setStatusReturnDate(""); setStatusNote("")
    setStatusChangeOpen(true)
  }

  function handleStatusChange() {
    if (!statusChangeTarget) return
    setBusStates((s) => ({ ...s, [statusChangeTarget.id]: newStatus }))
    const label = statusConfig[newStatus].label
    addToast(`${statusChangeTarget.code} → ${label}`, newStatus === "blocked" || newStatus === "decommissioned" ? "error" : "info")
    setStatusChangeOpen(false)
    setSelected(null)
  }

  // ─── Add maintenance record ──────────────────────────────────────────────────

  function handleAddMaintenance() {
    if (!maintBusId || !maintDate || !maintVendor.trim()) return
    const bus = mergedBuses.find((b) => b.id === maintBusId)
    if (!bus) return
    const id = `m${Date.now()}`
    const rec: MaintenanceRecord = {
      id, busId: maintBusId, busCode: bus.code,
      type: maintType, date: maintDate, nextDue: maintNextDue || maintDate,
      cost: parseFloat(maintCost) || 0, vendor: maintVendor.trim(),
      notes: maintNotes.trim() || undefined, status: "completed",
    }
    setRecords((r) => [rec, ...r])
    addToast(`Maintenance record added for ${bus.code}`)
    setMaintOpen(false)
    setMaintBusId(""); setMaintType("routine"); setMaintDate(""); setMaintNextDue("")
    setMaintCost(""); setMaintVendor(""); setMaintNotes("")
  }

  // ─── Render helpers ─────────────────────────────────────────────────────────

  function openMaintForBus(busId: string) {
    setMaintBusId(busId); setMaintOpen(true)
  }

  // ─── BUSES TAB ──────────────────────────────────────────────────────────────

  function BusesTab() {
    return (
      <>
        {/* Search + type filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <SearchNormal1 size={14} color="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-dim pointer-events-none" />
            <Input
              placeholder="Search by code, plate, model, driver…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="sm:w-40">
            <option value="all">All Types</option>
            {(Object.entries(busTypeLabels) as [BusType, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </div>

        {/* Status filters + view toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {statusFilters.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                  statusFilter === f
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300 border-transparent"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-lg border border-white/[0.08] p-1">
            <button onClick={() => setView("grid")} className={cn("p-1.5 rounded-md transition-colors", view === "grid" ? "bg-white/10 text-zinc-200" : "text-zinc-500 hover:text-zinc-300")} title="Grid view">
              <Grid1 size={14} color="currentColor" />
            </button>
            <button onClick={() => setView("table")} className={cn("p-1.5 rounded-md transition-colors", view === "table" ? "bg-white/10 text-zinc-200" : "text-zinc-500 hover:text-zinc-300")} title="Table view">
              <RowVertical size={14} color="currentColor" />
            </button>
          </div>
        </div>

        {filteredBuses.length === 0 && (
          <div className="text-center py-16 text-zinc-500 text-sm">No buses match your filters</div>
        )}

        {/* Grid view */}
        {view === "grid" && filteredBuses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBuses.map((bus) => {
              const sc = statusConfig[bus.status]
              const fill = bus.currentPassengers !== undefined ? (bus.currentPassengers / bus.capacity) * 100 : 0
              return (
                <Card key={bus.id} className="hover:border-white/[0.18] transition-colors cursor-pointer" onClick={() => { setSelected(bus); setDetailTab("overview") }}>
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
                      </div>
                      <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Next Maint.</p>
                        <div className="mt-0.5">
                          <MaintBadge nextDue={bus.nextMaintenanceDue} />
                        </div>
                      </div>
                    </div>

                    {bus.fuelLevel !== undefined && (
                      <div className="mt-2 rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-zinc-600">Fuel</span>
                          <span className={cn(bus.fuelLevel < 25 ? "text-red-400" : "text-zinc-400")}>{bus.fuelLevel}%</span>
                        </div>
                        <Progress value={bus.fuelLevel} colorClass={bus.fuelLevel < 25 ? "bg-red-500" : bus.fuelLevel < 40 ? "bg-yellow-500" : "bg-emerald-500"} className="h-1" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Table view */}
        {view === "table" && filteredBuses.length > 0 && (
          <div className="rounded-xl border border-white/[0.08] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  {["Bus", "Status", "Driver", "Route", "Passengers", "Fuel", "Inspection", "Last Seen", "Next Maint."].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredBuses.map((bus) => {
                  const sc = statusConfig[bus.status]
                  const fill = bus.currentPassengers !== undefined ? (bus.currentPassengers / bus.capacity) * 100 : 0
                  return (
                    <tr key={bus.id} className="hover:bg-white/[0.03] transition-colors cursor-pointer group" onClick={() => { setSelected(bus); setDetailTab("overview") }}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100">{bus.code}</p>
                        <p className="text-[11px] text-zinc-600">{bus.model} · {bus.plate}</p>
                      </td>
                      <td className="px-4 py-3"><Badge variant={sc.variant}>{sc.label}</Badge></td>
                      <td className="px-4 py-3">
                        {bus.driver ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={bus.driver} size="xs" />
                            <span className="text-xs text-zinc-300">{bus.driver}</span>
                          </div>
                        ) : <span className="text-xs text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-3"><span className="text-xs text-zinc-400">{bus.route ?? "—"}</span></td>
                      <td className="px-4 py-3">
                        {bus.status === "active" && bus.currentPassengers !== undefined ? (
                          <div className="flex items-center gap-2 min-w-[80px]">
                            <Progress value={fill} colorClass={fill > 85 ? "bg-emerald-500" : "bg-amber-500"} />
                            <span className="text-[11px] text-zinc-600 whitespace-nowrap">{bus.currentPassengers}/{bus.capacity}</span>
                          </div>
                        ) : <span className="text-xs text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {bus.fuelLevel !== undefined ? (
                          <div className="flex items-center gap-2 min-w-[70px]">
                            <Progress value={bus.fuelLevel} colorClass={bus.fuelLevel < 25 ? "bg-red-500" : bus.fuelLevel < 40 ? "bg-yellow-500" : "bg-emerald-500"} />
                            <span className={cn("text-[11px] whitespace-nowrap", bus.fuelLevel < 25 ? "text-red-400" : "text-zinc-500")}>{bus.fuelLevel}%</span>
                          </div>
                        ) : <span className="text-xs text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {bus.inspectionResult === "pass"
                            ? <TickCircle size={12} color="#34d399" variant="Bold" />
                            : bus.inspectionResult === "fail"
                            ? <CloseCircle size={12} color="#f87171" variant="Bold" />
                            : null}
                          <span className={cn("text-xs capitalize", bus.inspectionResult === "pass" ? "text-emerald-400" : bus.inspectionResult === "fail" ? "text-red-400" : "text-zinc-500")}>
                            {bus.inspectionResult}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs", bus.lastSeen === "Live" ? "text-emerald-400" : "text-zinc-500")}>{bus.lastSeen ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3"><MaintBadge nextDue={bus.nextMaintenanceDue} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </>
    )
  }

  // ─── MAINTENANCE TAB ────────────────────────────────────────────────────────

  function MaintenanceTab() {
    const overdue = records.filter((r) => r.status === "overdue").length
    const scheduled = records.filter((r) => r.status === "scheduled").length

    return (
      <>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {overdue > 0 && <Badge variant="destructive">{overdue} Overdue</Badge>}
            {scheduled > 0 && <Badge variant="warning">{scheduled} Scheduled</Badge>}
            <span className="text-xs text-zinc-500">{records.length} total records</span>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setMaintOpen(true)}>
            <Add size={14} color="currentColor" />
            Add Record
          </Button>
        </div>

        <div className="rounded-xl border border-white/[0.08] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                {["Bus", "Type", "Date", "Next Due", "Status", "Cost", "Vendor"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 font-semibold text-zinc-200 whitespace-nowrap">{r.busCode}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-zinc-400">{maintTypeLabels[r.type]}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400 whitespace-nowrap">{fmtDate(r.date)}</td>
                  <td className="px-4 py-3 text-xs text-zinc-400 whitespace-nowrap">{fmtDate(r.nextDue)}</td>
                  <td className="px-4 py-3">
                    {r.status === "overdue" ? <Badge variant="destructive">Overdue</Badge>
                      : r.status === "scheduled" ? <Badge variant="warning">Scheduled</Badge>
                      : <Badge variant="success">Completed</Badge>}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400 whitespace-nowrap">
                    ₦{r.cost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{r.vendor}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && (
            <div className="text-center py-10 text-zinc-600 text-sm">No maintenance records yet</div>
          )}
        </div>
      </>
    )
  }

  // ─── DOCUMENTS TAB ──────────────────────────────────────────────────────────

  function DocumentsTab() {
    const expired = mergedBuses.filter((b) =>
      complianceStatus(b.insuranceExpiry) === "expired" ||
      complianceStatus(b.roadworthinessExpiry) === "expired" ||
      complianceStatus(b.vehicleLicenseExpiry) === "expired"
    ).length
    const expiring = mergedBuses.filter((b) =>
      (complianceStatus(b.insuranceExpiry) === "expiring" ||
       complianceStatus(b.roadworthinessExpiry) === "expiring" ||
       complianceStatus(b.vehicleLicenseExpiry) === "expiring") &&
      complianceStatus(b.insuranceExpiry) !== "expired"
    ).length

    return (
      <>
        <div className="flex items-center gap-3">
          {expired > 0 && <div className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/[0.05] px-3 py-2"><Warning2 size={13} color="#f87171" variant="Bold" /><span className="text-xs text-red-400 font-medium">{expired} bus{expired !== 1 ? "es" : ""} with expired docs</span></div>}
          {expiring > 0 && <div className="flex items-center gap-1.5 rounded-lg border border-yellow-500/20 bg-yellow-500/[0.05] px-3 py-2"><Warning2 size={13} color="#fbbf24" variant="Bold" /><span className="text-xs text-yellow-400 font-medium">{expiring} expiring within 30 days</span></div>}
          {expired === 0 && expiring === 0 && <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] px-3 py-2"><TickCircle size={13} color="#34d399" variant="Bold" /><span className="text-xs text-emerald-400 font-medium">All documents in order</span></div>}
        </div>

        <div className="rounded-xl border border-white/[0.08] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Bus</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Insurance</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Roadworthiness</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Vehicle License</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Dispatch Ready</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {mergedBuses.filter((b) => b.status !== "decommissioned").map((bus) => {
                const allValid =
                  complianceStatus(bus.insuranceExpiry) === "valid" &&
                  complianceStatus(bus.roadworthinessExpiry) === "valid" &&
                  complianceStatus(bus.vehicleLicenseExpiry) === "valid"
                return (
                  <tr key={bus.id} className="hover:bg-white/[0.03] transition-colors cursor-pointer" onClick={() => { setSelected(bus); setDetailTab("compliance") }}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-zinc-200">{bus.code}</p>
                      <p className="text-[11px] text-zinc-600">{bus.plate}</p>
                    </td>
                    <td className="px-4 py-3">
                      <ComplianceBadge expiry={bus.insuranceExpiry} />
                      <p className="text-[10px] text-zinc-600 mt-0.5">{fmtDate(bus.insuranceExpiry)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <ComplianceBadge expiry={bus.roadworthinessExpiry} />
                      <p className="text-[10px] text-zinc-600 mt-0.5">{fmtDate(bus.roadworthinessExpiry)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <ComplianceBadge expiry={bus.vehicleLicenseExpiry} />
                      <p className="text-[10px] text-zinc-600 mt-0.5">{fmtDate(bus.vehicleLicenseExpiry)}</p>
                    </td>
                    <td className="px-4 py-3">
                      {allValid
                        ? <Badge variant="success">Ready</Badge>
                        : <Badge variant="destructive">Not Ready</Badge>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  // ─── DEVICES TAB ────────────────────────────────────────────────────────────

  function DevicesTab() {
    const linked = mergedBuses.filter((b) => b.gpsPaired).length
    const offline = mergedBuses.filter((b) => b.gpsDeviceId && !b.gpsPaired).length

    return (
      <>
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-zinc-400">
            <span className="text-emerald-400 font-semibold">{linked}</span> GPS linked
          </div>
          {offline > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/[0.05] px-3 py-2">
              <Warning2 size={13} color="#f87171" variant="Bold" />
              <span className="text-xs text-red-400 font-medium">{offline} device{offline !== 1 ? "s" : ""} offline</span>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.08] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                {["Bus", "GPS Device", "GPS Status", "Last Ping", "App Paired", "QR Code", "Bus Unique Code"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {mergedBuses.filter((b) => b.status !== "decommissioned").map((bus) => (
                <tr key={bus.id} className="hover:bg-white/[0.03] transition-colors cursor-pointer" onClick={() => { setSelected(bus); setDetailTab("devices") }}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-zinc-200">{bus.code}</p>
                    <p className="text-[11px] text-zinc-600">{bus.plate}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">{bus.gpsDeviceId ?? <span className="text-zinc-600">Not assigned</span>}</td>
                  <td className="px-4 py-3">
                    {bus.gpsPaired
                      ? <Badge variant="success">Online</Badge>
                      : bus.gpsDeviceId
                      ? <Badge variant="destructive">Offline</Badge>
                      : <Badge variant="muted">No Device</Badge>}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{bus.gpsLastPing ?? "—"}</td>
                  <td className="px-4 py-3">
                    {bus.driverAppPaired
                      ? <Badge variant="success">Paired</Badge>
                      : <Badge variant="muted">Not Paired</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    {bus.qrActive
                      ? <Badge variant="success">Active</Badge>
                      : <Badge variant="muted">Inactive</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-amber-400">{bus.busUniqueCode ?? "—"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  // ─── BUS DETAIL SHEET ───────────────────────────────────────────────────────

  const detailTabs: { key: DetailTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "compliance", label: "Compliance" },
    { key: "devices", label: "Devices & QR" },
    { key: "history", label: "History" },
  ]

  // ─── RENDER ─────────────────────────────────────────────────────────────────

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
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryItems.map((s) => (
            <Card key={s.label} className="p-4 flex items-center gap-3">
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", s.bg)}>
                <BusIcon size={16} color={s.iconColor} variant="Bold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">{s.count}</p>
                <p className="text-xs text-zinc-500">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-white/[0.06]">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px",
                activeTab === t.key
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-4">
          {activeTab === "buses" && <BusesTab />}
          {activeTab === "maintenance" && <MaintenanceTab />}
          {activeTab === "documents" && <DocumentsTab />}
          {activeTab === "devices" && <DevicesTab />}
        </div>
      </main>

      {/* ── REGISTER BUS SHEET ────────────────────────────────────────────── */}
      <Sheet
        open={regOpen}
        onClose={() => setRegOpen(false)}
        title={regSuccess ? "Bus Registered" : "Register New Bus"}
        subtitle={regSuccess ? undefined : `Step ${regStep} of 5`}
        footer={
          regSuccess ? (
            <Button variant="outline" size="sm" className="ml-auto" onClick={() => setRegOpen(false)}>Close</Button>
          ) : regStep === 1 ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setRegOpen(false)}>Cancel</Button>
              <Button size="sm" className="ml-auto" onClick={() => { if (validateStep1()) setRegStep(2) }} disabled={!regCode.trim() || !regModel.trim() || !regPlate.trim()}>Next</Button>
            </>
          ) : regStep === 2 ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setRegStep(1)}>Back</Button>
              <Button size="sm" className="ml-auto" onClick={() => setRegStep(3)} disabled={!regCapacity.trim()}>Next</Button>
            </>
          ) : regStep === 3 ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setRegStep(2)}>Back</Button>
              <Button size="sm" className="ml-auto" onClick={() => setRegStep(4)}>Next</Button>
            </>
          ) : regStep === 4 ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setRegStep(3)}>Back</Button>
              <Button size="sm" className="ml-auto" onClick={() => setRegStep(5)}>Review</Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setRegStep(4)}>Back</Button>
              <Button size="sm" className="ml-auto gap-1.5" onClick={handleRegisterBus}>
                <Add size={14} color="currentColor" />
                Register Bus
              </Button>
            </>
          )
        }
      >
        <div className="px-6 py-5">
          {/* Step progress bar */}
          {!regSuccess && (
            <div className="flex gap-1 mb-6">
              {[1,2,3,4,5].map((s) => (
                <div key={s} className={cn("h-1 flex-1 rounded-full transition-colors", s <= regStep ? "bg-amber-500" : "bg-white/[0.08]")} />
              ))}
            </div>
          )}

          {/* Success screen */}
          {regSuccess && (
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center py-4">
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                  <TickCircle size={28} color="#34d399" variant="Bold" />
                </div>
                <p className="text-base font-semibold text-zinc-100">Bus {regCode.toUpperCase()} Registered</p>
                <p className="text-sm text-zinc-500 mt-1">What would you like to do next?</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 text-center">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Bus Unique Code</p>
                <p className="font-mono text-lg font-bold text-amber-400">{genBusUniqueCode(regCode)}</p>
                <p className="text-[11px] text-zinc-600 mt-1">Print and attach to bus for manual boarding</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { setRegSuccess(false); openRegister() }} className="rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-left hover:bg-white/[0.05] transition-colors">
                  <p className="text-xs font-medium text-zinc-200">Add Another Bus</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Register another vehicle</p>
                </button>
                <button onClick={() => { const nb = mergedBuses[mergedBuses.length - 1]; if (nb) { setSelected(nb); setDetailTab("overview") } setRegOpen(false) }} className="rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-left hover:bg-white/[0.05] transition-colors">
                  <p className="text-xs font-medium text-zinc-200">View Bus Details</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Open the bus profile</p>
                </button>
                <button onClick={() => setRegOpen(false)} className="col-span-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-center hover:bg-white/[0.05] transition-colors">
                  <p className="text-xs font-medium text-zinc-400">Done</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Bus Identity */}
          {!regSuccess && regStep === 1 && (
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Bus Identity</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Bus Code <span className="text-red-400">*</span></label>
                  <Input placeholder="e.g. BUS-015" value={regCode} onChange={(e) => setRegCode(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Bus Type</label>
                  <Select value={regBusType} onChange={(e) => setRegBusType(e.target.value)}>
                    {(Object.entries(busTypeLabels) as [string, string][]).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Manufacturer</label>
                  <Input placeholder="e.g. Toyota" value={regManufacturer} onChange={(e) => setRegManufacturer(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Model <span className="text-red-400">*</span></label>
                  <Input placeholder="e.g. Coaster" value={regModel} onChange={(e) => setRegModel(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Year</label>
                  <Input type="number" placeholder="e.g. 2021" value={regYear} onChange={(e) => setRegYear(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Colour</label>
                  <Input placeholder="e.g. White" value={regColour} onChange={(e) => setRegColour(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Plate Number <span className="text-red-400">*</span></label>
                <Input placeholder="e.g. LND-234-AA" value={regPlate} onChange={(e) => { setRegPlate(e.target.value); setPlateError("") }} className={plateError ? "border-red-500/50" : ""} />
                {plateError && <p className="text-xs text-red-400 mt-1">{plateError} — <button className="underline" onClick={() => setRegOpen(false)}>search existing buses</button></p>}
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">VIN / Chassis Number <span className="text-zinc-600">(optional)</span></label>
                <Input placeholder="e.g. JT2BF22K4W0123456" value={regVin} onChange={(e) => setRegVin(e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 2: Capacity */}
          {!regSuccess && regStep === 2 && (
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Capacity & Configuration</p>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Seating Capacity <span className="text-red-400">*</span></label>
                <Input type="number" min="1" max="100" value={regCapacity} onChange={(e) => setRegCapacity(e.target.value)} />
                <p className="text-[11px] text-zinc-600 mt-1">Total number of fixed seats</p>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Standing Passengers Allowed?</label>
                <Select value={regStanding} onChange={(e) => setRegStanding(e.target.value)}>
                  <option value="no">No — seats only</option>
                  <option value="yes">Yes — standing permitted</option>
                </Select>
              </div>
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
                  <p className="text-[11px] text-zinc-500 mt-1">Bus will be registered but set to Blocked until maintenance clears it.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Documents */}
          {!regSuccess && regStep === 3 && (
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Documents & Compliance</p>
              <p className="text-xs text-zinc-500">Enter expiry dates. Buses with expired documents cannot be dispatched.</p>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Insurance Expiry Date</label>
                <Input type="date" value={regInsuranceExpiry} onChange={(e) => setRegInsuranceExpiry(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Roadworthiness Expiry Date</label>
                <Input type="date" value={regRoadworthinessExpiry} onChange={(e) => setRegRoadworthinessExpiry(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Vehicle License Expiry Date</label>
                <Input type="date" value={regVehicleLicenseExpiry} onChange={(e) => setRegVehicleLicenseExpiry(e.target.value)} />
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-[11px] text-zinc-500">Documents expiring within 30 days will trigger a compliance alert. You can update these later from the bus profile.</p>
              </div>
            </div>
          )}

          {/* Step 4: Device & QR */}
          {!regSuccess && regStep === 4 && (
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Device & QR Setup</p>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">GPS Device ID <span className="text-zinc-600">(optional)</span></label>
                <Input placeholder="e.g. GPS-015" value={regGpsId} onChange={(e) => setRegGpsId(e.target.value)} />
                <p className="text-[11px] text-zinc-600 mt-1">Leave blank if hardware hasn't been fitted yet</p>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Driver App Pairing Method</label>
                <Select value={regPairingMethod} onChange={(e) => setRegPairingMethod(e.target.value)}>
                  <option value="list">Driver selects bus from list</option>
                  <option value="qr">Driver scans QR code to bind</option>
                </Select>
              </div>
              <Separator />
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
                <p className="text-xs text-zinc-400 mb-2">Auto-generated Bus Unique Code</p>
                <p className="font-mono text-xl font-bold text-amber-400">{genBusUniqueCode(regCode || "000")}</p>
                <p className="text-[11px] text-zinc-500 mt-2">This code identifies the bus for manual fare collection. Print and display on the bus dashboard.</p>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {!regSuccess && regStep === 5 && (
            <div className="space-y-5">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Confirm & Register</p>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] divide-y divide-white/[0.05]">
                {[
                  ["Bus Code", regCode.toUpperCase(), "text-amber-400"],
                  ["Type", busTypeLabels[regBusType as BusType] ?? regBusType, ""],
                  ["Model", `${regManufacturer} ${regModel}`.trim(), ""],
                  ["Year", regYear || "—", ""],
                  ["Plate", regPlate.toUpperCase(), ""],
                  ["VIN", regVin || "—", "text-zinc-500"],
                  ["Colour", regColour || "—", ""],
                  ["Capacity", `${regCapacity} seats${regStanding === "yes" ? " + standing" : ""}`, ""],
                  ["Inspection", regInspection, regInspection === "pass" ? "text-emerald-400" : regInspection === "fail" ? "text-red-400" : "text-zinc-400"],
                  ["GPS Device", regGpsId || "Not assigned", ""],
                  ["Initial Status", regInspection === "fail" ? "Blocked" : "Available", regInspection === "fail" ? "text-red-400" : "text-zinc-400"],
                ].map(([label, value, cls]) => (
                  <div key={label as string} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-zinc-500">{label}</span>
                    <span className={cn("text-sm font-medium text-zinc-200", cls as string)}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 p-4">
                <div className="flex items-center gap-2">
                  <TickCircle size={14} color="#34d399" variant="Bold" />
                  <p className="text-xs text-emerald-400 font-medium">Ready to register</p>
                </div>
                <p className="text-[11px] text-zinc-600 mt-1">
                  {regInspection === "fail"
                    ? "Bus will be added as Blocked — clear inspection before dispatching."
                    : "Bus will be added to the fleet and available for dispatch."}
                </p>
              </div>
            </div>
          )}
        </div>
      </Sheet>

      {/* ── BUS DETAIL SHEET ──────────────────────────────────────────────── */}
      <Sheet
        open={!!selectedBus}
        onClose={() => setSelected(null)}
        title={selectedBus ? `${selectedBus.code} — ${selectedBus.model}` : ""}
        subtitle={selectedBus?.plate}
        footer={
          selectedBus ? (
            <>
              {selectedBus.driver && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setUnassignTarget(selectedBus)}>
                  <UserRemove size={14} color="currentColor" />
                  Unassign Driver
                </Button>
              )}
              <Button variant="outline" size="sm" className="ml-auto gap-1.5" onClick={() => openStatusChange(selectedBus)}>
                <Setting2 size={14} color="currentColor" />
                Change Status
              </Button>
            </>
          ) : undefined
        }
      >
        {selectedBus && (
          <div className="flex flex-col h-full">
            {/* Detail tab bar */}
            <div className="flex gap-1 border-b border-white/[0.06] px-6 pt-2 shrink-0">
              {detailTabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setDetailTab(t.key)}
                  className={cn(
                    "px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px",
                    detailTab === t.key
                      ? "border-amber-500 text-amber-400"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Overview */}
            {detailTab === "overview" && (
              <div className="px-6 py-5 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Status</p>
                    <Badge variant={statusConfig[selectedBus.status].variant}>{statusConfig[selectedBus.status].label}</Badge>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Capacity</p>
                    <p className="text-sm font-semibold text-zinc-200">{selectedBus.capacity} seats{selectedBus.standingAllowed ? " + standing" : ""}</p>
                  </div>
                  {selectedBus.busType && (
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4">
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Type</p>
                      <p className="text-sm font-semibold text-zinc-200">{busTypeLabels[selectedBus.busType]}</p>
                    </div>
                  )}
                  {selectedBus.year && (
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4">
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Year</p>
                      <p className="text-sm font-semibold text-zinc-200">{selectedBus.year} {selectedBus.colour && `· ${selectedBus.colour}`}</p>
                    </div>
                  )}
                </div>

                {selectedBus.vin && (
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">VIN / Chassis</p>
                    <p className="font-mono text-xs text-zinc-300">{selectedBus.vin}</p>
                  </div>
                )}

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

                {selectedBus.status === "active" && selectedBus.currentPassengers !== undefined && (
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Passenger Load</p>
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-400">Onboard</span>
                        <span className="font-semibold text-zinc-100">{selectedBus.currentPassengers} / {selectedBus.capacity}</span>
                      </div>
                      <Progress value={(selectedBus.currentPassengers / selectedBus.capacity) * 100} colorClass="bg-amber-500" />
                    </div>
                  </div>
                )}

                {/* Trip & Revenue summary */}
                <div>
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Last 7 Days</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Trips", value: selectedBus.status === "maintenance" || selectedBus.status === "decommissioned" ? "0" : "14" },
                      { label: "Revenue", value: selectedBus.status === "maintenance" || selectedBus.status === "decommissioned" ? "₦0" : "₦312,500" },
                      { label: "Avg Pax", value: selectedBus.status === "maintenance" || selectedBus.status === "decommissioned" ? "—" : "22" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3 text-center">
                        <p className="text-sm font-bold text-zinc-100">{s.value}</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Inspection */}
                <div>
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Inspection Record</p>
                  <div className={cn("rounded-xl border p-4", selectedBus.inspectionResult === "pass" ? "border-emerald-500/20 bg-emerald-500/[0.04]" : selectedBus.inspectionResult === "fail" ? "border-red-500/20 bg-red-500/[0.04]" : "border-white/[0.06] bg-white/[0.02]")}>
                    <div className="flex items-center gap-2 mb-1">
                      {selectedBus.inspectionResult === "pass"
                        ? <TickCircle size={16} color="#34d399" variant="Bold" />
                        : <CloseCircle size={16} color="#f87171" variant="Bold" />}
                      <p className={cn("text-sm font-semibold capitalize", selectedBus.inspectionResult === "pass" ? "text-emerald-400" : "text-red-400")}>
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
                        <span className={cn("font-semibold", selectedBus.fuelLevel < 25 ? "text-red-400" : selectedBus.fuelLevel < 40 ? "text-yellow-400" : "text-emerald-400")}>{selectedBus.fuelLevel}%</span>
                      </div>
                      <Progress value={selectedBus.fuelLevel} colorClass={selectedBus.fuelLevel < 25 ? "bg-red-500" : selectedBus.fuelLevel < 40 ? "bg-yellow-500" : "bg-emerald-500"} />
                      {selectedBus.fuelLevel < 25 && <p className="text-xs text-red-400 mt-2">Low fuel — schedule refuelling before next trip</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Compliance tab */}
            {detailTab === "compliance" && (
              <div className="px-6 py-5 space-y-4 overflow-y-auto">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Document Status</p>
                {[
                  { label: "Insurance", expiry: selectedBus.insuranceExpiry },
                  { label: "Roadworthiness", expiry: selectedBus.roadworthinessExpiry },
                  { label: "Vehicle License", expiry: selectedBus.vehicleLicenseExpiry },
                ].map((doc) => {
                  const s = complianceStatus(doc.expiry)
                  return (
                    <div key={doc.label} className={cn("rounded-xl border p-4",
                      s === "expired" ? "border-red-500/20 bg-red-500/[0.04]" :
                      s === "expiring" ? "border-yellow-500/20 bg-yellow-500/[0.04]" :
                      s === "valid" ? "border-emerald-500/20 bg-emerald-500/[0.04]" :
                      "border-white/[0.06] bg-white/[0.02]"
                    )}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-zinc-200">{doc.label}</p>
                        <ComplianceBadge expiry={doc.expiry} />
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Calendar size={12} color="#52525b" variant="Linear" />
                        <p className="text-xs text-zinc-500">
                          {doc.expiry ? `Expires ${fmtDate(doc.expiry)}` : "No expiry date on file"}
                        </p>
                      </div>
                      {s === "expiring" && <p className="text-[11px] text-yellow-400 mt-2">Expiring within 30 days — renew before scheduling beyond this date</p>}
                      {s === "expired" && <p className="text-[11px] text-red-400 mt-2">Document expired — bus cannot be dispatched until renewed</p>}
                    </div>
                  )
                })}
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                  <p className="text-xs text-zinc-500">Update document expiry dates from Settings → Fleet, or contact your fleet administrator.</p>
                </div>
              </div>
            )}

            {/* Devices tab */}
            {detailTab === "devices" && (
              <div className="px-6 py-5 space-y-4 overflow-y-auto">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">GPS & Tracking</p>
                <div className={cn("rounded-xl border p-4", selectedBus.gpsPaired ? "border-emerald-500/20 bg-emerald-500/[0.04]" : "border-white/[0.06] bg-white/[0.02]")}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-zinc-200">GPS Device</p>
                    {selectedBus.gpsPaired
                      ? <Badge variant="success">Online</Badge>
                      : selectedBus.gpsDeviceId
                      ? <Badge variant="destructive">Offline</Badge>
                      : <Badge variant="muted">Not Assigned</Badge>}
                  </div>
                  {selectedBus.gpsDeviceId && <p className="text-xs text-zinc-500">Device ID: <span className="font-mono text-zinc-300">{selectedBus.gpsDeviceId}</span></p>}
                  {selectedBus.gpsLastPing && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Timer1 size={11} color="#52525b" variant="Linear" />
                      <p className="text-xs text-zinc-500">Last ping: {selectedBus.gpsLastPing}</p>
                    </div>
                  )}
                  {!selectedBus.gpsPaired && selectedBus.gpsDeviceId && (
                    <p className="text-[11px] text-red-400 mt-2">Device not sending data. Bus is still operational but live tracking is unavailable.</p>
                  )}
                </div>

                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Driver App</p>
                <div className={cn("rounded-xl border p-4", selectedBus.driverAppPaired ? "border-emerald-500/20 bg-emerald-500/[0.04]" : "border-white/[0.06] bg-white/[0.02]")}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-200">Driver App Pairing</p>
                    {selectedBus.driverAppPaired ? <Badge variant="success">Paired</Badge> : <Badge variant="muted">Not Paired</Badge>}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1.5">{selectedBus.driverAppPaired ? "A driver's app is currently linked to this bus." : "No driver app is linked. Driver will select this bus manually or by scanning QR."}</p>
                </div>

                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">QR Code & Boarding</p>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-zinc-200">Bus QR Code</p>
                        {selectedBus.qrActive ? <Badge variant="success">Active</Badge> : <Badge variant="muted">Inactive</Badge>}
                      </div>
                      <p className="text-[11px] text-zinc-500">Scan to bind a driver or validate manual boarding.</p>
                      <p className="font-mono text-lg font-bold text-amber-400 mt-3">{selectedBus.busUniqueCode ?? genBusUniqueCode(selectedBus.code)}</p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">Bus Unique Code</p>
                    </div>
                    <div className="shrink-0 h-16 w-16 rounded-lg border border-amber-500/30 bg-amber-500/[0.08] flex items-center justify-center">
                      <div className="grid grid-cols-4 gap-px p-1">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div key={i} className={cn("h-2.5 w-2.5 rounded-[1px]", [0,1,4,5,2,7,8,10,13,15].includes(i) ? "bg-amber-500/70" : "bg-transparent")} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => addToast(`QR downloaded for ${selectedBus.code}`)}>Download QR</Button>
                    <Button variant="ghost" size="sm" onClick={() => addToast(`QR regenerated for ${selectedBus.code} — old code invalidated`, "info")}>Regenerate</Button>
                  </div>
                </div>
              </div>
            )}

            {/* History tab */}
            {detailTab === "history" && (
              <div className="px-6 py-5 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Maintenance History</p>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => openMaintForBus(selectedBus.id)}>
                    <Add size={12} color="currentColor" />
                    Add Record
                  </Button>
                </div>

                {/* Next due + last service summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Next Due</p>
                    <MaintBadge nextDue={selectedBus.nextMaintenanceDue} />
                    {selectedBus.nextMaintenanceDue && selectedBus.nextMaintenanceDue !== "Overdue" && (
                      <p className="text-[10px] text-zinc-600 mt-1">{fmtDate(selectedBus.nextMaintenanceDue)}</p>
                    )}
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Records</p>
                    <p className="text-sm font-semibold text-zinc-200">{busRecords.length}</p>
                  </div>
                </div>

                {busRecords.length === 0 ? (
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-8 text-center">
                    <p className="text-sm text-zinc-600">No maintenance records for this bus</p>
                    <Button variant="ghost" size="sm" className="mt-3 gap-1.5" onClick={() => openMaintForBus(selectedBus.id)}>
                      <Add size={12} color="currentColor" />
                      Add First Record
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {busRecords.map((r) => (
                      <div key={r.id} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{maintTypeLabels[r.type]}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{r.vendor}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-amber-400">₦{r.cost.toLocaleString()}</p>
                            <p className="text-[10px] text-zinc-600">{fmtDate(r.date)}</p>
                          </div>
                        </div>
                        {r.notes && <p className="text-xs text-zinc-500 border-t border-white/[0.05] pt-2 mt-2">{r.notes}</p>}
                        <div className="flex items-center gap-1.5 mt-2">
                          <Calendar size={11} color="#52525b" variant="Linear" />
                          <p className="text-[10px] text-zinc-600">Next due: {fmtDate(r.nextDue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Sheet>

      {/* ── STATUS CHANGE DIALOG ──────────────────────────────────────────── */}
      <Dialog
        open={statusChangeOpen}
        onClose={() => setStatusChangeOpen(false)}
        title="Change Bus Status"
        description={statusChangeTarget ? `Update the operational status for ${statusChangeTarget.code}` : ""}
      >
        <div className="space-y-4 mt-1">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">New Status</label>
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value as BusStatus)}>
              <option value="active">On Route (Active)</option>
              <option value="available">Available</option>
              <option value="blocked">Blocked</option>
              <option value="maintenance">Under Maintenance</option>
              <option value="decommissioned">Decommissioned</option>
            </Select>
          </div>
          {newStatus === "maintenance" && (
            <>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Expected Return Date</label>
                <Input type="date" value={statusReturnDate} onChange={(e) => setStatusReturnDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Maintenance Note</label>
                <Textarea placeholder="Describe what work is being done…" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} className="min-h-[70px]" />
              </div>
            </>
          )}
          {newStatus === "decommissioned" && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-3">
              <p className="text-xs text-red-400 font-medium">This action archives the bus</p>
              <p className="text-[11px] text-zinc-500 mt-1">Decommissioned buses are removed from dispatch and scheduling. This cannot be automatically reversed.</p>
            </div>
          )}
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Reason <span className="text-zinc-600">(optional)</span></label>
            <Input placeholder="e.g. Scheduled for major overhaul" value={statusReason} onChange={(e) => setStatusReason(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" size="sm" onClick={() => setStatusChangeOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              variant={newStatus === "decommissioned" || newStatus === "blocked" ? "destructive" : "default"}
              onClick={handleStatusChange}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ── UNASSIGN DRIVER CONFIRM ───────────────────────────────────────── */}
      <Dialog
        open={!!unassignTarget}
        onClose={() => setUnassignTarget(null)}
        title="Unassign Driver"
        description={unassignTarget ? `Remove ${unassignTarget.driver} from ${unassignTarget.code}?` : ""}
      >
        <div className="flex gap-2 justify-end mt-2">
          <Button variant="outline" size="sm" onClick={() => setUnassignTarget(null)}>Cancel</Button>
          <Button size="sm" onClick={() => { addToast(`Driver unassigned from ${unassignTarget?.code}`, "info"); setUnassignTarget(null); setSelected(null) }}>
            Confirm
          </Button>
        </div>
      </Dialog>

      {/* ── ADD MAINTENANCE RECORD SHEET ─────────────────────────────────── */}
      <Sheet
        open={maintOpen}
        onClose={() => setMaintOpen(false)}
        title="Add Maintenance Record"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setMaintOpen(false)}>Cancel</Button>
            <Button size="sm" className="ml-auto gap-1.5" onClick={handleAddMaintenance} disabled={!maintBusId || !maintDate || !maintVendor.trim()}>
              <Add size={14} color="currentColor" />
              Save Record
            </Button>
          </>
        }
      >
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Bus <span className="text-red-400">*</span></label>
            <Select value={maintBusId} onChange={(e) => setMaintBusId(e.target.value)}>
              <option value="">Select bus…</option>
              {mergedBuses.filter((b) => b.status !== "decommissioned").map((b) => (
                <option key={b.id} value={b.id}>{b.code} — {b.plate}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Maintenance Type</label>
            <Select value={maintType} onChange={(e) => setMaintType(e.target.value as MaintenanceType)}>
              {(Object.entries(maintTypeLabels) as [MaintenanceType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Date <span className="text-red-400">*</span></label>
              <Input type="date" value={maintDate} onChange={(e) => setMaintDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Next Due Date</label>
              <Input type="date" value={maintNextDue} onChange={(e) => setMaintNextDue(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Cost (₦)</label>
              <Input type="number" placeholder="e.g. 45000" value={maintCost} onChange={(e) => setMaintCost(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Vendor / Mechanic <span className="text-red-400">*</span></label>
              <Input placeholder="e.g. Toyota Service Centre" value={maintVendor} onChange={(e) => setMaintVendor(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Notes</label>
            <Textarea placeholder="Describe work done, parts replaced, observations…" value={maintNotes} onChange={(e) => setMaintNotes(e.target.value)} />
          </div>
        </div>
      </Sheet>

      {/* ── TOASTS ────────────────────────────────────────────────────────── */}
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
