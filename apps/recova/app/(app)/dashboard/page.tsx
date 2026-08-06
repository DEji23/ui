import Link from "next/link"
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  CircleAlert,
  Clock4,
  ExternalLink,
  MessageSquareWarning,
  TrendingUp,
  Users,
} from "lucide-react"

import { naira, nairaShort, relativeTime } from "@/lib/format"
import { RECOVERY_CASES } from "@/lib/data/recovery-cases"
import { AUDIT_EVENTS, INCIDENTS, RAIL_HEALTH } from "@/lib/data/operations"
import { RAIL_LABEL } from "@/lib/domain/types"
import { DEFAULT_POLICY } from "@/lib/domain/policy"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import {
  ChartLegend,
  RailDistributionChart,
  RecoveryPerformanceChart,
} from "@/components/dashboard/recovery-chart"

/**
 * Operations Command Center.
 *
 * The dashboard PRD is emphatic that this is "NOT a reporting UI" — it is a
 * command center. So every panel below answers "what needs action now?":
 * rail health that justifies switching priority, an incident feed, and a
 * critical-case list that links straight into the queue.
 */

const CATEGORY_TONE = {
  RECOVERY: "brand",
  MANDATE: "info",
  DISPUTE: "purple",
  SYSTEM: "neutral",
  FINANCE: "success",
  ACCESS: "info",
} as const

const SEVERITY_DOT = {
  CRITICAL: "bg-error-600",
  WARN: "bg-warning-600",
  INFO: "bg-info-600",
} as const

export default function DashboardPage() {
  const criticalCases = [...RECOVERY_CASES]
    .filter((c) => c.state !== "CLOSED_PAID")
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, 4)

  const totalOutstanding = RECOVERY_CASES.reduce((sum, c) => sum + c.outstanding, 0)

  return (
    <>
      <PageHeader
        title="Dashboard Overview"
        description="Overview of loan recovery operations."
      />

      <div className="flex flex-col gap-6 px-8 pb-12">
        {/* Row 1 — recovery performance */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Recovery Rate"
            value="87.4%"
            icon={TrendingUp}
            tone="info"
            delta={-18}
            caption="vs last month"
          />
          <StatCard
            label="Loans In Recovery"
            value="1,847"
            icon={Users}
            tone="warning"
            delta={-18}
            caption="vs last month"
          />
          <StatCard
            label="Collected"
            value={nairaShort(284_800_000)}
            icon={Banknote}
            tone="success"
            delta={18}
            caption="vs last month"
          />
          <StatCard
            label="Outstanding"
            value={nairaShort(8_400_000_000)}
            icon={CircleAlert}
            tone="error"
            delta={-18}
            caption="vs last month"
            invertDelta
          />
        </div>

        {/* Row 2 — control surface */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active Mandates"
            value="1,247"
            icon={BadgeCheck}
            tone="brand"
            caption="NDD + Remita live"
          />
          <StatCard
            label="Open Disputes"
            value="23"
            icon={MessageSquareWarning}
            tone="warning"
            delta={-2}
            caption="vs yesterday"
            invertDelta
          />
          <StatCard
            label="SLA Breaches"
            value="8"
            icon={AlertTriangle}
            tone="error"
            delta={1}
            caption="new today"
            invertDelta
          />
          <StatCard
            label="Pending Approval"
            value="11"
            icon={Clock4}
            tone="warning"
            caption="Maker checker queue"
          />
        </div>

        {/* Row 3 — performance + rail mix */}
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.7fr_1fr]">
          <Card>
            <CardHeader className="flex-wrap">
              <div>
                <CardTitle>7-Day Recovery Performance</CardTitle>
                <CardDescription>Daily breakdown by outcome</CardDescription>
              </div>
              <ChartLegend />
            </CardHeader>
            <CardContent>
              <RecoveryPerformanceChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Recovery Rail Distribution</CardTitle>
                <CardDescription>Active collection channels</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <RailDistributionChart />
            </CardContent>
          </Card>
        </div>

        {/* Row 4 — rail health + live incidents */}
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.7fr_1fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Rail Health</CardTitle>
                <CardDescription>
                  Circuit breaker trips below{" "}
                  {(1 - DEFAULT_POLICY.circuitBreaker.railFailureRateThreshold) * 100}%
                  success
                </CardDescription>
              </div>
              <Button variant="soft" size="sm" asChild>
                <Link href="/system-health">Monitor</Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {RAIL_HEALTH.map((rail) => {
                const pct = Math.round(rail.successRate * 100)
                const breached =
                  rail.successRate <
                  1 - DEFAULT_POLICY.circuitBreaker.railFailureRateThreshold
                return (
                  <div key={rail.rail} className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                        {RAIL_LABEL[rail.rail]}
                        {rail.circuitOpen ? (
                          <Badge tone="error" dot>
                            CIRCUIT OPEN
                          </Badge>
                        ) : null}
                      </span>
                      <span className="flex items-center gap-3 text-sm">
                        <span className="text-subtle">
                          {rail.attempts.toLocaleString()} attempts ·{" "}
                          {rail.avgLatencyMs}ms
                        </span>
                        <span
                          className={
                            breached
                              ? "tabular font-bold text-error-600"
                              : "tabular font-bold text-success-600"
                          }
                        >
                          {pct}%
                        </span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={
                          breached
                            ? "h-full rounded-full bg-error-600"
                            : "h-full rounded-full bg-success-500"
                        }
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Live Incident Feed</CardTitle>
                <CardDescription>Last 60 minutes</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {INCIDENTS.map((incident) => (
                <div key={incident.id} className="flex gap-3">
                  <span
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${SEVERITY_DOT[incident.severity]}`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-ink">{incident.message}</p>
                    <p className="text-xs text-subtle">{relativeTime(incident.at)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Row 5 — critical cases + activity */}
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.7fr_1fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Critical Cases</CardTitle>
                <CardDescription>Requiring immediate attention</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/recovery-queue">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col">
              {criticalCases.map((c) => (
                <Link
                  key={c.id}
                  href="/recovery-queue"
                  className="flex items-center justify-between gap-4 border-b border-stroke py-4 last:border-0 hover:bg-surface"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-body">
                      {c.borrowerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {c.borrowerName}
                      </p>
                      <p className="truncate text-xs text-subtle">
                        ID: {c.reference} • Overdue {c.dpd}d
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="tabular text-sm font-bold text-ink">
                      {naira(c.outstanding)}
                    </span>
                    <Badge tone={c.dpd >= 40 ? "error" : "warning"}>
                      {c.dpd >= 40 ? "SEVERE" : "MODERATE"}
                    </Badge>
                  </div>
                </Link>
              ))}
              <p className="pt-4 text-xs text-subtle">
                Total outstanding across open cases:{" "}
                <span className="tabular font-semibold text-ink">
                  {naira(totalOutstanding)}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Immutable audit stream</CardDescription>
              </div>
              <Button variant="soft" size="sm" asChild>
                <Link href="/audit-trail">
                  Full log
                  <ExternalLink />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {AUDIT_EVENTS.slice(0, 5).map((event) => (
                <div key={event.id} className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full border border-brand/20 bg-brand/20" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-ink">{event.action}</p>
                      <Badge tone={CATEGORY_TONE[event.category]}>
                        {event.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-subtle">
                      {event.actor} · {relativeTime(event.at)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
