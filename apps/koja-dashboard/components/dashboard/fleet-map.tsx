import Link from "next/link"
import { Bus, Map1, Refresh2 } from "iconsax-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { buses } from "@/lib/data"

const activeBuses = buses.filter(b => b.status === "active")

const statusConfig: Record<string, { label: string; dot: string }> = {
  active: { label: "Active", dot: "bg-emerald-400" },
  available: { label: "Available", dot: "bg-blue-400" },
  maintenance: { label: "Maintenance", dot: "bg-amber-400" },
  blocked: { label: "Blocked", dot: "bg-red-400" },
  decommissioned: { label: "Decommissioned", dot: "bg-zinc-500" },
}

export function FleetMap() {
  return (
    <Card>
      <CardHeader className="border-b border-line-soft">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Live Fleet Map</CardTitle>
            <p className="text-xs text-fg-dim mt-0.5">{activeBuses.length} buses currently active</p>
          </div>
          <Link href="/fleet">
            <Button variant="outline" size="sm">View all buses →</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Map unavailable placeholder */}
        <div className="relative h-52 border-b border-line-soft flex items-center justify-center overflow-hidden bg-[var(--subtle-bg)]">
          {/* Simulated map grid */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(var(--fg) 1px, transparent 1px), linear-gradient(90deg, var(--fg) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          {/* Bus pins scattered on map */}
          <div className="absolute top-8 left-[20%] h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Bus size={12} color="#34d399" variant="Bold" />
          </div>
          <div className="absolute top-16 left-[55%] h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Bus size={12} color="#34d399" variant="Bold" />
          </div>
          <div className="absolute top-28 left-[35%] h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Bus size={12} color="#34d399" variant="Bold" />
          </div>
          <div className="absolute top-10 left-[75%] h-6 w-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Bus size={12} color="#f59e0b" variant="Bold" />
          </div>

          {/* Unavailable overlay */}
          <div className="relative z-10 text-center">
            <div className="h-10 w-10 rounded-xl bg-[var(--hover-bg)] border border-line-soft flex items-center justify-center mx-auto mb-3">
              <Map1 size={20} color="var(--fg-dim)" variant="Bold" />
            </div>
            <p className="text-sm font-medium text-fg-muted">Live map unavailable</p>
            <p className="text-xs text-fg-dim mt-0.5">GPS integration required for live tracking</p>
            <Button variant="outline" size="sm" className="mt-3 gap-1.5">
              <Refresh2 size={12} color="currentColor" variant="Linear" />
              Retry connection
            </Button>
          </div>
        </div>

        {/* Fallback: active bus list */}
        <div>
          <p className="px-5 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-fg-dim">
            Active Buses — Live View
          </p>
          <div className="divide-y divide-line-soft">
            {activeBuses.map(bus => {
              const cfg = statusConfig[bus.status] ?? statusConfig.active
              return (
                <div
                  key={bus.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--hover-bg)] transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Bus size={16} color="#f59e0b" variant="Bold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-fg">{bus.code}</p>
                      <span className="text-fg-dim text-xs">·</span>
                      <span className="text-xs text-fg-muted truncate">{bus.driver ?? "Unassigned"}</span>
                    </div>
                    <p className="text-xs text-fg-dim mt-0.5 truncate">{bus.route ?? "No route assigned"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1.5 justify-end mb-1">
                      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                      <span className="text-xs text-fg-muted">{cfg.label}</span>
                    </div>
                    <p className="text-[11px] text-fg-dim">
                      {bus.currentPassengers !== undefined
                        ? `${bus.currentPassengers}/${bus.capacity} seats`
                        : `${bus.capacity} seats`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
