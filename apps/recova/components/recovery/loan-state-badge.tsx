import { cn } from "@/lib/utils"
import type { LoanState } from "@/lib/mock-data"
import { Lock } from "lucide-react"

const stateConfig: Record<
  LoanState,
  { label: string; className: string; dot?: string; pulse?: boolean; lock?: boolean }
> = {
  ACTIVE: {
    label: "Active",
    className: "bg-success/12 text-success border-success/20",
    dot: "bg-success",
  },
  DUE: {
    label: "Due",
    className: "bg-amber-500/12 text-amber-600 border-amber-500/20",
    dot: "bg-amber-500",
  },
  OVERDUE: {
    label: "Overdue",
    className: "bg-destructive/12 text-destructive border-destructive/20",
    dot: "bg-destructive",
  },
  IN_RECOVERY: {
    label: "In Recovery",
    className: "bg-info/12 text-info border-info/20",
    dot: "bg-info",
  },
  PARTIALLY_RECOVERED: {
    label: "Partial",
    className: "bg-amber-500/12 text-amber-600 border-amber-500/20",
    dot: "bg-amber-500",
  },
  AT_RISK: {
    label: "At Risk",
    className: "bg-red-500/12 text-red-600 border-red-500/20",
    dot: "bg-red-500",
    pulse: true,
  },
  DISPUTE_OPEN: {
    label: "Dispute",
    className: "bg-red-500/12 text-red-600 border-red-500/20",
    lock: true,
  },
  RECOVERY_FAILED: {
    label: "Failed",
    className: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
  LEGAL_REVIEW: {
    label: "Legal",
    className: "bg-purple-500/12 text-purple-600 border-purple-500/20",
    dot: "bg-purple-500",
  },
  CLOSED_PAID: {
    label: "Closed",
    className: "bg-success/12 text-success border-success/20",
    dot: "bg-success",
  },
  WRITE_OFF: {
    label: "Write-Off",
    className: "bg-neutral-800/12 text-neutral-600 border-neutral-500/20 line-through",
    dot: "bg-neutral-500",
  },
}

interface LoanStateBadgeProps {
  state: LoanState
  size?: "sm" | "md"
  className?: string
}

export function LoanStateBadge({ state, size = "md", className }: LoanStateBadgeProps) {
  const config = stateConfig[state]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 font-medium",
        size === "md" ? "py-0.5 text-xs" : "py-0.5 text-[10px]",
        config.className,
        className
      )}
    >
      {config.lock ? (
        <Lock className="h-2.5 w-2.5 shrink-0" />
      ) : config.dot ? (
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            config.dot,
            config.pulse && "animate-pulse-slow"
          )}
        />
      ) : null}
      {config.label}
    </span>
  )
}
