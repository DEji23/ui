import Link from "next/link"
import { UserAdd, Bus, Send2, Warning2 } from "iconsax-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const ACTIONS = [
  {
    label: "Add Driver",
    description: "Register a new driver to the fleet",
    href: "/drivers?add=1",
    icon: UserAdd,
    iconColor: "#f59e0b",
    iconBg: "bg-amber-500/10",
  },
  {
    label: "Register Bus",
    description: "Add a new vehicle to the fleet",
    href: "/fleet?add=1",
    icon: Bus,
    iconColor: "#34d399",
    iconBg: "bg-emerald-500/10",
  },
  {
    label: "Publish Dispatch",
    description: "Activate today's pending assignments",
    href: "/dispatch",
    icon: Send2,
    iconColor: "#60a5fa",
    iconBg: "bg-blue-500/10",
  },
  {
    label: "View Alerts",
    description: "Review and respond to fleet alerts",
    href: "/alerts",
    icon: Warning2,
    iconColor: "#f87171",
    iconBg: "bg-red-500/10",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="px-5 py-4 border-b border-white/[0.05]">
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-3 grid grid-cols-2 gap-2">
        {ACTIONS.map((a) => {
          const Icon = a.icon
          return (
            <Link
              key={a.label}
              href={a.href}
              className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all group"
            >
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", a.iconBg)}>
                <Icon size={16} color={a.iconColor} variant="Bold" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-200 group-hover:text-zinc-100 leading-none">{a.label}</p>
                <p className="text-[10px] text-zinc-600 mt-1 leading-snug">{a.description}</p>
              </div>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
