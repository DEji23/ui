"use client"

import * as React from "react"
import { ShieldOff } from "lucide-react"

import { percent } from "@/lib/format"
import { can } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import { RAIL_HEALTH } from "@/lib/data/operations"
import { RAIL_LABEL, type RailHealth } from "@/lib/domain/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input, Label } from "@/components/ui/input"
import { ResultDialog } from "@/components/queues/action-dialogs"

/**
 * Manual circuit-breaker override — Core Dashboard PRD Module 6.
 * The automatic breaker (threshold-tripped) is real state; this panel is
 * the operator's manual escape hatch on top of it — "Disable: [ ] NDD
 * [ ] EasyPay, Reason: …" from the PRD's own mockup.
 */
export function RailBreakerPanel() {
  const [rails, setRails] = React.useState<RailHealth[]>(RAIL_HEALTH)
  const [pending, setPending] = React.useState<Record<string, boolean>>({})
  const [reason, setReason] = React.useState("")
  const [result, setResult] = React.useState<{ title: string; message: string } | null>(
    null
  )
  const mayOverride = can(CURRENT_USER.role, "recovery.override")

  const dirty = rails.some((r) => (pending[r.rail] ?? r.circuitOpen) !== r.circuitOpen)

  function toggle(rail: string, checked: boolean) {
    setPending((prev) => ({ ...prev, [rail]: checked }))
  }

  function apply() {
    const changed = rails.filter((r) => (pending[r.rail] ?? r.circuitOpen) !== r.circuitOpen)
    setRails((prev) =>
      prev.map((r) => ({ ...r, circuitOpen: pending[r.rail] ?? r.circuitOpen }))
    )
    setResult({
      title: "Circuit breakers updated",
      message: `${changed.map((r) => RAIL_LABEL[r.rail]).join(", ")} ${
        changed.length === 1 ? "was" : "were"
      } manually ${changed.map((r) => (pending[r.rail] ? "disabled" : "re-enabled")).join(", ")}. Reason logged as "${reason}". Automated recovery re-routes to the remaining rails immediately.`,
    })
    setPending({})
    setReason("")
  }

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4">
        <div>
          <CardTitle>Rail Monitors</CardTitle>
          <CardDescription>
            Success rate, latency and breaker state per rail — manual override sits on
            top of the automatic threshold trip
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-0">
        {rails.map((rail) => {
          const effectiveOpen = pending[rail.rail] ?? rail.circuitOpen
          return (
            <div
              key={rail.rail}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-stroke p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{RAIL_LABEL[rail.rail]}</p>
                <p className="text-xs text-subtle">
                  {percent(rail.successRate * 100)} success · {rail.avgLatencyMs}ms ·{" "}
                  {rail.attempts.toLocaleString()} attempts
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge dot tone={effectiveOpen ? "error" : "success"}>
                  {effectiveOpen ? "Breaker open" : "Closed"}
                </Badge>
                <label
                  className="flex items-center gap-1.5 text-xs text-body"
                  title={mayOverride ? undefined : "Requires the recovery.override permission."}
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--color-error-600)]"
                    disabled={!mayOverride}
                    checked={effectiveOpen}
                    onChange={(e) => toggle(rail.rail, e.target.checked)}
                  />
                  Disable
                </label>
              </div>
            </div>
          )
        })}

        {dirty ? (
          <div className="mt-2 flex flex-col gap-3 rounded-[var(--radius-control)] bg-surface p-4 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="breaker-reason">Reason for manual override *</Label>
              <Input
                id="breaker-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Bank downtime confirmed by NIBSS status page"
              />
            </div>
            <Button
              variant="danger"
              size="md"
              disabled={reason.trim() === ""}
              onClick={apply}
            >
              <ShieldOff className="size-4" />
              Apply
            </Button>
          </div>
        ) : null}
      </CardContent>

      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </Card>
  )
}
