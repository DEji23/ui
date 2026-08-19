"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Download, History, Pause, RefreshCcw, RotateCw } from "lucide-react"

import { naira, relativeTime } from "@/lib/format"
import { APP_NOW } from "@/lib/clock"
import { can } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import { DEFAULT_POLICY } from "@/lib/domain/policy"
import { accountsFor } from "@/lib/data/recovery-cases"
import { appendLedgerEntry } from "@/lib/data/ledger"
import { RAIL_HEALTH_MAP } from "@/lib/data/operations"
import { accountSuspension, recommend } from "@/lib/domain/orchestration"
import { allowedTransitions, retryEligibility } from "@/lib/domain/state-machine"
import {
  ESCALATION_TIER_LABEL,
  FAILURE_REASON_LABEL,
  RAIL_LABEL,
  type EscalationTier,
  type RecoveryAttempt,
  type RecoveryCase,
} from "@/lib/domain/types"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, DetailRow, DetailSection } from "@/components/ui/sheet"
import { RailBadge, RecoveryStatePill } from "@/components/shared/status-pill"
import { ReasonDialog, ResultDialog } from "@/components/queues/action-dialogs"

/** Escalation moves one tier at a time; LGL is the ladder's terminus. */
const NEXT_TIER: Record<EscalationTier, EscalationTier> = {
  T1: "T2",
  T2: "T3",
  T3: "T4",
  T4: "LGL",
  LGL: "LGL",
}

/**
 * Recovery Details panel — Figma "Side Modal (Active)".
 *
 * Beyond mirroring the layout, this panel is where the guardrails become
 * visible: the engine's recommendation is recomputed on open (the PRD calls
 * stale recommendations out as a critical edge case), and the retry button
 * is disabled with a stated reason whenever `retryEligibility` says no.
 *
 * Retry, pause and escalate all write through `onUpdate` so the queue table
 * behind the sheet reflects the new state immediately — the same pattern the
 * Action Queues module uses for task actions.
 */
export function RecoveryDetailSheet({
  recoveryCase,
  open,
  onOpenChange,
  onUpdate,
}: {
  recoveryCase: RecoveryCase | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (updated: RecoveryCase) => void
}) {
  const [reasonOpen, setReasonOpen] = React.useState<"pause" | "escalate" | null>(null)
  const [result, setResult] = React.useState<{ title: string; message: string } | null>(
    null
  )

  if (!recoveryCase) return null

  const accounts = accountsFor(recoveryCase.borrowerId)
  const eligibility = retryEligibility(recoveryCase)
  const recommendation = recommend(
    recoveryCase,
    accounts,
    DEFAULT_POLICY,
    RAIL_HEALTH_MAP,
    APP_NOW
  )

  const escalateTransition = allowedTransitions(recoveryCase.state).find(
    (t) => t.requires === "escalation.trigger"
  )

  const mayRetry = can(CURRENT_USER.role, "recovery.retry") && eligibility.allowed
  const mayEscalate = can(CURRENT_USER.role, "escalation.trigger") && !!escalateTransition
  const mayPause = can(CURRENT_USER.role, "recovery.pause")

  const atRisk =
    recoveryCase.state === "AT_RISK" ||
    recoveryCase.state === "COLLECTIONS" ||
    recoveryCase.state === "RECOVERY_FAILED"

  function handleRetry() {
    if (!recoveryCase || !recommendation.eligible || !recommendation.rail || !recommendation.account || !recommendation.decision) {
      return
    }
    const decision = recommendation.decision
    const amount = decision.action === "SKIP_ACCOUNT" ? 0 : decision.amount
    const outcome: RecoveryAttempt["outcome"] =
      decision.action === "DEBIT_FULL" ? "SUCCESS" : "PARTIAL"

    const attempt: RecoveryAttempt = {
      id: `att_${recoveryCase.id}_${recoveryCase.attempts.length + 1}`,
      attemptNo: recoveryCase.attempts.length + 1,
      rail: recommendation.rail,
      accountNumber: recommendation.account.accountNumber,
      amountRequested: recoveryCase.outstanding,
      amountRecovered: amount,
      outcome,
      failureReason: null,
      idempotencyKey: `idem_${recoveryCase.id}_${Date.now()}`,
      attemptedAt: APP_NOW.toISOString(),
    }

    const amountRecovered = recoveryCase.amountRecovered + amount
    const outstanding = Math.max(0, Math.round((recoveryCase.outstanding - amount) * 100) / 100)
    const nextState =
      outstanding === 0 ? "CLOSED_PAID" : outcome === "PARTIAL" ? "PARTIALLY_RECOVERED" : recoveryCase.state

    // Every recovered naira is also a ledger event — full or partial — so the
    // settlement record and the queue's own totals never drift apart.
    if (amount > 0) {
      appendLedgerEntry({
        loanId: recoveryCase.loanId,
        transactionId: `TX-${attempt.idempotencyKey}`,
        type: "DEBIT",
        status: "PROVISIONAL",
        amount,
        currency: "NGN",
        rail: recommendation.rail,
        referenceEntryId: null,
        createdAt: APP_NOW.toISOString(),
      })
    }

    onUpdate({
      ...recoveryCase,
      attempts: [...recoveryCase.attempts, attempt],
      amountRecovered,
      outstanding,
      retryCount: recoveryCase.retryCount + 1,
      lastAction:
        outstanding === 0
          ? "Manual retry — recovered in full"
          : outcome === "PARTIAL"
            ? "Manual retry — partial recovery"
            : "Manual retry",
      state: nextState,
    })
    setResult({
      title: outstanding === 0 ? "Recovery complete" : "Retry recorded",
      message:
        outstanding === 0
          ? `${naira(amount)} recovered via ${RAIL_LABEL[recommendation.rail]}. Outstanding balance cleared and the case moved to Closed Paid.`
          : `${naira(amount)} recovered via ${RAIL_LABEL[recommendation.rail]}. ${naira(outstanding)} remains outstanding.`,
    })
  }

  function handlePauseConfirm(reasonCode: string) {
    if (!recoveryCase) return
    onUpdate({
      ...recoveryCase,
      recoveryPaused: true,
      pauseReason: reasonCode,
      lastAction: "Recovery paused",
    })
    setResult({
      title: "Recovery paused",
      message: `Automated retries are suspended for ${recoveryCase.loanId}. Reason logged as ${reasonCode}, attributed to ${CURRENT_USER.name}.`,
    })
  }

  function handleEscalateConfirm(reasonCode: string) {
    if (!recoveryCase || !escalateTransition) return
    onUpdate({
      ...recoveryCase,
      state: escalateTransition.to,
      tier: NEXT_TIER[recoveryCase.tier],
      lastAction: `Escalated to ${escalateTransition.to.replace(/_/g, " ")}`,
    })
    setResult({
      title: "Case escalated",
      message: `${recoveryCase.loanId} moved to ${escalateTransition.to.replace(/_/g, " ")}. Reason logged as ${reasonCode}.`,
    })
  }

  function handleReconsent() {
    if (!recoveryCase) return
    onUpdate({
      ...recoveryCase,
      state: "IN_RECOVERY",
      retryCount: 0,
      lastAction: "Re-initiated iGree consent — awaiting new BVN-linked accounts",
    })
    setResult({
      title: "Consent re-initiated",
      message: `${recoveryCase.borrowerName} has been sent a new iGree consent request. Once granted, any newly-linked accounts get a fresh mandate and the retry ladder restarts from attempt 0.`,
    })
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          title="Recovery Details"
          footer={
            <>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  variant="soft"
                  size="lg"
                  className="flex-1"
                  onClick={() =>
                    setResult({
                      title: "Download queued",
                      message: `A signed PDF record for ${recoveryCase.reference} has been queued. It will include borrower details, rail decisions and every debit attempt, with BVN and account numbers masked.`,
                    })
                  }
                >
                  Download Record
                  <Download />
                </Button>
                <Button variant="soft" size="lg" className="flex-1" asChild>
                  <Link href="/audit-trail">
                    View Audit History
                    <History />
                  </Link>
                </Button>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                {mayPause && !recoveryCase.recoveryPaused ? (
                  <Button
                    variant="outline"
                    size="lg"
                    className="sm:flex-1"
                    onClick={() => setReasonOpen("pause")}
                  >
                    <Pause />
                    Pause Recovery
                  </Button>
                ) : null}
                <Button
                  variant="primary"
                  size="lg"
                  block={!mayPause || recoveryCase.recoveryPaused}
                  className={mayPause && !recoveryCase.recoveryPaused ? "sm:flex-1" : ""}
                  disabled={!mayEscalate}
                  title={
                    mayEscalate
                      ? undefined
                      : !escalateTransition
                        ? "No escalation path from this state."
                        : "Requires the escalation.trigger permission."
                  }
                  onClick={() => setReasonOpen("escalate")}
                >
                  Escalate
                  <ArrowRight />
                </Button>
              </div>
              {recoveryCase.state === "RECOVERY_FAILED" ? (
                <Button
                  variant="primary"
                  size="lg"
                  block
                  disabled={!can(CURRENT_USER.role, "recovery.retry")}
                  title={
                    can(CURRENT_USER.role, "recovery.retry")
                      ? undefined
                      : "Requires the recovery.retry permission."
                  }
                  onClick={handleReconsent}
                >
                  <RefreshCcw />
                  Re-initiate Consent
                </Button>
              ) : null}
            </>
          }
        >
          <div className="flex flex-col gap-4">
            {!eligibility.allowed ? (
              <Alert tone="warning" title="Recovery Blocked">
                {eligibility.reason}
              </Alert>
            ) : atRisk ? (
              <Alert tone="error" title="Recovery At Risk">
                Recovery attempts are approaching escalation thresholds.
              </Alert>
            ) : null}

            <DetailSection title="Borrower Information">
              <DetailRow label="Full Name">{recoveryCase.borrowerName}</DetailRow>
              <DetailRow label="Loan ID">{recoveryCase.loanId}</DetailRow>
              <DetailRow label="Phone Number">{recoveryCase.phone}</DetailRow>
              <DetailRow label="Email Address">{recoveryCase.email}</DetailRow>
            </DetailSection>

            <DetailSection title="Recovery Information">
              <DetailRow label="Recovery Reference">{recoveryCase.reference}</DetailRow>
              <DetailRow label="Assigned Debt Recovery Officer (DRO)">
                {recoveryCase.assignedTo}
              </DetailRow>
              <DetailRow label="Original Recovery Amount">
                {naira(recoveryCase.originalAmount)}
              </DetailRow>
              <DetailRow label="Amount Recovered">
                {naira(recoveryCase.amountRecovered)}
              </DetailRow>
              <DetailRow label="Outstanding Balance">
                {naira(recoveryCase.outstanding)}
              </DetailRow>
              <DetailRow label="Day Past Due (DPD)">{recoveryCase.dpd}</DetailRow>
              <DetailRow label="Escalation Tier">
                {ESCALATION_TIER_LABEL[recoveryCase.tier]}
              </DetailRow>
              <DetailRow label="Recovery Status">
                <RecoveryStatePill state={recoveryCase.state} />
              </DetailRow>
            </DetailSection>

            <DetailSection title="Mandate Information">
              <DetailRow label="Mandate reference">
                {recoveryCase.mandateReference ?? "—"}
              </DetailRow>
              <DetailRow label="Recovery Rail">
                <RailBadge rail={recoveryCase.rail} />
              </DetailRow>
              <DetailRow label="Linked Account">{recoveryCase.linkedAccount}</DetailRow>
            </DetailSection>

            {/* Decision-engine output — recomputed on every open. */}
            <DetailSection title="System Recommendation">
              {recommendation.eligible ? (
                <div className="flex flex-col gap-3 rounded-[var(--radius-control)] bg-brand-subtle p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-brand">
                      Next best action
                    </span>
                    <span className="text-xs font-bold text-brand">
                      {(recommendation.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-ink">
                    {recommendation.decision?.action === "DEBIT_FULL"
                      ? `Debit ${naira(recommendation.decision.amount)} via ${
                          recommendation.rail ? RAIL_LABEL[recommendation.rail] : "—"
                        }`
                      : recommendation.decision?.action === "DEBIT_PARTIAL"
                        ? `Partial debit ${naira(recommendation.decision.amount)} via ${
                            recommendation.rail ? RAIL_LABEL[recommendation.rail] : "—"
                          }`
                        : "Skip this account"}
                  </p>
                  <ul className="flex list-disc flex-col gap-1 pl-4 text-xs text-body">
                    {recommendation.rationale.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-[var(--radius-control)] bg-gray-100 p-4 text-xs text-body">
                  {recommendation.blockedReason ??
                    "No viable debit route — every ranked account was skipped."}
                </div>
              )}

              <Button
                variant="soft"
                size="md"
                block
                disabled={!mayRetry}
                title={mayRetry ? undefined : eligibility.reason}
                onClick={handleRetry}
              >
                <RotateCw />
                {mayRetry ? "Retry Now" : "Retry Unavailable"}
              </Button>
            </DetailSection>

            <DetailSection title="Account Intelligence">
              <div className="flex flex-col gap-2">
                {accounts.map((account) => {
                  const suspension = accountSuspension(
                    account.accountNumber,
                    recoveryCase.attempts,
                    APP_NOW
                  )
                  return (
                    <div
                      key={account.accountNumber}
                      className="flex items-center justify-between gap-3 rounded-[var(--radius-nav)] bg-surface p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-ink">
                          {account.bankName} · {account.accountNumber}
                        </p>
                        <p className="text-[10px] text-subtle">
                          Mandate {account.mandateStatus}
                          {account.blacklisted ? " · blacklisted" : ""}
                        </p>
                        {suspension.suspended && suspension.until ? (
                          <p className="mt-0.5 text-[10px] font-semibold text-warning-600">
                            Suspended until {relativeTime(suspension.until.toISOString())} —{" "}
                            {suspension.recentFailures} failures in 24h
                          </p>
                        ) : null}
                      </div>
                      <span className="tabular shrink-0 text-xs font-semibold text-ink">
                        {account.lastBalance === null
                          ? "Balance unknown"
                          : naira(account.lastBalance)}
                      </span>
                    </div>
                  )
                })}
                {accounts.length === 0 ? (
                  <p className="text-xs text-subtle">No BVN-linked accounts on file.</p>
                ) : null}
              </div>
            </DetailSection>

            <DetailSection title="Recent Activity" divided={false}>
              <div className="flex flex-col gap-3">
                {recoveryCase.attempts.length === 0 ? (
                  <p className="text-xs text-subtle">No debit attempts recorded yet.</p>
                ) : (
                  [...recoveryCase.attempts].reverse().map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between gap-3 rounded-[var(--radius-nav)] bg-surface p-2"
                    >
                      <span className="text-xs font-medium text-subtle">
                        Attempt {attempt.attemptNo} · {RAIL_LABEL[attempt.rail]} ·{" "}
                        {attempt.outcome === "FAILED" && attempt.failureReason
                          ? FAILURE_REASON_LABEL[attempt.failureReason]
                          : attempt.outcome === "PARTIAL"
                            ? `Partial ${naira(attempt.amountRecovered)}`
                            : "Success"}
                      </span>
                      <span className="shrink-0 text-[10px] italic text-subtle">
                        {relativeTime(attempt.attemptedAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </DetailSection>
          </div>
        </SheetContent>
      </Sheet>

      <ReasonDialog
        open={reasonOpen !== null}
        onOpenChange={(o) => !o && setReasonOpen(null)}
        action={
          reasonOpen === "pause"
            ? { id: "pause", label: "Pause Recovery", permission: "recovery.pause", requiresReason: true, tone: "outline" }
            : reasonOpen === "escalate"
              ? { id: "escalate", label: "Escalate", permission: "escalation.trigger", requiresReason: true, tone: "primary" }
              : null
        }
        category={reasonOpen === "pause" ? "pause" : "escalate"}
        subject={`${recoveryCase.reference} · ${recoveryCase.borrowerName}`}
        onConfirm={(reasonCode) =>
          reasonOpen === "pause" ? handlePauseConfirm(reasonCode) : handleEscalateConfirm(reasonCode)
        }
      />

      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}
