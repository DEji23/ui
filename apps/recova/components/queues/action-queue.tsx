"use client"

import * as React from "react"
import { Lock, Sparkles, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import { naira, relativeTime } from "@/lib/format"
import { can } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import { TASKS } from "@/lib/data/tasks"
import { RECOVERY_CASES } from "@/lib/data/recovery-cases"
import {
  TASK_ACTIONS,
  TASK_STATUS_LABEL,
  guardAction,
  isBreachingSla,
  isRecommendationStale,
  sortByPriority,
  type ReasonCategory,
  type Task,
  type TaskAction,
  type TaskStatus,
  type TaskType,
} from "@/lib/domain/tasks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, type TabItem } from "@/components/ui/tabs"
import { EmptyState } from "@/components/shared/empty-state"
import { QueueToolbar } from "@/components/shared/queue-toolbar"
import { AssignDialog, ReasonDialog, ResultDialog } from "./action-dialogs"

type Tone = "neutral" | "success" | "warning" | "error" | "info" | "purple" | "brand"

const PRIORITY_TONE: Record<Task["priority"], Tone> = {
  CRITICAL: "error",
  HIGH: "warning",
  MEDIUM: "info",
  LOW: "neutral",
}

const STATUS_TONE: Record<TaskStatus, Tone> = {
  OPEN: "warning",
  ASSIGNED: "info",
  IN_PROGRESS: "purple",
  RESOLVED: "success",
  CLOSED: "neutral",
}

const FILTERS: Array<{ value: string; label: string; states?: TaskStatus[] }> = [
  { value: "all", label: "All" },
  { value: "open", label: "Open", states: ["OPEN"] },
  { value: "assigned", label: "Assigned", states: ["ASSIGNED"] },
  { value: "in-progress", label: "In Progress", states: ["IN_PROGRESS"] },
  { value: "resolved", label: "Resolved", states: ["RESOLVED", "CLOSED"] },
  { value: "mine", label: "Assigned to me" },
]

/** Maps an action to the reason vocabulary it should offer. */
const REASON_CATEGORY: Record<string, ReasonCategory> = {
  escalate: "escalate",
  escalate_legal: "escalate",
  pause: "pause",
  remove_account: "pause",
  adjust_ledger: "ledger_adjust",
  approve_refund: "refund",
  reject: "refund",
}

/**
 * Generic action queue.
 *
 * Renders one task type as assignable, trackable work with the decision
 * engine's recommendation inline — the PRD's "Embedded Decision Engine
 * Suggestions". Every action is guarded before it can fire.
 */
export function ActionQueue({ type }: { type: TaskType }) {
  const [tab, setTab] = React.useState("all")
  const [query, setQuery] = React.useState("")
  const [tasks, setTasks] = React.useState<Task[]>(() =>
    TASKS.filter((t) => t.type === type)
  )

  const [reasonAction, setReasonAction] = React.useState<{
    task: Task
    action: TaskAction
  } | null>(null)
  const [assignTask, setAssignTask] = React.useState<Task | null>(null)
  const [result, setResult] = React.useState<{ title: string; message: string } | null>(
    null
  )

  const tabItems: TabItem[] = FILTERS.map((f) => ({
    value: f.value,
    label: f.label,
    count:
      f.value === "mine"
        ? tasks.filter((t) => t.assignedTo === CURRENT_USER.name).length
        : f.states
          ? tasks.filter((t) => f.states!.includes(t.status)).length
          : tasks.length,
  }))

  const rows = React.useMemo(() => {
    const filter = FILTERS.find((f) => f.value === tab)
    const q = query.trim().toLowerCase()
    return sortByPriority(
      tasks
        .filter((t) =>
          filter?.value === "mine"
            ? t.assignedTo === CURRENT_USER.name
            : !filter?.states || filter.states.includes(t.status)
        )
        .filter(
          (t) =>
            q === "" ||
            [t.taskId, t.customer, t.subjectLabel, t.summary, t.assignedTo ?? ""]
              .join(" ")
              .toLowerCase()
              .includes(q)
        )
    )
  }, [tasks, tab, query])

  /** Looks up the live recovery state so the dispute guard can fire. */
  function subjectState(task: Task): string | undefined {
    return RECOVERY_CASES.find((c) => c.loanId === task.subjectId)?.state
  }

  function runAction(task: Task, action: TaskAction, reasonCode?: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.taskId === task.taskId
          ? {
              ...t,
              version: t.version + 1,
              status:
                action.id === "assign"
                  ? t.status
                  : t.status === "OPEN"
                    ? "ASSIGNED"
                    : t.status === "ASSIGNED"
                      ? "IN_PROGRESS"
                      : t.status,
            }
          : t
      )
    )
    setResult({
      title: `${action.label} — ${task.subjectLabel}`,
      message: reasonCode
        ? `${action.label} recorded against ${task.subjectLabel} with reason ${reasonCode}. Audit entry written for ${CURRENT_USER.name}.`
        : `${action.label} recorded against ${task.subjectLabel}. Audit entry written for ${CURRENT_USER.name}.`,
    })
  }

  function handleAction(task: Task, action: TaskAction) {
    const guard = guardAction(task, action, {
      hasPermission: can(CURRENT_USER.role, action.permission),
      subjectState: subjectState(task),
      currentUser: CURRENT_USER.name,
      readVersion: task.version,
    })
    if (!guard.allowed) {
      setResult({ title: "Action blocked", message: guard.reason ?? "Not permitted." })
      return
    }
    if (action.id === "assign") {
      setAssignTask(task)
      return
    }
    if (action.requiresReason) {
      setReasonAction({ task, action })
      return
    }
    runAction(task, action)
  }

  const actions = TASK_ACTIONS[type]

  return (
    <>
      <Card className="p-6">
        <QueueToolbar
          value={query}
          onValueChange={setQuery}
          placeholder="Search task, customer, loan ID, assignee…"
        />
        <Tabs items={tabItems} value={tab} onValueChange={setTab} className="mt-6" />

        {rows.length === 0 ? (
          <EmptyState
            title="No task in this queue."
            description="Tasks arrive automatically when the recovery, mandate, reconciliation or dispute engines emit an exception."
          />
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {rows.map((task) => {
              const breaching = isBreachingSla(task)
              const locked = task.lockedBy !== null && task.lockedBy !== CURRENT_USER.name
              const stale =
                task.recommendation !== null && isRecommendationStale(task.recommendation)

              return (
                <div
                  key={task.taskId}
                  className={cn(
                    "rounded-[var(--radius-control)] border p-4",
                    breaching ? "border-error-200 bg-error-50/40" : "border-stroke"
                  )}
                >
                  {/* Row header */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-subtle">
                          {task.taskId}
                        </span>
                        <Badge dot tone={PRIORITY_TONE[task.priority]}>
                          {task.priority}
                        </Badge>
                        <Badge dot tone={STATUS_TONE[task.status]}>
                          {TASK_STATUS_LABEL[task.status]}
                        </Badge>
                        {breaching ? <Badge tone="error">SLA BREACHED</Badge> : null}
                        {locked ? (
                          <Badge tone="warning">
                            <Lock className="size-3" />
                            {task.lockedBy}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-ink">
                        {task.customer} · {task.subjectLabel}
                      </p>
                      <p className="text-xs text-subtle">{task.summary}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      {task.amount > 0 ? (
                        <p className="tabular text-sm font-bold text-ink">
                          {naira(task.amount)}
                        </p>
                      ) : null}
                      <p className="text-xs text-subtle">
                        Due {relativeTime(task.dueTime)}
                      </p>
                      <p className="text-xs text-subtle">
                        {task.assignedTo ?? "Unassigned"}
                      </p>
                    </div>
                  </div>

                  {/* Decision engine recommendation */}
                  {task.recommendation ? (
                    <div
                      className={cn(
                        "mt-3 rounded-[var(--radius-nav)] p-3",
                        stale ? "bg-warning-50" : "bg-brand-subtle"
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={cn(
                            "flex items-center gap-1.5 text-xs font-semibold",
                            stale ? "text-warning-700" : "text-brand"
                          )}
                        >
                          {stale ? (
                            <TriangleAlert className="size-3.5" />
                          ) : (
                            <Sparkles className="size-3.5" />
                          )}
                          {stale ? "Recommendation stale" : "System recommendation"}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-bold",
                            stale ? "text-warning-700" : "text-brand"
                          )}
                        >
                          {(task.recommendation.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-ink">
                        → {task.recommendation.label}
                      </p>
                      <p className="text-xs text-body">{task.recommendation.detail}</p>
                      {stale ? (
                        <p className="mt-1 text-xs font-medium text-warning-700">
                          Computed {relativeTime(task.recommendation.computedAt)} — will be
                          recomputed before execution.
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Actions */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {actions.map((action) => {
                      const guard = guardAction(task, action, {
                        hasPermission: can(CURRENT_USER.role, action.permission),
                        subjectState: subjectState(task),
                        currentUser: CURRENT_USER.name,
                      })
                      return (
                        <Button
                          key={action.id}
                          size="sm"
                          variant={
                            action.tone === "danger"
                              ? "dangerSoft"
                              : action.tone === "primary"
                                ? "primary"
                                : action.tone === "soft"
                                  ? "soft"
                                  : "outline"
                          }
                          disabled={!guard.allowed}
                          title={guard.reason}
                          onClick={() => handleAction(task, action)}
                        >
                          {action.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <ReasonDialog
        open={reasonAction !== null}
        onOpenChange={(open) => !open && setReasonAction(null)}
        action={reasonAction?.action ?? null}
        category={
          reasonAction ? (REASON_CATEGORY[reasonAction.action.id] ?? "pause") : "pause"
        }
        subject={reasonAction?.task.subjectLabel ?? ""}
        onConfirm={(reasonCode) => {
          if (reasonAction) runAction(reasonAction.task, reasonAction.action, reasonCode)
          setReasonAction(null)
        }}
      />

      <AssignDialog
        open={assignTask !== null}
        onOpenChange={(open) => !open && setAssignTask(null)}
        subject={assignTask?.subjectLabel ?? ""}
        currentAssignee={assignTask?.assignedTo ?? null}
        onConfirm={(assignee) => {
          if (assignTask) {
            setTasks((prev) =>
              prev.map((t) =>
                t.taskId === assignTask.taskId
                  ? {
                      ...t,
                      assignedTo: assignee,
                      status: t.status === "OPEN" ? "ASSIGNED" : t.status,
                      version: t.version + 1,
                    }
                  : t
              )
            )
            setResult({
              title: "Task assigned",
              message: `${assignTask.subjectLabel} assigned to ${assignee}.`,
            })
          }
          setAssignTask(null)
        }}
      />

      <ResultDialog
        open={result !== null}
        onOpenChange={(open) => !open && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}
