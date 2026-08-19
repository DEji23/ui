import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarClock, CircleAlert, Coins, Layers } from "lucide-react"

import { naira, percent, relativeTime, shortDate } from "@/lib/format"
import { LOANS, LOAN_REFERENCE_DATE, loanById, obligationsFor } from "@/lib/data/loans"
import { RECOVERY_CASES, accountsFor } from "@/lib/data/recovery-cases"
import { RAIL_HEALTH_MAP } from "@/lib/data/operations"
import { DEFAULT_POLICY } from "@/lib/domain/policy"
import { rankAccounts, recommend } from "@/lib/domain/orchestration"
import { buildRetryPlan } from "@/lib/domain/orchestration"
import {
  LOAN_STATE_LABEL,
  OBLIGATION_STATE_LABEL,
  daysPastDue,
  summarise,
  type ObligationState,
} from "@/lib/domain/scheduler"
import {
  FAILURE_REASON_LABEL,
  RAIL_LABEL,
  RECOVERY_STATE_LABEL,
} from "@/lib/domain/types"
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
import { RailBadge, RecoveryStatePill } from "@/components/shared/status-pill"
import { InterventionPanel } from "@/components/loans/intervention-panel"
import { OverpaymentAlert } from "@/components/loans/overpayment-alert"

/**
 * Loan & Customer 360 — PRD Module 3.
 *
 * "Provide a single truth view for any loan": summary, obligation
 * breakdown, account intelligence and recovery timeline on one page, with
 * the manual intervention panel attached.
 */

type Tone = "neutral" | "success" | "warning" | "error" | "info" | "purple" | "brand"

const OBLIGATION_TONE: Record<ObligationState, Tone> = {
  PENDING: "neutral",
  DUE: "warning",
  PARTIALLY_PAID: "warning",
  PAID: "success",
  DEFAULTED: "error",
  RESTRUCTURED: "purple",
}

export function generateStaticParams() {
  return LOANS.map((loan) => ({ loanId: loan.id }))
}

export default async function LoanDetailPage({
  params,
}: {
  params: Promise<{ loanId: string }>
}) {
  const { loanId } = await params
  const loan = loanById(decodeURIComponent(loanId))
  if (!loan) notFound()

  const obligations = obligationsFor(loan.id)
  const summary = summarise(obligations, LOAN_REFERENCE_DATE)
  const recoveryCase = RECOVERY_CASES.find((c) => c.loanId === loan.id) ?? null
  const accounts = accountsFor(loan.customerId)
  const ranked = rankAccounts(accounts, DEFAULT_POLICY, LOAN_REFERENCE_DATE)

  const recommendation = recoveryCase
    ? recommend(
        recoveryCase,
        accounts,
        DEFAULT_POLICY,
        RAIL_HEALTH_MAP,
        LOAN_REFERENCE_DATE
      )
    : null

  const retryPlan = buildRetryPlan(LOAN_REFERENCE_DATE, DEFAULT_POLICY)

  return (
    <>
      <PageHeader
        title={loan.customerName}
        description={`${loan.id} · ${loan.productName} · ${LOAN_STATE_LABEL[loan.state]}`}
        actions={
          <Button variant="outline" className="h-12 px-5" asChild>
            <Link href="/loans">
              <ArrowLeft />
              All loans
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-6 px-8 pb-12">
        {loan.overpaymentAmount > 0 ? (
          <OverpaymentAlert amount={loan.overpaymentAmount} customerName={loan.customerName} />
        ) : null}

        {/* A. Loan summary */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Outstanding Balance"
            value={naira(summary.totalOutstanding)}
            icon={Coins}
            tone={summary.totalOutstanding > 0 ? "error" : "success"}
            caption={`of ${naira(summary.totalDue)} scheduled`}
          />
          <StatCard
            label="Days Past Due"
            value={String(summary.dpd)}
            icon={CircleAlert}
            tone={summary.dpd > 30 ? "error" : summary.dpd > 0 ? "warning" : "success"}
            caption={
              recoveryCase
                ? `Tier ${recoveryCase.tier} · ${RECOVERY_STATE_LABEL[recoveryCase.state]}`
                : "No active recovery"
            }
          />
          <StatCard
            label="Recovered"
            value={naira(summary.totalPaid)}
            icon={Layers}
            tone="success"
            caption={`${summary.paidCount} of ${summary.obligationCount} obligations paid`}
          />
          <StatCard
            label="Next Scheduled Debit"
            value={
              summary.nextObligation ? shortDate(summary.nextObligation.dueDate) : "—"
            }
            icon={CalendarClock}
            tone="brand"
            caption={
              summary.nextObligation
                ? naira(summary.nextObligation.outstandingAmount)
                : "Nothing outstanding"
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-6">
            {/* B. Obligation breakdown */}
            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <div>
                  <CardTitle>Obligation Breakdown</CardTitle>
                  <CardDescription>
                    {loan.amortizationType.replace("_", " ").toLowerCase()} schedule ·{" "}
                    {(loan.interestRate * 100).toFixed(0)}% p.a. ·{" "}
                    {loan.tenureMonths} months
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="min-w-[720px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Due Date</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Interest</TableHead>
                      <TableHead>Penalty</TableHead>
                      <TableHead>Total Due</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>DPD</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {obligations.map((ob) => (
                      <TableRow key={ob.obligationId}>
                        <TableCell className="whitespace-nowrap text-subtle">
                          {shortDate(ob.dueDate)}
                        </TableCell>
                        <TableCell className="tabular">
                          {naira(ob.principalComponent)}
                        </TableCell>
                        <TableCell className="tabular text-subtle">
                          {naira(ob.interestComponent)}
                        </TableCell>
                        <TableCell className="tabular text-subtle">
                          {ob.penaltyComponent > 0 ? naira(ob.penaltyComponent) : "—"}
                        </TableCell>
                        <TableCell className="tabular font-semibold">
                          {naira(ob.totalDue)}
                        </TableCell>
                        <TableCell className="tabular font-semibold">
                          {ob.outstandingAmount > 0 ? naira(ob.outstandingAmount) : "—"}
                        </TableCell>
                        <TableCell className="tabular text-subtle">
                          {ob.outstandingAmount > 0
                            ? daysPastDue(ob, LOAN_REFERENCE_DATE)
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge dot tone={OBLIGATION_TONE[ob.status]}>
                            {OBLIGATION_STATE_LABEL[ob.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="mt-4 text-xs text-subtle">
                  Payments are applied oldest-obligation-first. Penalty of{" "}
                  {percent(1, 0)} applies to any obligation still outstanding after the
                  7-day grace period.
                </p>
              </CardContent>
            </Card>

            {/* C. Account intelligence */}
            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <div>
                  <CardTitle>Account Intelligence</CardTitle>
                  <CardDescription>
                    BVN-linked accounts ranked by the decision engine
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {ranked.length === 0 ? (
                  <p className="py-6 text-center text-sm text-subtle">
                    Every linked account is blacklisted or mandate-failed.
                  </p>
                ) : (
                  <Table className="min-w-[720px]">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Rank</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Bank</TableHead>
                        <TableHead>Mandate</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Inflow</TableHead>
                        <TableHead>Last Credit</TableHead>
                        <TableHead>Last Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ranked.map((scored, i) => (
                        <TableRow key={scored.account.accountNumber}>
                          <TableCell className="tabular font-bold text-brand">
                            #{i + 1}
                          </TableCell>
                          <TableCell className="tabular text-subtle">
                            {scored.account.accountNumber}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {scored.account.bankName}
                          </TableCell>
                          <TableCell>
                            <Badge
                              dot
                              tone={
                                scored.account.mandateStatus === "ACTIVE"
                                  ? "success"
                                  : scored.account.mandateStatus === "NONE"
                                    ? "neutral"
                                    : "error"
                              }
                            >
                              {scored.account.mandateStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="tabular font-bold">
                            {scored.score.toFixed(2)}
                          </TableCell>
                          <TableCell className="tabular text-subtle">
                            {scored.breakdown.inflow.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-subtle">
                            {scored.account.lastCreditAt
                              ? relativeTime(
                                  scored.account.lastCreditAt,
                                  LOAN_REFERENCE_DATE
                                )
                              : "—"}
                          </TableCell>
                          <TableCell className="tabular">
                            {scored.account.lastBalance === null
                              ? "Unknown"
                              : naira(scored.account.lastBalance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <p className="mt-4 text-xs text-subtle">
                  Score = 0.30·inflow + 0.25·recency + 0.20·success rate +
                  0.15·stability − 0.10·failure rate.
                </p>
              </CardContent>
            </Card>

            {/* D. Recovery timeline */}
            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <div>
                  <CardTitle>Recovery Timeline</CardTitle>
                  <CardDescription>Every attempt with its outcome</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {!recoveryCase || recoveryCase.attempts.length === 0 ? (
                  <p className="py-6 text-center text-sm text-subtle">
                    No debit attempt recorded on this loan yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {[...recoveryCase.attempts].reverse().map((attempt) => (
                      <div
                        key={attempt.id}
                        className="flex items-start gap-3 border-b border-stroke pb-3 last:border-0"
                      >
                        <span
                          className={
                            attempt.outcome === "SUCCESS"
                              ? "mt-1.5 size-2 shrink-0 rounded-full bg-success-500"
                              : attempt.outcome === "PARTIAL"
                                ? "mt-1.5 size-2 shrink-0 rounded-full bg-warning-600"
                                : "mt-1.5 size-2 shrink-0 rounded-full bg-error-600"
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-ink">
                              Attempt {attempt.attemptNo} ·{" "}
                              {RAIL_LABEL[attempt.rail]} · {attempt.accountNumber}
                            </p>
                            <span className="text-xs text-subtle">
                              {shortDate(attempt.attemptedAt)}
                            </span>
                          </div>
                          <p className="text-xs text-body">
                            Requested {naira(attempt.amountRequested)} ·{" "}
                            {attempt.outcome === "FAILED" && attempt.failureReason
                              ? FAILURE_REASON_LABEL[attempt.failureReason]
                              : `Recovered ${naira(attempt.amountRecovered)}`}
                          </p>
                          <p className="font-mono text-[10px] text-subtle">
                            {attempt.idempotencyKey}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {recoveryCase ? (
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <div>
                    <CardTitle>Recovery Status</CardTitle>
                    <CardDescription>Live engine state</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 p-0">
                  <Row label="Recovery state">
                    <RecoveryStatePill state={recoveryCase.state} />
                  </Row>
                  <Row label="Escalation tier">{recoveryCase.tier}</Row>
                  <Row label="Assigned DRO">{recoveryCase.assignedTo}</Row>
                  <Row label="Active rail">
                    <RailBadge rail={recoveryCase.rail} />
                  </Row>
                  <Row label="Mandate">{recoveryCase.mandateReference ?? "—"}</Row>
                  <Row label="Retry count">
                    {recoveryCase.retryCount} of{" "}
                    {DEFAULT_POLICY.debit.maxAttemptsPerCycle}
                  </Row>
                  <Row label="Next retry">
                    {recoveryCase.nextRetryAt
                      ? shortDate(recoveryCase.nextRetryAt)
                      : "Not scheduled"}
                  </Row>
                </CardContent>
              </Card>
            ) : null}

            {recommendation ? (
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <div>
                    <CardTitle>Engine Recommendation</CardTitle>
                    <CardDescription>Recomputed on page load</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {recommendation.eligible ? (
                    <>
                      <p className="mb-2 text-sm font-semibold text-brand">
                        {(recommendation.confidence * 100).toFixed(0)}% confidence
                      </p>
                      <ul className="flex list-disc flex-col gap-1 pl-4 text-xs text-body">
                        {recommendation.rationale.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-sm text-body">{recommendation.blockedReason}</p>
                  )}
                </CardContent>
              </Card>
            ) : null}

            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <div>
                  <CardTitle>Retry Ladder</CardTitle>
                  <CardDescription>
                    Quiet hours {DEFAULT_POLICY.debit.quietHours.from}–
                    {DEFAULT_POLICY.debit.quietHours.to} are skipped
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-0">
                {retryPlan.map((plan) => (
                  <div
                    key={plan.attemptNo}
                    className="flex items-start justify-between gap-3 border-b border-stroke pb-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        {plan.attemptNo === 0
                          ? "First attempt"
                          : `Retry ${plan.attemptNo}`}
                      </p>
                      <p className="text-xs text-subtle">{plan.strategy}</p>
                    </div>
                    <span className="shrink-0 text-xs text-subtle">
                      {shortDate(plan.scheduledAt.toISOString())}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <InterventionPanel
              recoveryCase={recoveryCase}
              outstanding={summary.totalOutstanding}
            />
          </div>
        </div>
      </div>
    </>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-stroke pb-3 last:border-0">
      <span className="text-xs font-medium text-body">{label}</span>
      <span className="text-right text-xs font-semibold text-ink">{children}</span>
    </div>
  )
}
