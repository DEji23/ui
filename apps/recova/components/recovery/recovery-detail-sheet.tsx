"use client"

import * as React from "react"
import { ArrowRight, Download, History, Pause, RotateCw } from "lucide-react"

import { naira, relativeTime } from "@/lib/format"
import { APP_NOW } from "@/lib/clock"
import { can } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import { DEFAULT_POLICY } from "@/lib/domain/policy"
import { accountsFor } from "@/lib/data/recovery-cases"
import { RAIL_HEALTH_MAP } from "@/lib/data/operations"
import { recommend } from "@/lib/domain/orchestration"
import { retryEligibility } from "@/lib/domain/state-machine"
import {
  FAILURE_REASON_LABEL,
  RAIL_LABEL,
  type RecoveryCase,
} from "@/lib/domain/types"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, DetailRow, DetailSection } from "@/components/ui/sheet"
import { RailBadge, RecoveryStatePill } from "@/components/shared/status-pill"

/**
 * Recovery Details panel — Figma "Side Modal (Active)".
 *
 * Beyond mirroring the layout, this panel is where the guardrails become
 * visible: the engine's recommendation is recomputed on open (the PRD calls
 * stale recommendations out as a critical edge case), and the retry button
 * is disabled with a stated reason whenever `retryEligibility` says no.
 */
export function RecoveryDetailSheet({
  recoveryCase,
  open,
  onOpenChange,
}: {
  recoveryCase: RecoveryCase | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
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

  const mayRetry = can(CURRENT_USER.role, "recovery.retry") && eligibility.allowed
  const mayEscalate = can(CURRENT_USER.role, "escalation.trigger")
  const mayPause = can(CURRENT_USER.role, "recovery.pause")

  const atRisk =
    recoveryCase.state === "AT_RISK" ||
    recoveryCase.state === "COLLECTIONS" ||
    recoveryCase.state === "RECOVERY_FAILED"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title="Recovery Details"
        footer={
          <>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button variant="soft" size="lg" className="flex-1">
                Download Record
                <Download />
              </Button>
              <Button variant="soft" size="lg" className="flex-1">
                View Audit History
                <History />
              </Button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {mayPause && !recoveryCase.recoveryPaused ? (
                <Button variant="outline" size="lg" className="sm:flex-1">
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
              >
                Escalate
                <ArrowRight />
              </Button>
            </div>
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
            <DetailRow label="Escalation Tier">{recoveryCase.tier}</DetailRow>
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
            >
              <RotateCw />
              {mayRetry ? "Retry Now" : "Retry Unavailable"}
            </Button>
          </DetailSection>

          <DetailSection title="Account Intelligence">
            <div className="flex flex-col gap-2">
              {accounts.map((account) => (
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
                  </div>
                  <span className="tabular shrink-0 text-xs font-semibold text-ink">
                    {account.lastBalance === null
                      ? "Balance unknown"
                      : naira(account.lastBalance)}
                  </span>
                </div>
              ))}
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
  )
}
