import { CircleCheck, TriangleAlert } from "lucide-react"

import { naira, shortDate } from "@/lib/format"
import { DEFAULT_POLICY, validatePolicy } from "@/lib/domain/policy"
import { RAIL_LABEL } from "@/lib/domain/types"
import { can } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"

import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { PolicyEnginePageActions } from "@/components/wizards/misc-page-actions"
import { OrgPolicyOverrides } from "@/components/policy/org-policy-overrides"

/**
 * Policy control panel.
 *
 * Every value the orchestration engine reads is editable here rather than
 * shipped in code — the PRD's "recovery policy configurability" requirement.
 * The validation report is rendered live so an operator sees why a
 * combination is rejected before saving it.
 */
function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-stroke py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-body">{label}</p>
        {hint ? <p className="text-xs text-subtle">{hint}</p> : null}
      </div>
      <p className="tabular shrink-0 text-sm font-semibold text-ink">{value}</p>
    </div>
  )
}

export default function PolicyEnginePage() {
  const policy = DEFAULT_POLICY
  const violations = validatePolicy(policy)
  const mayEdit = can(CURRENT_USER.role, "policy.configure")

  return (
    <>
      <PageHeader
        title="Policy Engine"
        description="Recovery behaviour is configuration, not code. Tune retries, mandates and escalation per portfolio."
        actions={<PolicyEnginePageActions />}
      />

      <div className="flex flex-col gap-6 px-8 pb-12">
        {!mayEdit ? (
          <Alert tone="info" title="Read-only">
            Editing recovery policy requires the <code>policy.configure</code>{" "}
            permission. You are signed in as {CURRENT_USER.roleLabel}.
          </Alert>
        ) : null}

        {violations.length === 0 ? (
          <Alert tone="success" title="Policy is valid">
            No conflicting rules detected. Retry timing respects settlement windows and
            escalation thresholds increase monotonically.
          </Alert>
        ) : (
          <div className="flex flex-col gap-3">
            {violations.map((v) => (
              <Alert
                key={`${v.field}-${v.message}`}
                tone={v.severity === "ERROR" ? "error" : "warning"}
                title={v.field}
              >
                {v.message}
              </Alert>
            ))}
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Platform Default — applies to every organisation without an override below
        </p>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Debit & Recovery</CardTitle>
                <CardDescription>Retry ladder and rail routing</CardDescription>
              </div>
              <Badge tone="brand">{policy.id}</Badge>
            </CardHeader>
            <CardContent>
              <Row
                label="Partial recovery"
                value={policy.debit.partialRecoveryEnabled ? "Enabled" : "Disabled"}
              />
              <Row
                label="Minimum partial amount"
                value={naira(policy.debit.minPartialAmount)}
                hint="Below this, rail fees exceed the recovery"
              />
              <Row
                label="Max attempts per account / day"
                value={String(policy.debit.maxAttemptsPerAccountPerDay)}
              />
              <Row
                label="Max attempts per cycle"
                value={String(policy.debit.maxAttemptsPerCycle)}
              />
              <Row
                label="Rail priority"
                value={policy.debit.railPriority.map((r) => RAIL_LABEL[r]).join(" → ")}
              />
              <Row
                label="Retry intervals"
                value={policy.debit.retryIntervalsHours.map((h) => `+${h}h`).join(", ")}
                hint="Synchronised with NDD and Remita settlement windows"
              />
              {policy.debit.easyPayRetryIntervalsHours ? (
                <Row
                  label="EasyPay retry intervals (override)"
                  value={policy.debit.easyPayRetryIntervalsHours.map((h) => `+${h}h`).join(", ")}
                  hint="EasyPay isn't a mandate rail, so it can run a faster cadence than the shared ladder above"
                />
              ) : null}
              <Row
                label="Quiet hours"
                value={`${policy.debit.quietHours.from} – ${policy.debit.quietHours.to}`}
                hint="No debit attempts are scheduled in this window"
              />
              <Row
                label="Cool-down after failures"
                value={`${policy.debit.coolDownHoursAfterFailures}h after ${policy.debit.failuresBeforeCoolDown} failures`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Mandate Policy</CardTitle>
                <CardDescription>Lifecycle and refresh thresholds</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Row
                label="Max mandates per borrower"
                value={String(policy.mandate.maxMandatesPerBorrower)}
              />
              <Row
                label="Mandate expiry"
                value={`${policy.mandate.mandateExpiryDays} days`}
              />
              <Row
                label="Auto-refresh threshold"
                value={`${policy.mandate.autoRefreshAfterDays} days`}
                hint="Must fire before expiry, or mandates lapse silently"
              />
              <Row
                label="Exclude dormant accounts"
                value={policy.mandate.excludeDormantAccounts ? "Yes" : "No"}
              />
              <Row
                label="Validation window"
                value={`${policy.mandate.validationWindowHours}h`}
                hint="Auto-cancel if the customer does not validate"
              />
              <Row
                label="Reminder schedule"
                value={policy.mandate.reminderHours.map((h) => `${h}h`).join(", ")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Escalation Policy</CardTitle>
                <CardDescription>Failed cycles before each tier</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Row
                label="Cycles to At Risk"
                value={String(policy.escalation.cyclesToAtRisk)}
              />
              <Row
                label="Cycles to Collections"
                value={String(policy.escalation.cyclesToCollections)}
              />
              <Row
                label="Cycles to Legal"
                value={String(policy.escalation.cyclesToLegal)}
              />
              <Row
                label="Override roles"
                value={policy.escalation.overrideRoles.join(", ")}
                hint="Who may force escalation or pause recovery"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Circuit Breaker</CardTitle>
                <CardDescription>Automatic protection against rail failure</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Row
                label="Rail failure threshold"
                value={`${policy.circuitBreaker.railFailureRateThreshold * 100}%`}
                hint="Above this, automated recovery on the rail pauses"
              />
              <Row
                label="Minimum sample size"
                value={String(policy.circuitBreaker.minimumSampleSize)}
                hint="Avoids tripping on small-sample noise"
              />
              <Row
                label="Retry storm throttle"
                value={`${policy.circuitBreaker.autoThrottleRetryStorm} retries/min`}
              />
              <div className="mt-4 flex items-center gap-2 text-xs text-subtle">
                <CircleCheck className="size-4 text-success-600" />
                Last updated {shortDate(policy.updatedAt)} by {policy.updatedBy}
              </div>
            </CardContent>
          </Card>
        </div>

        <OrgPolicyOverrides />

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Hard Guardrails</CardTitle>
              <CardDescription>Not configurable — enforced in code</CardDescription>
            </div>
            <TriangleAlert className="size-5 text-warning-600" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {[
              "No retry may execute while a loan is in DISPUTE_OPEN.",
              "Every debit, mandate and refund operation requires an idempotency key.",
              "The retry engine verifies transaction status before reattempting a debit.",
              "Only authorised roles may move a loan into LEGAL_REVIEW or WRITE_OFF.",
              "Ledger entries are immutable; corrections are new referencing entries.",
            ].map((rule) => (
              <div key={rule} className="flex items-start gap-2">
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-brand" />
                <p className="text-sm text-body">{rule}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
