"use client"

import * as React from "react"
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react"

import { naira } from "@/lib/format"
import { BANKS } from "@/lib/data/banks"
import { CONSENTS } from "@/lib/data/operations"
import { TARIFFS } from "@/lib/domain/billing"
import { DEFAULT_POLICY } from "@/lib/domain/policy"
import { RAILS, RAIL_LABEL, type LinkedAccount, type Rail } from "@/lib/domain/types"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input, Label, Select } from "@/components/ui/input"

/**
 * Create Mandate wizard.
 *
 * The PRD requires mandate requests fan out to every BVN-linked account,
 * ordered preferred → highest historical inflow → backup — not one account
 * per submission. Steps: borrower + rail/loan details, review the full
 * fan-out list, success, and the two branch endings: bank rejection
 * (ACCOUNT_DORMANT) and the 24h validation-timeout exit state.
 */
type Step = "details" | "review" | "success" | "error" | "timeout"

/** Preferred first, then by inflow (highest first) among the rest, backup last. */
function prioritize(accounts: LinkedAccount[]): LinkedAccount[] {
  return [...accounts].sort((a, b) => {
    if (a.preferred !== b.preferred) return a.preferred ? -1 : 1
    if (a.backup !== b.backup) return a.backup ? 1 : -1
    return b.inflowScore - a.inflowScore
  })
}

export function CreateMandateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [step, setStep] = React.useState<Step>("details")
  const [consentId, setConsentId] = React.useState("")
  const [rail, setRail] = React.useState<Rail>("NDD")
  const [maxAmount, setMaxAmount] = React.useState("1000000")
  const [loanRef, setLoanRef] = React.useState("")
  const [validated, setValidated] = React.useState<Record<string, boolean>>({})

  React.useEffect(() => {
    if (open) {
      setStep("details")
      setConsentId("")
      setRail("NDD")
      setMaxAmount("1000000")
      setLoanRef("")
      setValidated({})
    }
  }, [open])

  function restart() {
    setStep("details")
    setConsentId("")
    setRail("NDD")
    setMaxAmount("1000000")
    setLoanRef("")
    setValidated({})
  }

  // Only borrowers with granted consent and at least one linked account.
  const eligible = CONSENTS.filter(
    (c) => c.status === "GRANTED" && c.linkedAccounts.length > 0
  )
  const consent = eligible.find((c) => c.id === consentId)
  const accounts = consent ? prioritize(consent.linkedAccounts) : []
  const primaryBank = accounts[0] ? BANKS.find((b) => b.code === accounts[0].bankCode) : undefined
  const dormantAccount = accounts.find((a) => a.mandateStatus === "FAILED")

  // NDD needs every bank in the fan-out to support direct debit.
  const railUnsupported =
    rail === "NDD" && accounts.some((a) => {
      const bank = BANKS.find((b) => b.code === a.bankCode)
      return bank !== undefined && !bank.supportsNdd
    })
  const detailsValid = consentId !== "" && Number(maxAmount) > 0 && loanRef !== ""

  const stillPending = accounts.filter((a) => !validated[a.accountNumber])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={
          step === "success"
            ? "Mandate Requests Sent"
            : step === "error"
              ? "Mandate Setup Failed"
              : step === "timeout"
                ? "Mandate Validation Not Completed"
                : "Create Mandate"
        }
        description={
          step === "details"
            ? "Mandate requests fan out to every BVN-linked account, not just one"
            : step === "review"
              ? "Confirm before submitting to every linked account"
              : undefined
        }
        footer={
          step === "details" ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                size="lg"
                className="sm:flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="sm:flex-1"
                disabled={!detailsValid || railUnsupported}
                onClick={() => setStep("review")}
              >
                Continue
              </Button>
            </div>
          ) : step === "review" ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                size="lg"
                className="sm:flex-1"
                onClick={() => setStep("details")}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="sm:flex-1"
                onClick={() => setStep(dormantAccount ? "error" : "success")}
              >
                Send to All Accounts
              </Button>
            </div>
          ) : step === "error" ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                size="lg"
                className="sm:flex-1"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="sm:flex-1"
                onClick={() => setStep("details")}
              >
                Try Alternate Account
              </Button>
            </div>
          ) : step === "timeout" ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                size="lg"
                className="sm:flex-1"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button variant="primary" size="lg" className="sm:flex-1" onClick={restart}>
                <RotateCcw className="size-4" />
                Restart Mandate Setup
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                size="lg"
                className="sm:flex-1"
                disabled={stillPending.length === 0}
                title={
                  stillPending.length === 0
                    ? undefined
                    : "Simulates every still-pending account passing 24h with no validation transfer."
                }
                onClick={() => setStep("timeout")}
              >
                Simulate 24h Elapsed (No Validation)
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="sm:flex-1"
                onClick={() => onOpenChange(false)}
              >
                Okay
              </Button>
            </div>
          )
        }
      >
        {step === "details" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cm-borrower">Borrower *</Label>
              <Select
                id="cm-borrower"
                value={consentId}
                onChange={(e) => setConsentId(e.target.value)}
              >
                <option value="">Select borrower</option>
                {eligible.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.borrowerName} — {c.linkedAccounts.length} linked account
                    {c.linkedAccounts.length === 1 ? "" : "s"}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-subtle">
                Only borrowers with granted iGree consent appear here.
              </p>
            </div>

            {accounts.length > 0 ? (
              <div className="flex flex-col gap-2">
                <Label>BVN-linked accounts (mandate sent to all, in this order)</Label>
                <div className="flex flex-col gap-1.5">
                  {accounts.map((a, i) => (
                    <div
                      key={a.accountNumber}
                      className="flex items-center justify-between gap-2 rounded-[var(--radius-control)] border border-stroke p-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-subtle">
                          {i + 1}
                        </span>
                        <span className="truncate text-xs font-medium text-ink">
                          {a.bankName} · {a.accountNumber}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {a.preferred ? <Badge tone="brand">Preferred</Badge> : null}
                        {a.backup ? <Badge tone="neutral">Backup</Badge> : null}
                        {!a.preferred && !a.backup ? (
                          <span className="text-[10px] text-subtle">
                            Inflow {Math.round(a.inflowScore * 100)}%
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <Label htmlFor="cm-rail">Recovery rail *</Label>
              <Select
                id="cm-rail"
                value={rail}
                onChange={(e) => setRail(e.target.value as Rail)}
              >
                {RAILS.filter((r) => r !== "EASY_PAY").map((r) => (
                  <option key={r} value={r}>
                    {RAIL_LABEL[r]}
                  </option>
                ))}
              </Select>
              {railUnsupported ? (
                <p className="text-xs text-error-600">
                  {primaryBank?.name ?? "One of these banks"} does not support NIBSS Direct
                  Debit. Select Remita instead.
                </p>
              ) : (
                <p className="text-xs text-subtle">
                  EasyPay is a fallback rail and does not use mandates.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="cm-loan">Loan reference *</Label>
              <Input
                id="cm-loan"
                value={loanRef}
                onChange={(e) => setLoanRef(e.target.value)}
                placeholder="e.g. LN-2024-0001"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="cm-max">Maximum debit amount *</Label>
              <Input
                id="cm-max"
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
              <p className="text-xs text-subtle">
                Mandate usage is restricted to this ceiling, the authorised loan and
                the approved recovery purpose.
              </p>
            </div>
          </div>
        ) : null}

        {step === "review" && consent ? (
          <div className="flex flex-col gap-4">
            <Alert tone="info" title="₦50 validation transfer required per account">
              Each account's borrower must complete the validation transfer within{" "}
              {DEFAULT_POLICY.mandate.validationWindowHours}h. Reminders fire at{" "}
              {DEFAULT_POLICY.mandate.reminderHours.join(", ")}h, then any account still
              unvalidated auto-cancels with exit state MANDATE VALIDATION NOT COMPLETED.
            </Alert>

            <div className="flex flex-col gap-3 rounded-[var(--radius-control)] bg-surface p-4">
              <ReviewRow label="Borrower">{consent.borrowerName}</ReviewRow>
              <ReviewRow label="BVN">{consent.bvnMasked}</ReviewRow>
              <ReviewRow label="Accounts">{accounts.length} (all linked)</ReviewRow>
              <ReviewRow label="Rail">{RAIL_LABEL[rail]}</ReviewRow>
              <ReviewRow label="Loan reference">{loanRef}</ReviewRow>
              <ReviewRow label="Maximum amount">{naira(Number(maxAmount))}</ReviewRow>
              <ReviewRow label="Mandate activation cost">
                {naira(TARIFFS.MANDATE_ACTIVATION.cost * accounts.length)} ({accounts.length}
                {" × "}
                {naira(TARIFFS.MANDATE_ACTIVATION.cost)})
              </ReviewRow>
              <ReviewRow label="Expiry">
                {DEFAULT_POLICY.mandate.mandateExpiryDays} days from approval
              </ReviewRow>
            </div>

            <p className="text-xs text-subtle">
              An idempotency key is attached per account automatically, so submitting
              twice cannot create duplicate mandates.
            </p>
          </div>
        ) : null}

        {step === "success" && consent ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <CheckCircle2 className="size-12 text-success-600" />
              <div>
                <p className="text-lg font-bold text-ink">
                  {accounts.length} mandate request{accounts.length === 1 ? "" : "s"} submitted
                </p>
                <p className="mt-1 text-sm text-subtle">
                  {consent.borrowerName} has been notified by SMS and email to validate
                  every request — the multi-account requirement notice was sent
                  alongside it.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {accounts.map((a) => (
                <div
                  key={a.accountNumber}
                  className="flex items-center justify-between gap-2 rounded-[var(--radius-control)] border border-stroke p-2.5"
                >
                  <span className="truncate text-xs font-medium text-ink">
                    {a.bankName} · {a.accountNumber}
                  </span>
                  {validated[a.accountNumber] ? (
                    <Badge tone="success" dot>
                      Validated
                    </Badge>
                  ) : (
                    <Badge tone="warning" dot>
                      Awaiting Customer
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {step === "error" ? (
          <div className="flex flex-col gap-4">
            <Alert tone="error" title="Bank rejected the mandate">
              {dormantAccount?.bankName} returned <code>ACCOUNT_DORMANT</code> for account{" "}
              {dormantAccount?.accountNumber}. That account has been flagged MANDATE FAILED
              and removed from the debit pool; the remaining accounts in the fan-out are
              unaffected.
            </Alert>
            <div className="flex flex-col gap-3 rounded-[var(--radius-control)] bg-surface p-4">
              <ReviewRow label="Retries used">1 of 2 permitted within 24h</ReviewRow>
              <ReviewRow label="Alternate accounts">
                {(accounts.length ?? 1) - 1} available on this BVN
              </ReviewRow>
              <ReviewRow label="Next step">
                Automatic mandate attempt on the next ranked account
              </ReviewRow>
            </div>
            <p className="text-xs text-subtle">
              If every linked account fails, the borrower reaches MANDATE SETUP FAILED
              ALL ACCOUNTS and recovery falls back to EasyPay.
            </p>
          </div>
        ) : null}

        {step === "timeout" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <XCircle className="size-12 text-error-600" />
              <div>
                <p className="text-lg font-bold text-ink">MANDATE VALIDATION NOT COMPLETED</p>
                <p className="mt-1 text-sm text-subtle">
                  {stillPending.length} of {accounts.length} account
                  {accounts.length === 1 ? "" : "s"} did not receive the ₦50 validation
                  transfer within {DEFAULT_POLICY.mandate.validationWindowHours}h and{" "}
                  {stillPending.length === 1 ? "has" : "have"} been auto-cancelled.
                </p>
              </div>
            </div>
            <Alert tone="warning" title="Loan officer notified">
              The assigned DRO/DRM has been sent the mandate.validation_timeout
              notification and this case now needs manual follow-up.
            </Alert>
            <p className="text-xs text-subtle">
              The borrower has been prompted to restart mandate setup from the
              beginning.
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function ReviewRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-medium text-body">{label}</span>
      <span className="text-right text-xs font-semibold text-ink">{children}</span>
    </div>
  )
}
