"use client"

import * as React from "react"
import { CheckCircle2, Circle, CircleDashed, PlayCircle, ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"

/**
 * ONB-E-10 — guided first-borrower sandbox walkthrough.
 *
 * Sandbox certification (Phase 6) proves every scenario passes in
 * isolation. This walks one synthetic borrower through the real sequence
 * — Consent, then Mandate, then a Recovery trigger — so the client sees
 * the phases connect end-to-end before Production Approval unlocks.
 */
const GUIDED_STEPS = [
  {
    key: "CONSENT",
    label: "Consent",
    detail:
      "A synthetic borrower grants iGree consent for account visibility and a recurring debit mandate.",
    confirmLabel: "Simulate consent grant",
  },
  {
    key: "MANDATE",
    label: "Mandate",
    detail:
      "The recurring debit mandate is registered against the consent and activated with the sandbox bank rail.",
    confirmLabel: "Simulate mandate activation",
  },
  {
    key: "RECOVERY_TRIGGER",
    label: "Recovery Trigger",
    detail:
      "A missed obligation is simulated on the borrower's loan, and the recovery engine attempts collection through the active mandate.",
    confirmLabel: "Simulate recovery trigger",
  },
] as const

type StepKey = (typeof GUIDED_STEPS)[number]["key"]

export function GuidedBorrowerTestCard({
  orgName,
  visible,
}: {
  orgName: string
  visible: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [stepIndex, setStepIndex] = React.useState(0)
  const [completed, setCompleted] = React.useState<Record<StepKey, boolean>>({
    CONSENT: false,
    MANDATE: false,
    RECOVERY_TRIGGER: false,
  })
  const [validated, setValidated] = React.useState(false)

  if (!visible) return null

  function start() {
    setStepIndex(0)
    setCompleted({ CONSENT: false, MANDATE: false, RECOVERY_TRIGGER: false })
    setOpen(true)
  }

  function confirmStep() {
    const step = GUIDED_STEPS[stepIndex]
    setCompleted((prev) => ({ ...prev, [step.key]: true }))
    if (stepIndex === GUIDED_STEPS.length - 1) {
      setValidated(true)
      setOpen(false)
    } else {
      setStepIndex((i) => i + 1)
    }
  }

  const allDone = GUIDED_STEPS.every((s) => completed[s.key])

  return (
    <>
      <Card className={cn("p-6", validated && "border border-success-200")}>
        <CardHeader className="flex-wrap items-center p-0 pb-4">
          <div>
            <CardTitle>Guided First-Borrower Test</CardTitle>
            <CardDescription>
              Walk one synthetic borrower through Consent → Mandate → Recovery Trigger in
              the sandbox before {orgName} goes live.
            </CardDescription>
          </div>
          {validated ? <Badge dot tone="success">Sandbox Validated</Badge> : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-0">
          <ol className="flex flex-wrap items-center gap-y-2">
            {GUIDED_STEPS.map((step, i) => {
              const done = validated || completed[step.key]
              return (
                <li key={step.key} className="flex items-center gap-1">
                  <span
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                      done
                        ? "border-success-200 bg-success-50 text-success-700"
                        : "border-stroke text-subtle"
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      <Circle className="size-3.5" />
                    )}
                    {step.label}
                  </span>
                  {i < GUIDED_STEPS.length - 1 ? (
                    <span className="px-1 text-xs text-muted">→</span>
                  ) : null}
                </li>
              )
            })}
          </ol>

          {validated ? (
            <div className="flex items-center gap-2 rounded-[var(--radius-control)] border border-success-200 bg-success-50 px-3 py-2 text-xs font-semibold text-success-700">
              <ShieldCheck className="size-4 shrink-0" />
              Sandbox-validated end-to-end — Consent, Mandate and Recovery Trigger all
              completed for a live synthetic borrower.
            </div>
          ) : null}

          <Button variant={validated ? "outline" : "soft"} size="md" block onClick={start}>
            <PlayCircle className="size-4" />
            {validated ? "Run Guided Borrower Test Again" : "Run Guided Borrower Test"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          title="Guided First-Borrower Test"
          description={`Step ${stepIndex + 1} of ${GUIDED_STEPS.length} — ${orgName}'s sandbox environment`}
          footer={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                size="lg"
                className="sm:flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="lg" className="sm:flex-1" onClick={confirmStep}>
                {GUIDED_STEPS[stepIndex].confirmLabel}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <ol className="flex flex-col gap-2">
              {GUIDED_STEPS.map((step, i) => {
                const done = completed[step.key]
                const current = i === stepIndex
                return (
                  <li
                    key={step.key}
                    className={cn(
                      "flex items-start gap-3 rounded-[var(--radius-control)] border p-3",
                      current
                        ? "border-brand bg-brand-subtle"
                        : done
                          ? "border-success-200 bg-success-50/50"
                          : "border-stroke"
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="size-4 shrink-0 text-success-600" />
                    ) : current ? (
                      <CircleDashed className="size-4 shrink-0 text-brand" />
                    ) : (
                      <Circle className="size-4 shrink-0 text-muted" />
                    )}
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          current ? "text-brand" : done ? "text-success-700" : "text-ink"
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="mt-0.5 text-xs text-subtle">{step.detail}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
            {allDone ? (
              <div className="flex items-center gap-2 rounded-[var(--radius-control)] border border-success-200 bg-success-50 px-3 py-2 text-xs font-semibold text-success-700">
                <ShieldCheck className="size-4 shrink-0" />
                All steps confirmed — closing marks this sandbox as validated.
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
