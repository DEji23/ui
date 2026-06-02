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

function severityBadge(severity: Alert["severity"]) {
  if (severity === "critical") return <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded px-1.5 py-0.5">Critical</span>
  if (severity === "warning") return <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5">Warning</span>
  return <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded px-1.5 py-0.5">Info</span>
}

function alertActions(alert: Alert) {
  const base = "text-[10px] font-medium px-2 py-1 rounded bg-[var(--hover-bg)] border border-line-soft text-fg-muted hover:text-fg hover:border-line-soft/80 transition-colors"
  if (alert.type === "breakdown") {
    return (
      <div className="flex items-center gap-1.5 mt-2">
        <Link href="/fleet"><button className={base}>View Bus</button></Link>
        <Link href="/dispatch"><button className={base}>Assign Replacement</button></Link>
      </div>
    )
  }
  if (alert.type === "late_start" || alert.type === "no_show") {
    return (
      <div className="flex items-center gap-1.5 mt-2">
        <Link href="/drivers"><button className={base}>View Driver</button></Link>
        <Link href="/dispatch"><button className={base}>Replace Driver</button></Link>
      </div>
    )
  }
  if (alert.type === "cash_discrepancy") {
    return (
      <div className="flex items-center gap-1.5 mt-2">
        <Link href="/reconciliation"><button className={base}>View Report</button></Link>
      </div>
    )
  }
  if (alert.type === "inspection_fail") {
    return (
      <div className="flex items-center gap-1.5 mt-2">
        <Link href="/fleet"><button className={base}>View Bus</button></Link>
      </div>
    )
  }
  if (alert.type === "code_red") {
    return (
      <div className="flex items-center gap-1.5 mt-2">
        <Link href="/drivers"><button className={base}>View Driver</button></Link>
        <Link href="/alerts"><button className={base}>Full Details</button></Link>
      </div>
    )
  }
  return null
}

export function AlertFeed() {
  const unack = alerts.filter((a) => !a.acknowledged)
  const items = [...unack, ...alerts.filter((a) => a.acknowledged)].slice(0, 5)

  return (
    <Card className="flex flex-col">
      <CardHeader className="border-b border-line-soft">
        <div className="flex items-center justify-between">
          <CardTitle>Live Alerts</CardTitle>
          {unack.length > 0 && (
            <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5">
              {unack.length} active
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-1.5 px-3 pb-3 pt-3">
        {items.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              "rounded-lg p-3 transition-colors",
              alertBg(alert.severity),
              alert.acknowledged && "opacity-60"
            )}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5 shrink-0">
                <AlertIcon severity={alert.severity} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-xs font-semibold text-fg leading-none">{alert.title}</p>
                  {severityBadge(alert.severity)}
                </div>
                <p className="text-[11px] text-fg-muted mt-1 leading-snug line-clamp-2">
                  {alert.description}
                </p>
                <p className="text-[10px] text-fg-dim mt-1">{alert.timestamp}</p>
                {!alert.acknowledged && alertActions(alert)}
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
