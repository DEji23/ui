import { Activity, CheckCircle2, AlertTriangle, Clock, Server } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const services = [
  { name: "NDD Gateway", status: "operational", uptime: 99.9, latency: "42ms", lastCheck: "30s ago" },
  { name: "Remita API", status: "operational", uptime: 99.7, latency: "118ms", lastCheck: "30s ago" },
  { name: "EasyPay Service", status: "degraded", uptime: 97.2, latency: "380ms", lastCheck: "30s ago" },
  { name: "iGree Consent Platform", status: "operational", uptime: 99.8, latency: "65ms", lastCheck: "30s ago" },
  { name: "SMS Gateway", status: "operational", uptime: 99.5, latency: "88ms", lastCheck: "30s ago" },
  { name: "Core Banking (FLEXCUBE)", status: "operational", uptime: 99.9, latency: "210ms", lastCheck: "1m ago" },
  { name: "Audit Service", status: "operational", uptime: 100, latency: "12ms", lastCheck: "30s ago" },
  { name: "Report Engine", status: "operational", uptime: 99.6, latency: "145ms", lastCheck: "2m ago" },
]

const STATUS_STYLE: Record<string, { dot: string; text: string; badge: string }> = {
  operational: { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  degraded: { dot: "bg-amber-500 animate-pulse", text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  down: { dot: "bg-red-500 animate-pulse", text: "text-red-600 dark:text-red-400", badge: "bg-red-500/10 text-red-600 dark:text-red-400" },
}

const operationalCount = services.filter(s => s.status === "operational").length

export default function SystemHealthPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="System Health"
        description="Real-time monitoring of all integration services"
      />

      <div className="p-4 sm:p-6 space-y-5">
        {/* Status summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Operational</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{operationalCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Degraded</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {services.filter(s => s.status === "degraded").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Avg Uptime</p>
                <p className="text-xl font-bold text-foreground">
                  {(services.reduce((a, s) => a + s.uptime, 0) / services.length).toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service list */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Services</h3>
          </div>
          <div className="divide-y divide-border">
            {services.map(service => {
              const style = STATUS_STYLE[service.status]
              return (
                <div key={service.name} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors">
                  <div className={cn("h-2 w-2 rounded-full shrink-0", style.dot)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-foreground">{service.name}</p>
                      <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold capitalize", style.badge)}>
                        {service.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5 min-w-[120px]">
                        <Progress value={service.uptime} className="h-1 w-20" />
                        <span className="text-[11px] text-muted-foreground">{service.uptime}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-foreground monospace-nums">{service.latency}</p>
                    <p className="text-[11px] text-muted-foreground">latency</p>
                  </div>
                  <div className="text-right shrink-0 min-w-[60px]">
                    <p className="text-[11px] text-muted-foreground">{service.lastCheck}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
