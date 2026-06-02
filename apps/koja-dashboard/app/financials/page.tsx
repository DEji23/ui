"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar } from "@/components/ui/avatar"
import { cn, formatNGN, formatNGNFull } from "@/lib/utils"
import {
  tripRecords, settlements, complianceDocs, revenueData,
  type TripRecord, type Settlement, type ComplianceDoc, type FieldExpense,
} from "@/lib/data"
import {
  Moneys, Receipt1, TrendUp, Chart1, PercentageCircle,
  TickCircle, CloseCircle, Timer1, Warning2, Danger, Bus, DocumentText1,
} from "iconsax-react"

type Tab = "trips" | "earnings" | "breakdown" | "settlements" | "compliance" | "profitability"

const TABS: { id: Tab; label: string }[] = [
  { id: "trips", label: "Trips" },
  { id: "earnings", label: "Earnings Overview" },
  { id: "breakdown", label: "Earnings Breakdown" },
  { id: "settlements", label: "Settlements" },
  { id: "compliance", label: "Compliance" },
  { id: "profitability", label: "Profitability" },
]

type Toast = { id: number; message: string; type: "success" | "error" | "info" }

function settlementBadge(status: TripRecord["settlementStatus"]) {
  if (status === "paid") return <Badge variant="success">Paid</Badge>
  if (status === "approved") return <Badge variant="success" className="!bg-emerald-500/5 !text-emerald-500">Approved</Badge>
  if (status === "fee_calculated") return <Badge variant="default">Fee Calculated</Badge>
  if (status === "confirmed") return <Badge variant="info">Confirmed</Badge>
  if (status === "disputed") return <Badge variant="destructive">Disputed</Badge>
  return <Badge variant="muted">Provisional</Badge>
}

function settlStatusBadge(status: Settlement["status"]) {
  if (status === "paid") return <Badge variant="success">Paid</Badge>
  if (status === "approved") return <Badge variant="success" className="!bg-emerald-500/5 !text-emerald-500">Approved</Badge>
  if (status === "fee_calculated") return <Badge variant="default">Fee Calculated</Badge>
  if (status === "confirmed") return <Badge variant="info">Confirmed</Badge>
  if (status === "disputed") return <Badge variant="destructive">Disputed</Badge>
  return <Badge variant="muted">Provisional</Badge>
}

function complianceBadge(status: ComplianceDoc["status"]) {
  if (status === "valid") return <Badge variant="success">Valid</Badge>
  if (status === "expiring_soon") return <Badge variant="warning">Expiring Soon</Badge>
  return <Badge variant="destructive">Expired</Badge>
}

function daysUntil(dateStr: string) {
  const d = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(d / (1000 * 60 * 60 * 24))
}

export default function FinancialsPage() {
  const [tab, setTab] = useState<Tab>("trips")
  const [trips, setTrips] = useState<TripRecord[]>(tripRecords)
  const [tripDetail, setTripDetail] = useState<TripRecord | null>(null)
  const [tripFilter, setTripFilter] = useState({ route: "", driver: "", settlement: "" })
  const [settlList, setSettlList] = useState<Settlement[]>(settlements)
  const [settlDetail, setSettlDetail] = useState<Settlement | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  function addToast(message: string, type: Toast["type"] = "success") {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }

  function handleApproveExpense(tripId: string, expenseIdx: number) {
    const update = (t: TripRecord) =>
      t.id !== tripId ? t : {
        ...t,
        fieldExpenses: t.fieldExpenses.map((e, i) => i === expenseIdx ? { ...e, status: "approved" as const } : e),
      }
    setTrips((list) => list.map(update))
    setTripDetail((prev) => prev && prev.id === tripId ? update(prev) : prev)
    addToast("Expense approved", "success")
  }

  function handleRejectExpense(tripId: string, expenseIdx: number) {
    const update = (t: TripRecord) =>
      t.id !== tripId ? t : {
        ...t,
        fieldExpenses: t.fieldExpenses.map((e, i) => i === expenseIdx ? { ...e, status: "rejected" as const } : e),
      }
    setTrips((list) => list.map(update))
    setTripDetail((prev) => prev && prev.id === tripId ? update(prev) : prev)
    addToast("Expense rejected", "error")
  }

  function handleAdvanceSettlement(id: string) {
    const order: Settlement["status"][] = ["provisional", "confirmed", "fee_calculated", "approved", "paid"]
    setSettlList((list) =>
      list.map((s) => {
        if (s.id !== id) return s
        const next = order[Math.min(order.indexOf(s.status) + 1, order.length - 1)]
        return { ...s, status: next }
      })
    )
    addToast("Settlement status advanced", "success")
  }

  function handleDisputeSettlement(id: string) {
    setSettlList((list) => list.map((s) => s.id === id ? { ...s, status: "disputed" as const } : s))
    addToast("Settlement flagged as disputed", "error")
  }

  const filteredTrips = trips.filter((t) => {
    if (tripFilter.route && t.route !== tripFilter.route) return false
    if (tripFilter.driver && t.driver !== tripFilter.driver) return false
    if (tripFilter.settlement && t.settlementStatus !== tripFilter.settlement) return false
    return true
  })

  const totalGross = trips.reduce((s, t) => s + t.grossRevenue, 0)
  const totalFees = trips.reduce((s, t) => s + t.fees.reduce((f, fee) => f + fee.amount, 0), 0)
  const totalExpenses = trips.reduce((s, t) => s + t.fieldExpenses.filter((e) => e.status !== "rejected").reduce((f, e) => f + e.amount, 0), 0)
  const totalNet = trips.reduce((s, t) => s + t.netRevenue, 0)
  const pendingSettl = settlList.filter((s) => s.status !== "paid").reduce((sum, s) => sum + s.netRevenue, 0)
  const marginStr = totalGross > 0 ? ((totalNet / totalGross) * 100).toFixed(1) : "0"

  const uniqueRoutes = [...new Set(trips.map((t) => t.route))]
  const uniqueDrivers = [...new Set(trips.map((t) => t.driver))]

  const routeRevenue = uniqueRoutes.map((route) => ({
    route,
    gross: trips.filter((t) => t.route === route).reduce((s, t) => s + t.grossRevenue, 0),
    net: trips.filter((t) => t.route === route).reduce((s, t) => s + t.netRevenue, 0),
  }))
  const maxRouteRev = Math.max(...routeRevenue.map((r) => r.gross), 1)
  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue), 1)

  const busCodes = [...new Set(complianceDocs.map((d) => d.busCode))]

  const profitByBus = busCodes
    .filter((bus) => trips.some((t) => t.bus === bus))
    .map((bus) => {
      const busTrips = trips.filter((t) => t.bus === bus)
      const gross = busTrips.reduce((s, t) => s + t.grossRevenue, 0)
      const opDed = busTrips.reduce((s, t) => s + t.fees.reduce((f, fee) => f + fee.amount, 0), 0)
      const field = busTrips.reduce((s, t) => s + t.fieldExpenses.filter((e) => e.status !== "rejected").reduce((f, e) => f + e.amount, 0), 0)
      const compDocs = complianceDocs.filter((d) => d.busCode === bus)
      const compCost = Math.round(compDocs.reduce((s, d) => s + d.amortizedDailyRate * 3, 0))
      const trueNet = Math.round(gross - opDed - field - compCost)
      const marginPct = gross > 0 ? ((trueNet / gross) * 100).toFixed(1) : "0"
      return { bus, route: busTrips[0]?.route ?? "—", gross, opDed, field, compCost, trueNet, marginPct }
    })

  return (
    <>
      <Header title="Financials" subtitle="Trips, earnings, settlements & compliance" />

      <main className="flex-1 p-4 sm:p-6 space-y-5">
        {/* Sub-nav tabs */}
        <div className="flex gap-0 flex-wrap border-b border-line-soft">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "px-3 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px whitespace-nowrap",
                tab === id
                  ? "text-amber-400 border-amber-500"
                  : "text-fg-dim border-transparent hover:text-fg-muted"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── TRIPS ───────────────────────────────────────────────── */}
        {tab === "trips" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Gross Revenue", value: formatNGN(totalGross), icon: <Moneys size={16} color="#f59e0b" variant="Bold" />, bg: "bg-amber-500/10" },
                { label: "Total Fees", value: formatNGN(totalFees), icon: <Receipt1 size={16} color="#f87171" variant="Bold" />, bg: "bg-red-500/10" },
                { label: "Net Revenue", value: formatNGN(totalNet), icon: <TrendUp size={16} color="#34d399" variant="Bold" />, bg: "bg-emerald-500/10" },
                { label: "Total Trips", value: String(trips.length), icon: <Bus size={16} color="#60a5fa" variant="Bold" />, bg: "bg-blue-500/10" },
              ].map(({ label, value, icon, bg }) => (
                <div key={label} className="bg-surface border border-line-soft rounded-xl p-4 flex items-center gap-3">
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", bg)}>{icon}</div>
                  <div>
                    <p className="text-[11px] text-fg-dim">{label}</p>
                    <p className="text-base font-bold text-fg">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={tripFilter.route} onChange={(e) => setTripFilter((f) => ({ ...f, route: e.target.value }))} className="w-auto min-w-[160px] text-xs h-8">
                <option value="">All Routes</option>
                {uniqueRoutes.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
              <Select value={tripFilter.driver} onChange={(e) => setTripFilter((f) => ({ ...f, driver: e.target.value }))} className="w-auto min-w-[150px] text-xs h-8">
                <option value="">All Drivers</option>
                {uniqueDrivers.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
              <Select value={tripFilter.settlement} onChange={(e) => setTripFilter((f) => ({ ...f, settlement: e.target.value }))} className="w-auto min-w-[160px] text-xs h-8">
                <option value="">All Statuses</option>
                {["provisional", "confirmed", "fee_calculated", "approved", "paid", "disputed"].map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                ))}
              </Select>
              {(tripFilter.route || tripFilter.driver || tripFilter.settlement) && (
                <Button variant="ghost" size="sm" onClick={() => setTripFilter({ route: "", driver: "", settlement: "" })}>Clear</Button>
              )}
            </div>

            <Card>
              <div className="overflow-x-auto">
                <div style={{ minWidth: 800 }}>
                  <div className="grid grid-cols-[80px_90px_1fr_80px_1fr_50px_80px_80px_110px_56px] gap-3 px-5 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider border-b border-line-soft">
                    <span>ID</span><span>Date</span><span>Route</span><span>Bus</span><span>Driver</span>
                    <span>Pax</span><span>Gross</span><span>Net</span><span>Settlement</span><span></span>
                  </div>
                  <div className="divide-y divide-line-soft">
                    {filteredTrips.length === 0 && (
                      <div className="py-12 text-center text-fg-dim text-sm">No trips match current filters</div>
                    )}
                    {filteredTrips.map((trip) => (
                      <div
                        key={trip.id}
                        className="grid grid-cols-[80px_90px_1fr_80px_1fr_50px_80px_80px_110px_56px] gap-3 items-center px-5 py-3.5 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
                        onClick={() => setTripDetail(trip)}
                      >
                        <span className="text-xs font-mono text-fg-dim uppercase">{trip.id}</span>
                        <span className="text-xs text-fg-muted">{trip.date.slice(5).replace("-", "/")}</span>
                        <span className="text-xs text-fg truncate">{trip.route}</span>
                        <span className="text-xs text-fg-muted">{trip.bus}</span>
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar name={trip.driver} size="sm" />
                          <span className="text-xs text-fg truncate">{trip.driver.split(" ")[0]}</span>
                        </div>
                        <span className="text-xs text-fg-muted">{trip.passengerCount}</span>
                        <span className="text-xs font-medium text-fg">{formatNGN(trip.grossRevenue)}</span>
                        <span className="text-xs font-medium text-emerald-400">{formatNGN(trip.netRevenue)}</span>
                        <div onClick={(e) => e.stopPropagation()}>{settlementBadge(trip.settlementStatus)}</div>
                        <Button variant="ghost" size="sm" className="text-[11px] px-2 h-6" onClick={(e) => { e.stopPropagation(); setTripDetail(trip) }}>View</Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── EARNINGS OVERVIEW ───────────────────────────────────────────── */}
        {tab === "earnings" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { label: "Gross Revenue", value: formatNGN(totalGross), sub: "All trips", icon: <Moneys size={18} color="#f59e0b" variant="Bold" />, bg: "bg-amber-500/10" },
                { label: "Total Deductions", value: formatNGN(totalFees + totalExpenses), sub: "Fees + expenses", icon: <Receipt1 size={18} color="#f87171" variant="Bold" />, bg: "bg-red-500/10" },
                { label: "Net Earnings", value: formatNGN(totalNet), sub: "After deductions", icon: <TrendUp size={18} color="#34d399" variant="Bold" />, bg: "bg-emerald-500/10" },
                { label: "Pending Settlement", value: formatNGN(pendingSettl), sub: `${settlList.filter((s) => s.status !== "paid").length} unsettled`, icon: <Timer1 size={18} color="#fbbf24" variant="Linear" />, bg: "bg-amber-500/10" },
                { label: "Profit Margin", value: `${marginStr}%`, sub: "Net / Gross", icon: <PercentageCircle size={18} color="#a78bfa" variant="Bold" />, bg: "bg-violet-500/10" },
              ].map(({ label, value, sub, icon, bg }) => (
                <div key={label} className="bg-surface border border-line-soft rounded-xl p-4">
                  <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center mb-3", bg)}>{icon}</div>
                  <p className="text-[11px] text-fg-dim mb-0.5">{label}</p>
                  <p className="text-lg font-bold text-fg">{value}</p>
                  <p className="text-[11px] text-fg-dim mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card>
                <CardHeader><CardTitle>Weekly Revenue Trend</CardTitle></CardHeader>
                <CardContent className="pt-2">
                  <div className="flex items-end gap-2" style={{ height: 140 }}>
                    {revenueData.map((d) => (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="text-[9px] text-fg-dim">{formatNGN(d.revenue)}</span>
                        <div
                          className={cn("w-full rounded-t-md", d.date === "Today" ? "bg-amber-500" : "bg-amber-500/30")}
                          style={{ height: `${Math.round((d.revenue / maxRevenue) * 100)}px` }}
                        />
                        <span className="text-[9px] text-fg-dim">{d.date}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Revenue by Route</CardTitle></CardHeader>
                <CardContent className="pt-2 space-y-3">
                  {routeRevenue.sort((a, b) => b.gross - a.gross).map(({ route, gross, net }) => (
                    <div key={route}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-fg-muted truncate max-w-[60%]">{route}</span>
                        <span className="text-fg font-medium">{formatNGN(gross)}</span>
                      </div>
                      <div className="h-2 bg-[var(--subtle-bg)] rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500/60 rounded-full" style={{ width: `${Math.round((gross / maxRouteRev) * 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-fg-dim mt-0.5">Net: {formatNGN(net)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Deduction Breakdown by Collector</CardTitle></CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(["platform", "government", "union", "terminal"] as const).map((collector) => {
                    const amount = trips.reduce((s, t) => s + t.fees.filter((f) => f.collector === collector).reduce((a, f) => a + f.amount, 0), 0)
                    const pct = totalFees > 0 ? Math.round((amount / totalFees) * 100) : 0
                    const styles: Record<string, string> = {
                      platform: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                      government: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                      union: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                      terminal: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                    }
                    return (
                      <div key={collector} className={cn("rounded-xl p-4 border", styles[collector])}>
                        <p className="text-[11px] font-semibold uppercase tracking-wider mb-1">
                          {collector.charAt(0).toUpperCase() + collector.slice(1)}
                        </p>
                        <p className="text-lg font-bold text-fg">{formatNGN(amount)}</p>
                        <p className="text-[11px] opacity-70">{pct}% of fees</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── EARNINGS BREAKDOWN ────────────────────────────────────────────── */}
        {tab === "breakdown" && (
          <Card>
            <CardHeader className="pb-3 border-b border-line-soft"><CardTitle>Earnings Breakdown</CardTitle></CardHeader>
            <div className="overflow-x-auto">
              <div style={{ minWidth: 880 }}>
                <div className="grid grid-cols-[80px_80px_1fr_80px_80px_80px_80px_80px_80px] gap-3 px-5 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider border-b border-line-soft">
                  <span>Date</span><span>Trip</span><span>Route / Driver</span>
                  <span>Gross</span><span>Platform</span><span>Gov Tax</span>
                  <span>Union</span><span>Field Exp.</span><span>Net</span>
                </div>
                <div className="divide-y divide-line-soft">
                  {trips.map((t) => {
                    const platform = t.fees.filter((f) => f.collector === "platform").reduce((s, f) => s + f.amount, 0)
                    const gov = t.fees.filter((f) => f.collector === "government").reduce((s, f) => s + f.amount, 0)
                    const union = t.fees.filter((f) => f.collector === "union").reduce((s, f) => s + f.amount, 0)
                    const field = t.fieldExpenses.filter((e) => e.status !== "rejected").reduce((s, e) => s + e.amount, 0)
                    return (
                      <div
                        key={t.id}
                        className="grid grid-cols-[80px_80px_1fr_80px_80px_80px_80px_80px_80px] gap-3 items-center px-5 py-3.5 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
                        onClick={() => setTripDetail(t)}
                      >
                        <span className="text-xs text-fg-dim">{t.date.slice(5).replace("-", "/")}</span>
                        <span className="text-xs font-mono text-fg-dim uppercase">{t.id}</span>
                        <div className="min-w-0">
                          <p className="text-xs text-fg truncate">{t.route}</p>
                          <p className="text-[11px] text-fg-dim">{t.driver.split(" ")[0]}</p>
                        </div>
                        <span className="text-xs font-medium text-fg">{formatNGN(t.grossRevenue)}</span>
                        <span className="text-xs text-red-400">-{formatNGN(platform)}</span>
                        <span className="text-xs text-red-400">-{formatNGN(gov)}</span>
                        <span className="text-xs text-fg-muted">-{formatNGN(union)}</span>
                        <span className={cn("text-xs", field > 0 ? "text-amber-400" : "text-fg-dim")}>{field > 0 ? `-${formatNGN(field)}` : "—"}</span>
                        <span className="text-xs font-semibold text-emerald-400">{formatNGN(t.netRevenue)}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="grid grid-cols-[80px_80px_1fr_80px_80px_80px_80px_80px_80px] gap-3 px-5 py-3 border-t border-line-soft bg-[var(--subtle-bg)] text-xs font-semibold">
                  <span className="col-span-3 text-fg-dim">Totals</span>
                  <span className="text-fg">{formatNGN(totalGross)}</span>
                  <span className="text-red-400">-{formatNGN(trips.reduce((s, t) => s + t.fees.filter((f) => f.collector === "platform").reduce((a, f) => a + f.amount, 0), 0))}</span>
                  <span className="text-red-400">-{formatNGN(trips.reduce((s, t) => s + t.fees.filter((f) => f.collector === "government").reduce((a, f) => a + f.amount, 0), 0))}</span>
                  <span className="text-fg-muted">-{formatNGN(trips.reduce((s, t) => s + t.fees.filter((f) => f.collector === "union").reduce((a, f) => a + f.amount, 0), 0))}</span>
                  <span className="text-amber-400">-{formatNGN(totalExpenses)}</span>
                  <span className="text-emerald-400">{formatNGN(totalNet)}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ── SETTLEMENTS ─────────────────────────────────────────────────── */}
        {tab === "settlements" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              {(["provisional", "confirmed", "fee_calculated", "approved", "paid"] as const).map((s, i) => {
                const count = settlList.filter((x) => x.status === s).length
                const cols: Record<string, string> = { provisional: "text-fg-dim", confirmed: "text-blue-400", fee_calculated: "text-amber-400", approved: "text-emerald-400", paid: "text-emerald-500" }
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className="text-center">
                      <div className={cn("text-xl font-bold", cols[s])}>{count}</div>
                      <div className="text-[10px] text-fg-dim leading-tight">{s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</div>
                    </div>
                    {i < 4 && <span className="text-fg-dim text-xs">→</span>}
                  </div>
                )
              })}
              {settlList.filter((s) => s.status === "disputed").length > 0 && (
                <div className="ml-2 text-center border-l border-line-soft pl-3">
                  <div className="text-xl font-bold text-red-400">{settlList.filter((s) => s.status === "disputed").length}</div>
                  <div className="text-[10px] text-fg-dim">Disputed</div>
                </div>
              )}
            </div>

            <Card>
              <div className="overflow-x-auto">
                <div style={{ minWidth: 760 }}>
                  <div className="grid grid-cols-[1fr_70px_1fr_80px_90px_80px_100px_60px] gap-3 px-5 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider border-b border-line-soft">
                    <span>Driver</span><span>Bus</span><span>Route</span>
                    <span>Gross</span><span>Deductions</span><span>Net</span><span>Status</span><span></span>
                  </div>
                  <div className="divide-y divide-line-soft">
                    {settlList.map((s) => (
                      <div key={s.id} className="grid grid-cols-[1fr_70px_1fr_80px_90px_80px_100px_60px] gap-3 items-center px-5 py-4 hover:bg-[var(--hover-bg)] transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar name={s.driver} size="sm" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-fg truncate">{s.driver}</p>
                            <p className="text-[10px] text-fg-dim">{s.driverCode}</p>
                          </div>
                        </div>
                        <span className="text-xs text-fg-muted">{s.bus}</span>
                        <span className="text-xs text-fg-muted truncate">{s.route}</span>
                        <span className="text-xs text-fg">{formatNGN(s.grossRevenue)}</span>
                        <span className="text-xs text-red-400">-{formatNGN(s.totalTripFees + s.totalDailyFees + s.fieldExpenses)}</span>
                        <span className="text-xs font-medium text-emerald-400">{formatNGN(s.netRevenue)}</span>
                        <div>{settlStatusBadge(s.status)}</div>
                        <Button variant="ghost" size="sm" className="text-[11px] px-2 h-6" onClick={() => setSettlDetail(s)}>Detail</Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── COMPLIANCE ────────────────────────────────────────────────── */}
        {tab === "compliance" && (
          <div className="space-y-4">
            {complianceDocs.some((d) => d.status !== "valid") && (
              <div className="flex flex-wrap gap-3">
                {complianceDocs.filter((d) => d.status === "expired").length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                    <Danger size={13} color="currentColor" variant="Bold" />
                    {complianceDocs.filter((d) => d.status === "expired").length} document(s) expired — service suspension risk
                  </div>
                )}
                {complianceDocs.filter((d) => d.status === "expiring_soon").length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                    <Warning2 size={13} color="currentColor" variant="Bold" />
                    {complianceDocs.filter((d) => d.status === "expiring_soon").length} document(s) expiring within 60 days
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {busCodes.map((bus) => {
                const docs = complianceDocs.filter((d) => d.busCode === bus)
                const hasExpired = docs.some((d) => d.status === "expired")
                const hasExpiring = docs.some((d) => d.status === "expiring_soon")
                return (
                  <Card key={bus} className={cn(hasExpired ? "border-red-500/20" : hasExpiring ? "border-amber-500/20" : "")}>
                    <CardHeader className="pb-3 border-b border-line-soft">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bus size={13} color="#f59e0b" variant="Bold" />
                          <span className="text-sm font-semibold text-fg">{bus}</span>
                        </div>
                        <div className="flex gap-1.5">
                          {hasExpired ? <Badge variant="destructive">Expired Docs</Badge>
                            : hasExpiring ? <Badge variant="warning">Action Required</Badge>
                            : <Badge variant="success">All Clear</Badge>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-3 space-y-2.5">
                      {docs.map((doc) => {
                        const days = daysUntil(doc.expiryDate)
                        return (
                          <div key={doc.id} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <DocumentText1 size={12}
                                color={doc.status === "expired" ? "#f87171" : doc.status === "expiring_soon" ? "#fbbf24" : "#34d399"}
                                variant="Bold"
                              />
                              <div className="min-w-0">
                                <p className="text-xs text-fg-muted truncate">{doc.name}</p>
                                <p className="text-[10px] text-fg-dim">{doc.issuingAuthority} · ₦{doc.amortizedDailyRate}/day</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="text-right">
                                <p className="text-[10px] text-fg-dim">{doc.expiryDate}</p>
                                <p className={cn("text-[10px] font-medium", days < 0 ? "text-red-400" : days < 60 ? "text-amber-400" : "text-fg-dim")}>
                                  {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                                </p>
                              </div>
                              {complianceBadge(doc.status)}
                            </div>
                          </div>
                        )
                      })}
                      <div className="pt-2.5 border-t border-line-soft flex justify-between text-[11px]">
                        <span className="text-fg-dim">Amortized compliance cost / day</span>
                        <span className="font-semibold text-fg-muted">₦{docs.reduce((s, d) => s + d.amortizedDailyRate, 0).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* ── PROFITABILITY ────────────────────────────────────────────────── */}
        {tab === "profitability" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--subtle-bg)] border border-line-soft text-xs text-fg-dim">
              <Chart1 size={12} color="currentColor" variant="Linear" />
              Compliance costs amortized over 3 days. True Net reflects full operational + compliance cost.
            </div>
            <Card>
              <div className="overflow-x-auto">
                <div style={{ minWidth: 840 }}>
                  <div className="grid grid-cols-[80px_1fr_90px_110px_90px_110px_90px_70px] gap-3 px-5 py-3 text-[11px] font-semibold text-fg-dim uppercase tracking-wider border-b border-line-soft">
                    <span>Bus</span><span>Route</span><span>Gross</span>
                    <span>Op. Deductions</span><span>Field Exp.</span>
                    <span>Compliance</span><span>True Net</span><span>Margin</span>
                  </div>
                  <div className="divide-y divide-line-soft">
                    {profitByBus.map((row) => {
                      const m = parseFloat(row.marginPct)
                      const mc = m >= 80 ? "text-emerald-400" : m >= 60 ? "text-amber-400" : "text-red-400"
                      return (
                        <div key={row.bus} className="grid grid-cols-[80px_1fr_90px_110px_90px_110px_90px_70px] gap-3 items-center px-5 py-4 hover:bg-[var(--hover-bg)] transition-colors">
                          <div className="flex items-center gap-1.5">
                            <Bus size={12} color="#f59e0b" variant="Bold" />
                            <span className="text-xs font-medium text-fg">{row.bus}</span>
                          </div>
                          <span className="text-xs text-fg-muted truncate">{row.route}</span>
                          <span className="text-xs font-medium text-fg">{formatNGN(row.gross)}</span>
                          <span className="text-xs text-red-400">-{formatNGN(row.opDed)}</span>
                          <span className={cn("text-xs", row.field > 0 ? "text-amber-400" : "text-fg-dim")}>{row.field > 0 ? `-${formatNGN(row.field)}` : "—"}</span>
                          <span className="text-xs text-violet-400">-{formatNGN(row.compCost)}</span>
                          <span className="text-xs font-semibold text-emerald-400">{formatNGN(row.trueNet)}</span>
                          <span className={cn("text-xs font-bold", mc)}>{row.marginPct}%</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="grid grid-cols-[80px_1fr_90px_110px_90px_110px_90px_70px] gap-3 px-5 py-3 border-t border-line-soft bg-[var(--subtle-bg)] text-xs font-semibold">
                    <span className="col-span-2 text-fg-dim">Fleet Total</span>
                    <span className="text-fg">{formatNGN(profitByBus.reduce((s, r) => s + r.gross, 0))}</span>
                    <span className="text-red-400">-{formatNGN(profitByBus.reduce((s, r) => s + r.opDed, 0))}</span>
                    <span className="text-amber-400">-{formatNGN(profitByBus.reduce((s, r) => s + r.field, 0))}</span>
                    <span className="text-violet-400">-{formatNGN(profitByBus.reduce((s, r) => s + r.compCost, 0))}</span>
                    <span className="text-emerald-400">{formatNGN(profitByBus.reduce((s, r) => s + r.trueNet, 0))}</span>
                    <span className="text-fg-muted">
                      {(() => {
                        const g = profitByBus.reduce((s, r) => s + r.gross, 0)
                        const n = profitByBus.reduce((s, r) => s + r.trueNet, 0)
                        return g > 0 ? `${((n / g) * 100).toFixed(1)}%` : "—"
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* ── TRIP DETAIL DIALOG ────────────────────────────────────────────── */}
      <Dialog
        open={!!tripDetail}
        onClose={() => setTripDetail(null)}
        title={tripDetail ? `Trip ${tripDetail.id.toUpperCase()} — ${tripDetail.route}` : ""}
        className="max-w-xl"
      >
        {tripDetail && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { label: "Date", value: tripDetail.date },
                { label: "Bus", value: tripDetail.bus },
                { label: "Driver", value: tripDetail.driver.split(" ")[0] },
                { label: "Departure", value: tripDetail.startTime },
                { label: "Arrival", value: tripDetail.endTime },
                { label: "Shift", value: tripDetail.shiftType },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-[var(--subtle-bg)] border border-line-soft p-2.5">
                  <p className="text-fg-dim mb-0.5">{label}</p>
                  <p className="font-medium text-fg-muted capitalize">{value}</p>
                </div>
              ))}
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold text-fg-dim uppercase tracking-wider mb-2">Revenue Summary</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Gross Revenue", value: formatNGNFull(tripDetail.grossRevenue) },
                  { label: "Passengers", value: String(tripDetail.passengerCount) },
                  { label: "Avg Fare", value: formatNGN(Math.round(tripDetail.grossRevenue / tripDetail.passengerCount)) },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-[var(--subtle-bg)] border border-line-soft p-3">
                    <p className="text-[10px] text-fg-dim mb-1">{label}</p>
                    <p className="text-sm font-bold text-fg">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold text-fg-dim uppercase tracking-wider mb-2">Fee Breakdown</p>
              <div className="space-y-1.5">
                {tripDetail.fees.map((fee) => (
                  <div key={fee.name} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                      <span className="text-fg-muted">{fee.name}</span>
                      <Badge variant="muted" className="text-[9px] px-1 py-0">{fee.collector}</Badge>
                    </div>
                    <span className="font-medium text-red-400">-{formatNGNFull(fee.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {tripDetail.fieldExpenses.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-fg-dim uppercase tracking-wider mb-2">Field Expenses</p>
                  <div className="space-y-2">
                    {tripDetail.fieldExpenses.map((exp: FieldExpense, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 rounded-lg bg-[var(--subtle-bg)] border border-line-soft p-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-fg-muted">{exp.type}</p>
                          <p className="text-[10px] text-fg-dim capitalize">{exp.category}{exp.location ? ` · ${exp.location}` : ""} · {exp.timestamp}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-medium text-amber-400">-{formatNGNFull(exp.amount)}</span>
                          {exp.status === "pending" ? (
                            <div className="flex gap-1">
                              <Button variant="success" size="sm" className="h-6 px-2 text-[10px]" onClick={() => handleApproveExpense(tripDetail.id, idx)}>
                                <TickCircle size={10} color="currentColor" variant="Bold" /> Approve
                              </Button>
                              <Button variant="destructive" size="sm" className="h-6 px-2 text-[10px]" onClick={() => handleRejectExpense(tripDetail.id, idx)}>
                                <CloseCircle size={10} color="currentColor" variant="Bold" /> Reject
                              </Button>
                            </div>
                          ) : (
                            <Badge variant={exp.status === "approved" ? "success" : "muted"}>
                              {exp.status === "approved" ? "Approved" : "Rejected"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div>
              <p className="text-xs font-semibold text-fg-dim uppercase tracking-wider mb-2">Net Calculation</p>
              <div className="rounded-xl bg-[var(--subtle-bg)] border border-line-soft p-4 space-y-2">
                {[
                  { label: "Gross Revenue", value: tripDetail.grossRevenue, color: "text-fg" },
                  { label: "Trip Fees", value: -tripDetail.fees.reduce((s, f) => s + f.amount, 0), color: "text-red-400" },
                  {
                    label: "Field Expenses",
                    value: -tripDetail.fieldExpenses.filter((e: FieldExpense) => e.status !== "rejected").reduce((s: number, e: FieldExpense) => s + e.amount, 0),
                    color: "text-amber-400"
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-fg-muted">{label}</span>
                    <span className={cn("font-medium", color)}>{value >= 0 ? formatNGNFull(value) : `-${formatNGNFull(Math.abs(value))}`}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-fg">Trip Net Revenue</span>
                  <span className="text-emerald-400">{formatNGNFull(tripDetail.netRevenue)}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                {settlementBadge(tripDetail.settlementStatus)}
                <Button variant="outline" size="sm" onClick={() => setTripDetail(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* ── SETTLEMENT DETAIL DIALOG ────────────────────────────────────────────── */}
      <Dialog
        open={!!settlDetail}
        onClose={() => setSettlDetail(null)}
        title={settlDetail ? `Settlement — ${settlDetail.driver}` : ""}
        className="max-w-lg"
      >
        {settlDetail && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-3">
              <Avatar name={settlDetail.driver} size="md" />
              <div>
                <p className="text-sm font-semibold text-fg">{settlDetail.driver}</p>
                <p className="text-xs text-fg-dim">{settlDetail.driverCode} · {settlDetail.bus} · {settlDetail.route}</p>
              </div>
              <div className="ml-auto shrink-0">{settlStatusBadge(settlDetail.status)}</div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold text-fg-dim uppercase tracking-wider mb-2">Revenue Summary</p>
              <div className="space-y-1.5 text-xs">
                {[
                  { label: "Gross Revenue", value: settlDetail.grossRevenue, color: "text-fg" },
                  { label: "Trip Fees", value: -settlDetail.totalTripFees, color: "text-red-400" },
                  { label: "Daily Fees", value: -settlDetail.totalDailyFees, color: "text-red-400" },
                  { label: "Field Expenses", value: -settlDetail.fieldExpenses, color: "text-amber-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-fg-muted">{label}</span>
                    <span className={cn("font-medium", color)}>{value >= 0 ? formatNGNFull(value) : `-${formatNGNFull(Math.abs(value))}`}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold text-sm">
                  <span className="text-fg">Net Revenue</span>
                  <span className="text-emerald-400">{formatNGNFull(settlDetail.netRevenue)}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold text-fg-dim uppercase tracking-wider mb-2">Revenue Split</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/20 p-3 text-center">
                  <p className="text-[10px] text-amber-400 uppercase font-semibold mb-1">Owner ({settlDetail.ownerSharePct}%)</p>
                  <p className="text-base font-bold text-fg">{formatNGNFull(settlDetail.ownerAmount)}</p>
                </div>
                <div className="rounded-xl bg-blue-500/[0.06] border border-blue-500/20 p-3 text-center">
                  <p className="text-[10px] text-blue-400 uppercase font-semibold mb-1">Driver ({settlDetail.driverSharePct}%)</p>
                  <p className="text-base font-bold text-fg">{formatNGNFull(settlDetail.driverAmount)}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold text-fg-dim uppercase tracking-wider mb-2">Regulatory Summary</p>
              <div className="space-y-1.5 text-xs">
                {settlDetail.regulatorySummary.map(({ collector, amount }) => (
                  <div key={collector} className="flex justify-between">
                    <span className="text-fg-muted">{collector}</span>
                    <span className="font-medium text-fg">{formatNGNFull(amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1 flex-wrap">
              {settlDetail.status !== "paid" && settlDetail.status !== "disputed" && (
                <>
                  <Button variant="destructive" size="sm" onClick={() => { handleDisputeSettlement(settlDetail.id); setSettlDetail(null) }}>
                    Flag Dispute
                  </Button>
                  <Button size="sm" onClick={() => { handleAdvanceSettlement(settlDetail.id); setSettlDetail(null) }}>
                    Advance Status
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setSettlDetail(null)}>Close</Button>
            </div>
          </div>
        )}
      </Dialog>

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
