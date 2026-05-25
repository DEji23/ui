import Link from "next/link"
import { People, Bus, User, DollarCircle, ArrowUp2, ArrowDown2, TickCircle, Wallet2 } from "iconsax-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn, formatNGN } from "@/lib/utils"
import { drivers, buses, activeTrips, tripsCompletedToday, pendingSettlementsAmount } from "@/lib/data"

const activeBuses = buses.filter(b => b.status === "active").length
const totalBuses = buses.length
const activeDrivers = drivers.filter(d => d.status === "active").length
const totalDrivers = drivers.length
const liveTrips = activeTrips.filter(t => t.status !== "completed")
const totalPassengers = liveTrips.reduce((s, t) => s + t.passengers, 0)
const totalCapacity = liveTrips.reduce((s, t) => s + t.capacity, 0)
const avgUtil = totalCapacity > 0 ? Math.round((totalPassengers / totalCapacity) * 100) : 0

const stats = [
  {
    label: "Revenue Today",
    value: formatNGN(289500),
    sub: "live count",
    delta: "₦8K behind pace",
    up: false,
    icon: DollarCircle,
    iconColor: "#34d399",
    iconBg: "bg-emerald-500/10",
    href: "/reconciliation",
  },
  {
    label: "Trips Completed",
    value: String(tripsCompletedToday),
    sub: "since 06:00 AM",
    delta: "+1 vs avg",
    up: true,
    icon: TickCircle,
    iconColor: "#60a5fa",
    iconBg: "bg-blue-500/10",
    href: "/dispatch",
  },
  {
    label: "Active Buses",
    value: `${activeBuses}/${totalBuses}`,
    sub: "on route now",
    delta: "+1 vs yesterday",
    up: true,
    icon: Bus,
    iconColor: "#f59e0b",
    iconBg: "bg-amber-500/10",
    href: "/fleet",
  },
  {
    label: "Active Drivers",
    value: `${activeDrivers}/${totalDrivers}`,
    sub: "on shift",
    delta: "+1 vs yesterday",
    up: true,
    icon: People,
    iconColor: "#a78bfa",
    iconBg: "bg-purple-500/10",
    href: "/drivers",
  },
  {
    label: "Avg Seat Utilisation",
    value: `${avgUtil}%`,
    sub: "across live trips",
    delta: "+4% vs avg",
    up: true,
    icon: User,
    iconColor: "#38bdf8",
    iconBg: "bg-sky-500/10",
    href: "/dispatch",
  },
  {
    label: "Pending Settlements",
    value: formatNGN(pendingSettlementsAmount),
    sub: "awaiting clearance",
    delta: "Review needed",
    up: false,
    icon: Wallet2,
    iconColor: "#fb923c",
    iconBg: "bg-orange-500/10",
    href: "/reconciliation",
  },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((s) => {
        const Icon = s.icon
        const TrendIcon = s.up ? ArrowUp2 : ArrowDown2
        return (
          <Link key={s.label} href={s.href}>
            <Card className="hover:border-amber-500/20 transition-colors cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", s.iconBg)}>
                    <Icon size={18} color={s.iconColor} variant="Bold" />
                  </div>
                  <div className={cn("flex items-center gap-1 text-xs font-medium", s.up ? "text-emerald-400" : "text-red-400")}>
                    <TrendIcon size={12} color="currentColor" variant="Linear" />
                    <span>{s.delta}</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-fg tracking-tight">{s.value}</div>
                  <div className="text-xs text-fg-muted mt-0.5">{s.label}</div>
                  <div className="text-[11px] text-fg-dim mt-0.5">{s.sub}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
