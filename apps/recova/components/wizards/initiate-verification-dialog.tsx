"use client"

import * as React from "react"
import { CheckCircle2, ShieldOff, Smartphone, UserRoundX, WalletCards } from "lucide-react"

import { naira } from "@/lib/format"
import { IGREE_ONBOARDING_COST, TARIFFS } from "@/lib/domain/billing"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input, Label, Select } from "@/components/ui/input"

/**
 * iGree verification journey.
 *
 * Covers the happy path and all three documented failure exits:
 * consent declined, identity verification failed (3 OTP retries then a 24h
 * lockout), and no BVN-linked accounts.
 */
type Step = "details" | "otp" | "consent" | "success" | "declined" | "otp_failed" | "no_accounts"

const CHANNELS = [
  { value: "SMS_OTP", label: "SMS OTP" },
  { value: "USSD", label: "USSD" },
  { value: "BANK_APP", label: "Bank app" },
]

export function InitiateVerificationDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [step, setStep] = React.useState<Step>("details")
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [bvn, setBvn] = React.useState("")
  const [channel, setChannel] = React.useState("SMS_OTP")
  const [otp, setOtp] = React.useState("")
  const [attempts, setAttempts] = React.useState(0)

  React.useEffect(() => {
    if (open) {
      setStep("details")
      setFirstName("")
      setLastName("")
      setPhone("")
      setEmail("")
      setBvn("")
      setChannel("SMS_OTP")
      setOtp("")
      setAttempts(0)
    }
  }, [open])

  const detailsValid =
    firstName !== "" &&
    lastName !== "" &&
    /^\+?\d{10,14}$/.test(phone.replace(/\s/g, "")) &&
    /.+@.+\..+/.test(email) &&
    /^\d{11}$/.test(bvn)

  function submitOtp() {
    // 000000 forces the failure branch; any other 6 digits succeeds.
    if (otp === "000000") {
      const next = attempts + 1
      setAttempts(next)
      setOtp("")
      if (next >= 3) setStep("otp_failed")
      return
    }
    // BVNs ending 0 simulate the no-linked-accounts exit.
    setStep(bvn.endsWith("0") ? "no_accounts" : "consent")
  }

  const titles: Record<Step, string> = {
    details: "Initiate Verification",
    otp: "Enter OTP",
    consent: "Grant Consent",
    success: "Verification Complete",
    declined: "Consent Declined",
    otp_failed: "Identity Verification Failed",
    no_accounts: "No Linked Accounts",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={titles[step]}
        description={
          step === "details"
            ? "Collects basic data, then hands the borrower to iGree for BVN authentication"
            : undefined
        }
        footer={footerFor()}
      >
        {step === "details" ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Borrower first name *" id="iv-first">
                <Input
                  id="iv-first"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Emeka"
                />
              </Field>
              <Field label="Borrower last name *" id="iv-last">
                <Input
                  id="iv-last"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Okonkwo"
                />
              </Field>
            </div>

            <Field label="Phone number *" id="iv-phone">
              <Input
                id="iv-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +234 801 234 5678"
              />
            </Field>

            <Field label="Email address *" id="iv-email">
              <Input
                id="iv-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. emeka@example.com"
              />
            </Field>

            <Field label="BVN *" id="iv-bvn">
              <Input
                id="iv-bvn"
                value={bvn}
                onChange={(e) => setBvn(e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder="11 digits"
              />
              {bvn !== "" && bvn.length !== 11 ? (
                <p className="mt-1 text-xs text-error-600">A BVN is exactly 11 digits.</p>
              ) : null}
            </Field>

            <Field label="Authentication channel *" id="iv-channel">
              <Select
                id="iv-channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                {CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Alert tone="info" title={`Onboarding cost ${naira(IGREE_ONBOARDING_COST)}`}>
              SMS OTP {naira(TARIFFS.IGREE_SMS_OTP.cost)}, consent{" "}
              {naira(TARIFFS.IGREE_CONSENT.cost)}, BVN validation{" "}
              {naira(TARIFFS.IGREE_BVN_DATA.cost)}, linked accounts{" "}
              {naira(TARIFFS.IGREE_LINKED_ACCOUNTS.cost)}. A ₦50 consent execution
              debit is also raised against the primary account.
            </Alert>
          </div>
        ) : null}

        {step === "otp" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <Smartphone className="size-12 text-brand" />
              <p className="text-sm text-body">
                An OTP has been sent to <strong>{phone}</strong> via{" "}
                {CHANNELS.find((c) => c.value === channel)?.label}.
              </p>
            </div>

            <Field label="One-time password" id="iv-otp">
              <Input
                id="iv-otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6 digits"
                className="text-center text-lg tracking-[0.5em]"
              />
            </Field>

            {attempts > 0 ? (
              <Alert tone="warning" title={`${attempts} of 3 attempts used`}>
                After three failed attempts the borrower is locked out for 24 hours and
                both borrower and loan officer are notified.
              </Alert>
            ) : (
              <p className="text-center text-xs text-subtle">
                Enter 000000 to exercise the failure path.
              </p>
            )}
          </div>
        ) : null}

        {step === "consent" ? (
          <div className="flex flex-col gap-4">
            <Alert tone="info" title="Borrower consent language">
              Consent covers identity data and every account linked to this BVN.
              Recovery may be attempted against any of those accounts under the terms
              of the loan agreement.
            </Alert>
            <div className="rounded-[var(--radius-control)] bg-surface p-4 text-xs leading-relaxed text-body">
              <p className="font-semibold text-ink">Scope requested</p>
              <ul className="mt-2 flex list-disc flex-col gap-1 pl-4">
                <li>BVN identity verification</li>
                <li>Discovery of all BVN-linked bank accounts</li>
                <li>Creation of direct debit mandates for loan repayment</li>
                <li>Recovery debits within the agreed mandate limits</li>
              </ul>
              <p className="mt-3 text-subtle">
                The consent record is stored with version, scope, timestamp,
                authentication channel and expiry as NDPA evidence.
              </p>
            </div>
          </div>
        ) : null}

        {step === "success" ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 className="size-14 text-success-600" />
            <div>
              <p className="text-lg font-bold text-ink">Consent granted</p>
              <p className="mt-1 text-sm text-subtle">
                Identity verified and BVN-linked accounts retrieved. Mandate creation
                is now unlocked for {firstName} {lastName}.
              </p>
            </div>
          </div>
        ) : null}

        {step === "declined" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <ShieldOff className="size-12 text-error-600" />
              <p className="text-sm text-body">
                iGree returned <code>consent_denied</code>. The loan application is
                halted automatically and no further workflow runs.
              </p>
            </div>
            <Alert tone="error" title="Exit state: ONBOARDING FAILED — CONSENT DENIED">
              Borrower notified: &ldquo;We cannot proceed without your consent to
              verify your BVN details.&rdquo; The loan officer's dashboard now shows
              this application as Stalled.
            </Alert>
          </div>
        ) : null}

        {step === "otp_failed" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <UserRoundX className="size-12 text-error-600" />
              <p className="text-sm text-body">
                Three OTP attempts failed. The borrower is locked out for 24 hours.
              </p>
            </div>
            <Alert tone="error" title="Exit state: ONBOARDING FAILED — IDENTITY VERIFICATION">
              Both the borrower and the loan officer have been notified. Verification
              can be re-initiated after the lockout expires.
            </Alert>
          </div>
        ) : null}

        {step === "no_accounts" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <WalletCards className="size-12 text-warning-600" />
              <p className="text-sm text-body">
                iGree returned identity data but no active accounts tied to this BVN.
              </p>
            </div>
            <Alert tone="warning" title="Exit state: ONBOARDING FAILED — NO LINKED ACCOUNTS">
              The borrower has been asked to update KYC with their bank. The loan
              cannot proceed until at least one account is linked.
            </Alert>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )

  function footerFor() {
    if (step === "details") {
      return (
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
            disabled={!detailsValid}
            onClick={() => setStep("otp")}
          >
            Proceed To Verification
          </Button>
        </div>
      )
    }
    if (step === "otp") {
      return (
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
            disabled={otp.length !== 6}
            onClick={submitOtp}
          >
            Verify OTP
          </Button>
        </div>
      )
    }
    if (step === "consent") {
      return (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="dangerSoft"
            size="lg"
            className="sm:flex-1"
            onClick={() => setStep("declined")}
          >
            Decline
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="sm:flex-1"
            onClick={() => setStep("success")}
          >
            Grant Consent
          </Button>
        </div>
      )
    }
    return (
      <Button variant="primary" size="lg" block onClick={() => onOpenChange(false)}>
        Okay
      </Button>
    )
  }
}

function Field({
  label,
  id,
  children,
}: {
  label: string
  id: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}
