import { Activity, Clock, Server, Timer } from "lucide-react"

import { percent, relativeTime } from "@/lib/format"
import { INCIDENTS, RAIL_HEALTH } from "@/lib/data/operations"
import { DEFAULT_POLICY } from "@/lib/domain/policy"
import { RAIL_LABEL } from "@/lib/domain/types"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { RailBreakerPanel } from "@/components/system-health/rail-breaker-panel"

/** Real-time health for every integration rail, queue and worker. */
const SERVICES = [
  { name: "Recovery Scheduler", status: "Healthy", detail: "Next sweep in 4m", queue: 0 },
  { name: "Orchestration Engine", status: "Healthy", detail: "p95 240ms", queue: 12 },
  { name: "Mandate Poller", status: "Healthy", detail: "Last run 6m ago", queue: 3 },
  { name: "Webhook Delivery", status: "Degraded", detail: "214 retries queued", queue: 214 },
  { name: "Reconciliation Worker", status: "Healthy", detail: "Last run 08:15", queue: 0 },
  { name: "Dead Letter Queue", status: "Attention", detail: "7 messages awaiting replay", queue: 7 },
]

const SERVICE_TONE = {
  Healthy: "success",
  Degraded: "warning",
  Attention: "error",
} as const

const SEVERITY_TONE = {
  INFO: "info",
  WARN: "warning",
  CRITICAL: "error",
} as const

export default function SystemHealthPage() {
  const openBreakers = RAIL_HEALTH.filter((r) => r.circuitOpen)

  return (
    <>
      <PageHeader
        title="System Health"
        description="Integration rails, scheduler queues, webhook delivery and retry jobs."
      />

      <div className="flex flex-col gap-6 px-8 pb-12">
        {openBreakers.length > 0 ? (
          <Alert
            tone="error"
            title={`${openBreakers.length} circuit breaker${openBreakers.length === 1 ? "" : "s"} open`}
          >
            {openBreakers.map((r) => RAIL_LABEL[r.rail]).join(", ")} paused. Recovery
            degrades gracefully onto the remaining rails in priority order.
          </Alert>
        ) : null}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Uptime (30d)"
            value={percent(99.94, 2)}
            icon={Activity}
            tone="success"
            caption="SLA ≥ 99.9%"
          />
          <StatCard
            label="API p95 Latency"
            value="640ms"
            icon={Timer}
            tone="success"
            caption="Target < 800ms"
          />
          <StatCard
            label="Queued Jobs"
            value={String(SERVICES.reduce((s, x) => s + x.queue, 0))}
            icon={Server}
            tone="warning"
            caption="Across all workers"
          />
          <StatCard
            label="Retry Throttle"
            value={`${DEFAULT_POLICY.circuitBreaker.autoThrottleRetryStorm}/min`}
            icon={Clock}
            tone="brand"
            caption="Retry storm protection"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <div>
                <CardTitle>Services</CardTitle>
                <CardDescription>Schedulers, workers and delivery queues</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-0">
              {SERVICES.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-stroke p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {service.name}
                    </p>
                    <p className="text-xs text-subtle">{service.detail}</p>
                  </div>
                  <Badge
                    dot
                    tone={SERVICE_TONE[service.status as keyof typeof SERVICE_TONE]}
                  >
                    {service.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <RailBreakerPanel />
        </div>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Incident Log</CardTitle>
              <CardDescription>Latest platform events</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-0">
            {INCIDENTS.map((incident) => (
              <div
                key={incident.id}
                className="flex items-start justify-between gap-3 border-b border-stroke py-3 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm text-ink">{incident.message}</p>
                  <p className="text-xs text-subtle">{relativeTime(incident.at)}</p>
                </div>
                <Badge tone={SEVERITY_TONE[incident.severity]}>
                  {incident.severity}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
