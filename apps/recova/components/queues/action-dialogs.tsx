"use client"

import * as React from "react"

import { REASON_CODES, type ReasonCategory, type TaskAction } from "@/lib/domain/tasks"
import { AGENTS } from "@/lib/data/tasks"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Label, Select, Textarea } from "@/components/ui/input"

/**
 * Reason-capture dialog.
 *
 * PRD Module 4 guardrail: "mandatory reason logging". The confirm button
 * stays disabled until a reason code is chosen, so an override cannot reach
 * the audit log without one.
 */
export function ReasonDialog({
  open,
  onOpenChange,
  action,
  category,
  subject,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: TaskAction | null
  category: ReasonCategory
  subject: string
  onConfirm: (reasonCode: string, notes: string) => void
}) {
  const [reasonCode, setReasonCode] = React.useState("")
  const [notes, setNotes] = React.useState("")

  // Reset whenever a different action opens the dialog.
  React.useEffect(() => {
    if (open) {
      setReasonCode("")
      setNotes("")
    }
  }, [open, action?.id])

  if (!action) return null

  const options = REASON_CODES[category]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={action.label}
        description={subject}
        footer={
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
              variant={action.tone === "danger" ? "danger" : "primary"}
              size="lg"
              className="sm:flex-1"
              disabled={reasonCode === ""}
              title={reasonCode === "" ? "Select a reason code to continue." : undefined}
              onClick={() => {
                onConfirm(reasonCode, notes)
                onOpenChange(false)
              }}
            >
              Confirm {action.label}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Alert tone="warning" title="This action is logged">
            Your identity, the timestamp, the reason code, and the previous and new
            state are written to the immutable audit trail.
          </Alert>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reason-code">Reason code *</Label>
            <Select
              id="reason-code"
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
            >
              <option value="">Select a reason</option>
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reason-notes">Additional notes (optional)</Label>
            <Textarea
              id="reason-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Context that a reviewer would need later…"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Assignment dialog — round-robin and load-balanced allocation are automatic,
 *  so this covers the manual override path only. */
export function AssignDialog({
  open,
  onOpenChange,
  subject,
  currentAssignee,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: string
  currentAssignee: string | null
  onConfirm: (assignee: string) => void
}) {
  const [assignee, setAssignee] = React.useState(currentAssignee ?? "")

  React.useEffect(() => {
    if (open) setAssignee(currentAssignee ?? "")
  }, [open, currentAssignee])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Assign Task"
        description={subject}
        footer={
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
              disabled={assignee === ""}
              onClick={() => {
                onConfirm(assignee)
                onOpenChange(false)
              }}
            >
              Assign
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="assignee">Assign to</Label>
          <Select
            id="assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            <option value="">Select an operator</option>
            {AGENTS.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name} — {a.role}
              </option>
            ))}
          </Select>
          <p className="mt-2 text-xs text-subtle">
            Assignment moves the task from OPEN to ASSIGNED and notifies the operator.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Confirmation shown after an action completes. */
export function ResultDialog({
  open,
  onOpenChange,
  title,
  message,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={title}
        footer={
          <Button
            variant="primary"
            size="lg"
            block
            onClick={() => onOpenChange(false)}
          >
            Okay
          </Button>
        }
      >
        <Alert tone="success" title="Action recorded">
          {message}
        </Alert>
      </DialogContent>
    </Dialog>
  )
}
