import { People, Bus, User, DollarCircle, ArrowUp2, ArrowDown2 } from "iconsax-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn, formatNGN } from "@/lib/utils"

const stats = [
  {
    label: "Active Drivers",
    value: "4",
    sub: "of 8 on shift",
    delta: "+1 vs yesterday",
    up: true,
    icon: People,
    iconColor: "#60a5fa",
    iconBg: "bg-blue-500/10",
  },
  {
    label: "Buses on Route",
    value: "4",
    sub: "of 8 fleet",
    delta: "+1 vs yesterday",
    up: true,
    icon: Bus,
    iconColor: "#f59e0b",
    iconBg: "bg-amber-500/10",
  },
  {
    label: "Passengers Onboard",
    value: "79",
    sub: "across active trips",
    delta: "+12 vs avg",
    up: true,
    icon: User,
    iconColor: "#a78bfa",
    iconBg: "bg-purple-500/10",
  },
  {
    label: "Revenue Today",
    value: formatNGN(289500),
    sub: "live count",
    delta: "₦8K behind pace",
    up: false,
    icon: DollarCircle,
    iconColor: "#34d399",
    iconBg: "bg-emerald-500/10",
  },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon
        const TrendIcon = s.up ? ArrowUp2 : ArrowDown2
        return (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", s.iconBg)}>
                  <Icon size={18} color={s.iconColor} variant="Bold" />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    s.up ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  <TrendIcon size={12} color="currentColor" variant="Linear" />
                  <span>{s.delta}</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-zinc-50 tracking-tight">{s.value}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
                <div className="text-[11px] text-zinc-600 mt-0.5">{s.sub}</div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
