import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { naira, relativeTime } from "@/lib/format"
import { TASKS } from "@/lib/data/tasks"
import { CURRENT_USER } from "@/lib/data/session"
import {
  TASK_TYPE_LABEL,
  TASK_TYPE_QUEUE,
  isBreachingSla,
  sortByPriority,
  type TaskType,
} from "@/lib/domain/tasks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

/**
 * Action Queue Summary — the routing surface for Module 2.
 * Answers "what needs action now?" rather than "browse the loan book".
 */
const TYPES: TaskType[] = [
  "FAILED_RECOVERY",
  "MANDATE_ISSUE",
  "RECONCILIATION_EXCEPTION",
  "DISPUTE",
  "COLLECTIONS_CASE",
]

export default function ActionQueuesPage() {
  const mine = sortByPriority(
    TASKS.filter(
      (t) =>
        t.assignedTo === CURRENT_USER.name &&
        t.status !== "RESOLVED" &&
        t.status !== "CLOSED"
    )
  )

  return (
    <>
      <PageHeader
        title="Action Queues"
        description="Every engine exception becomes assignable, trackable work. Queues are isolated by type."
      />

      <div className="flex flex-col gap-6 px-8 pb-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {TYPES.map((type) => {
            const all = TASKS.filter((t) => t.type === type)
            const open = all.filter(
              (t) => t.status !== "RESOLVED" && t.status !== "CLOSED"
            )
            const breaching = open.filter((t) => isBreachingSla(t))
            const unassigned = open.filter((t) => t.assignedTo === null)
            const value = open.reduce((s, t) => s + t.amount, 0)

            return (
              <Card key={type} className="flex flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-ink-header">
                      {TASK_TYPE_LABEL[type]}
                    </h3>
                    <p className="text-xs text-subtle">
                      {all.length} total · {unassigned.length} unassigned
                    </p>
                  </div>
                  <p className="tabular text-3xl font-bold text-ink-header">
                    {open.length}
                  </p>
                </div>

                {value > 0 ? (
                  <p className="tabular text-sm text-body">
                    {naira(value)} at risk in this queue
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {breaching.length > 0 ? (
                    <Badge tone="error" dot>
                      {breaching.length} SLA BREACHED
                    </Badge>
                  ) : (
                    <Badge tone="success" dot>
                      SLA HEALTHY
                    </Badge>
                  )}
                  {unassigned.length > 0 ? (
                    <Badge tone="warning">{unassigned.length} UNASSIGNED</Badge>
                  ) : null}
                </div>

                <Button variant="soft" size="md" block asChild>
                  <Link href={TASK_TYPE_QUEUE[type]}>
                    Open queue
                    <ArrowRight />
                  </Link>
                </Button>
              </Card>
            )
          })}
        </div>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>My Work</CardTitle>
              <CardDescription>
                Tasks assigned to {CURRENT_USER.name}, highest priority first
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-0">
            {mine.length === 0 ? (
              <p className="py-6 text-center text-sm text-subtle">
                Nothing assigned to you right now.
              </p>
            ) : (
              mine.map((task) => (
                <Link
                  key={task.taskId}
                  href={TASK_TYPE_QUEUE[task.type]}
                  className="flex items-center justify-between gap-4 rounded-[var(--radius-control)] border border-stroke p-4 transition-colors hover:bg-surface"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {task.customer} · {task.subjectLabel}
                    </p>
                    <p className="truncate text-xs text-subtle">{task.summary}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge tone={TASK_TYPE_LABEL[task.type] ? "info" : "neutral"}>
                      {TASK_TYPE_LABEL[task.type]}
                    </Badge>
                    <span
                      className={
                        isBreachingSla(task)
                          ? "text-xs font-semibold text-error-600"
                          : "text-xs text-subtle"
                      }
                    >
                      Due {relativeTime(task.dueTime)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
