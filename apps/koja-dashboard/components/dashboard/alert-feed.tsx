import Link from "next/link"
import { Danger, Warning2, InfoCircle } from "iconsax-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { alerts, type Alert } from "@/lib/data"

function AlertIcon({ severity }: { severity: Alert["severity"] }) {
  if (severity === "critical") return <Danger size={14} color="#f87171" variant="Bold" />
  if (severity === "warning") return <Warning2 size={14} color="#fbbf24" variant="Bold" />
  return <InfoCircle size={14} color="#60a5fa" variant="Bold" />
}

function alertBg(severity: Alert["severity"]) {
  if (severity === "critical") return "bg-red-500/[0.06] hover:bg-red-500/[0.10]"
  if (severity === "warning") return "bg-yellow-500/[0.06] hover:bg-yellow-500/[0.10]"
  return "bg-blue-500/[0.06] hover:bg-blue-500/[0.10]"
}

export function AlertFeed() {
  const unack = alerts.filter((a) => !a.acknowledged)
  const items = [...unack, ...alerts.filter((a) => a.acknowledged)].slice(0, 5)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Live Alerts</CardTitle>
          {unack.length > 0 && (
            <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5">
              {unack.length} active
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-1.5 px-3 pb-3">
        {items.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              "rounded-lg p-3 transition-colors",
              alertBg(alert.severity),
              alert.acknowledged && "opacity-50"
            )}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                <AlertIcon severity={alert.severity} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-200 leading-none">{alert.title}</p>
                <p className="text-[11px] text-zinc-500 mt-1 leading-snug line-clamp-2">
                  {alert.description}
                </p>
                <p className="text-[10px] text-zinc-600 mt-1">{alert.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
        <Link
          href="/alerts"
          className="block text-center text-xs text-amber-400 hover:text-amber-300 py-2 transition-colors"
        >
          View all alerts →
        </Link>
      </CardContent>
    </Card>
  )
}
