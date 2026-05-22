"use client"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { drivers, buses, alerts, activeTrips, revenueData } from "@/lib/data"
import { formatNGN, formatNGNFull } from "@/lib/utils"
import Link from "next/link"

const activeDrivers = drivers.filter((d) => d.status === "active").length
const activeBuses = buses.filter((b) => b.status === "active").length
const criticalAlerts = alerts.filter((a) => a.severity === "critical" && !a.acknowledged).length
const totalPax = activeTrips.reduce((s, t) => s + t.pax, 0)
const revenueToday = drivers.reduce((s, d) => s + d.earnings.today, 0)

const maxRevenue = Math.max(...revenueData.map((d) => d.amount))

export default function DashboardPage() {
  const date = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="pt-14">
      <Header title="Dashboard" subtitle={date} />

      <div className="p-4 sm:p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Revenue Today",
              value: formatNGNFull(revenueToday),
              sub: "↑ ₦41K vs yesterday",
              icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
            },
            {
              label: "Active Drivers",
              value: activeDrivers,
              sub: `${drivers.filter((d) => d.status === "on_leave").length} on leave`,
              icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
              color: "text-amber-400",
              bg: "bg-amber-500/10",
            },
            {
              label: "Buses on Route",
              value: activeBuses,
              sub: `${buses.filter((b) => b.status === "inactive").length} available`,
              icon: "M8 17h8a2 2 0 002-2V7a2 2 0 00-2-2H8a2 2 0 00-2 2v8a2 2 0 002 2z M6 8h12M6 12h12",
              color: "text-blue-400",
              bg: "bg-blue-500/10",
            },
            {
              label: "Pax Onboard",
              value: totalPax,
              sub: `${activeTrips.length} active trips`,
              icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
              color: "text-purple-400",
              bg: "bg-purple-500/10",
            },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-[#141518] border border-white/6 rounded-xl p-4">
              <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center mb-3`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-4.5 h-4.5 ${kpi.color}`}>
                  <path d={kpi.icon} />
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{kpi.value}</div>
              <div className="text-xs text-white/50 mt-0.5">{kpi.label}</div>
              <div className="text-xs text-white/30 mt-1">{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Revenue Chart */}
          <div className="lg:col-span-3 bg-[#141518] border border-white/6 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Revenue — Last 7 Days</h3>
                <p className="text-xs text-white/40 mt-0.5">
                  Total: {formatNGNFull(revenueData.reduce((s, d) => s + d.amount, 0))}
                </p>
              </div>
              <Badge variant="green">↑ 12% WoW</Badge>
            </div>
            <div className="flex items-end gap-2 h-36">
              {revenueData.map((item) => {
                const pct = (item.amount / maxRevenue) * 100
                const isToday = item.day === "Today"
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[9px] text-white/30">{formatNGN(item.amount)}</div>
                    <div className="w-full flex items-end" style={{ height: "100px" }}>
                      <div
                        className={`w-full rounded-t-md transition-all ${isToday ? "bg-amber-500" : "bg-white/10"}`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <div className={`text-[10px] font-medium ${isToday ? "text-amber-400" : "text-white/40"}`}>
                      {item.day}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Active Trips */}
          <div className="lg:col-span-2 bg-[#141518] border border-white/6 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Active Trips</h3>
              <span className="text-xs bg-white/8 px-2 py-0.5 rounded-md text-white/50">{activeTrips.length}</span>
            </div>
            <div className="space-y-2">
              {activeTrips.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-[10px] font-bold shrink-0">
                      {trip.driver.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white/80">{trip.driver.split(" ")[0]}</div>
                      <div className="text-[10px] text-white/35">{trip.route}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={trip.status === "en_route" ? "green" : "amber"} className="text-[9px]">
                      {trip.status === "en_route" ? "En Route" : "Boarding"}
                    </Badge>
                    <div className="text-[10px] text-white/35 mt-0.5">{trip.pax}/{trip.capacity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Alerts Panel */}
          <div className="lg:col-span-3 bg-[#141518] border border-white/6 rounded-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
              <h3 className="text-sm font-semibold text-white">Active Alerts</h3>
              <Link href="/alerts" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {alerts.filter((a) => !a.acknowledged).slice(0, 4).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className={`w-0.5 h-10 rounded-full mt-0.5 shrink-0 ${
                    alert.severity === "critical" ? "bg-red-500" : alert.severity === "high" ? "bg-yellow-500" : "bg-white/30"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-white/90">{alert.title}</p>
                      <Badge variant={alert.severity === "critical" ? "red" : alert.severity === "high" ? "yellow" : "gray"} className="shrink-0 text-[9px]">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-white/40 mt-0.5 truncate">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions & Stats */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#141518] border border-white/6 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Fleet Health</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Fleet Efficiency", value: "84%", color: "text-emerald-400" },
                  { label: "KPIs Met", value: "71%", color: "text-amber-400" },
                  { label: "Compliance", value: `${drivers.filter((d) => d.compliance === "verified").length}/${drivers.length}`, color: "text-blue-400" },
                  { label: "Active Alerts", value: criticalAlerts, color: "text-red-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/4 rounded-lg p-3">
                    <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#141518] border border-white/6 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Add Driver", href: "/drivers?action=add" },
                  { label: "Add Bus", href: "/fleet?action=add" },
                  { label: "New Dispatch", href: "/dispatch?action=new" },
                  { label: "Leave Requests", href: "/leave" },
                ].map((a) => (
                  <Link
                    key={a.label}
                    href={a.href}
                    className="text-center py-2.5 px-3 rounded-lg bg-white/5 border border-white/8 text-xs font-medium text-white/60 hover:text-white hover:bg-white/8 hover:border-white/15 transition-all"
                  >
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
