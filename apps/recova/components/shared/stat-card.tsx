import type { LucideIcon } from "lucide-react"
import { ArrowDown, ArrowUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

/**
 * Dashboard metric tile.
 * Figma geometry: 258×165, 24px padding, 40px tinted icon chip top-right,
 * h3 16/24, value 30/36 bold, delta row 12/20.
 */
export interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  tone?: "brand" | "info" | "success" | "warning" | "error" | "purple"
  delta?: number
  /** Text after the delta, e.g. "vs last month". Shown alone when no delta. */
  caption?: string
  /** Set when a rising number is bad (disputes, SLA breaches, outstanding). */
  invertDelta?: boolean
}

const ICON_TONE = {
  brand: "bg-brand-subtle text-brand",
  info: "bg-info-50 text-info-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  error: "bg-error-50 text-error-600",
  purple: "bg-[#f4f0ff] text-purple-600",
} as const

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  delta,
  caption,
  invertDelta = false,
}: StatCardProps) {
  const rising = (delta ?? 0) > 0
  // A rising dispute count is bad news; a rising collection total is good.
  const good = invertDelta ? !rising : rising
  const DeltaIcon = rising ? ArrowUp : ArrowDown

  return (
    <Card className="flex items-start justify-between gap-4 p-6">
      <div className="flex min-w-0 flex-col gap-4">
        <h3 className="truncate text-base text-body">{label}</h3>
        <p className="tabular text-3xl font-bold leading-9 text-ink-header">
          {value}
        </p>
        <div className="flex items-center gap-1 text-sm">
          {delta !== undefined ? (
            <span
              className={cn(
                "flex items-center gap-1 font-semibold",
                good ? "text-success-600" : "text-error-600"
              )}
            >
              <DeltaIcon className="size-4" />
              {rising ? "+" : ""}
              {delta}%
            </span>
          ) : null}
          {caption ? <span className="text-subtle">{caption}</span> : null}
        </div>
      </div>
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          ICON_TONE[tone]
        )}
      >
        <Icon className="size-6" />
      </div>
    </Card>
  )
}
