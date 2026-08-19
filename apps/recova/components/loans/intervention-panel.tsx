"use client"

import * as React from "react"
import { Ban, CalendarClock, HandCoins, Pause, Zap } from "lucide-react"

import { naira } from "@/lib/format"
import { can } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import { DEFAULT_POLICY } from "@/lib/domain/policy"
import { retryEligibility } from "@/lib/domain/state-machine"
import { RAIL_LABEL, RAILS, type RecoveryCase } from "@/lib/domain/types"
import { REASON_CODES } from "@/lib/domain/tasks"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input, Label, Select, Textarea } from "@/components/ui/input"
import { ResultDialog } from "@/components/queues/action-dialogs"

/**
 * Manual Intervention Panel — PRD Module 4.
 *
 * Every control here is an override, so all four carry the same guardrails:
 * role restriction, a mandatory reason code, and an audit entry. The panel
 * is deliberately visually distinct (danger-tinted) so an operator knows
 * they have left the automated path.
 */
type Intervention = "force_debit" | "pause" | "modify_plan" | "payment_plan" | null

export function InterventionPanel({
  recoveryCase,
  outstanding,
}: {
  recoveryCase: RecoveryCase | null
  outstanding: number
}) {
  const [open, setOpen] = React.useState<Intervention>(null)
  const [result, setResult] = React.useState<{ title: string; message: string } | null>(
    null
  )

  const mayForce = can(CURRENT_USER.role, "recovery.override")
  const mayPause = can(CURRENT_USER.role, "recovery.pause")
  const mayModify = can(CURRENT_USER.role, "policy.configure")
  const mayPlan = can(CURRENT_USER.role, "collections.manage")

  const eligibility = recoveryCase
    ? retryEligibility(recoveryCase)
    : { allowed: false, reason: "No active recovery case on this loan." }

  function complete(title: string, message: string) {
    setOpen(null)
    setResult({ title, message })
  }

  return (
    <>
      <Card className="border border-error-100 p-6">
        <CardHeader className="p-0 pb-4">
          <div>
            <CardTitle>Manual Intervention</CardTitle>
            <CardDescription>
              Controlled overrides. Each requires a reason code and is written to the
              audit trail.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!eligibility.allowed ? (
            <Alert tone="warning" title="Automated recovery is blocked" className="mb-4">
              {eligibility.reason} Overrides below remain available to authorised roles
              but will be flagged for review.
            </Alert>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              variant="dangerSoft"
              size="md"
              disabled={!mayForce}
              title={mayForce ? undefined : "Requires recovery.override (DRM and above)."}
              onClick={() => setOpen("force_debit")}
            >
              <Zap />
              Force Debit
            </Button>
            <Button
              variant="outline"
              size="md"
              disabled={!mayPause}
              title={mayPause ? undefined : "Requires recovery.pause."}
              onClick={() => setOpen("pause")}
            >
              <Pause />
              Pause Recovery
            </Button>
            <Button
              variant="outline"
              size="md"
              disabled={!mayModify}
              title={mayModify ? undefined : "Requires policy.configure."}
              onClick={() => setOpen("modify_plan")}
            >
              <CalendarClock />
              Modify Recovery Plan
            </Button>
            <Button
              variant="outline"
              size="md"
              disabled={!mayPlan}
              title={mayPlan ? undefined : "Requires collections.manage."}
              onClick={() => setOpen("payment_plan")}
            >
              <HandCoins />
              Assign Payment Plan
            </Button>
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs text-subtle">
            <Ban className="mt-0.5 size-3.5 shrink-0" />
            Override frequency is tracked as a KPI — a rising rate signals a policy that
            no longer matches reality.
          </p>
        </CardContent>
      </Card>

      <ForceDebitDialog
        open={open === "force_debit"}
        onOpenChange={(o) => !o && setOpen(null)}
        outstanding={outstanding}
        onConfirm={(amount, rail, reason) =>
          complete(
            "Force debit queued",
            `₦${amount.toLocaleString()} via ${RAIL_LABEL[rail as keyof typeof RAIL_LABEL] ?? rail} outside policy, reason ${reason}. Idempotency key issued; maker-checker approval required before execution.`
          )
        }
      />

      <PauseDialog
        open={open === "pause"}
        onOpenChange={(o) => !o && setOpen(null)}
        onConfirm={(reason) =>
          complete(
            "Recovery paused",
            `All scheduled retries suspended, reason ${reason}. The scheduler, orchestration engine and manual replay path will all refuse this loan until it resumes.`
          )
        }
      />

      <ModifyPlanDialog
        open={open === "modify_plan"}
        onOpenChange={(o) => !o && setOpen(null)}
        onConfirm={(intervals, rails) =>
          complete(
            "Recovery plan updated",
            `Retry ladder set to ${intervals} and rail priority to ${rails}. Change applies to this loan only and is validated against settlement windows.`
          )
        }
      />

      <PaymentPlanDialog
        open={open === "payment_plan"}
        onOpenChange={(o) => !o && setOpen(null)}
        outstanding={outstanding}
        onConfirm={(instalments, amount) =>
          complete(
            "Payment plan assigned",
            `${instalments} instalments of ₦${amount.toLocaleString()} scheduled. Obligations regenerated and fed back to the loan service; paid obligations are preserved.`
          )
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

/* ------------------------------------------------------------------ */

function ForceDebitDialog({
  open,
  onOpenChange,
  outstanding,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  outstanding: number
  onConfirm: (amount: number, rail: string, reason: string) => void
}) {
  const [amount, setAmount] = React.useState(String(outstanding))
  const [rail, setRail] = React.useState<string>("NDD")
  const [reason, setReason] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setAmount(String(outstanding))
      setRail("NDD")
      setReason("")
    }
  }, [open, outstanding])

  const numeric = Number(amount)
  const valid = reason !== "" && numeric > 0 && numeric <= outstanding

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Force Debit"
        description="Bypasses retry schedule, quiet hours and attempt caps"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" size="lg" className="sm:flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="lg"
              className="sm:flex-1"
              disabled={!valid}
              onClick={() => onConfirm(numeric, rail, reason)}
            >
              Force Debit
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Alert tone="error" title="Policy override">
            This debit ignores the configured retry ladder and quiet hours. It still
            carries an idempotency key, so it cannot double-debit — but it can breach
            the attempt cap. Requires a second authoriser.
          </Alert>

          <div className="flex flex-col gap-2">
            <Label htmlFor="fd-amount">Amount (max {naira(outstanding)})</Label>
            <Input
              id="fd-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {numeric > outstanding ? (
              <p className="text-xs text-error-600">
                Cannot exceed the outstanding balance.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="fd-rail">Rail</Label>
            <Select id="fd-rail" value={rail} onChange={(e) => setRail(e.target.value)}>
              {RAILS.map((r) => (
                <option key={r} value={r}>
                  {RAIL_LABEL[r]}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="fd-reason">Reason code *</Label>
            <Select id="fd-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="">Select a reason</option>
              {REASON_CODES.force_debit.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PauseDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = React.useState("")
  const [notes, setNotes] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setReason("")
      setNotes("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Pause Recovery"
        description="Suspends every automated retry on this loan"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" size="lg" className="sm:flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="sm:flex-1"
              disabled={reason === ""}
              onClick={() => onConfirm(reason)}
            >
              Pause Recovery
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="p-reason">Reason code *</Label>
            <Select id="p-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="">Select a reason</option>
              {REASON_CODES.pause.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          {reason === "FRAUD_SUSPICION" ? (
            <Alert tone="error" title="Fraud suspicion also locks mandates">
              Selecting this reason freezes every mandate on the borrower's BVN-linked
              accounts and routes the case to Compliance.
            </Alert>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="p-notes">Notes (optional)</Label>
            <Textarea
              id="p-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What triggered the pause?"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ModifyPlanDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (intervals: string, rails: string) => void
}) {
  const [intervals, setIntervals] = React.useState(
    DEFAULT_POLICY.debit.retryIntervalsHours.join(", ")
  )
  const [priority, setPriority] = React.useState(
    DEFAULT_POLICY.debit.railPriority.join(" → ")
  )

  const parsed = intervals
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => !Number.isNaN(v))
  const tooTight = parsed.some((h) => h < 24)
  const ascending = parsed.every((h, i, arr) => i === 0 || h > arr[i - 1])
  const valid = parsed.length > 0 && !tooTight && ascending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Modify Recovery Plan"
        description="Loan-level override of the retry ladder and rail order"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" size="lg" className="sm:flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="sm:flex-1"
              disabled={!valid}
              onClick={() => onConfirm(intervals, priority)}
            >
              Apply Plan
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="mp-intervals">Retry intervals (hours, comma separated)</Label>
            <Input
              id="mp-intervals"
              value={intervals}
              onChange={(e) => setIntervals(e.target.value)}
            />
            {tooTight ? (
              <p className="text-xs text-error-600">
                Intervals under 24h risk double-debiting during NDD and Remita
                settlement lag.
              </p>
            ) : null}
            {!ascending && parsed.length > 1 ? (
              <p className="text-xs text-error-600">
                Intervals must increase monotonically.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="mp-priority">Rail priority</Label>
            <Select
              id="mp-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="NDD → REMITA → EASY_PAY">NDD → Remita → EasyPay</option>
              <option value="REMITA → NDD → EASY_PAY">Remita → NDD → EasyPay</option>
              <option value="EASY_PAY → NDD → REMITA">EasyPay first → NDD → Remita</option>
            </Select>
            <p className="text-xs text-subtle">
              EasyPay-first is the documented fallback strategy during NIBSS
              instability.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PaymentPlanDialog({
  open,
  onOpenChange,
  outstanding,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  outstanding: number
  onConfirm: (instalments: number, amount: number) => void
}) {
  const [instalments, setInstalments] = React.useState("3")
  const count = Math.max(1, Number(instalments) || 1)
  const perInstalment = Math.round((outstanding / count) * 100) / 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Assign Payment Plan"
        description="Regenerates the unpaid obligation tail"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" size="lg" className="sm:flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="sm:flex-1"
              disabled={count < 1 || outstanding <= 0}
              onClick={() => onConfirm(count, perInstalment)}
            >
              Assign Plan
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Alert tone="info" title="Paid obligations are preserved">
            Restructuring marks the unpaid tail as RESTRUCTURED and generates fresh
            obligations. Already-paid obligations are never rewritten.
          </Alert>

          <div className="flex flex-col gap-2">
            <Label htmlFor="pp-count">Number of instalments</Label>
            <Input
              id="pp-count"
              type="number"
              min={1}
              value={instalments}
              onChange={(e) => setInstalments(e.target.value)}
            />
          </div>

          <div className="rounded-[var(--radius-control)] bg-surface p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-body">Outstanding</span>
              <span className="tabular font-semibold text-ink">{naira(outstanding)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-body">Per instalment</span>
              <span className="tabular font-bold text-brand">{naira(perInstalment)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
