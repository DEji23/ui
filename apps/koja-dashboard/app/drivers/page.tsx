"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { cn, formatNGN } from "@/lib/utils"
import { drivers, type DriverStatus } from "@/lib/data"
import { Add, SearchNormal1, Star1 } from "iconsax-react"

const statusConfig: Record<
  DriverStatus,
  { label: string; variant: "success" | "muted" | "warning" | "destructive" | "default" | "info" }
> = {
  active: { label: "Active", variant: "success" },
  offline: { label: "Offline", variant: "muted" },
  late: { label: "Late", variant: "warning" },
  on_leave: { label: "On Leave", variant: "info" },
  blocked: { label: "Blocked", variant: "destructive" },
}

const filters = ["All", "Active", "Late", "Offline", "On Leave", "Blocked"] as const
type Filter = (typeof filters)[number]

export default function DriversPage() {
  const [filter, setFilter] = useState<Filter>("All")
  const [search, setSearch] = useState("")

  const filtered = drivers.filter((d) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Active" && d.status === "active") ||
      (filter === "Late" && d.status === "late") ||
      (filter === "Offline" && d.status === "offline") ||
      (filter === "On Leave" && d.status === "on_leave") ||
      (filter === "Blocked" && d.status === "blocked")
    const matchesSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const activeCount = drivers.filter((d) => d.status === "active").length

  return (
    <>
      <Header
        title="Drivers"
        subtitle={`${activeCount} of ${drivers.length} on shift`}
        action={
          <Button size="sm" className="gap-1.5 mr-1">
            <Add size={14} color="currentColor" />
            Add Driver
          </Button>
        }
      />
      <main className="flex-1 p-6 space-y-5">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative max-w-xs">
            <SearchNormal1
              size={14}
              color="#52525b"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <Input
              placeholder="Search name or code…"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((driver) => {
            const sc = statusConfig[driver.status]
            const weekFill = (driver.hoursThisWeek / 60) * 100
            return (
              <Card key={driver.id} className="hover:border-white/[0.12] transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={driver.name} size="lg" />
                      <div>
                        <p className="text-sm font-semibold text-zinc-100">{driver.name}</p>
                        <p className="text-xs text-zinc-500">{driver.code}</p>
                      </div>
                    </div>
                    <Badge variant={sc.variant}>{sc.label}</Badge>
                  </div>

                  {driver.route && (
                    <div className="mb-3 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Current Route</p>
                      <p className="text-xs font-medium text-zinc-300">{driver.route}</p>
                      {driver.bus && <p className="text-[11px] text-zinc-600 mt-0.5">{driver.bus}</p>}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2 text-center">
                      <p className="text-base font-bold text-zinc-200">{driver.tripsToday}</p>
                      <p className="text-[10px] text-zinc-600">Trips</p>
                    </div>
                    <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2 text-center">
                      <p className="text-base font-bold text-zinc-200">{formatNGN(driver.earningsToday)}</p>
                      <p className="text-[10px] text-zinc-600">Earned</p>
                    </div>
                    <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star1 size={12} color="#f59e0b" variant="Bold" />
                        <p className="text-base font-bold text-zinc-200">{driver.rating}</p>
                      </div>
                      <p className="text-[10px] text-zinc-600">Rating</p>
                    </div>
                  </div>

                  {driver.hoursThisWeek > 0 && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Hours This Week</p>
                        <p className="text-[11px] text-zinc-500">
                          {driver.hoursThisWeek}h / 60h
                        </p>
                      </div>
                      <Progress
                        value={weekFill}
                        colorClass={
                          weekFill > 83
                            ? "bg-red-500"
                            : weekFill > 67
                            ? "bg-yellow-500"
                            : "bg-amber-500"
                        }
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-zinc-600">
            <p className="text-sm">No drivers match your filter</p>
          </div>
        )}
      </main>
    </>
  )
}
