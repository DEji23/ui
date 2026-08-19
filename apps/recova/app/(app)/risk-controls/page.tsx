"use client"

import * as React from "react"
import { Ban, ShieldAlert, UserCheck } from "lucide-react"

import { relativeTime, shortDate } from "@/lib/format"
import { RISK_LISTED_ACCOUNTS } from "@/lib/data/risk"
import { RAIL_HEALTH } from "@/lib/data/operations"
import { DEFAULT_POLICY } from "@/lib/domain/policy"
import { can } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import { RAIL_LABEL } from "@/lib/domain/types"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { ResultDialog } from "@/components/queues/action-dialogs"

/**
 * Safety & abuse controls.
 *
 * Rate limiting, circuit breakers and the blacklist/whitelist registry —
 * "Authorized roles (Debt Recovery Manager and Above) can pause recovery,
 * blacklist an account, whitelist exceptions."
 */
export default function RiskControlsPage() {
  const [accounts, setAccounts] = React.useState(RISK_LISTED_ACCOUNTS)
  const [result, setResult] = React.useState<{ title: string; message: string } | null>(
    null
  )

  const mayOverride = can(CURRENT_USER.role, "recovery.override")
  const blacklisted = accounts.filter((a) => a.listType === "BLACKLIST")
  const whitelisted = accounts.filter((a) => a.listType === "WHITELIST")
  const autoReleasing = blacklisted.filter((a) => a.autoReleaseAt !== null)

  function release(accountNumber: string) {
    setAccounts((prev) => prev.filter((a) => a.accountNumber !== accountNumber))
    setResult({
      title: "Account released",
      message: `${accountNumber} removed from the blacklist by ${CURRENT_USER.name}. It re-enters the debit pool on the next ranking pass.`,
    })
  }

  return (
    <>
      <PageHeader
        title="Risk & Abuse Controls"
        description="Rate limiting, circuit breakers and the account blacklist/whitelist registry."
      />

      <div className="flex flex-col gap-6 px-8 pb-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Blacklisted Accounts"
            value={String(blacklisted.length)}
            icon={Ban}
            tone="error"
            caption="Excluded from the debit pool"
          />
          <StatCard
            label="Auto-Releasing"
            value={String(autoReleasing.length)}
            icon={ShieldAlert}
            tone="warning"
            caption="48h adaptive throttle"
          />
          <StatCard
            label="Whitelisted"
            value={String(whitelisted.length)}
            icon={UserCheck}
            tone="success"
            caption="Manual exceptions"
          />
          <StatCard
            label="Retry Storm Throttle"
            value={`${DEFAULT_POLICY.circuitBreaker.autoThrottleRetryStorm}/min`}
            icon={ShieldAlert}
            tone="brand"
            caption="Global cap"
          />
        </div>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Rate Limits</CardTitle>
              <CardDescription>Enforced per account, borrower and bank</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 p-0 sm:grid-cols-3">
            <RateLimitCard
              label="Per account / day"
              value={DEFAULT_POLICY.debit.maxAttemptsPerAccountPerDay}
            />
            <RateLimitCard
              label="Per recovery cycle"
              value={DEFAULT_POLICY.debit.maxAttemptsPerCycle}
            />
            <RateLimitCard
              label="Cool-down after failures"
              value={`${DEFAULT_POLICY.debit.coolDownHoursAfterFailures}h after ${DEFAULT_POLICY.debit.failuresBeforeCoolDown}`}
            />
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Circuit Breakers</CardTitle>
              <CardDescription>
                Global failure-rate protection per rail — trips below{" "}
                {(1 - DEFAULT_POLICY.circuitBreaker.railFailureRateThreshold) * 100}%
                success
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-0">
            {RAIL_HEALTH.map((rail) => (
              <div
                key={rail.rail}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-stroke p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {RAIL_LABEL[rail.rail]}
                  </p>
                  <p className="text-xs text-subtle">
                    {(rail.successRate * 100).toFixed(0)}% success ·{" "}
                    {rail.attempts.toLocaleString()} attempts
                  </p>
                </div>
                <Badge dot tone={rail.circuitOpen ? "error" : "success"}>
                  {rail.circuitOpen ? "Open — paused" : "Closed — healthy"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Account Registry</CardTitle>
              <CardDescription>
                Blacklist and whitelist — DRM and above only
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Account</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>List</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Failures</TableHead>
                  <TableHead>Added By</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Auto-Release</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.accountNumber}>
                    <TableCell className="tabular text-subtle">
                      {account.bankName} · {account.accountNumber}
                    </TableCell>
                    <TableCell className="font-semibold text-ink">
                      {account.borrowerName}
                    </TableCell>
                    <TableCell>
                      <Badge tone={account.listType === "BLACKLIST" ? "error" : "success"}>
                        {account.listType}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[220px] whitespace-normal text-xs text-body">
                      {account.reason}
                    </TableCell>
                    <TableCell className="tabular text-subtle">
                      {account.consecutiveFailures}
                    </TableCell>
                    <TableCell className="text-subtle">{account.addedBy}</TableCell>
                    <TableCell className="text-subtle">
                      {shortDate(account.addedAt)}
                    </TableCell>
                    <TableCell className="text-subtle">
                      {account.autoReleaseAt
                        ? relativeTime(account.autoReleaseAt)
                        : "Manual only"}
                    </TableCell>
                    <TableCell>
                      {account.listType === "BLACKLIST" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!mayOverride}
                          title={
                            mayOverride
                              ? undefined
                              : "Releasing an account requires recovery.override."
                          }
                          onClick={() => release(account.accountNumber)}
                        >
                          Release
                        </Button>
                      ) : (
                        <span className="text-xs text-subtle">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Alert tone="info" title="Fraud signal detection">
          Unusual debit patterns — rapid retries across accounts, repeated
          just-below-threshold partials, mismatched name-enquiry results — are flagged
          for review rather than acted on automatically.
        </Alert>
      </div>

      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}

function RateLimitCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-stroke p-4">
      <p className="text-xs text-subtle">{label}</p>
      <p className="tabular mt-1 text-2xl font-bold text-ink-header">{value}</p>
    </div>
  )
}
