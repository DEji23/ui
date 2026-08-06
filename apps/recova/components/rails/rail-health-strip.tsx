import { Activity, Gauge, TrendingDown, Zap } from "lucide-react"

import { percent } from "@/lib/format"
import { RAIL_HEALTH } from "@/lib/data/operations"
import { DEFAULT_POLICY } from "@/lib/domain/policy"
import { RAIL_LABEL, type Rail } from "@/lib/domain/types"
import { Alert } from "@/components/ui/alert"
import { StatCard } from "@/components/shared/stat-card"

/**
 * Per-rail health header.
 * The circuit-breaker banner is the UI half of the PRD's requirement that
 * abnormal failure rates pause automated recovery rather than silently
 * burning rail fees on doomed attempts.
 */
export function RailHealthStrip({ rail }: { rail: Rail }) {
  const health = RAIL_HEALTH.find((r) => r.rail === rail)
  if (!health) return null

  const threshold = 1 - DEFAULT_POLICY.circuitBreaker.railFailureRateThreshold

  return (
    <div className="flex flex-col gap-6">
      {health.circuitOpen ? (
        <Alert tone="error" title={`${RAIL_LABEL[rail]} circuit breaker is open`}>
          Success rate {percent(health.successRate * 100)} is below the{" "}
          {percent(threshold * 100, 0)} policy threshold. Automated recovery on this
          rail is paused; the orchestration engine is routing to the next rail in
          priority order.
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Success Rate"
          value={percent(health.successRate * 100)}
          icon={Gauge}
          tone={health.successRate < threshold ? "error" : "success"}
          delta={health.trend}
          caption="vs last week"
        />
        <StatCard
          label="Attempts (7d)"
          value={health.attempts.toLocaleString()}
          icon={Activity}
          tone="info"
          caption="Debit + enquiry calls"
        />
        <StatCard
          label="Avg Latency"
          value={`${health.avgLatencyMs}ms`}
          icon={Zap}
          tone={health.avgLatencyMs > 800 ? "warning" : "success"}
          caption="Target < 800ms"
        />
        <StatCard
          label="Circuit Breaker"
          value={health.circuitOpen ? "Open" : "Closed"}
          icon={TrendingDown}
          tone={health.circuitOpen ? "error" : "brand"}
          caption={`Trips below ${percent(threshold * 100, 0)}`}
        />
      </div>
    </div>
  )
}
