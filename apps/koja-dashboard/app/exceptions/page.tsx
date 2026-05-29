"use client"

import { useState } from "react"
import {
  Warning2,
  Danger,
  TickCircle,
  Bus,
  People,
  Map1,
  DocumentText1,
  SecuritySafe,
  SearchNormal1,
  ArrowRight2,
  Lock1,
  InfoCircle,
  Shield,
  ReceiptItem,
  Profile2User,
  CallCalling,
} from "iconsax-react"
import { cn } from "@/lib/utils"
import {
  exceptions as initialExceptions,
  mockPassengers,
  drivers,
  buses,
} from "@/lib/data"
import type {
  Exception,
  ExceptionCategory,
  MockPassenger,
} from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ExceptionCategory, string> = {
  driver: "Driver",
  bus_asset: "Bus / Asset",
  trip_route: "Trip / Route",
  passenger_payment: "Passenger / Payment",
  compliance: "Compliance",
  security_incident: "Security / Incident",
}

const CATEGORY_ACTIONS: Record<ExceptionCategory, { value: string; label: string }[]> = {
  driver: [
    { value: "reassign_driver", label: "Assign Replacement Driver" },
    { value: "mark_no_show", label: "Mark as No-Show" },
    { value: "delay_trip", label: "Delay Trip" },
    { value: "cancel_trip", label: "Cancel Trip" },
    { value: "notify_supervisor", label: "Notify Supervisor" },
  ],
  bus_asset: [
    { value: "assign_replacement_bus", label: "Assign Replacement Bus" },
    { value: "dispatch_replacement", label: "Dispatch Replacement (Mid-Trip)" },
    { value: "terminate_refund", label: "Terminate Trip + Issue Refund" },
    { value: "lock_bus", label: "Lock Bus from Service" },
    { value: "schedule_maintenance", label: "Schedule Maintenance" },
  ],
  trip_route: [
    { value: "correct_route", label: "Correct Route / Contact Driver" },
    { value: "override_capacity", label: "Admin Override — Overcapacity" },
    { value: "delay_trip", label: "Delay Trip" },
    { value: "cancel_trip", label: "Cancel Trip" },
  ],
  passenger_payment: [
    { value: "issue_refund", label: "Issue Passenger Refund" },
    { value: "apply_fallback_boarding", label: "Apply Fallback Boarding Rule" },
    { value: "investigate_fraud", label: "Flag for Fraud Investigation" },
  ],
  compliance: [
    { value: "force_end_shift", label: "Force End Shift" },
    { value: "approve_extension", label: "Approve Extension (Documented)" },
    { value: "reassign_driver", label: "Assign Relief Driver" },
  ],
  security_incident: [
    { value: "file_incident_report", label: "File Incident Report" },
    { value: "suspend_driver", label: "Suspend Driver (Pending Review)" },
    { value: "lock_bus_qr", label: "Lock Bus QR / AFC System" },
    { value: "escalate_police", label: "Escalate to Police" },
  ],
}

const REASON_OPTIONS: Record<string, string[]> = {
  reassign_driver: ["Driver no-show", "Driver fatigue", "Driver requested swap", "Driver compliance issue", "Driver emergency", "Driver misconduct"],
  mark_no_show: ["No communication", "Late notification given", "Personal emergency reported", "Unexplained absence"],
  notify_supervisor: ["Information only", "Escalation required", "Awaiting guidance"],
  assign_replacement_bus: ["Bus breakdown", "Bus failed inspection", "GPS offline", "Maintenance required", "Bus blocked by authority"],
  dispatch_replacement: ["Mid-trip engine failure", "Tyre puncture", "Transmission fault", "Passenger safety risk"],
  terminate_refund: ["Bus breakdown mid-trip", "Vehicle unsafe to continue", "Safety incident", "Driver incapacitated", "External authority instruction"],
  lock_bus: ["Failed inspection", "Safety risk", "Authority order", "Compliance breach", "Pending investigation"],
  schedule_maintenance: ["Routine service due", "Fault detected", "Post-inspection requirement"],
  correct_route: ["GPS deviation detected", "Driver took shortcut", "Traffic diversion", "Road closure", "Route assignment error"],
  override_capacity: ["Emergency situation", "Last trip of day", "Authorised by supervisor", "Temporary exception approved"],
  delay_trip: ["Traffic congestion", "Driver swap in progress", "Bus issue resolving", "Terminal congestion", "Weather"],
  cancel_trip: ["Bus unavailable", "Driver unavailable", "Safety risk", "Low demand", "Authority instruction"],
  issue_refund: ["Double charge", "Overcharged fare", "AFC system error", "Wrong route billed", "Driver error"],
  apply_fallback_boarding: ["Device offline", "QR scanner malfunction", "Network failure", "App crash"],
  investigate_fraud: ["Duplicate QR codes", "Passenger count mismatch", "Cash discrepancy", "AFC anomaly"],
  force_end_shift: ["Hours limit exceeded", "Safety protocol", "Driver unwell", "Policy compliance"],
  approve_extension: ["Operational emergency", "No replacement available", "Driver consent given", "Last-trip completion"],
  file_incident_report: ["Physical altercation", "Theft", "Medical emergency", "Fraud attempt", "Property damage"],
  suspend_driver: ["Pending investigation", "Code of conduct violation", "Safety breach", "Authority request"],
  lock_bus_qr: ["Suspected QR fraud", "System security alert", "AFC anomaly", "Authority request"],
  escalate_police: ["Violent incident", "Theft", "Fraud", "Passenger threat", "Driver request"],
}

const IMPACT_SUMMARIES: Record<string, string> = {
  reassign_driver: "Trip continues under replacement driver. Driver app receives new assignment. Passengers get updated ETA.",
  mark_no_show: "Duty flagged as no-show. Bus remains at terminal until reassigned. Reconciliation record created.",
  notify_supervisor: "Supervisor receives immediate alert. No operational change — escalation and awareness only.",
  assign_replacement_bus: "Replacement bus assigned to the route. Driver app and passenger tracking updated automatically.",
  dispatch_replacement: "Replacement bus dispatched to breakdown location. Passengers transferred — original AFC records retained. No double billing.",
  terminate_refund: "Trip terminated. All boarded passengers notified and made eligible for wallet refund. Revenue voided for the incomplete trip.",
  lock_bus: "Bus locked from all active service. No further trips until unlocked by an admin.",
  schedule_maintenance: "Maintenance job logged in fleet schedule. Bus remains inactive until work is cleared.",
  correct_route: "Driver contacted via app. Route corrected in AFC and passenger tracking. Fare logic preserved.",
  override_capacity: "Capacity override logged with documented justification. Flagged for compliance review.",
  delay_trip: "Departure time updated. Passengers with app notifications receive new ETA. Driver schedule updated.",
  cancel_trip: "Trip cancelled. All boarded passengers notified immediately. Revenue for this trip voided.",
  apply_fallback_boarding: "Manual boarding activated for this bus. Passengers can board with manual code until device is restored.",
  investigate_fraud: "Fraud investigation raised. Compliance team notified. AFC data for this trip frozen for review.",
  force_end_shift: "Shift ended immediately. Driver blocked from new assignments until next cycle. Compliance record updated.",
  approve_extension: "Regulatory extension approved and logged. Driver cannot be assigned the following day without minimum rest gap. Month-end compliance review triggered.",
  suspend_driver: "Driver suspended from all active assignments. HR team notified. Active trips unaffected.",
  lock_bus_qr: "Bus QR/AFC system locked. Passengers cannot board via app until admin unlocks after investigation.",
  escalate_police: "Police notification sent. Incident reference logged in audit trail. Fleet manager receives confirmation.",
}

const NOTIFY_PASSENGERS_ACTIONS = new Set([
  "reassign_driver", "assign_replacement_bus", "dispatch_replacement",
  "delay_trip", "cancel_trip", "correct_route", "terminate_refund",
])

// ─── Helpers ─────────────────────────────────────────────────────────────────

function severityBorder(s: string) {
  if (s === "critical") return "border-l-red-500"
  if (s === "high") return "border-l-orange-500"
  if (s === "warning") return "border-l-amber-500"
  return "border-l-blue-500"
}

function severityBg(s: string) {
  if (s === "critical") return "bg-red-500/10 text-red-400"
  if (s === "high") return "bg-orange-500/10 text-orange-400"
  if (s === "warning") return "bg-amber-500/10 text-amber-400"
  return "bg-blue-500/10 text-blue-400"
}

function StatusBadge({ status }: { status: string }) {
  if (status === "open") return <Badge variant="destructive" className="text-[10px]">Open</Badge>
  if (status === "in_progress") return <Badge variant="warning" className="text-[10px]">In Progress</Badge>
  return <Badge variant="success" className="text-[10px]">Resolved</Badge>
}

function SeverityIcon({ severity, size = 14 }: { severity: string; size?: number }) {
  if (severity === "critical") return <Danger size={size} color="#f87171" variant="Bold" />
  if (severity === "high") return <Warning2 size={size} color="#fb923c" variant="Bold" />
  if (severity === "warning") return <Warning2 size={size} color="#fbbf24" variant="Linear" />
  return <InfoCircle size={size} color="#60a5fa" variant="Linear" />
}

function CategoryIcon({ cat, size = 13 }: { cat: ExceptionCategory; size?: number }) {
  if (cat === "driver") return <Profile2User size={size} color="currentColor" variant="Linear" />
  if (cat === "bus_asset") return <Bus size={size} color="currentColor" variant="Linear" />
  if (cat === "trip_route") return <Map1 size={size} color="currentColor" variant="Linear" />
  if (cat === "passenger_payment") return <ReceiptItem size={size} color="currentColor" variant="Linear" />
  if (cat === "compliance") return <Shield size={size} color="currentColor" variant="Linear" />
  return <SecuritySafe size={size} color="currentColor" variant="Linear" />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExceptionsPage() {
  const [exList, setExList] = useState<Exception[]>(initialExceptions)
  const [catFilter, setCatFilter] = useState<ExceptionCategory | "all">("all")
  const [sevFilter, setSevFilter] = useState<"all" | "critical" | "high" | "warning" | "info">("all")
  const [selectedEx, setSelectedEx] = useState<Exception | null>(null)
  const [actionType, setActionType] = useState("")
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")
  const [replacementDriver, setReplacementDriver] = useState("")
  const [replacementBus, setReplacementBus] = useState("")
  const [handoverLocation, setHandoverLocation] = useState("")
  const [newDepartureTime, setNewDepartureTime] = useState("")
  const [overrideHours, setOverrideHours] = useState("")
  const [notifyPassengers, setNotifyPassengers] = useState(true)
  const [confirmStep, setConfirmStep] = useState(false)

  // Refund panel
  const [showRefundPanel, setShowRefundPanel] = useState(false)
  const [refundSearch, setRefundSearch] = useState("")
  const [refundPassenger, setRefundPassenger] = useState<MockPassenger | null>(null)
  const [refundTripId, setRefundTripId] = useState("")
  const [refundAmount, setRefundAmount] = useState("")
  const [refundReason, setRefundReason] = useState("")
  const [confirmRefund, setConfirmRefund] = useState(false)

  // Incident form
  const [showIncidentForm, setShowIncidentForm] = useState(false)
  const [incidentType, setIncidentType] = useState("")
  const [incidentDesc, setIncidentDesc] = useState("")
  const [incidentAction, setIncidentAction] = useState("")
  const [suspendDriver, setSuspendDriver] = useState(false)
  const [lockBusQr, setLockBusQr] = useState(false)
  const [escalatePolice, setEscalatePolice] = useState(false)

  // Toasts
  const [toasts, setToasts] = useState<{ id: string; msg: string; color: string }[]>([])

  function addToast(msg: string, color = "emerald") {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, msg, color }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  function resetActionState() {
    setActionType("")
    setReason("")
    setNotes("")
    setReplacementDriver("")
    setReplacementBus("")
    setHandoverLocation("")
    setNewDepartureTime("")
    setOverrideHours("")
    setNotifyPassengers(true)
    setConfirmStep(false)
  }

  function openDetail(ex: Exception) {
    setSelectedEx(ex)
    resetActionState()
  }

  function updateException(id: string, patch: Partial<Exception>) {
    setExList(prev => prev.map(e => (e.id === id ? { ...e, ...patch } : e)))
    setSelectedEx(prev => (prev?.id === id ? { ...prev, ...patch } : prev))
  }

  function appendAudit(exId: string, action: string, note?: string) {
    const entry = {
      timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      action,
      actor: "Fleet Manager",
      note,
    }
    setExList(prev =>
      prev.map(e => (e.id === exId ? { ...e, auditLog: [...e.auditLog, entry] } : e))
    )
    setSelectedEx(prev =>
      prev?.id === exId ? { ...prev, auditLog: [...prev.auditLog, entry] } : prev
    )
  }

  function handleCallDriver() {
    if (!selectedEx?.driver) return
    addToast(`Calling ${selectedEx.driver}…`, "blue")
    appendAudit(selectedEx.id, `Outbound call initiated to driver ${selectedEx.driver}`)
  }

  function handleConfirmAction() {
    if (!selectedEx) return
    const ex = selectedEx
    const driverObj = drivers.find(d => d.id === replacementDriver)
    const busObj = buses.find(b => b.id === replacementBus)
    const notifyStr = NOTIFY_PASSENGERS_ACTIONS.has(actionType) ? (notifyPassengers ? " Passengers notified." : " Passenger notification skipped.") : ""

    const audit: Record<string, string> = {
      reassign_driver: `Replacement driver assigned: ${driverObj?.name ?? replacementDriver}. Reason: ${reason}${handoverLocation ? `. Handover at: ${handoverLocation}` : ""}${notifyStr}`,
      mark_no_show: `Driver marked as no-show. Reason: ${reason}`,
      notify_supervisor: `Supervisor notified. ${notes || reason}`,
      assign_replacement_bus: `Replacement bus assigned: ${busObj?.code ?? replacementBus}. Reason: ${reason}${notifyStr}`,
      dispatch_replacement: `Replacement dispatched — Driver: ${driverObj?.name ?? "TBD"}, Bus: ${busObj?.code ?? "TBD"}. Passengers transferred (no double billing). Reason: ${reason}${notifyStr}`,
      lock_bus: `Bus ${ex.bus ?? ""} locked from service. Reason: ${reason}`,
      schedule_maintenance: `Maintenance scheduled. Notes: ${notes || reason}`,
      correct_route: `Route correction initiated — driver contacted. Reason: ${reason}${notifyStr}`,
      override_capacity: `Overcapacity override approved. Justification: ${reason}`,
      delay_trip: `Trip delayed. New departure: ${newDepartureTime || "TBD"}. Reason: ${reason}${notifyStr}`,
      cancel_trip: `Trip cancelled. Reason: ${reason}. Passengers notified.`,
      apply_fallback_boarding: `Fallback boarding applied — manual log activated. Reason: ${reason}`,
      investigate_fraud: `Flagged for fraud investigation. Notes: ${notes || reason}`,
      force_end_shift: `Shift force-ended. Driver blocked from further assignment. Reason: ${reason}`,
      approve_extension: `Hours extension approved. Override: ${overrideHours}h. Justification: ${reason}`,
      suspend_driver: `Driver suspended pending review. Reason: ${reason}`,
      lock_bus_qr: `Bus QR/AFC system locked. Reason: ${reason}`,
      escalate_police: `Escalated to police. Notes: ${notes || reason}`,
    }

    const resolvedActions = new Set(["lock_bus", "schedule_maintenance", "override_capacity", "cancel_trip", "apply_fallback_boarding", "force_end_shift", "approve_extension"])
    const inProgressActions = new Set(["reassign_driver", "assign_replacement_bus", "dispatch_replacement", "correct_route", "delay_trip", "investigate_fraud", "suspend_driver", "lock_bus_qr", "escalate_police", "mark_no_show"])

    const toastMessages: Record<string, [string, string]> = {
      reassign_driver: [`Replacement driver assigned to ${ex.route ?? ex.bus ?? "duty"}`, "emerald"],
      mark_no_show: ["Driver marked as no-show — duty flagged for reconciliation", "amber"],
      notify_supervisor: ["Supervisor notified", "blue"],
      assign_replacement_bus: [`Replacement bus ${busObj?.code ?? ""} assigned`, "emerald"],
      dispatch_replacement: ["Replacement dispatched — passenger transfer initiated (no double billing)", "emerald"],
      lock_bus: [`Bus ${ex.bus ?? ""} locked from service`, "amber"],
      schedule_maintenance: ["Maintenance job scheduled", "emerald"],
      correct_route: ["Driver contacted — route correction in progress", "amber"],
      override_capacity: ["Overcapacity override logged — audit trail updated", "amber"],
      delay_trip: ["Trip delayed — schedule updated", "amber"],
      cancel_trip: ["Trip cancelled — passengers notified", "red"],
      apply_fallback_boarding: ["Fallback boarding activated — passengers manually logged", "emerald"],
      investigate_fraud: ["Flagged for fraud investigation — compliance team notified", "amber"],
      force_end_shift: ["Shift ended — driver blocked from assignment until next cycle", "amber"],
      approve_extension: ["Extension approved — documented in audit trail", "amber"],
      suspend_driver: ["Driver suspended — HR team notified", "red"],
      lock_bus_qr: ["Bus QR system locked — fraud investigation initiated", "red"],
      escalate_police: ["Police notified — reference logged in audit trail", "red"],
    }

    if (audit[actionType]) appendAudit(ex.id, audit[actionType], notes || undefined)

    if (resolvedActions.has(actionType)) {
      updateException(ex.id, {
        status: "resolved",
        resolvedBy: "Fleet Manager",
        resolvedAt: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        resolution: audit[actionType],
      })
    } else if (inProgressActions.has(actionType)) {
      updateException(ex.id, { status: "in_progress" })
    }

    const [toastMsg, toastColor] = toastMessages[actionType] ?? ["Action completed", "emerald"]
    addToast(toastMsg, toastColor)

    resetActionState()
    setSelectedEx(null)
  }

  function handleRefundSubmit() {
    if (!selectedEx || !refundPassenger) return
    appendAudit(selectedEx.id, `Refund issued to ${refundPassenger.name} — ₦${Number(refundAmount).toLocaleString()}. Reason: ${refundReason}. Trip: ${refundTripId}`)
    updateException(selectedEx.id, {
      status: "resolved",
      resolvedBy: "Fleet Manager",
      resolvedAt: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      resolution: `₦${Number(refundAmount).toLocaleString()} refund processed to ${refundPassenger.name}`,
    })
    setShowRefundPanel(false)
    setSelectedEx(null)
    setRefundSearch("")
    setRefundPassenger(null)
    setRefundAmount("")
    setRefundReason("")
    setRefundTripId("")
    setConfirmRefund(false)
    addToast(`₦${Number(refundAmount).toLocaleString()} refund processed for ${refundPassenger.name}`)
  }

  function handleIncidentSubmit() {
    if (!selectedEx) return
    const parts = [
      `Incident type: ${incidentType}`,
      suspendDriver ? "Driver suspended" : null,
      lockBusQr ? "Bus QR locked" : null,
      escalatePolice ? "Police notified" : null,
    ].filter(Boolean).join(". ")
    appendAudit(selectedEx.id, `Incident report filed. ${parts}. Action taken: ${incidentAction}`, incidentDesc)
    updateException(selectedEx.id, { status: "in_progress" })
    setShowIncidentForm(false)
    setSelectedEx(null)
    setIncidentType("")
    setIncidentDesc("")
    setIncidentAction("")
    setSuspendDriver(false)
    setLockBusQr(false)
    setEscalatePolice(false)
    addToast("Incident report filed — investigation initiated", "amber")
  }

  // Computed values
  const filtered = exList
    .filter(e => catFilter === "all" || e.category === catFilter)
    .filter(e => sevFilter === "all" || e.severity === sevFilter)
  const sortedFiltered = [...filtered].sort((a, b) => {
    const sevOrder = { critical: 0, high: 1, warning: 2, info: 3 }
    const stOrder = { open: 0, in_progress: 1, resolved: 2 }
    if (stOrder[a.status] !== stOrder[b.status]) return stOrder[a.status] - stOrder[b.status]
    return (sevOrder[a.severity as keyof typeof sevOrder] ?? 3) - (sevOrder[b.severity as keyof typeof sevOrder] ?? 3)
  })

  const openCount = exList.filter(e => e.status === "open").length
  const inProgressCount = exList.filter(e => e.status === "in_progress").length
  const resolvedCount = exList.filter(e => e.status === "resolved").length
  const criticalCount = exList.filter(e => e.severity === "critical" && e.status !== "resolved").length

  const availableDrivers = drivers.filter(
    d => d.status !== "blocked" && d.status !== "on_leave" && d.complianceStatus !== "blocked"
  )
  const availableBuses = buses.filter(b => b.status === "available" && b.inspectionResult === "pass")

  const currentActionLabel = CATEGORY_ACTIONS[selectedEx?.category ?? "driver"]?.find(a => a.value === actionType)?.label

  const refundResults =
    refundSearch.length > 1
      ? mockPassengers.filter(
          p =>
            p.name.toLowerCase().includes(refundSearch.toLowerCase()) ||
            p.phone.includes(refundSearch)
        )
      : []

  const actionIsLauncher = actionType === "issue_refund" || actionType === "file_incident_report" || actionType === "terminate_refund"

  const SEV_FILTERS = [
    { value: "all", label: "All severities" },
    { value: "critical", label: "Critical", color: "text-red-400 bg-red-500/10" },
    { value: "high", label: "High", color: "text-orange-400 bg-orange-500/10" },
    { value: "warning", label: "Warning", color: "text-amber-400 bg-amber-500/10" },
    { value: "info", label: "Info", color: "text-blue-400 bg-blue-500/10" },
  ] as const

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-fg">Exceptions</h1>
          <p className="text-sm text-fg-dim mt-0.5">Real-time operational exception management and resolution</p>
        </div>
        {criticalCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-sm font-semibold text-red-400 shrink-0">
            <Danger size={14} color="currentColor" variant="Bold" />
            {criticalCount} Critical
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Open", value: openCount, color: "text-red-400" },
          { label: "In Progress", value: inProgressCount, color: "text-amber-400" },
          { label: "Resolved", value: resolvedCount, color: "text-emerald-400" },
        ].map(s => (
          <Card key={s.label} className="bg-panel border-line-soft">
            <CardContent className="p-4">
              <p className="text-xs text-fg-dim mb-1">{s.label}</p>
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category filter tabs */}
      <div className="space-y-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {(["all", "driver", "bus_asset", "trip_route", "passenger_payment", "compliance", "security_incident"] as const).map(cat => {
            const count =
              cat === "all"
                ? exList.filter(e => e.status !== "resolved").length
                : exList.filter(e => e.category === cat && e.status !== "resolved").length
            return (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors shrink-0",
                  catFilter === cat
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-surface text-fg-muted hover:bg-[var(--hover-bg)] hover:text-fg"
                )}
              >
                {cat !== "all" && <CategoryIcon cat={cat as ExceptionCategory} size={12} />}
                {cat === "all" ? "All" : CATEGORY_LABELS[cat as ExceptionCategory]}
                {count > 0 && (
                  <span
                    className={cn(
                      "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold",
                      catFilter === cat ? "bg-amber-500 text-black" : "bg-red-500/20 text-red-400"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Severity filter */}
        <div className="flex gap-1.5 flex-wrap">
          {SEV_FILTERS.map(sf => (
            <button
              key={sf.value}
              onClick={() => setSevFilter(sf.value)}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                sevFilter === sf.value
                  ? sf.value === "all"
                    ? "bg-[var(--subtle-bg)] text-fg"
                    : sf.color + " border border-current/20"
                  : "text-fg-dim hover:text-fg-muted hover:bg-[var(--hover-bg)]"
              )}
            >
              {sf.value !== "all" && <SeverityIcon severity={sf.value} size={10} />}
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exception list */}
      <div className="space-y-2">
        {sortedFiltered.length === 0 && (
          <div className="flex items-center justify-center py-12 text-fg-dim text-sm">
            No exceptions match the current filters
          </div>
        )}
        {sortedFiltered.map(ex => (
          <div
            key={ex.id}
            onClick={() => openDetail(ex)}
            className={cn(
              "relative flex gap-3 rounded-xl border border-line-soft bg-panel p-4 cursor-pointer transition-colors hover:bg-[var(--hover-bg)] border-l-[3px]",
              severityBorder(ex.severity),
              ex.status === "resolved" && "opacity-60"
            )}
          >
            <div className="mt-0.5 shrink-0">
              <SeverityIcon severity={ex.severity} size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-[var(--subtle-bg)] text-fg-dim">
                    <CategoryIcon cat={ex.category} size={10} />
                    {CATEGORY_LABELS[ex.category]}
                  </span>
                  <StatusBadge status={ex.status} />
                </div>
                <span className="text-[11px] text-fg-dim shrink-0">{ex.detectedAt}</span>
              </div>
              <p className="text-sm font-semibold text-fg mt-1.5">{ex.title}</p>
              <p className="text-xs text-fg-muted mt-0.5 line-clamp-2">{ex.description}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {ex.route && (
                  <span className="flex items-center gap-1 text-[11px] text-fg-dim">
                    <Map1 size={11} color="currentColor" /> {ex.route}
                  </span>
                )}
                {ex.bus && (
                  <span className="flex items-center gap-1 text-[11px] text-fg-dim">
                    <Bus size={11} color="currentColor" /> {ex.bus}
                  </span>
                )}
                {ex.driver && (
                  <span className="flex items-center gap-1 text-[11px] text-fg-dim">
                    <People size={11} color="currentColor" /> {ex.driver}
                  </span>
                )}
              </div>
            </div>
            {ex.status !== "resolved" && (
              <div className="shrink-0 flex items-center self-center">
                <ArrowRight2 size={14} color="currentColor" className="text-fg-dim" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ─── Exception Detail Dialog ────────────────────────────────────────────── */}
      <Dialog
        open={!!selectedEx && !showRefundPanel && !showIncidentForm}
        onOpenChange={open => {
          if (!open) {
            setSelectedEx(null)
            resetActionState()
          }
        }}
      >
        {selectedEx && (
          <DialogContent className="max-w-2xl bg-panel border-line-soft max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-[var(--subtle-bg)] text-fg-dim">
                  <CategoryIcon cat={selectedEx.category} size={10} />
                  {CATEGORY_LABELS[selectedEx.category]}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full",
                    severityBg(selectedEx.severity)
                  )}
                >
                  <SeverityIcon severity={selectedEx.severity} size={11} />
                  {selectedEx.severity.charAt(0).toUpperCase() + selectedEx.severity.slice(1)}
                </span>
                <StatusBadge status={selectedEx.status} />
              </div>
              <DialogTitle className="text-base font-bold text-fg leading-snug">
                {selectedEx.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <p className="text-sm text-fg-muted">{selectedEx.description}</p>

              {/* Context grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-xl bg-[var(--subtle-bg)] p-3 text-xs">
                {selectedEx.route && (
                  <div>
                    <span className="text-fg-dim block">Route</span>
                    <p className="text-fg font-medium mt-0.5">{selectedEx.route}</p>
                  </div>
                )}
                {selectedEx.bus && (
                  <div>
                    <span className="text-fg-dim block">Bus</span>
                    <p className="text-fg font-medium mt-0.5">{selectedEx.bus}</p>
                  </div>
                )}
                {selectedEx.driver && (
                  <div>
                    <span className="text-fg-dim block">Driver</span>
                    <p className="text-fg font-medium mt-0.5">{selectedEx.driver}</p>
                  </div>
                )}
                <div>
                  <span className="text-fg-dim block">Detected</span>
                  <p className="text-fg font-medium mt-0.5">{selectedEx.detectedAt}</p>
                </div>
                {selectedEx.tripId && (
                  <div>
                    <span className="text-fg-dim block">Trip ID</span>
                    <p className="text-fg font-medium mt-0.5">{selectedEx.tripId}</p>
                  </div>
                )}
                {selectedEx.recommendedAction && (
                  <div className="col-span-2">
                    <span className="text-fg-dim block">Recommended Action</span>
                    <p className="text-amber-400 font-medium mt-0.5">{selectedEx.recommendedAction}</p>
                  </div>
                )}
              </div>

              {/* Quick actions */}
              {selectedEx.status !== "resolved" && selectedEx.driver && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-line-soft text-fg-muted text-xs gap-1.5"
                    onClick={handleCallDriver}
                  >
                    <CallCalling size={13} color="currentColor" variant="Linear" />
                    Call {selectedEx.driver.split(" ")[0]}
                  </Button>
                </div>
              )}

              {selectedEx.status === "resolved" ? (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TickCircle size={14} color="#34d399" variant="Bold" />
                    <span className="text-sm font-semibold text-emerald-400">Resolved</span>
                  </div>
                  {selectedEx.resolution && (
                    <p className="text-xs text-fg-muted">{selectedEx.resolution}</p>
                  )}
                  {selectedEx.resolvedBy && (
                    <p className="text-xs text-fg-dim mt-1">
                      By {selectedEx.resolvedBy} · {selectedEx.resolvedAt}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <Separator className="bg-line-soft" />

                  {/* Action panel */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-fg-dim">
                      Take Action
                    </p>

                    <Select
                      value={actionType}
                      onValueChange={v => {
                        setActionType(v)
                        setConfirmStep(false)
                        setNotifyPassengers(true)
                      }}
                    >
                      <SelectTrigger className="bg-surface border-line-soft text-fg text-sm">
                        <SelectValue placeholder="Select action to take…" />
                      </SelectTrigger>
                      <SelectContent className="bg-panel border-line-soft">
                        {CATEGORY_ACTIONS[selectedEx.category].map(a => (
                          <SelectItem key={a.value} value={a.value} className="text-fg text-sm">
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {actionType && (
                      <div className="space-y-3 rounded-xl bg-[var(--subtle-bg)] p-4">
                        {/* Driver select */}
                        {(actionType === "reassign_driver" || actionType === "dispatch_replacement") && (
                          <div>
                            <p className="text-xs text-fg-dim mb-1.5">Select replacement driver</p>
                            <Select value={replacementDriver} onValueChange={setReplacementDriver}>
                              <SelectTrigger className="bg-surface border-line-soft text-fg text-sm">
                                <SelectValue placeholder="Choose available driver…" />
                              </SelectTrigger>
                              <SelectContent className="bg-panel border-line-soft">
                                {availableDrivers.map(d => (
                                  <SelectItem key={d.id} value={d.id} className="text-fg text-sm">
                                    {d.name} ({d.code}) · {d.hoursThisWeek}h this wk · {d.complianceStatus}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {replacementDriver && (() => {
                              const d = drivers.find(dr => dr.id === replacementDriver)
                              if (!d) return null
                              return (
                                <div
                                  className={cn(
                                    "mt-2 rounded-lg px-3 py-2 text-xs",
                                    d.complianceStatus === "clear"
                                      ? "bg-emerald-500/10 text-emerald-400"
                                      : "bg-amber-500/10 text-amber-400"
                                  )}
                                >
                                  {d.complianceStatus === "clear" ? (
                                    <TickCircle size={11} color="currentColor" className="inline mr-1" variant="Bold" />
                                  ) : (
                                    <Warning2 size={11} color="currentColor" className="inline mr-1" />
                                  )}
                                  Compliance: {d.complianceStatus} · License expires {d.licenseExpiry ?? "N/A"} · {d.hoursThisWeek}h this week
                                </div>
                              )
                            })()}
                            {actionType === "reassign_driver" && selectedEx.status === "in_progress" && (
                              <div className="mt-2">
                                <p className="text-xs text-fg-dim mb-1.5">Handover location (mid-trip)</p>
                                <Input
                                  value={handoverLocation}
                                  onChange={e => setHandoverLocation(e.target.value)}
                                  placeholder="e.g. Oshodi Terminal, Bay 3"
                                  className="bg-surface border-line-soft text-fg text-sm"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Bus select */}
                        {(actionType === "assign_replacement_bus" || actionType === "dispatch_replacement") && (
                          <div>
                            <p className="text-xs text-fg-dim mb-1.5">Select replacement bus</p>
                            <Select value={replacementBus} onValueChange={setReplacementBus}>
                              <SelectTrigger className="bg-surface border-line-soft text-fg text-sm">
                                <SelectValue placeholder="Choose available bus…" />
                              </SelectTrigger>
                              <SelectContent className="bg-panel border-line-soft">
                                {availableBuses.map(b => (
                                  <SelectItem key={b.id} value={b.id} className="text-fg text-sm">
                                    {b.code} — {b.model} · Cap {b.capacity} · Fuel {b.fuelLevel}%
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {actionType === "dispatch_replacement" && (
                              <div className="mt-2 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-xs text-blue-400">
                                <InfoCircle size={11} color="currentColor" className="inline mr-1" variant="Bold" />
                                Passengers will be transferred to replacement bus. Original AFC boarding records
                                retained — no double billing applied.
                              </div>
                            )}
                          </div>
                        )}

                        {/* Delay trip time */}
                        {actionType === "delay_trip" && (
                          <div>
                            <p className="text-xs text-fg-dim mb-1.5">New departure time</p>
                            <Input
                              type="time"
                              value={newDepartureTime}
                              onChange={e => setNewDepartureTime(e.target.value)}
                              className="bg-surface border-line-soft text-fg text-sm w-36"
                            />
                          </div>
                        )}

                        {/* Hours extension */}
                        {actionType === "approve_extension" && (
                          <>
                            <div>
                              <p className="text-xs text-fg-dim mb-1.5">Approved additional hours</p>
                              <Input
                                type="number"
                                min="1"
                                max="4"
                                value={overrideHours}
                                onChange={e => setOverrideHours(e.target.value)}
                                placeholder="e.g. 2"
                                className="bg-surface border-line-soft text-fg text-sm w-28"
                              />
                            </div>
                            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-400">
                              <Warning2 size={11} color="currentColor" className="inline mr-1" />
                              Extension is a regulatory exception. This action will be permanently recorded in the
                              compliance audit trail and reviewed at month-end.
                            </div>
                          </>
                        )}

                        {/* Refund launcher */}
                        {actionType === "issue_refund" && (
                          <Button
                            variant="outline"
                            className="w-full border-line-soft text-fg"
                            onClick={() => setShowRefundPanel(true)}
                          >
                            <ReceiptItem size={14} color="currentColor" className="mr-2" />
                            Open Passenger Refund Panel
                          </Button>
                        )}

                        {/* Terminate + refund launcher */}
                        {actionType === "terminate_refund" && (
                          <>
                            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                              <Danger size={11} color="currentColor" className="inline mr-1" variant="Bold" />
                              Trip will be terminated. All passengers notified and made eligible for wallet refund.
                              Revenue for the incomplete trip will be voided. This action cannot be undone.
                            </div>
                            <Button
                              variant="outline"
                              className="w-full border-line-soft text-fg"
                              onClick={() => setShowRefundPanel(true)}
                            >
                              <ReceiptItem size={14} color="currentColor" className="mr-2" />
                              Continue — Open Passenger Refund Panel
                            </Button>
                          </>
                        )}

                        {/* Incident form launcher */}
                        {actionType === "file_incident_report" && (
                          <Button
                            variant="outline"
                            className="w-full border-line-soft text-fg"
                            onClick={() => setShowIncidentForm(true)}
                          >
                            <DocumentText1 size={14} color="currentColor" className="mr-2" />
                            Open Incident Report Form
                          </Button>
                        )}

                        {/* Risk warnings */}
                        {actionType === "suspend_driver" && (
                          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                            <Danger size={11} color="currentColor" className="inline mr-1" variant="Bold" />
                            This will suspend the driver from all assignments pending review. HR team will be
                            notified immediately.
                          </div>
                        )}
                        {actionType === "lock_bus_qr" && (
                          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                            <Lock1 size={11} color="currentColor" className="inline mr-1" variant="Bold" />
                            Passengers will be unable to board via app until system is unlocked by an admin.
                          </div>
                        )}
                        {actionType === "cancel_trip" && (
                          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                            <Danger size={11} color="currentColor" className="inline mr-1" variant="Bold" />
                            Trip will be cancelled. All boarded passengers will be notified. Revenue for this
                            trip will be voided.
                          </div>
                        )}

                        {/* Reason + notes (not for launcher actions) */}
                        {!actionIsLauncher && (
                          <>
                            <div>
                              <p className="text-xs text-fg-dim mb-1.5">Reason</p>
                              <Select value={reason} onValueChange={setReason}>
                                <SelectTrigger className="bg-surface border-line-soft text-fg text-sm">
                                  <SelectValue placeholder="Select reason…" />
                                </SelectTrigger>
                                <SelectContent className="bg-panel border-line-soft">
                                  {(REASON_OPTIONS[actionType] ?? []).map(r => (
                                    <SelectItem key={r} value={r} className="text-fg text-sm">
                                      {r}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <p className="text-xs text-fg-dim mb-1.5">Notes (optional)</p>
                              <Textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Add any relevant notes for the audit trail…"
                                className="bg-surface border-line-soft text-fg text-sm resize-none"
                                rows={2}
                              />
                            </div>

                            {/* Notify passengers toggle */}
                            {NOTIFY_PASSENGERS_ACTIONS.has(actionType) && (
                              <button
                                onClick={() => setNotifyPassengers(!notifyPassengers)}
                                className={cn(
                                  "w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors border",
                                  notifyPassengers
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                    : "bg-surface border-line-soft text-fg-muted hover:bg-[var(--hover-bg)]"
                                )}
                              >
                                <People size={14} color="currentColor" variant="Linear" />
                                <span className="flex-1 text-left text-xs">Notify passengers of this change</span>
                                {notifyPassengers && <TickCircle size={13} color="currentColor" variant="Bold" />}
                              </button>
                            )}

                            {!confirmStep ? (
                              <Button
                                className="w-full"
                                variant={
                                  ["cancel_trip", "suspend_driver", "lock_bus", "lock_bus_qr"].includes(
                                    actionType
                                  )
                                    ? "destructive"
                                    : "default"
                                }
                                disabled={!reason}
                                onClick={() => setConfirmStep(true)}
                              >
                                {currentActionLabel ?? "Continue"}
                              </Button>
                            ) : (
                              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-3">
                                <p className="text-xs font-semibold text-amber-400">Confirm this action</p>
                                <div className="text-xs text-fg-muted space-y-1">
                                  <p>
                                    Action:{" "}
                                    <span className="text-fg font-medium">{currentActionLabel}</span>
                                  </p>
                                  <p>
                                    Reason: <span className="text-fg font-medium">{reason}</span>
                                  </p>
                                  {replacementDriver && (
                                    <p>
                                      Replacement driver:{" "}
                                      <span className="text-fg font-medium">
                                        {drivers.find(d => d.id === replacementDriver)?.name}
                                      </span>
                                    </p>
                                  )}
                                  {replacementBus && (
                                    <p>
                                      Replacement bus:{" "}
                                      <span className="text-fg font-medium">
                                        {buses.find(b => b.id === replacementBus)?.code}
                                      </span>
                                    </p>
                                  )}
                                  {handoverLocation && (
                                    <p>
                                      Handover at:{" "}
                                      <span className="text-fg font-medium">{handoverLocation}</span>
                                    </p>
                                  )}
                                  {newDepartureTime && (
                                    <p>
                                      New departure:{" "}
                                      <span className="text-fg font-medium">{newDepartureTime}</span>
                                    </p>
                                  )}
                                  {overrideHours && (
                                    <p>
                                      Extension:{" "}
                                      <span className="text-fg font-medium">{overrideHours}h</span>
                                    </p>
                                  )}
                                  {NOTIFY_PASSENGERS_ACTIONS.has(actionType) && (
                                    <p>
                                      Passengers notified:{" "}
                                      <span className={cn("font-medium", notifyPassengers ? "text-emerald-400" : "text-fg-dim")}>
                                        {notifyPassengers ? "Yes" : "No"}
                                      </span>
                                    </p>
                                  )}
                                  {IMPACT_SUMMARIES[actionType] && (
                                    <div className="mt-2 pt-2 border-t border-amber-500/20">
                                      <p className="text-[10px] uppercase tracking-widest text-amber-400/70 mb-1">Impact</p>
                                      <p className="text-fg-muted leading-relaxed">{IMPACT_SUMMARIES[actionType]}</p>
                                    </div>
                                  )}
                                  <p className="text-fg-dim pt-1">
                                    This action will be permanently recorded in the exception audit log.
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setConfirmStep(false)}
                                    className="flex-1 border border-line-soft text-fg-muted"
                                  >
                                    Back
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={
                                      ["cancel_trip", "suspend_driver", "lock_bus", "lock_bus_qr"].includes(
                                        actionType
                                      )
                                        ? "destructive"
                                        : "default"
                                    }
                                    className="flex-1"
                                    onClick={handleConfirmAction}
                                  >
                                    Confirm
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Audit log */}
              {selectedEx.auditLog.length > 0 && (
                <>
                  <Separator className="bg-line-soft" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-fg-dim mb-3">
                      Audit Log
                    </p>
                    <div className="space-y-2.5">
                      {selectedEx.auditLog.map((entry, i) => (
                        <div key={i} className="flex gap-2 text-xs">
                          <span className="text-fg-dim shrink-0 font-mono w-16">{entry.timestamp}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-fg-muted">{entry.action}</span>
                            {entry.note && (
                              <span className="text-fg-dim"> — {entry.note}</span>
                            )}
                            <span className="text-fg-dim"> · {entry.actor}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ─── Passenger Refund Panel ──────────────────────────────────────────────── */}
      <Dialog
        open={showRefundPanel}
        onOpenChange={open => {
          if (!open) {
            setShowRefundPanel(false)
            setRefundSearch("")
            setRefundPassenger(null)
            setConfirmRefund(false)
          }
        }}
      >
        <DialogContent className="max-w-lg bg-panel border-line-soft">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-fg flex items-center gap-2">
              <ReceiptItem size={16} color="#f59e0b" variant="Bold" />
              Passenger Refund Panel
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {!refundPassenger ? (
              <>
                <div>
                  <p className="text-xs text-fg-dim mb-1.5">Search by passenger name or phone number</p>
                  <div className="relative">
                    <SearchNormal1
                      size={14}
                      color="currentColor"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-dim"
                    />
                    <Input
                      value={refundSearch}
                      onChange={e => setRefundSearch(e.target.value)}
                      placeholder="e.g. Adaeze or 080 1122…"
                      className="pl-9 bg-surface border-line-soft text-fg text-sm"
                    />
                  </div>
                </div>
                {refundResults.length > 0 && (
                  <div className="space-y-1.5">
                    {refundResults.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setRefundPassenger(p)
                          setRefundAmount("600")
                          setConfirmRefund(false)
                        }}
                        className="w-full flex items-center justify-between rounded-lg bg-surface border border-line-soft px-3 py-2.5 text-left hover:bg-[var(--hover-bg)] transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-fg">{p.name}</p>
                          <p className="text-xs text-fg-dim">
                            {p.phone} · Wallet: ₦{p.walletBalance.toLocaleString()}
                          </p>
                        </div>
                        <ArrowRight2 size={14} color="currentColor" className="text-fg-dim shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
                {refundSearch.length > 1 && refundResults.length === 0 && (
                  <p className="text-xs text-fg-dim text-center py-4">No passengers found</p>
                )}
              </>
            ) : !confirmRefund ? (
              <>
                {/* Passenger info + trip log */}
                <div className="rounded-xl bg-[var(--subtle-bg)] p-3">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-fg">{refundPassenger.name}</p>
                      <p className="text-xs text-fg-dim">{refundPassenger.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-fg-dim">Wallet Balance</p>
                      <p className="text-sm font-bold text-emerald-400">
                        ₦{refundPassenger.walletBalance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Separator className="bg-line-soft mb-3" />
                  <p className="text-xs text-fg-dim mb-2">Recent trips — select the affected trip</p>
                  <div className="space-y-1">
                    {refundPassenger.recentTrips.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => setRefundTripId(t.tripId)}
                        className={cn(
                          "w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors",
                          refundTripId === t.tripId
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "hover:bg-[var(--hover-bg)] text-fg-muted border border-transparent"
                        )}
                      >
                        <span>
                          {t.date} · {t.route}
                        </span>
                        <span className="font-semibold">₦{t.fare}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-fg-dim mb-1.5">Refund amount (₦)</p>
                    <Input
                      type="number"
                      value={refundAmount}
                      onChange={e => setRefundAmount(e.target.value)}
                      className="bg-surface border-line-soft text-fg text-sm"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-fg-dim mb-1.5">Reason</p>
                    <Select value={refundReason} onValueChange={setRefundReason}>
                      <SelectTrigger className="bg-surface border-line-soft text-fg text-sm">
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent className="bg-panel border-line-soft">
                        {["Double charge", "Overcharged fare", "AFC error", "Wrong route billed", "Driver error", "Trip terminated"].map(r => (
                          <SelectItem key={r} value={r} className="text-fg text-sm">
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRefundPassenger(null)}
                    className="border border-line-soft text-fg-muted"
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!refundAmount || !refundReason || !refundTripId}
                    onClick={() => setConfirmRefund(true)}
                  >
                    Review Refund
                  </Button>
                </div>
              </>
            ) : (
              /* Refund confirm step */
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2.5">
                  <p className="text-xs font-semibold text-amber-400">Confirm refund</p>
                  <div className="text-xs space-y-1.5 text-fg-muted">
                    <p>
                      Passenger: <span className="text-fg font-medium">{refundPassenger?.name}</span>
                    </p>
                    <p>
                      Phone: <span className="text-fg font-medium">{refundPassenger?.phone}</span>
                    </p>
                    <p>
                      Affected trip: <span className="text-fg font-medium">{refundTripId}</span>
                    </p>
                    <p>
                      Refund amount:{" "}
                      <span className="text-emerald-400 font-bold">
                        ₦{Number(refundAmount).toLocaleString()}
                      </span>
                    </p>
                    <p>
                      Reason: <span className="text-fg font-medium">{refundReason}</span>
                    </p>
                    <div className="pt-2 border-t border-amber-500/20 mt-2">
                      <p className="text-[10px] uppercase tracking-widest text-amber-400/70 mb-1">Impact</p>
                      <p className="leading-relaxed">
                        ₦{Number(refundAmount).toLocaleString()} will be credited to {refundPassenger?.name}&apos;s wallet immediately.
                        New balance: ₦{((refundPassenger?.walletBalance ?? 0) + Number(refundAmount)).toLocaleString()}.
                        Passenger will be notified via app. Audit trail updated.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmRefund(false)}
                    className="border border-line-soft text-fg-muted"
                  >
                    Back
                  </Button>
                  <Button className="flex-1" onClick={handleRefundSubmit}>
                    Confirm — Process Refund
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Incident Report Form ────────────────────────────────────────────────── */}
      <Dialog
        open={showIncidentForm}
        onOpenChange={open => {
          if (!open) setShowIncidentForm(false)
        }}
      >
        <DialogContent className="max-w-lg bg-panel border-line-soft max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-fg flex items-center gap-2">
              <DocumentText1 size={16} color="#f59e0b" variant="Bold" />
              Incident Report Form
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {selectedEx && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-[var(--subtle-bg)] p-3 text-xs">
                {selectedEx.route && (
                  <div>
                    <span className="text-fg-dim block">Route</span>
                    <p className="text-fg font-medium mt-0.5">{selectedEx.route}</p>
                  </div>
                )}
                {selectedEx.bus && (
                  <div>
                    <span className="text-fg-dim block">Bus</span>
                    <p className="text-fg font-medium mt-0.5">{selectedEx.bus}</p>
                  </div>
                )}
                {selectedEx.driver && (
                  <div>
                    <span className="text-fg-dim block">Driver</span>
                    <p className="text-fg font-medium mt-0.5">{selectedEx.driver}</p>
                  </div>
                )}
                <div>
                  <span className="text-fg-dim block">Time</span>
                  <p className="text-fg font-medium mt-0.5">{selectedEx.detectedAt}</p>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-fg-dim mb-1.5">Incident type</p>
              <Select value={incidentType} onValueChange={setIncidentType}>
                <SelectTrigger className="bg-surface border-line-soft text-fg text-sm">
                  <SelectValue placeholder="Select incident type…" />
                </SelectTrigger>
                <SelectContent className="bg-panel border-line-soft">
                  {[
                    { value: "passenger_altercation", label: "Passenger Altercation" },
                    { value: "theft", label: "Theft" },
                    { value: "assault", label: "Assault" },
                    { value: "medical_emergency", label: "Medical Emergency" },
                    { value: "fire", label: "Fire / Smoke" },
                    { value: "accident", label: "Road Accident" },
                    { value: "fraud", label: "Fraud / QR Abuse" },
                    { value: "suspicious_boarding", label: "Suspicious Boarding" },
                  ].map(t => (
                    <SelectItem key={t.value} value={t.value} className="text-fg text-sm">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-xs text-fg-dim mb-1.5">Description of incident</p>
              <Textarea
                value={incidentDesc}
                onChange={e => setIncidentDesc(e.target.value)}
                placeholder="Describe what happened — include any passenger details if involved…"
                className="bg-surface border-line-soft text-fg text-sm resize-none"
                rows={3}
              />
            </div>

            <div>
              <p className="text-xs text-fg-dim mb-1.5">Action taken at the time</p>
              <Textarea
                value={incidentAction}
                onChange={e => setIncidentAction(e.target.value)}
                placeholder="What was done at the time of the incident…"
                className="bg-surface border-line-soft text-fg text-sm resize-none"
                rows={2}
              />
            </div>

            <Separator className="bg-line-soft" />

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-fg-dim">
                Further Actions
              </p>
              {[
                {
                  key: "suspend",
                  label: "Suspend driver pending review",
                  icon: <People size={14} color="currentColor" />,
                  state: suspendDriver,
                  set: setSuspendDriver,
                },
                {
                  key: "lock",
                  label: "Lock bus QR / AFC system",
                  icon: <Lock1 size={14} color="currentColor" />,
                  state: lockBusQr,
                  set: setLockBusQr,
                },
                {
                  key: "police",
                  label: "Escalate to police",
                  icon: <SecuritySafe size={14} color="currentColor" />,
                  state: escalatePolice,
                  set: setEscalatePolice,
                },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => item.set(!item.state)}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    item.state
                      ? "bg-red-500/15 text-red-400 border border-red-500/30"
                      : "bg-surface border border-line-soft text-fg-muted hover:bg-[var(--hover-bg)]"
                  )}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.state && <TickCircle size={14} color="currentColor" variant="Bold" />}
                </button>
              ))}
            </div>

            {/* Impact summary for incident */}
            {(incidentType || suspendDriver || lockBusQr || escalatePolice) && (
              <div className="rounded-lg bg-[var(--subtle-bg)] border border-line-soft px-3 py-2.5 text-xs space-y-1 text-fg-dim">
                <p className="text-[10px] uppercase tracking-widest text-fg-dim mb-1">Impact</p>
                <p>Trip will be flagged — future dispatch prevented until resolved.</p>
                {suspendDriver && <p className="text-red-400">Driver suspended from all active assignments.</p>}
                {lockBusQr && <p className="text-red-400">Bus QR/AFC locked — passengers cannot board via app.</p>}
                {escalatePolice && <p className="text-amber-400">Police reference number will be logged in audit trail.</p>}
              </div>
            )}

            <Button
              className="w-full"
              disabled={!incidentType || !incidentDesc || !incidentAction}
              onClick={handleIncidentSubmit}
            >
              Submit Incident Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Toast stack ──────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-medium shadow-xl",
              t.color === "red"
                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                : t.color === "amber"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : t.color === "blue"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            )}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  )
}
