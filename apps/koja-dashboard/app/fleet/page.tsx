"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { cn, formatNGN } from "@/lib/utils"
import { buses, type BusStatus } from "@/lib/data"
import { Add, Bus, TickCircle, CloseCircle } from "iconsax-react"

const statusConfig: Record<
  BusStatus,
  { label: string; variant: "success" | "muted" | "warning" | "destructive" | "default" }
> = {
  active: { label: "On Route", variant: "success" },
  available: { label: "Available", variant: "default" },
  blocked: { label: "Blocked", variant: "destructive" },
  maintenance: { label: "Maintenance", variant: "warning" },
}

const filters = ["All", "On Route", "Available", "Blocked", "Maintenance"] as const
type Filter = (typeof filters)[number]

export default function FleetPage() {
  const [filter, setFilter] = useState<Filter>("All")

  const filtered = buses.filter((b) => {
    if (filter === "All") return true
    if (filter === "On Route") return b.status === "active"
    if (filter === "Available") return b.status === "available"
    if (filter === "Blocked") return b.status === "blocked"
    if (filter === "Maintenance") return b.status === "maintenance"
    return true
  })

  const summaryItems = [
    { label: "On Route", count: buses.filter((b) => b.status === "active").length, iconColor: "#34d399", bg: "bg-emerald-500/10" },
    { label: "Available", count: buses.filter((b) => b.status === "available").length, iconColor: "#f59e0b", bg: "bg-amber-500/10" },
    { label: "Blocked", count: buses.filter((b) => b.status === "blocked").length, iconColor: "#f87171", bg: "bg-red-500/10" },
    { label: "Maintenance", count: buses.filter((b) => b.status === "maintenance").length, iconColor: "#fbbf24", bg: "bg-yellow-500/10" },
  ]

  return (
    <>
      <Header
        title="Fleet"
        subtitle={`${buses.filter((b) => b.status === "active").length} of ${buses.length} buses active`}
        action={
          <Button size="sm" className="gap-1.5 mr-1">
            <Add size={14} color="currentColor" />
            Register Bus
          </Button>
        }
      />
      <main className="flex-1 p-6 space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          {summaryItems.map((s) => (
            <Card key={s.label} className="p-4 flex items-center gap-3">
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", s.bg)}>
                <Bus size={16} color={s.iconColor} variant="Bold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">{s.count}</p>
                <p className="text-xs text-zinc-500">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Filter */}
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

        {/* Bus Grid */}
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((bus) => {
            const sc = statusConfig[bus.status]
            const fill =
              bus.currentPassengers !== undefined
                ? (bus.currentPassengers / bus.capacity) * 100
                : 0

            return (
              <Card key={bus.id} className="hover:border-white/[0.12] transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-zinc-100">{bus.code}</p>
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {bus.model} · {bus.plate}
                      </p>
                    </div>
                  </div>

                  {bus.driver && (
                    <div className="flex items-center gap-2 mb-3 bg-white/[0.03] rounded-lg p-2 border border-white/[0.05]">
                      <Avatar name={bus.driver} size="xs" />
                      <div>
                        <p className="text-xs font-medium text-zinc-300">{bus.driver}</p>
                        {bus.route && (
                          <p className="text-[11px] text-zinc-600">{bus.route}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {bus.status === "active" && (
                    <div className="mb-3">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-zinc-600">Passengers</span>
                        <span className="text-zinc-400">
                          {bus.currentPassengers}/{bus.capacity}
                        </span>
                      </div>
                      <Progress
                        value={fill}
                        colorClass={fill > 85 ? "bg-emerald-500" : "bg-amber-500"}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2">
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Inspection</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {bus.inspectionResult === "pass" ? (
                          <TickCircle size={12} color="#34d399" variant="Bold" />
                        ) : bus.inspectionResult === "fail" ? (
                          <CloseCircle size={12} color="#f87171" variant="Bold" />
                        ) : null}
                        <p className="text-xs font-medium text-zinc-300 capitalize">
                          {bus.inspectionResult}
                        </p>
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-0.5">{bus.lastInspection}</p>
                    </div>
                    {bus.fuelLevel !== undefined && (
                      <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Fuel</p>
                        <p className="text-sm font-bold text-zinc-200 mt-0.5">{bus.fuelLevel}%</p>
                        <Progress
                          value={bus.fuelLevel}
                          colorClass={
                            bus.fuelLevel < 25
                              ? "bg-red-500"
                              : bus.fuelLevel < 40
                              ? "bg-yellow-500"
                              : "bg-emerald-500"
                          }
                          className="mt-1 h-1"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </>
  )
}
