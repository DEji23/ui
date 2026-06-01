"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { drivers, buses } from "@/lib/data"
import {
  Warning2, Danger, TickCircle, Bus, People, Map1, DocumentText1,
  SearchNormal1, ArrowRight2, Lock1, InfoCircle, ReceiptItem,
  Profile2User, Add, CloseCircle, Send2, Timer1, Calendar1,
  Location, Money, Flag2, Chart1, StatusUp, Task, Filter,
  PlayCircle, StopCircle, Setting2, RefreshCircle, Category2,
} from "iconsax-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type DispatchTab =
  | "overview"
  | "trip_planning"
  | "vehicle_blocks"
  | "bus_assignment"
  | "driver_assignment"
  | "publish"
  | "live_ops"
  | "exceptions"
  | "reconciliation"

interface DispatchTrip {
  id: string
  route: string
  departure: string
  arrival: string
  blockId: string
  busId: string
  driverId: string
  status: "planned" | "active" | "completed" | "cancelled" | "delayed"
  pax: number
  capacity: number
  fare: number
  deviation?: string
}

interface DispatchBlock {
  id: string
  busCode: string
  busId: string
  route: string
  trips: number
  departure: string
  driverId: string
  driverName: string
  status: "unassigned" | "assigned" | "published" | "active" | "completed"
}

interface LiveBus {
  id: string
  code: string
  route: string
  driver: string
  driverId: string
  status: "on_route" | "at_terminal" | "delayed" | "breakdown" | "off_duty"
  pax: number
  capacity: number
  lastUpdate: string
  eta?: string
  deviation?: string
}

interface ExceptionRow {
  id: string
  severity: "critical" | "high" | "warning" | "info"
  title: string
  route?: string
  bus?: string
  driver?: string
  status: "open" | "actioned"
  time: string
  note?: string
}

interface ReconciliationRow {
  id: string
  driver: string
  bus: string
  route: string
  plannedTrips: number
  completedTrips: number
  plannedRevenue: number
  actualRevenue: number
  passengers: number
  status: "matched" | "discrepancy" | "pending"
  note?: string
}

type Toast = { id: string; msg: string; color: string }

// ─── Seed data ────────────────────────────────────────────────────────────────

const ROUTES = [
  "Lagos Island – Oshodi",
  "Oshodi – Ikeja",
  "Lagos Island – Lekki",
  "Berger – Oshodi",
  "Ojota – CMS",
  "Surulere – Victoria Island",
]

const SEED_BLOCKS: DispatchBlock[] = [
  { id: "blk1", busCode: "KJA-001", busId: "b1", route: "Lagos Island – Oshodi", trips: 4, departure: "06:00", driverId: "d1", driverName: "Ibrahim Musa", status: "published" },
  { id: "blk2", busCode: "KJA-002", busId: "b2", route: "Oshodi – Ikeja", trips: 5, departure: "06:30", driverId: "d2", driverName: "Tunde Adeleke", status: "published" },
  { id: "blk3", busCode: "KJA-003", busId: "b3", route: "Lagos Island – Lekki", trips: 3, departure: "07:00", driverId: "", driverName: "", status: "unassigned" },
  { id: "blk4", busCode: "KJA-004", busId: "b4", route: "Berger – Oshodi", trips: 4, departure: "06:15", driverId: "d4", driverName: "Fatima Garba", status: "active" },
  { id: "blk5", busCode: "KJA-005", busId: "b5", route: "Ojota – CMS", trips: 3, departure: "07:30", driverId: "", driverName: "", status: "unassigned" },
  { id: "blk6", busCode: "KJA-007", busId: "b7", route: "Surulere – Victoria Island", trips: 4, departure: "06:45", driverId: "d6", driverName: "Aminu Danbaba", status: "assigned" },
]

const SEED_TRIPS: DispatchTrip[] = [
  { id: "t1", route: "Lagos Island – Oshodi", departure: "06:00", arrival: "07:15", blockId: "blk1", busId: "b1", driverId: "d1", status: "completed", pax: 42, capacity: 45, fare: 600 },
  { id: "t2", route: "Lagos Island – Oshodi", departure: "08:30", arrival: "09:45", blockId: "blk1", busId: "b1", driverId: "d1", status: "completed", pax: 38, capacity: 45, fare: 600 },
  { id: "t3", route: "Lagos Island – Oshodi", departure: "11:00", arrival: "12:15", blockId: "blk1", busId: "b1", driverId: "d1", status: "active", pax: 35, capacity: 45, fare: 600 },
  { id: "t4", route: "Lagos Island – Oshodi", departure: "14:00", arrival: "15:15", blockId: "blk1", busId: "b1", driverId: "d1", status: "planned", pax: 0, capacity: 45, fare: 600 },
  { id: "t5", route: "Oshodi – Ikeja", departure: "06:30", arrival: "07:20", blockId: "blk2", busId: "b2", driverId: "d2", status: "completed", pax: 40, capacity: 45, fare: 500 },
  { id: "t6", route: "Oshodi – Ikeja", departure: "09:00", arrival: "09:50", blockId: "blk2", busId: "b2", driverId: "d2", status: "active", pax: 32, capacity: 45, fare: 500 },
  { id: "t7", route: "Oshodi – Ikeja", departure: "11:30", arrival: "12:20", blockId: "blk2", busId: "b2", driverId: "d2", status: "planned", pax: 0, capacity: 45, fare: 500 },
  { id: "t8", route: "Lagos Island – Lekki", departure: "07:00", arrival: "08:30", blockId: "blk3", busId: "b3", driverId: "", status: "planned", pax: 0, capacity: 45, fare: 750 },
  { id: "t9", route: "Lagos Island – Lekki", departure: "10:00", arrival: "11:30", blockId: "blk3", busId: "b3", driverId: "", status: "planned", pax: 0, capacity: 45, fare: 750 },
  { id: "t10", route: "Lagos Island – Lekki", departure: "14:00", arrival: "15:30", blockId: "blk3", busId: "b3", driverId: "", status: "planned", pax: 0, capacity: 45, fare: 750 },
  { id: "t11", route: "Berger – Oshodi", departure: "06:15", arrival: "07:10", blockId: "blk4", busId: "b4", driverId: "d4", status: "completed", pax: 44, capacity: 45, fare: 550 },
  { id: "t12", route: "Berger – Oshodi", departure: "09:00", arrival: "09:55", blockId: "blk4", busId: "b4", driverId: "d4", status: "delayed", pax: 28, capacity: 45, fare: 550, deviation: "30 min delay — traffic" },
  { id: "t13", route: "Ojota – CMS", departure: "07:30", arrival: "08:45", blockId: "blk5", busId: "b5", driverId: "", status: "planned", pax: 0, capacity: 45, fare: 650 },
  { id: "t14", route: "Surulere – Victoria Island", departure: "06:45", arrival: "08:00", blockId: "blk6", busId: "b7", driverId: "d6", status: "completed", pax: 41, capacity: 45, fare: 700 },
  { id: "t15", route: "Surulere – Victoria Island", departure: "09:30", arrival: "10:45", blockId: "blk6", busId: "b7", driverId: "d6", status: "active", pax: 37, capacity: 45, fare: 700 },
  { id: "t16", route: "Surulere – Victoria Island", departure: "13:00", arrival: "14:15", blockId: "blk6", busId: "b7", driverId: "d6", status: "planned", pax: 0, capacity: 45, fare: 700 },
]

const SEED_LIVE: LiveBus[] = [
  { id: "b1", code: "KJA-001", route: "Lagos Island – Oshodi", driver: "Ibrahim Musa", driverId: "d1", status: "on_route", pax: 35, capacity: 45, lastUpdate: "11:04", eta: "12:15" },
  { id: "b2", code: "KJA-002", route: "Oshodi – Ikeja", driver: "Tunde Adeleke", driverId: "d2", status: "on_route", pax: 32, capacity: 45, lastUpdate: "11:06", eta: "11:50" },
  { id: "b4", code: "KJA-004", route: "Berger – Oshodi", driver: "Fatima Garba", driverId: "d4", status: "delayed", pax: 28, capacity: 45, lastUpdate: "11:02", eta: "12:25", deviation: "30 min delay — traffic at Lagos Bridge" },
  { id: "b7", code: "KJA-007", route: "Surulere – Victoria Island", driver: "Aminu Danbaba", driverId: "d6", status: "on_route", pax: 37, capacity: 45, lastUpdate: "11:05", eta: "10:45" },
]

const SEED_EXCEPTIONS: ExceptionRow[] = [
  { id: "ex1", severity: "critical", title: "Driver no-show — Chukwuemeka Obi", route: "Lagos Island – Lekki", bus: "KJA-003", driver: "Chukwuemeka Obi", status: "open", time: "06:45" },
  { id: "ex2", severity: "high", title: "KJA-005 bus assigned without driver", route: "Ojota – CMS", bus: "KJA-005", status: "open", time: "07:30" },
  { id: "ex3", severity: "high", title: "Trip delayed 30 min — KJA-004", route: "Berger – Oshodi", bus: "KJA-004", driver: "Fatima Garba", status: "open", time: "09:32" },
  { id: "ex4", severity: "warning", title: "KJA-002 nearing capacity (95%)", route: "Oshodi – Ikeja", bus: "KJA-002", driver: "Tunde Adeleke", status: "actioned", time: "10:15", note: "Passenger notified — next departure in 60 min" },
  { id: "ex5", severity: "info", title: "Trip t4 not yet confirmed for 14:00 departure", route: "Lagos Island – Oshodi", bus: "KJA-001", driver: "Ibrahim Musa", status: "open", time: "11:00" },
]

const SEED_RECONCILIATION: ReconciliationRow[] = [
  { id: "r1", driver: "Ibrahim Musa", bus: "KJA-001", route: "Lagos Island – Oshodi", plannedTrips: 4, completedTrips: 2, plannedRevenue: 108000, actualRevenue: 48000, passengers: 80, status: "pending" },
  { id: "r2", driver: "Tunde Adeleke", bus: "KJA-002", route: "Oshodi – Ikeja", plannedTrips: 5, completedTrips: 1, plannedRevenue: 112500, actualRevenue: 20000, passengers: 40, status: "pending" },
  { id: "r3", driver: "Fatima Garba", bus: "KJA-004", route: "Berger – Oshodi", plannedTrips: 4, completedTrips: 1, plannedRevenue: 99000, actualRevenue: 24200, passengers: 44, status: "discrepancy", note: "Revenue gap: ₦2,000 — AFC sync issue" },
  { id: "r4", driver: "Aminu Danbaba", bus: "KJA-007", route: "Surulere – Victoria Island", plannedTrips: 4, completedTrips: 1, plannedRevenue: 126000, actualRevenue: 28700, passengers: 41, status: "matched" },
  { id: "r5", driver: "—", bus: "KJA-003", route: "Lagos Island – Lekki", plannedTrips: 3, completedTrips: 0, plannedRevenue: 101250, actualRevenue: 0, passengers: 0, status: "discrepancy", note: "No-show — driver unassigned" },
  { id: "r6", driver: "—", bus: "KJA-005", route: "Ojota – CMS", plannedTrips: 3, completedTrips: 0, plannedRevenue: 87750, actualRevenue: 0, passengers: 0, status: "discrepancy", note: "Block unassigned — no trips dispatched" },
]

// ─── Helper components / fns ──────────────────────────────────────────────────

function toastColor(c: string) {
  if (c === "red") return "bg-red-500/20 text-red-300 border border-red-500/30"
  if (c === "amber") return "bg-amber-500/20 text-amber-300 border border-amber-500/30"
  if (c === "blue") return "bg-blue-500/20 text-blue-300 border border-blue-500/30"
  return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
}

function TripStatusBadge({ status }: { status: DispatchTrip["status"] }) {
  if (status === "active") return <Badge variant="success" className="text-[10px]">Active</Badge>
  if (status === "completed") return <Badge variant="muted" className="text-[10px]">Completed</Badge>
  if (status === "cancelled") return <Badge variant="destructive" className="text-[10px]">Cancelled</Badge>
  if (status === "delayed") return <Badge variant="warning" className="text-[10px]">Delayed</Badge>
  return <Badge variant="default" className="text-[10px]">Planned</Badge>
}

function BlockStatusBadge({ status }: { status: DispatchBlock["status"] }) {
  if (status === "active") return <Badge variant="success" className="text-[10px]">Active</Badge>
  if (status === "completed") return <Badge variant="muted" className="text-[10px]">Completed</Badge>
  if (status === "published") return <Badge variant="info" className="text-[10px]">Published</Badge>
  if (status === "assigned") return <Badge variant="default" className="text-[10px]">Assigned</Badge>
  return <Badge variant="warning" className="text-[10px]">Unassigned</Badge>
}

function LiveStatusBadge({ status }: { status: LiveBus["status"] }) {
  if (status === "on_route") return <Badge variant="success" className="text-[10px]">On Route</Badge>
  if (status === "at_terminal") return <Badge variant="default" className="text-[10px]">At Terminal</Badge>
  if (status === "delayed") return <Badge variant="warning" className="text-[10px]">Delayed</Badge>
  if (status === "breakdown") return <Badge variant="destructive" className="text-[10px]">Breakdown</Badge>
  return <Badge variant="muted" className="text-[10px]">Off Duty</Badge>
}

function SevIcon({ sev, size = 14 }: { sev: ExceptionRow["severity"]; size?: number }) {
  if (sev === "critical") return <Danger size={size} color="#f87171" variant="Bold" />
  if (sev === "high") return <Warning2 size={size} color="#fb923c" variant="Bold" />
  if (sev === "warning") return <Warning2 size={size} color="#fbbf24" variant="Linear" />
  return <InfoCircle size={size} color="#60a5fa" variant="Linear" />
}

const TAB_LIST: { id: DispatchTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "trip_planning", label: "Trip Planning" },
  { id: "vehicle_blocks", label: "Vehicle Blocks" },
  { id: "bus_assignment", label: "Bus Assignment" },
  { id: "driver_assignment", label: "Driver Assignment" },
  { id: "publish", label: "Publish Dispatch" },
  { id: "live_ops", label: "Live Operations" },
  { id: "exceptions", label: "Exceptions" },
  { id: "reconciliation", label: "Reconciliation" },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DispatchPage() {
  const [tab, setTab] = useState<DispatchTab>("overview")
  const [blocks, setBlocks] = useState<DispatchBlock[]>(SEED_BLOCKS)
  const [trips, setTrips] = useState<DispatchTrip[]>(SEED_TRIPS)
  const [liveBuses, setLiveBuses] = useState<LiveBus[]>(SEED_LIVE)
  const [exceptions, setExceptions] = useState<ExceptionRow[]>(SEED_EXCEPTIONS)
  const [reconciliation, setReconciliation] = useState<ReconciliationRow[]>(SEED_RECONCILIATION)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [published, setPublished] = useState(false)

  // Trip planning
  const [tripRoute, setTripRoute] = useState("")
  const [tripDep, setTripDep] = useState("06:00")
  const [tripArr, setTripArr] = useState("07:30")
  const [tripBlock, setTripBlock] = useState("")
  const [tripCapacity, setTripCapacity] = useState("45")
  const [tripFare, setTripFare] = useState("600")
  const [showTripDialog, setShowTripDialog] = useState(false)
  const [editTrip, setEditTrip] = useState<DispatchTrip | null>(null)

  // Vehicle blocks
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [editBlock, setEditBlock] = useState<DispatchBlock | null>(null)
  const [blockBus, setBlockBus] = useState("")
  const [blockRoute, setBlockRoute] = useState("")
  const [blockTrips, setBlockTrips] = useState("3")
  const [blockDep, setBlockDep] = useState("06:00")

  // Bus assignment
  const [busAssignTarget, setBusAssignTarget] = useState<DispatchBlock | null>(null)
  const [busAssignId, setBusAssignId] = useState("")

  // Driver assignment
  const [driverAssignTarget, setDriverAssignTarget] = useState<DispatchBlock | null>(null)
  const [driverAssignId, setDriverAssignId] = useState("")

  // Live ops
  const [selectedLive, setSelectedLive] = useState<LiveBus | null>(null)
  const [liveAction, setLiveAction] = useState("")
  const [liveNote, setLiveNote] = useState("")

  // Exceptions
  const [selectedEx, setSelectedEx] = useState<ExceptionRow | null>(null)
  const [exAction, setExAction] = useState("")
  const [exNote, setExNote] = useState("")
  const [exReplacement, setExReplacement] = useState("")

  // Reconciliation
  const [reconNote, setReconNote] = useState("")
  const [selectedRecon, setSelectedRecon] = useState<ReconciliationRow | null>(null)

  // Publish
  const [publishConfirm, setPublishConfirm] = useState(false)

  // ── Helpers ──

  function addToast(msg: string, color = "emerald") {
    const id = Date.now().toString()
    setToasts(p => [...p, { id, msg, color }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)
  }

  const availableDrivers = drivers.filter(d => d.status !== "blocked" && d.status !== "on_leave")
  const availableBuses = buses.filter(b => b.status === "available" || b.status === "active")

  // ── Computed ──

  const kpi = useMemo(() => {
    const activeTrips = trips.filter(t => t.status === "active").length
    const completedTrips = trips.filter(t => t.status === "completed").length
    const delayedTrips = trips.filter(t => t.status === "delayed").length
    const unassignedBlocks = blocks.filter(b => b.status === "unassigned").length
    const openExceptions = exceptions.filter(e => e.status === "open").length
    const totalPax = trips.filter(t => t.status === "completed").reduce((s, t) => s + t.pax, 0)
    const revenue = reconciliation.reduce((s, r) => s + r.actualRevenue, 0)
    return { activeTrips, completedTrips, delayedTrips, unassignedBlocks, openExceptions, totalPax, revenue }
  }, [trips, blocks, exceptions, reconciliation])

  // ── Handlers ──

  function handleSaveTrip() {
    if (!tripRoute || !tripDep || !tripArr) return
    const block = blocks.find(b => b.id === tripBlock)
    if (editTrip) {
      setTrips(p => p.map(t => t.id === editTrip.id
        ? { ...t, route: tripRoute, departure: tripDep, arrival: tripArr, blockId: tripBlock, busId: block?.busId ?? t.busId, driverId: block?.driverId ?? t.driverId, capacity: parseInt(tripCapacity) || 45, fare: parseInt(tripFare) || 600 }
        : t
      ))
      addToast("Trip updated")
    } else {
      const newTrip: DispatchTrip = {
        id: `t${Date.now()}`,
        route: tripRoute, departure: tripDep, arrival: tripArr,
        blockId: tripBlock, busId: block?.busId ?? "",
        driverId: block?.driverId ?? "",
        status: "planned", pax: 0,
        capacity: parseInt(tripCapacity) || 45,
        fare: parseInt(tripFare) || 600,
      }
      setTrips(p => [...p, newTrip])
      addToast("Trip added to plan")
    }
    setShowTripDialog(false)
    setEditTrip(null)
    setTripRoute(""); setTripDep("06:00"); setTripArr("07:30"); setTripBlock(""); setTripCapacity("45"); setTripFare("600")
  }

  function handleDeleteTrip(id: string) {
    setTrips(p => p.filter(t => t.id !== id))
    addToast("Trip removed from plan", "amber")
  }

  function openEditTrip(trip: DispatchTrip) {
    setEditTrip(trip)
    setTripRoute(trip.route); setTripDep(trip.departure); setTripArr(trip.arrival)
    setTripBlock(trip.blockId); setTripCapacity(String(trip.capacity)); setTripFare(String(trip.fare))
    setShowTripDialog(true)
  }

  function handleSaveBlock() {
    if (!blockBus || !blockRoute) return
    const busObj = buses.find(b => b.code === blockBus || b.id === blockBus)
    if (editBlock) {
      setBlocks(p => p.map(b => b.id === editBlock.id
        ? { ...b, busCode: busObj?.code ?? blockBus, busId: busObj?.id ?? b.busId, route: blockRoute, trips: parseInt(blockTrips) || 3, departure: blockDep }
        : b
      ))
      addToast("Block updated")
    } else {
      const nb: DispatchBlock = {
        id: `blk${Date.now()}`,
        busCode: busObj?.code ?? blockBus,
        busId: busObj?.id ?? "",
        route: blockRoute,
        trips: parseInt(blockTrips) || 3,
        departure: blockDep,
        driverId: "", driverName: "",
        status: "unassigned",
      }
      setBlocks(p => [...p, nb])
      addToast("Vehicle block created")
    }
    setShowBlockDialog(false); setEditBlock(null)
    setBlockBus(""); setBlockRoute(""); setBlockTrips("3"); setBlockDep("06:00")
  }

  function openEditBlock(b: DispatchBlock) {
    setEditBlock(b)
    setBlockBus(b.busCode); setBlockRoute(b.route)
    setBlockTrips(String(b.trips)); setBlockDep(b.departure)
    setShowBlockDialog(true)
  }

  function handleAssignBus() {
    if (!busAssignTarget || !busAssignId) return
    const busObj = buses.find(b => b.id === busAssignId)
    setBlocks(p => p.map(b => b.id === busAssignTarget.id
      ? { ...b, busId: busAssignId, busCode: busObj?.code ?? b.busCode, status: b.driverId ? "assigned" : "unassigned" }
      : b
    ))
    setBusAssignTarget(null); setBusAssignId("")
    addToast(`${busObj?.code} assigned to block`)
  }

  function handleAssignDriver() {
    if (!driverAssignTarget || !driverAssignId) return
    const driverObj = drivers.find(d => d.id === driverAssignId)
    setBlocks(p => p.map(b => b.id === driverAssignTarget.id
      ? { ...b, driverId: driverAssignId, driverName: driverObj?.name ?? "", status: b.busId ? "assigned" : "unassigned" }
      : b
    ))
    setDriverAssignTarget(null); setDriverAssignId("")
    addToast(`${driverObj?.name} assigned to block`)
  }

  function handlePublishAll() {
    const readyBlocks = blocks.filter(b => b.status === "assigned" || b.status === "published")
    setBlocks(p => p.map(b => (b.status === "assigned" ? { ...b, status: "published" } : b)))
    setPublished(true)
    setPublishConfirm(false)
    addToast(`${readyBlocks.length} blocks published — dispatch live`)
  }

  function handleLiveAction() {
    if (!selectedLive || !liveAction) return
    if (liveAction === "flag_breakdown") {
      setLiveBuses(p => p.map(b => b.id === selectedLive.id ? { ...b, status: "breakdown" } : b))
      setExceptions(p => [...p, {
        id: `ex${Date.now()}`, severity: "critical",
        title: `Breakdown reported — ${selectedLive.code}`,
        route: selectedLive.route, bus: selectedLive.code, driver: selectedLive.driver,
        status: "open", time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      }])
      addToast(`${selectedLive.code} flagged as breakdown — exception raised`, "red")
    } else if (liveAction === "contact_driver") {
      addToast(`Message sent to ${selectedLive.driver}`, "blue")
    } else if (liveAction === "end_trip") {
      setLiveBuses(p => p.map(b => b.id === selectedLive.id ? { ...b, status: "at_terminal" } : b))
      addToast(`${selectedLive.code} marked as returned to terminal`)
    }
    setSelectedLive(null); setLiveAction(""); setLiveNote("")
  }

  function handleExAction() {
    if (!selectedEx) return
    const patch: Partial<ExceptionRow> = { status: "actioned", note: exNote || exAction }
    setExceptions(p => p.map(e => e.id === selectedEx.id ? { ...e, ...patch } : e))
    if (exReplacement && selectedEx.id === "ex1") {
      const d = drivers.find(dr => dr.id === exReplacement)
      setBlocks(p => p.map(b => b.id === "blk3" ? { ...b, driverId: exReplacement, driverName: d?.name ?? "", status: "assigned" } : b))
      addToast(`${d?.name} assigned as replacement`, "emerald")
    } else {
      addToast("Exception actioned", "amber")
    }
    setSelectedEx(null); setExAction(""); setExNote(""); setExReplacement("")
  }

  function handleReconApprove(id: string) {
    setReconciliation(p => p.map(r => r.id === id ? { ...r, status: "matched" } : r))
    addToast("Reconciliation approved")
  }

  function handleReconNoteSubmit() {
    if (!selectedRecon) return
    setReconciliation(p => p.map(r => r.id === selectedRecon.id ? { ...r, note: reconNote } : r))
    setSelectedRecon(null); setReconNote("")
    addToast("Note saved to reconciliation record", "blue")
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render helpers per tab
  // ─────────────────────────────────────────────────────────────────────────────

  function renderOverview() {
    const kpiCards = [
      { label: "Active Trips", value: kpi.activeTrips, color: "text-emerald-400", bg: "bg-emerald-500/10", icon: <PlayCircle size={16} color="#34d399" variant="Bold" /> },
      { label: "Completed Today", value: kpi.completedTrips, color: "text-blue-400", bg: "bg-blue-500/10", icon: <TickCircle size={16} color="#60a5fa" variant="Bold" /> },
      { label: "Delayed", value: kpi.delayedTrips, color: "text-amber-400", bg: "bg-amber-500/10", icon: <Timer1 size={16} color="#f59e0b" variant="Bold" /> },
      { label: "Unassigned Blocks", value: kpi.unassignedBlocks, color: "text-orange-400", bg: "bg-orange-500/10", icon: <Bus size={16} color="#fb923c" variant="Bold" /> },
      { label: "Open Exceptions", value: kpi.openExceptions, color: "text-red-400", bg: "bg-red-500/10", icon: <Danger size={16} color="#f87171" variant="Bold" /> },
      { label: "Passengers Today", value: kpi.totalPax, color: "text-fg", bg: "bg-[var(--hover-bg)]", icon: <People size={16} color="currentColor" variant="Bold" /> },
    ]
    return (
      <div className="space-y-5">
        {kpi.openExceptions > 0 && (
          <div className="rounded-xl bg-red-500/[0.06] border border-red-500/20 px-4 py-3 flex items-start gap-3">
            <Danger size={16} color="#f87171" variant="Bold" className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-400">{kpi.openExceptions} open exception{kpi.openExceptions > 1 ? "s" : ""} require attention</p>
              <p className="text-xs text-fg-muted mt-0.5">{exceptions.filter(e => e.status === "open").map(e => e.title).join("  ·  ")}</p>
            </div>
            <Button size="sm" variant="outline" className="shrink-0 gap-1" onClick={() => setTab("exceptions")}>
              View <ArrowRight2 size={12} color="currentColor" />
            </Button>
          </div>
        )}
        {kpi.unassignedBlocks > 0 && (
          <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/20 px-4 py-3 flex items-center gap-3">
            <Bus size={16} color="#f59e0b" variant="Bold" />
            <p className="text-sm font-semibold text-amber-400 flex-1">{kpi.unassignedBlocks} vehicle block{kpi.unassignedBlocks > 1 ? "s" : ""} without a driver — assign before publish</p>
            <Button size="sm" variant="outline" className="shrink-0" onClick={() => setTab("driver_assignment")}>Assign</Button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {kpiCards.map(k => (
            <div key={k.label} className="bg-surface border border-line-soft rounded-xl p-4 flex items-center gap-3">
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", k.bg)}>{k.icon}</div>
              <div>
                <p className={cn("text-xl font-bold tabular-nums", k.color)}>{k.value.toLocaleString()}</p>
                <p className="text-xs text-fg-muted">{k.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <div className="px-5 py-4 border-b border-line-soft flex items-center justify-between">
              <p className="text-sm font-semibold text-fg">Active Blocks</p>
              <Button size="sm" variant="ghost" onClick={() => setTab("vehicle_blocks")}>View all</Button>
            </div>
            <CardContent className="px-0 pb-0">
              {blocks.slice(0, 4).map(b => (
                <div key={b.id} className="flex items-center gap-3 px-5 py-3 border-b border-line-soft last:border-0">
                  <div className="h-7 w-7 rounded-lg bg-[var(--hover-bg)] flex items-center justify-center shrink-0">
                    <Bus size={13} color={b.status === "unassigned" ? "#f59e0b" : "#a1a1aa"} variant="Bold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-fg">{b.busCode}</p>
                    <p className="text-xs text-fg-dim truncate">{b.route}</p>
                  </div>
                  <BlockStatusBadge status={b.status} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 py-4 border-b border-line-soft flex items-center justify-between">
              <p className="text-sm font-semibold text-fg">Live Fleet</p>
              <Button size="sm" variant="ghost" onClick={() => setTab("live_ops")}>View all</Button>
            </div>
            <CardContent className="px-0 pb-0">
              {liveBuses.map(b => (
                <div key={b.id} className="flex items-center gap-3 px-5 py-3 border-b border-line-soft last:border-0">
                  <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                    b.status === "on_route" ? "bg-emerald-500/10" : b.status === "delayed" ? "bg-amber-500/10" : "bg-red-500/10"
                  )}>
                    <Bus size={13} color={b.status === "on_route" ? "#34d399" : b.status === "delayed" ? "#f59e0b" : "#f87171"} variant="Bold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-fg">{b.code} · {b.driver.split(" ")[0]}</p>
                    <p className="text-xs text-fg-dim truncate">{b.route}</p>
                  </div>
                  <LiveStatusBadge status={b.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <div className="px-5 py-4 border-b border-line-soft">
            <p className="text-sm font-semibold text-fg">Revenue Snapshot</p>
          </div>
          <CardContent className="p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-fg tabular-nums">₦{kpi.revenue.toLocaleString()}</p>
                <p className="text-xs text-fg-dim mt-1">Collected so far</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-fg tabular-nums">{reconciliation.filter(r => r.status === "matched").length}</p>
                <p className="text-xs text-fg-dim mt-1">Reconciled</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400 tabular-nums">{reconciliation.filter(r => r.status === "discrepancy").length}</p>
                <p className="text-xs text-fg-dim mt-1">Discrepancies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  function renderTripPlanning() {
    const routeFilter = trips.reduce<Record<string, DispatchTrip[]>>((acc, t) => {
      if (!acc[t.route]) acc[t.route] = []
      acc[t.route].push(t)
      return acc
    }, {})
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-fg-muted">Plan and manage today&apos;s trip schedule per route.</p>
          <Button size="sm" className="gap-1.5" onClick={() => { setShowTripDialog(true); setEditTrip(null); setTripRoute(""); setTripDep("06:00"); setTripArr("07:30"); setTripBlock(""); setTripCapacity("45"); setTripFare("600") }}>
            <Add size={14} color="currentColor" /> Add Trip
          </Button>
        </div>

        {Object.entries(routeFilter).map(([route, rTrips]) => (
          <Card key={route}>
            <div className="px-5 py-3.5 border-b border-line-soft flex items-center gap-2">
              <Map1 size={14} color="currentColor" className="text-fg-dim" />
              <p className="text-sm font-semibold text-fg">{route}</p>
              <span className="ml-auto text-xs text-fg-dim">{rTrips.length} trips</span>
            </div>
            <div className="divide-y divide-line-soft">
              {rTrips.map(trip => (
                <div key={trip.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--hover-bg)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-fg">{trip.departure}</span>
                      <ArrowRight2 size={12} color="currentColor" className="text-fg-dim" />
                      <span className="text-sm text-fg-muted">{trip.arrival}</span>
                      <TripStatusBadge status={trip.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-fg-dim">
                      {trip.driverId ? (
                        <span className="flex items-center gap-1"><Profile2User size={11} color="currentColor" />{drivers.find(d => d.id === trip.driverId)?.name ?? "—"}</span>
                      ) : <span className="text-amber-400">No driver</span>}
                      <span className="flex items-center gap-1"><Bus size={11} color="currentColor" />{buses.find(b => b.id === trip.busId)?.code ?? "—"}</span>
                      <span>Cap {trip.capacity} · ₦{trip.fare}</span>
                    </div>
                    {trip.deviation && <p className="text-xs text-amber-400 mt-0.5">{trip.deviation}</p>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {trip.status === "planned" && (
                      <Button size="sm" variant="ghost" onClick={() => openEditTrip(trip)}>Edit</Button>
                    )}
                    {trip.status === "planned" && (
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => handleDeleteTrip(trip.id)}>
                        <CloseCircle size={14} color="currentColor" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    )
  }

  function renderVehicleBlocks() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-fg-muted">Bus–route allocations for today. Assign drivers and buses per block.</p>
          <Button size="sm" className="gap-1.5" onClick={() => { setShowBlockDialog(true); setEditBlock(null); setBlockBus(""); setBlockRoute(""); setBlockTrips("3"); setBlockDep("06:00") }}>
            <Add size={14} color="currentColor" /> New Block
          </Button>
        </div>
        <Card>
          <div className="hidden sm:grid grid-cols-[1fr_1.5fr_1fr_auto_auto_auto] gap-3 px-5 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider border-b border-line-soft">
            <span>Bus</span><span>Route</span><span>Driver</span><span>Trips / Dep.</span><span>Status</span><span />
          </div>
          <div className="divide-y divide-line-soft">
            {blocks.map(b => (
              <div key={b.id} className={cn("flex flex-col sm:grid sm:grid-cols-[1fr_1.5fr_1fr_auto_auto_auto] gap-3 items-start sm:items-center px-5 py-4 hover:bg-[var(--hover-bg)] transition-colors", b.status === "unassigned" && "bg-amber-500/[0.02]")}>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[var(--hover-bg)] flex items-center justify-center shrink-0">
                    <Bus size={13} color={b.status === "unassigned" ? "#f59e0b" : "#a1a1aa"} variant="Bold" />
                  </div>
                  <span className="text-sm font-semibold text-fg">{b.busCode}</span>
                </div>
                <p className="text-sm text-fg-muted">{b.route}</p>
                <p className="text-sm text-fg-muted">{b.driverName || <span className="text-amber-400 text-xs">Unassigned</span>}</p>
                <p className="text-xs text-fg-dim">{b.trips} trips · {b.departure}</p>
                <BlockStatusBadge status={b.status} />
                <div className="flex gap-1.5">
                  <Button size="sm" variant="ghost" onClick={() => openEditBlock(b)}>Edit</Button>
                  {b.status === "unassigned" && (
                    <Button size="sm" variant="outline" className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10" onClick={() => { setDriverAssignTarget(b); setDriverAssignId(""); setTab("driver_assignment") }}>
                      Assign
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  function renderBusAssignment() {
    return (
      <div className="space-y-4">
        <p className="text-sm text-fg-muted">Assign available buses to vehicle blocks.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {blocks.map(b => {
            const assignedBus = buses.find(bus => bus.id === b.busId)
            return (
              <Card key={b.id} className={cn(b.busId ? "" : "border-amber-500/20")}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-fg">{b.busCode}</p>
                      <p className="text-xs text-fg-dim">{b.route}</p>
                    </div>
                    <BlockStatusBadge status={b.status} />
                  </div>
                  {assignedBus ? (
                    <div className="flex items-center gap-2 rounded-lg bg-[var(--subtle-bg)] px-3 py-2 text-xs">
                      <Bus size={12} color="currentColor" className="text-fg-dim" />
                      <span className="text-fg font-medium">{assignedBus.code}</span>
                      <span className="text-fg-dim">— {assignedBus.model} · Cap {assignedBus.capacity}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-400">No bus assigned</p>
                  )}
                  <Button size="sm" variant="outline" className="w-full" onClick={() => { setBusAssignTarget(b); setBusAssignId(b.busId) }}>
                    {b.busId ? "Reassign Bus" : "Assign Bus"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Dialog
          open={!!busAssignTarget}
          onClose={() => { setBusAssignTarget(null); setBusAssignId("") }}
          title="Assign Bus to Block"
          description={busAssignTarget ? `${busAssignTarget.busCode} · ${busAssignTarget.route}` : ""}
          className="max-w-sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">Select Bus</label>
              <Select value={busAssignId} onChange={e => setBusAssignId(e.target.value)}>
                <option value="">Choose available bus…</option>
                {availableBuses.map(b => <option key={b.id} value={b.id}>{b.code} — {b.model} · Cap {b.capacity}</option>)}
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setBusAssignTarget(null); setBusAssignId("") }}>Cancel</Button>
              <Button size="sm" disabled={!busAssignId} onClick={handleAssignBus}>Assign</Button>
            </div>
          </div>
        </Dialog>
      </div>
    )
  }

  function renderDriverAssignment() {
    return (
      <div className="space-y-4">
        <p className="text-sm text-fg-muted">Assign drivers to vehicle blocks. Compliance status shown for each driver.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {blocks.map(b => {
            const assignedDriver = drivers.find(d => d.id === b.driverId)
            return (
              <Card key={b.id} className={cn(!b.driverId && "border-amber-500/20")}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-fg">{b.busCode}</p>
                      <p className="text-xs text-fg-dim">{b.route} · {b.trips} trips · Dep {b.departure}</p>
                    </div>
                    <BlockStatusBadge status={b.status} />
                  </div>
                  {assignedDriver ? (
                    <div className="flex items-center gap-2 rounded-lg bg-[var(--subtle-bg)] px-3 py-2 text-xs">
                      <Profile2User size={12} color="currentColor" className="text-fg-dim" />
                      <span className="text-fg font-medium">{assignedDriver.name}</span>
                      <span className="text-fg-dim">({assignedDriver.code})</span>
                      {assignedDriver.complianceStatus === "clear"
                        ? <TickCircle size={11} color="#34d399" variant="Bold" className="ml-auto" />
                        : <Warning2 size={11} color="#f59e0b" className="ml-auto" />
                      }
                    </div>
                  ) : (
                    <p className="text-xs text-amber-400">No driver assigned</p>
                  )}
                  <Button size="sm" variant={!b.driverId ? "default" : "outline"} className={cn("w-full", !b.driverId && "bg-amber-500 text-black hover:bg-amber-400")} onClick={() => { setDriverAssignTarget(b); setDriverAssignId(b.driverId) }}>
                    {b.driverId ? "Reassign Driver" : "Assign Driver"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Dialog
          open={!!driverAssignTarget}
          onClose={() => { setDriverAssignTarget(null); setDriverAssignId("") }}
          title="Assign Driver to Block"
          description={driverAssignTarget ? `${driverAssignTarget.busCode} · ${driverAssignTarget.route} · ${driverAssignTarget.trips} trips · Dep ${driverAssignTarget.departure}` : ""}
          className="max-w-md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">Select Driver</label>
              <Select value={driverAssignId} onChange={e => setDriverAssignId(e.target.value)}>
                <option value="">Choose available driver…</option>
                {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code}) · {d.complianceStatus}</option>)}
              </Select>
            </div>
            {driverAssignId && (() => {
              const d = drivers.find(dr => dr.id === driverAssignId)
              if (!d) return null
              return (
                <div className={cn("rounded-lg px-3 py-2 text-xs", d.complianceStatus === "clear" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400")}>
                  {d.complianceStatus === "clear"
                    ? <TickCircle size={11} color="currentColor" className="inline mr-1" variant="Bold" />
                    : <Warning2 size={11} color="currentColor" className="inline mr-1" />
                  }
                  Compliance: {d.complianceStatus} · {d.hoursThisWeek}h this week
                </div>
              )
            })()}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setDriverAssignTarget(null); setDriverAssignId("") }}>Cancel</Button>
              <Button size="sm" disabled={!driverAssignId} onClick={handleAssignDriver}>Assign</Button>
            </div>
          </div>
        </Dialog>
      </div>
    )
  }

  function renderPublish() {
    const ready = blocks.filter(b => b.status === "assigned" || b.status === "published")
    const unready = blocks.filter(b => b.status === "unassigned")
    const alreadyPublished = blocks.filter(b => b.status === "published" || b.status === "active")

    return (
      <div className="space-y-5">
        <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Send2 size={18} color="#f59e0b" variant="Bold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-fg">Publish Today&apos;s Dispatch</p>
              <p className="text-xs text-fg-muted mt-0.5">Publishing makes all assigned blocks live — drivers receive their duties, buses activate on the fleet tracker.</p>
            </div>
          </div>
          <Separator className="bg-line-soft" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-400 tabular-nums">{ready.length}</p>
              <p className="text-xs text-fg-dim mt-1">Ready to publish</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400 tabular-nums">{unready.length}</p>
              <p className="text-xs text-fg-dim mt-1">Unassigned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400 tabular-nums">{alreadyPublished.length}</p>
              <p className="text-xs text-fg-dim mt-1">Already live</p>
            </div>
          </div>
          {unready.length > 0 && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 text-xs text-amber-400">
              <Warning2 size={11} color="currentColor" className="inline mr-1" />
              {unready.map(b => b.busCode).join(", ")} {unready.length === 1 ? "has" : "have"} no driver — {unready.length === 1 ? "this block" : "these blocks"} will not be published.
            </div>
          )}
          <Button
            className="w-full gap-2"
            disabled={ready.length === 0}
            onClick={() => setPublishConfirm(true)}
          >
            <Send2 size={15} color="currentColor" />
            {published ? "Re-publish Updated Dispatch" : "Publish Dispatch"}
          </Button>
        </div>

        {published && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-center gap-3">
            <TickCircle size={18} color="#34d399" variant="Bold" />
            <div>
              <p className="text-sm font-semibold text-emerald-400">Dispatch is live</p>
              <p className="text-xs text-fg-muted mt-0.5">{alreadyPublished.length} blocks active · Drivers notified · Fleet tracker updated</p>
            </div>
          </div>
        )}

        <Card>
          <div className="px-5 py-3.5 border-b border-line-soft">
            <p className="text-sm font-semibold text-fg">Block Status Summary</p>
          </div>
          <div className="divide-y divide-line-soft">
            {blocks.map(b => (
              <div key={b.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="h-7 w-7 rounded-lg bg-[var(--hover-bg)] flex items-center justify-center shrink-0">
                  <Bus size={13} color={b.status === "unassigned" ? "#f59e0b" : "#a1a1aa"} variant="Bold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-fg">{b.busCode} · {b.route}</p>
                  <p className="text-xs text-fg-dim">{b.driverName || "No driver"} · {b.trips} trips · Dep {b.departure}</p>
                </div>
                <BlockStatusBadge status={b.status} />
              </div>
            ))}
          </div>
        </Card>

        <Dialog
          open={publishConfirm}
          onClose={() => setPublishConfirm(false)}
          title="Confirm Publish"
          description={`You are about to publish ${ready.length} block${ready.length !== 1 ? "s" : ""}. Drivers will receive their duties immediately.`}
          className="max-w-sm"
        >
          <div className="space-y-4">
            {unready.length > 0 && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-400">
                <Warning2 size={11} color="currentColor" className="inline mr-1" />
                {unready.length} unassigned block{unready.length > 1 ? "s" : ""} will be skipped.
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setPublishConfirm(false)}>Cancel</Button>
              <Button size="sm" onClick={handlePublishAll}>Confirm Publish</Button>
            </div>
          </div>
        </Dialog>
      </div>
    )
  }

  function renderLiveOps() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-fg-muted">Monitor active fleet in real time. Flag issues and contact drivers.</p>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => addToast("Fleet data refreshed", "blue")}>
            <RefreshCircle size={14} color="currentColor" /> Refresh
          </Button>
        </div>

        <div className="space-y-3">
          {liveBuses.map(b => (
            <div
              key={b.id}
              onClick={() => { setSelectedLive(b); setLiveAction(""); setLiveNote("") }}
              className={cn(
                "rounded-xl border px-4 py-4 cursor-pointer transition-colors hover:bg-[var(--hover-bg)]",
                b.status === "breakdown" ? "border-red-500/30 bg-red-500/[0.03]" :
                b.status === "delayed" ? "border-amber-500/30 bg-amber-500/[0.03]" : "border-line-soft"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                  b.status === "on_route" ? "bg-emerald-500/10" :
                  b.status === "delayed" ? "bg-amber-500/10" :
                  b.status === "breakdown" ? "bg-red-500/10" : "bg-[var(--hover-bg)]"
                )}>
                  <Bus size={15} color={
                    b.status === "on_route" ? "#34d399" :
                    b.status === "delayed" ? "#f59e0b" :
                    b.status === "breakdown" ? "#f87171" : "#a1a1aa"
                  } variant="Bold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-fg">{b.code}</span>
                    <span className="text-xs text-fg-dim">·</span>
                    <span className="text-sm text-fg-muted">{b.driver}</span>
                    <LiveStatusBadge status={b.status} />
                  </div>
                  <p className="text-xs text-fg-dim mt-0.5">{b.route}</p>
                  {b.deviation && <p className="text-xs text-amber-400 mt-0.5">{b.deviation}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-fg-dim">
                    <span className="flex items-center gap-1"><People size={11} color="currentColor" />{b.pax}/{b.capacity}</span>
                    {b.eta && <span className="flex items-center gap-1"><Timer1 size={11} color="currentColor" />ETA {b.eta}</span>}
                    <span>Updated {b.lastUpdate}</span>
                  </div>
                </div>
                <ArrowRight2 size={14} color="currentColor" className="text-fg-dim shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>

        <Dialog
          open={!!selectedLive}
          onClose={() => { setSelectedLive(null); setLiveAction(""); setLiveNote("") }}
          title={selectedLive ? `${selectedLive.code} — ${selectedLive.driver}` : ""}
          className="max-w-md"
        >
          {selectedLive && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-[var(--subtle-bg)] p-3 text-xs">
                <div><span className="text-fg-dim block">Route</span><p className="text-fg font-medium mt-0.5">{selectedLive.route}</p></div>
                <div><span className="text-fg-dim block">Status</span><div className="mt-0.5"><LiveStatusBadge status={selectedLive.status} /></div></div>
                <div><span className="text-fg-dim block">Passengers</span><p className="text-fg font-medium mt-0.5">{selectedLive.pax}/{selectedLive.capacity}</p></div>
                {selectedLive.eta && <div><span className="text-fg-dim block">ETA</span><p className="text-fg font-medium mt-0.5">{selectedLive.eta}</p></div>}
                {selectedLive.deviation && <div className="col-span-2"><span className="text-fg-dim block">Note</span><p className="text-amber-400 font-medium mt-0.5">{selectedLive.deviation}</p></div>}
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1.5">Action</label>
                <Select value={liveAction} onChange={e => setLiveAction(e.target.value)}>
                  <option value="">Select action…</option>
                  <option value="contact_driver">Contact Driver</option>
                  <option value="flag_breakdown">Flag Breakdown</option>
                  <option value="end_trip">Mark Returned to Terminal</option>
                </Select>
              </div>
              {liveAction && (
                <div>
                  <label className="block text-xs text-fg-muted mb-1.5">Note (optional)</label>
                  <Textarea value={liveNote} onChange={e => setLiveNote(e.target.value)} placeholder="Add note for audit trail…" rows={2} className="resize-none" />
                </div>
              )}
              {liveAction === "flag_breakdown" && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                  <Danger size={11} color="currentColor" className="inline mr-1" variant="Bold" />
                  This will mark the bus as breakdown and create a critical exception. This action is logged.
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => { setSelectedLive(null); setLiveAction(""); setLiveNote("") }}>Cancel</Button>
                <Button size="sm" disabled={!liveAction} variant={liveAction === "flag_breakdown" ? "destructive" : "default"} onClick={handleLiveAction}>Confirm</Button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    )
  }

  function renderExceptions() {
    const open = exceptions.filter(e => e.status === "open")
    const actioned = exceptions.filter(e => e.status === "actioned")
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {open.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-sm font-semibold text-red-400">
              <Danger size={14} color="currentColor" variant="Bold" />
              {open.length} Open
            </div>
          )}
          <p className="text-sm text-fg-muted">{open.length === 0 ? "All exceptions resolved for this session." : "Click an exception to take action."}</p>
        </div>

        {open.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-fg-dim">Open</p>
            {open.map(ex => (
              <div key={ex.id} onClick={() => { setSelectedEx(ex); setExAction(""); setExNote(""); setExReplacement("") }} className={cn(
                "flex gap-3 rounded-xl border border-l-[3px] p-4 cursor-pointer hover:bg-[var(--hover-bg)] transition-colors",
                ex.severity === "critical" ? "border-red-500/20 border-l-red-500" :
                ex.severity === "high" ? "border-orange-500/20 border-l-orange-500" :
                ex.severity === "warning" ? "border-amber-500/20 border-l-amber-500" : "border-blue-500/20 border-l-blue-500"
              )}>
                <SevIcon sev={ex.severity} size={16} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-fg">{ex.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-fg-dim flex-wrap">
                    {ex.route && <span className="flex items-center gap-1"><Map1 size={10} color="currentColor" />{ex.route}</span>}
                    {ex.bus && <span className="flex items-center gap-1"><Bus size={10} color="currentColor" />{ex.bus}</span>}
                    <span>{ex.time}</span>
                  </div>
                </div>
                <ArrowRight2 size={14} color="currentColor" className="text-fg-dim shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        )}

        {actioned.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-fg-dim">Actioned</p>
            {actioned.map(ex => (
              <div key={ex.id} className="flex gap-3 rounded-xl border border-line-soft p-4 opacity-60">
                <TickCircle size={14} color="#34d399" variant="Bold" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-fg-muted">{ex.title}</p>
                  {ex.note && <p className="text-xs text-fg-dim mt-0.5">{ex.note}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog
          open={!!selectedEx}
          onClose={() => { setSelectedEx(null); setExAction(""); setExNote(""); setExReplacement("") }}
          title={selectedEx?.title}
          className="max-w-lg"
        >
          {selectedEx && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-[var(--subtle-bg)] p-3 text-xs">
                {selectedEx.route && <div><span className="text-fg-dim block">Route</span><p className="text-fg font-medium mt-0.5">{selectedEx.route}</p></div>}
                {selectedEx.bus && <div><span className="text-fg-dim block">Bus</span><p className="text-fg font-medium mt-0.5">{selectedEx.bus}</p></div>}
                {selectedEx.driver && <div><span className="text-fg-dim block">Driver</span><p className="text-fg font-medium mt-0.5">{selectedEx.driver}</p></div>}
                <div><span className="text-fg-dim block">Time</span><p className="text-fg font-medium mt-0.5">{selectedEx.time}</p></div>
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1.5">Action</label>
                <Select value={exAction} onChange={e => setExAction(e.target.value)}>
                  <option value="">Select action…</option>
                  <option value="assign_replacement">Assign Replacement Driver</option>
                  <option value="delay_trip">Delay Trip</option>
                  <option value="cancel_trip">Cancel Trip</option>
                  <option value="contact_driver">Contact Driver</option>
                  <option value="acknowledge">Acknowledge — Monitor</option>
                </Select>
              </div>
              {exAction === "assign_replacement" && (
                <div>
                  <label className="block text-xs text-fg-muted mb-1.5">Replacement Driver</label>
                  <Select value={exReplacement} onChange={e => setExReplacement(e.target.value)}>
                    <option value="">Choose driver…</option>
                    {availableDrivers.filter(d => d.name !== selectedEx.driver).map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code}) · {d.complianceStatus}</option>
                    ))}
                  </Select>
                </div>
              )}
              <div>
                <label className="block text-xs text-fg-muted mb-1.5">Note</label>
                <Textarea value={exNote} onChange={e => setExNote(e.target.value)} placeholder="Add note for audit trail…" rows={2} className="resize-none" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => { setSelectedEx(null); setExAction(""); setExNote(""); setExReplacement("") }}>Cancel</Button>
                <Button size="sm" disabled={!exAction} onClick={handleExAction}>Save Action</Button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    )
  }

  function renderReconciliation() {
    const totalPlanned = reconciliation.reduce((s, r) => s + r.plannedRevenue, 0)
    const totalActual = reconciliation.reduce((s, r) => s + r.actualRevenue, 0)
    const gap = totalPlanned - totalActual

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Planned Revenue", value: `₦${totalPlanned.toLocaleString()}`, color: "text-fg" },
            { label: "Collected", value: `₦${totalActual.toLocaleString()}`, color: "text-emerald-400" },
            { label: "Gap", value: `₦${gap.toLocaleString()}`, color: gap > 0 ? "text-amber-400" : "text-emerald-400" },
          ].map(k => (
            <div key={k.label} className="bg-surface border border-line-soft rounded-xl p-4">
              <p className="text-xs text-fg-dim mb-1">{k.label}</p>
              <p className={cn("text-lg font-bold tabular-nums", k.color)}>{k.value}</p>
            </div>
          ))}
        </div>

        <Card>
          <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1.5fr_1fr_1fr_1fr_auto] gap-2 px-5 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider border-b border-line-soft">
            <span>Driver</span><span>Bus</span><span>Route</span><span>Trips</span><span>Revenue</span><span>Status</span><span />
          </div>
          <div className="divide-y divide-line-soft">
            {reconciliation.map(r => (
              <div key={r.id} className={cn(
                "flex flex-col sm:grid sm:grid-cols-[1.5fr_1fr_1.5fr_1fr_1fr_1fr_auto] gap-2 items-start sm:items-center px-5 py-4 hover:bg-[var(--hover-bg)] transition-colors",
                r.status === "discrepancy" && "bg-amber-500/[0.02]"
              )}>
                <p className="text-sm font-medium text-fg">{r.driver}</p>
                <p className="text-sm text-fg-muted">{r.bus}</p>
                <p className="text-sm text-fg-muted text-xs">{r.route}</p>
                <p className="text-sm text-fg-muted">{r.completedTrips}/{r.plannedTrips}</p>
                <div>
                  <p className="text-sm font-medium text-fg tabular-nums">₦{r.actualRevenue.toLocaleString()}</p>
                  <p className="text-xs text-fg-dim">of ₦{r.plannedRevenue.toLocaleString()}</p>
                </div>
                <div>
                  {r.status === "matched" && <Badge variant="success" className="text-[10px]">Matched</Badge>}
                  {r.status === "discrepancy" && <Badge variant="warning" className="text-[10px]">Discrepancy</Badge>}
                  {r.status === "pending" && <Badge variant="muted" className="text-[10px]">Pending</Badge>}
                  {r.note && <p className="text-[10px] text-fg-dim mt-0.5 line-clamp-1">{r.note}</p>}
                </div>
                <div className="flex gap-1.5">
                  {r.status !== "matched" && (
                    <Button size="sm" variant="ghost" onClick={() => handleReconApprove(r.id)}>
                      <TickCircle size={13} color="#34d399" variant="Bold" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => { setSelectedRecon(r); setReconNote(r.note ?? "") }}>
                    <DocumentText1 size={13} color="currentColor" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Dialog
          open={!!selectedRecon}
          onClose={() => { setSelectedRecon(null); setReconNote("") }}
          title="Reconciliation Note"
          description={selectedRecon ? `${selectedRecon.driver} · ${selectedRecon.bus} · ${selectedRecon.route}` : ""}
          className="max-w-sm"
        >
          <div className="space-y-4">
            <Textarea value={reconNote} onChange={e => setReconNote(e.target.value)} placeholder="Add note or discrepancy explanation…" rows={3} className="resize-none" />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setSelectedRecon(null); setReconNote("") }}>Cancel</Button>
              <Button size="sm" onClick={handleReconNoteSubmit}>Save Note</Button>
            </div>
          </div>
        </Dialog>
      </div>
    )
  }

  // ─── Main render ──────────────────────────────────────────────────────────────

  return (
    <>
      <Header
        title="Dispatch"
        subtitle="Today — Sunday 1 June 2026"
        action={
          <div className="flex gap-2 mr-1">
            {!published && (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setTab("publish")}>
                <Send2 size={14} color="currentColor" />
                <span className="hidden sm:inline">Publish</span>
              </Button>
            )}
            {published && (
              <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                <TickCircle size={13} color="currentColor" variant="Bold" />
                Live
              </div>
            )}
          </div>
        }
      />

      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Tab bar */}
        <div className="border-b border-line-soft bg-surface px-4 sm:px-6 overflow-x-auto">
          <div className="flex gap-0 min-w-max">
            {TAB_LIST.map(t => {
              const badge =
                t.id === "exceptions" ? exceptions.filter(e => e.status === "open").length :
                t.id === "vehicle_blocks" ? blocks.filter(b => b.status === "unassigned").length : 0
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative flex items-center gap-1.5 px-4 py-3.5 text-[13px] font-medium whitespace-nowrap transition-colors",
                    tab === t.id
                      ? "text-amber-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-amber-400 after:rounded-t"
                      : "text-fg-muted hover:text-fg"
                  )}
                >
                  {t.label}
                  {badge > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500/20 px-1 text-[9px] font-bold text-red-400">
                      {badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {tab === "overview" && renderOverview()}
          {tab === "trip_planning" && renderTripPlanning()}
          {tab === "vehicle_blocks" && renderVehicleBlocks()}
          {tab === "bus_assignment" && renderBusAssignment()}
          {tab === "driver_assignment" && renderDriverAssignment()}
          {tab === "publish" && renderPublish()}
          {tab === "live_ops" && renderLiveOps()}
          {tab === "exceptions" && renderExceptions()}
          {tab === "reconciliation" && renderReconciliation()}
        </div>
      </main>

      {/* Trip dialog */}
      <Dialog
        open={showTripDialog}
        onClose={() => { setShowTripDialog(false); setEditTrip(null) }}
        title={editTrip ? "Edit Trip" : "Add Trip"}
        description="Schedule a trip within an existing vehicle block."
        className="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Route</label>
            <Select value={tripRoute} onChange={e => setTripRoute(e.target.value)}>
              <option value="">Select route…</option>
              {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">Departure</label>
              <Input type="time" value={tripDep} onChange={e => setTripDep(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">Arrival</label>
              <Input type="time" value={tripArr} onChange={e => setTripArr(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Vehicle Block</label>
            <Select value={tripBlock} onChange={e => setTripBlock(e.target.value)}>
              <option value="">Select block…</option>
              {blocks.map(b => <option key={b.id} value={b.id}>{b.busCode} · {b.route}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">Capacity</label>
              <Input type="number" min="1" max="100" value={tripCapacity} onChange={e => setTripCapacity(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">Fare (₦)</label>
              <Input type="number" min="0" value={tripFare} onChange={e => setTripFare(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" size="sm" onClick={() => { setShowTripDialog(false); setEditTrip(null) }}>Cancel</Button>
            <Button size="sm" disabled={!tripRoute || !tripDep || !tripArr} onClick={handleSaveTrip}>
              {editTrip ? "Save Changes" : "Add Trip"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Block dialog */}
      <Dialog
        open={showBlockDialog}
        onClose={() => { setShowBlockDialog(false); setEditBlock(null) }}
        title={editBlock ? "Edit Vehicle Block" : "New Vehicle Block"}
        description="Create a bus–route allocation for today's operations."
        className="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Bus</label>
            <Select value={blockBus} onChange={e => setBlockBus(e.target.value)}>
              <option value="">Select bus…</option>
              {availableBuses.map(b => <option key={b.id} value={b.code}>{b.code} — {b.model}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Route</label>
            <Select value={blockRoute} onChange={e => setBlockRoute(e.target.value)}>
              <option value="">Select route…</option>
              {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">Trips</label>
              <Input type="number" min="1" max="10" value={blockTrips} onChange={e => setBlockTrips(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">Departure</label>
              <Input type="time" value={blockDep} onChange={e => setBlockDep(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" size="sm" onClick={() => { setShowBlockDialog(false); setEditBlock(null) }}>Cancel</Button>
            <Button size="sm" disabled={!blockBus || !blockRoute} onClick={handleSaveBlock}>
              {editBlock ? "Save Changes" : "Create Block"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Toast stack */}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={cn("px-4 py-3 rounded-xl text-sm font-medium shadow-xl", toastColor(t.color))}>
            {t.msg}
          </div>
        ))}
      </div>
    </>
  )
}
