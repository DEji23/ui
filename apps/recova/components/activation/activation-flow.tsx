"use client"

import * as React from "react"
import Link from "next/link"
import {
  CheckCircle2,
  Circle,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { userById, updateUser, type AppUser } from "@/lib/data/users"
import { ROLE_LABEL } from "@/lib/domain/rbac"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input, Label } from "@/components/ui/input"

type Step = "password" | "mfa" | "policies" | "done"

const STEPS: Array<{ key: Step; label: string }> = [
  { key: "password", label: "Set Password" },
  { key: "mfa", label: "Enrol MFA" },
  { key: "policies", label: "Accept Policies" },
]

const PASSWORD_RULES: Array<{ test: (pw: string) => boolean; label: string }> = [
  { test: (pw) => pw.length >= 8, label: "At least 8 characters" },
  { test: (pw) => /[A-Z]/.test(pw), label: "One uppercase letter" },
  { test: (pw) => /[a-z]/.test(pw), label: "One lowercase letter" },
  { test: (pw) => /[0-9]/.test(pw), label: "One number" },
  { test: (pw) => /[^A-Za-z0-9]/.test(pw), label: "One special character" },
]

function generateMfaCode(): string {
  return String(Math.floor(100_000 + Math.random() * 900_000))
}

/**
 * Phase 2 — Account Activation: password, MFA enrolment, AUP + Data Privacy
 * Policy acceptance, in the exact order lib/domain/onboarding.ts's
 * INTERNAL_PHASES.ACCOUNT_ACTIVATION lists them. Completing every step is
 * what actually produces the "Account Activated" status transition — there
 * is no shortcut path.
 */
export function ActivationFlow({ userId }: { userId: string }) {
  const [user, setUser] = React.useState<AppUser | undefined>(() => userById(userId))
  const [step, setStep] = React.useState<Step>("password")

  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [passwordError, setPasswordError] = React.useState<string | null>(null)

  const [mfaCode] = React.useState(generateMfaCode)
  const [mfaInput, setMfaInput] = React.useState("")
  const [mfaError, setMfaError] = React.useState<string | null>(null)
  const [mfaAttempts, setMfaAttempts] = React.useState(0)

  const [aupAccepted, setAupAccepted] = React.useState(false)
  const [privacyAccepted, setPrivacyAccepted] = React.useState(false)

  if (!user) return null
  // Narrow once, outside the closures below — TS doesn't carry the guard's
  // narrowing into nested function declarations that read the outer `user`.
  const currentUser = user

  const stepIndex = STEPS.findIndex((s) => s.key === step)

  function submitPassword() {
    const unmet = PASSWORD_RULES.filter((r) => !r.test(password))
    if (unmet.length > 0) {
      setPasswordError(
        `Password does not meet requirements: ${unmet.map((r) => r.label.toLowerCase()).join(", ")}.`
      )
      return
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.")
      return
    }
    setPasswordError(null)
    setStep("mfa")
  }

  function submitMfa() {
    if (mfaInput.trim() !== mfaCode) {
      setMfaAttempts((n) => n + 1)
      setMfaError("Incorrect code. Check your authenticator app and try again.")
      return
    }
    setMfaError(null)
    setStep("policies")
  }

  function completeActivation() {
    const updated = updateUser(currentUser.id, {
      status: "Account Activated",
      mfa: true,
      tempPassword: null,
    })
    setUser(updated ?? currentUser)
    setStep("done")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-[var(--radius-control)] bg-brand text-white">
            <ShieldCheck className="size-5" />
          </div>
          <span className="text-lg font-bold text-ink">RECOVA</span>
        </div>

        <Card className="p-6">
          {step !== "done" ? (
            <>
              <CardHeader className="p-0 pb-4">
                <div>
                  <CardTitle>Activate your account</CardTitle>
                  <CardDescription>
                    {user.name} · {user.email} · {ROLE_LABEL[user.role]}
                  </CardDescription>
                </div>
              </CardHeader>

              <ol className="mb-6 flex items-center gap-2">
                {STEPS.map((s, i) => (
                  <li key={s.key} className="flex flex-1 items-center gap-2">
                    <span
                      className={
                        i < stepIndex
                          ? "flex size-6 shrink-0 items-center justify-center rounded-full bg-success-500 text-[11px] font-bold text-white"
                          : i === stepIndex
                            ? "flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white"
                            : "flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-subtle"
                      }
                    >
                      {i < stepIndex ? <CheckCircle2 className="size-3.5" /> : i + 1}
                    </span>
                    <span className="hidden text-xs font-medium text-subtle sm:inline">
                      {s.label}
                    </span>
                    {i < STEPS.length - 1 ? (
                      <span className="h-px flex-1 bg-stroke" />
                    ) : null}
                  </li>
                ))}
              </ol>
            </>
          ) : null}

          <CardContent className="p-0">
            {step === "password" ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-subtle">
                  You were sent a temporary password with your invitation. Set a
                  permanent password to continue.
                </p>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="new-password">New password *</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirm-password">Confirm password *</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <ul className="flex flex-col gap-1.5 rounded-[var(--radius-control)] bg-surface p-3">
                  {PASSWORD_RULES.map((rule) => {
                    const met = rule.test(password)
                    return (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-2 text-xs ${met ? "text-success-700" : "text-subtle"}`}
                      >
                        {met ? (
                          <CheckCircle2 className="size-3.5 shrink-0" />
                        ) : (
                          <Circle className="size-3.5 shrink-0" />
                        )}
                        {rule.label}
                      </li>
                    )
                  })}
                </ul>
                {passwordError ? (
                  <Alert tone="error" title="Password rejected">
                    {passwordError}
                  </Alert>
                ) : null}
                <Button variant="primary" size="lg" block onClick={submitPassword}>
                  <KeyRound className="size-4" />
                  Continue
                </Button>
              </div>
            ) : null}

            {step === "mfa" ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-subtle">
                  Enter the 6-digit code from your authenticator app to enrol MFA.
                </p>
                <Alert tone="info" title="Demo mode">
                  This is a frontend-only prototype with no real authenticator —
                  your code is <span className="font-mono font-bold">{mfaCode}</span>.
                  Enter a different code to see the rejection path.
                </Alert>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="mfa-code">6-digit code *</Label>
                  <Input
                    id="mfa-code"
                    inputMode="numeric"
                    maxLength={6}
                    value={mfaInput}
                    onChange={(e) => setMfaInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="font-mono tracking-[0.3em]"
                  />
                </div>
                {mfaError ? (
                  <Alert tone="error" title="Enrolment failed">
                    {mfaError} Attempt {mfaAttempts} recorded — this does not activate
                    the account.
                  </Alert>
                ) : null}
                <Button variant="primary" size="lg" block onClick={submitMfa}>
                  <ShieldCheck className="size-4" />
                  Verify Code
                </Button>
              </div>
            ) : null}

            {step === "policies" ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-subtle">
                  Read and accept both policies to complete activation.
                </p>
                <label className="flex items-start gap-3 rounded-[var(--radius-control)] border border-stroke p-3 text-sm text-body">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 accent-[var(--color-brand)]"
                    checked={aupAccepted}
                    onChange={(e) => setAupAccepted(e.target.checked)}
                  />
                  I have read and accept the <strong>Acceptable Use Policy</strong>.
                </label>
                <label className="flex items-start gap-3 rounded-[var(--radius-control)] border border-stroke p-3 text-sm text-body">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 accent-[var(--color-brand)]"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  />
                  I have read and accept the <strong>Data Privacy Policy</strong>.
                </label>
                <Button
                  variant="primary"
                  size="lg"
                  block
                  disabled={!aupAccepted || !privacyAccepted}
                  title={
                    !aupAccepted || !privacyAccepted
                      ? "Both policies must be accepted to continue."
                      : undefined
                  }
                  onClick={completeActivation}
                >
                  <Sparkles className="size-4" />
                  Complete Activation
                </Button>
              </div>
            ) : null}

            {step === "done" ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-success-50 text-success-600">
                  <CheckCircle2 className="size-8" />
                </div>
                <div>
                  <p className="text-lg font-bold text-ink">Account Activated</p>
                  <p className="mt-1 text-sm text-subtle">
                    Password set, MFA enrolled, and both policies accepted.
                  </p>
                </div>
                <Badge dot tone="info">
                  Status: Account Activated
                </Badge>
                <p className="text-xs text-subtle">
                  An administrator will provision your {ROLE_LABEL[user.role]} role
                  next. You&apos;ll be notified once your access is ready.
                </p>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold text-brand hover:underline"
                >
                  Return to RECOVA
                </Link>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
