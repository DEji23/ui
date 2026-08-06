"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"

import { naira } from "@/lib/format"
import { BANKS } from "@/lib/data/banks"
import { CONSENTS } from "@/lib/data/operations"
import { TARIFFS } from "@/lib/domain/billing"
import { DEFAULT_POLICY } from "@/lib/domain/policy"
import { RAILS, RAIL_LABEL, type Rail } from "@/lib/domain/types"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input, Label, Select } from "@/components/ui/input"

/**
 * Create Mandate wizard.
 *
 * Three steps — borrower, account and rail, review — plus the failure state.
 * The account list is derived from granted iGree consents only, which is
 * the PRD's rule that a mandate can never precede consent.
 */
type Step = "details" | "review" | "success" | "error"

export function CreateMandateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [step, setStep] = React.useState<Step>("details")
  const [consentId, setConsentId] = React.useState("")
  const [accountNumber, setAccountNumber] = React.useState("")
  const [rail, setRail] = React.useState<Rail>("NDD")
  const [maxAmount, setMaxAmount] = React.useState("1000000")
  const [loanRef, setLoanRef] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setStep("details")
      setConsentId("")
      setAccountNumber("")
      setRail("NDD")
      setMaxAmount("1000000")
      setLoanRef("")
    }
  }, [open])

  // Only borrowers with granted consent and at least one linked account.
  const eligible = CONSENTS.filter(
    (c) => c.status === "GRANTED" && c.linkedAccounts.length > 0
  )
  const consent = eligible.find((c) => c.id === consentId)
  const account = consent?.linkedAccounts.find(
    (a) => a.accountNumber === accountNumber
  )
  const bank = account ? BANKS.find((b) => b.code === account.bankCode) : undefined

  // NDD needs the bank to support direct debit — the wizard's error branch.
  const railUnsupported = rail === "NDD" && bank !== undefined && !bank.supportsNdd
  const detailsValid =
    consentId !== "" && accountNumber !== "" && Number(maxAmount) > 0 && loanRef !== ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={
          step === "success"
            ? "Mandate Created"
            : step === "error"
              ? "Mandate Setup Failed"
              : "Create Mandate"
        }
        description={
          step === "details"
            ? "Mandates can only be created against a borrower with granted consent"
            : step === "review"
              ? "Confirm before submitting to the rail"
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
                onClick={() =>
                  // Dormant accounts fail at the bank, exercising the error state.
                  setStep(account?.mandateStatus === "FAILED" ? "error" : "success")
                }
              >
                Create Mandate
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
          ) : (
            <Button variant="primary" size="lg" block onClick={() => onOpenChange(false)}>
              Okay
            </Button>
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
                onChange={(e) => {
                  setConsentId(e.target.value)
                  setAccountNumber("")
                }}
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="cm-account">Account *</Label>
              <Select
                id="cm-account"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                disabled={!consent}
              >
                <option value="">
                  {consent ? "Select account" : "Select a borrower first"}
                </option>
                {consent?.linkedAccounts.map((a) => (
                  <option key={a.accountNumber} value={a.accountNumber}>
                    {a.bankName} — {a.accountNumber}
                    {a.mandateStatus === "ACTIVE" ? " (mandate active)" : ""}
                  </option>
                ))}
              </Select>
            </div>

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
                  {bank?.name} does not support NIBSS Direct Debit. Select Remita
                  instead.
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

        {step === "review" && consent && account ? (
          <div className="flex flex-col gap-4">
            <Alert tone="info" title="₦50 validation transfer required">
              The borrower must complete the validation transfer within{" "}
              {DEFAULT_POLICY.mandate.validationWindowHours}h. Reminders fire at{" "}
              {DEFAULT_POLICY.mandate.reminderHours.join(", ")}h, then the mandate
              auto-cancels.
            </Alert>

            <div className="flex flex-col gap-3 rounded-[var(--radius-control)] bg-surface p-4">
              <ReviewRow label="Borrower">{consent.borrowerName}</ReviewRow>
              <ReviewRow label="BVN">{consent.bvnMasked}</ReviewRow>
              <ReviewRow label="Account">
                {account.bankName} · {account.accountNumber}
              </ReviewRow>
              <ReviewRow label="Rail">{RAIL_LABEL[rail]}</ReviewRow>
              <ReviewRow label="Loan reference">{loanRef}</ReviewRow>
              <ReviewRow label="Maximum amount">{naira(Number(maxAmount))}</ReviewRow>
              <ReviewRow label="Mandate activation cost">
                {naira(TARIFFS.MANDATE_ACTIVATION.cost)}
              </ReviewRow>
              <ReviewRow label="Expiry">
                {DEFAULT_POLICY.mandate.mandateExpiryDays} days from approval
              </ReviewRow>
            </div>

            <p className="text-xs text-subtle">
              An idempotency key is attached automatically, so submitting twice cannot
              create two mandates.
            </p>
          </div>
        ) : null}

        {step === "success" ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 className="size-14 text-success-600" />
            <div>
              <p className="text-lg font-bold text-ink">Mandate request submitted</p>
              <p className="mt-1 text-sm text-subtle">
                Status is <strong>Pending Approval</strong> and validation is{" "}
                <strong>Awaiting Customer</strong>. The borrower has been sent the
                validation instruction by SMS and email.
              </p>
            </div>
            <Badge tone="warning" dot>
              Approval expected within 48h
            </Badge>
          </div>
        ) : null}

        {step === "error" ? (
          <div className="flex flex-col gap-4">
            <Alert tone="error" title="Bank rejected the mandate">
              {account?.bankName} returned <code>ACCOUNT_DORMANT</code>. The account
              has been flagged MANDATE FAILED and removed from the debit pool.
            </Alert>
            <div className="flex flex-col gap-3 rounded-[var(--radius-control)] bg-surface p-4">
              <ReviewRow label="Retries used">1 of 2 permitted within 24h</ReviewRow>
              <ReviewRow label="Alternate accounts">
                {(consent?.linkedAccounts.length ?? 1) - 1} available on this BVN
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
