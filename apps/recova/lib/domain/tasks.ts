import { APP_NOW } from "@/lib/clock"

import type { Permission, Role } from "./rbac"

/**
 * Workflow engine.
 *
 * PRD Module 2 is emphatic that this is the core of the dashboard:
 * "Turn system outputs into assignable, trackable work."
 *
 * Every queue in the app is a projection of this one Task model, which is
 * what makes work assignable across queues rather than per-screen.
 */

export type TaskStatus = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
}

/** OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED, per the PRD. */
export const TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  OPEN: ["ASSIGNED"],
  ASSIGNED: ["IN_PROGRESS", "OPEN"],
  IN_PROGRESS: ["RESOLVED", "ASSIGNED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: [],
}

export function canAdvance(from: TaskStatus, to: TaskStatus): boolean {
  return TASK_TRANSITIONS[from].includes(to)
}

export type TaskType =
  | "FAILED_RECOVERY"
  | "MANDATE_ISSUE"
  | "RECONCILIATION_EXCEPTION"
  | "DISPUTE"
  | "COLLECTIONS_CASE"

export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  FAILED_RECOVERY: "Failed Recovery",
  MANDATE_ISSUE: "Mandate Issue",
  RECONCILIATION_EXCEPTION: "Reconciliation Exception",
  DISPUTE: "Dispute",
  COLLECTIONS_CASE: "Collections Case",
}

/** Which queue each task type belongs to — queues must stay isolated. */
export const TASK_TYPE_QUEUE: Record<TaskType, string> = {
  FAILED_RECOVERY: "/action-queues/failed-recovery",
  MANDATE_ISSUE: "/action-queues/mandate-issues",
  RECONCILIATION_EXCEPTION: "/action-queues/reconciliation",
  DISPUTE: "/action-queues/disputes",
  COLLECTIONS_CASE: "/action-queues/collections",
}

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
}

/** The recommended next action the decision engine embeds on each row. */
export interface RecommendedAction {
  label: string
  detail: string
  /** Confidence the engine attaches to the recommendation, 0–1. */
  confidence: number
  /** Recomputed timestamp — stale recommendations must not be executed. */
  computedAt: string
}

export interface Task {
  taskId: string
  type: TaskType
  priority: TaskPriority
  assignedTo: string | null
  assignedRole: Role | null
  status: TaskStatus
  dueTime: string
  createdAt: string
  /** Loan, mandate, dispute or transaction reference this task acts on. */
  subjectId: string
  subjectLabel: string
  customer: string
  amount: number
  summary: string
  failureReason: string | null
  recommendation: RecommendedAction | null
  /** Optimistic locking — rejects a write made against a stale read. */
  version: number
  lockedBy: string | null
}

/* ------------------------------------------------------------------ */
/* Available actions per task type, each gated on a permission         */
/* ------------------------------------------------------------------ */

export interface TaskAction {
  id: string
  label: string
  permission: Permission
  /** Destructive or policy-overriding actions need a typed reason. */
  requiresReason: boolean
  tone: "primary" | "soft" | "outline" | "danger"
}

export const TASK_ACTIONS: Record<TaskType, TaskAction[]> = {
  FAILED_RECOVERY: [
    { id: "retry", label: "Retry Now", permission: "recovery.retry", requiresReason: false, tone: "primary" },
    { id: "reschedule", label: "Reschedule", permission: "recovery.retry", requiresReason: false, tone: "soft" },
    { id: "escalate", label: "Escalate", permission: "escalation.trigger", requiresReason: true, tone: "soft" },
    { id: "pause", label: "Pause Recovery", permission: "recovery.pause", requiresReason: true, tone: "outline" },
    { id: "assign", label: "Assign", permission: "collections.assign", requiresReason: false, tone: "outline" },
  ],
  MANDATE_ISSUE: [
    { id: "retry_mandate", label: "Retry Mandate", permission: "mandate.retry", requiresReason: false, tone: "primary" },
    { id: "remove_account", label: "Remove Account", permission: "mandate.cancel", requiresReason: true, tone: "danger" },
    { id: "alternate", label: "Try Alternate Account", permission: "mandate.create", requiresReason: false, tone: "soft" },
    { id: "assign", label: "Assign", permission: "collections.assign", requiresReason: false, tone: "outline" },
  ],
  RECONCILIATION_EXCEPTION: [
    { id: "investigate", label: "Investigate", permission: "reconciliation.run", requiresReason: false, tone: "primary" },
    { id: "request_confirmation", label: "Request Bank Confirmation", permission: "reconciliation.run", requiresReason: false, tone: "soft" },
    { id: "adjust_ledger", label: "Adjust Ledger", permission: "ledger.view", requiresReason: true, tone: "danger" },
    { id: "assign", label: "Assign", permission: "collections.assign", requiresReason: false, tone: "outline" },
  ],
  DISPUTE: [
    { id: "review", label: "Review Evidence", permission: "dispute.review", requiresReason: false, tone: "primary" },
    { id: "approve_refund", label: "Approve Refund", permission: "refund.approve", requiresReason: true, tone: "soft" },
    { id: "reject", label: "Reject Dispute", permission: "dispute.resolve", requiresReason: true, tone: "danger" },
    { id: "assign", label: "Assign", permission: "collections.assign", requiresReason: false, tone: "outline" },
  ],
  COLLECTIONS_CASE: [
    { id: "payment_plan", label: "Offer Payment Plan", permission: "collections.manage", requiresReason: false, tone: "primary" },
    { id: "escalate_legal", label: "Escalate to Legal", permission: "legal.escalate", requiresReason: true, tone: "soft" },
    { id: "assign", label: "Reassign", permission: "collections.assign", requiresReason: false, tone: "outline" },
  ],
}

/* ------------------------------------------------------------------ */
/* Reason codes — mandatory for every override                         */
/* ------------------------------------------------------------------ */

export const REASON_CODES = {
  pause: [
    { value: "DISPUTE", label: "Dispute raised" },
    { value: "GOODWILL", label: "Goodwill / customer hardship" },
    { value: "FRAUD_SUSPICION", label: "Fraud suspicion" },
    { value: "DATA_ISSUE", label: "Data or mandate issue" },
  ],
  escalate: [
    { value: "MULTIPLE_FAILED_ATTEMPTS", label: "Multiple failed attempts" },
    { value: "NO_CONTACT", label: "Borrower unreachable" },
    { value: "RECOVERY_EXHAUSTED", label: "Recovery options exhausted" },
    { value: "TIER_4_DELINQUENT", label: "Tier 4 delinquent" },
    { value: "CUSTOMER_REFUSAL", label: "Customer refusal to pay" },
  ],
  force_debit: [
    { value: "CUSTOMER_AUTHORISED_BY_PHONE", label: "Customer authorised by phone" },
    { value: "MONTH_END_PUSH", label: "Month-end recovery push" },
    { value: "CONFIRMED_INFLOW", label: "Confirmed inflow detected" },
  ],
  ledger_adjust: [
    { value: "DUPLICATE_DEBIT", label: "Duplicate debit" },
    { value: "SETTLEMENT_MISMATCH", label: "Settlement mismatch" },
    { value: "BANK_CONFIRMED_CORRECTION", label: "Bank-confirmed correction" },
  ],
  refund: [
    { value: "DISPUTE_RESOLUTION", label: "Dispute resolution" },
    { value: "DUPLICATE_DEBIT", label: "Duplicate debit" },
    { value: "OVERPAYMENT", label: "Overpayment" },
  ],
} as const

export type ReasonCategory = keyof typeof REASON_CODES

/* ------------------------------------------------------------------ */
/* Guards                                                              */
/* ------------------------------------------------------------------ */

export interface ActionGuardResult {
  allowed: boolean
  reason?: string
}

/**
 * Case 2 from the PRD's critical edge cases: a dispute opens while an agent
 * has the row on screen, then the agent clicks retry. The action must be
 * blocked, not merely discouraged.
 */
export function guardAction(
  task: Task,
  action: TaskAction,
  ctx: {
    hasPermission: boolean
    subjectState?: string
    currentUser: string
    /** Version the UI last read — mismatch means another agent edited it. */
    readVersion?: number
  }
): ActionGuardResult {
  if (!ctx.hasPermission) {
    return { allowed: false, reason: `Requires the ${action.permission} permission.` }
  }
  if (task.status === "CLOSED") {
    return { allowed: false, reason: "This task is closed." }
  }
  if (ctx.readVersion !== undefined && ctx.readVersion !== task.version) {
    return {
      allowed: false,
      reason: "This task changed since you opened it — reload before acting.",
    }
  }
  if (task.lockedBy && task.lockedBy !== ctx.currentUser) {
    return { allowed: false, reason: `Currently being worked by ${task.lockedBy}.` }
  }
  if (ctx.subjectState === "DISPUTE_OPEN" && action.id === "retry") {
    return {
      allowed: false,
      reason: "Loan is in DISPUTE OPEN — retries are blocked until the dispute closes.",
    }
  }
  return { allowed: true }
}

/** Recommendations older than this are recomputed before execution. */
export const RECOMMENDATION_TTL_MINUTES = 30

export function isRecommendationStale(
  recommendation: RecommendedAction,
  now: Date = APP_NOW
): boolean {
  const ageMinutes =
    (now.getTime() - new Date(recommendation.computedAt).getTime()) / 60_000
  return ageMinutes > RECOMMENDATION_TTL_MINUTES
}

export function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    return p !== 0 ? p : a.dueTime.localeCompare(b.dueTime)
  })
}

export function isBreachingSla(task: Task, now: Date = APP_NOW): boolean {
  return (
    task.status !== "RESOLVED" &&
    task.status !== "CLOSED" &&
    new Date(task.dueTime) < now
  )
}
