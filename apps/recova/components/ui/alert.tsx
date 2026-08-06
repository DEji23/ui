import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle, CheckCircle2, Info, OctagonAlert } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Inline banner — Figma names this frame "Positive message" and reuses it
 * across tones (error / warning / success / info) inside detail panels.
 */
const alertVariants = cva(
  "flex gap-2 rounded-[var(--radius-card)] border p-4",
  {
    variants: {
      tone: {
        error: "border-error-100 bg-error-50",
        warning: "border-warning-200 bg-warning-50",
        success: "border-success-200 bg-success-50",
        info: "border-stroke bg-surface",
      },
    },
    defaultVariants: { tone: "info" },
  }
)

const TITLE_TONE = {
  error: "text-error-700",
  warning: "text-warning-700",
  success: "text-success-700",
  info: "text-ink",
} as const

const BODY_TONE = {
  error: "text-error-600",
  warning: "text-warning-600",
  success: "text-success-600",
  info: "text-body",
} as const

const ICONS = {
  error: OctagonAlert,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
} as const

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title: string
}

export function Alert({ className, tone, title, children, ...props }: AlertProps) {
  const key = tone ?? "info"
  const Icon = ICONS[key]
  return (
    <div className={cn(alertVariants({ tone }), className)} role="status" {...props}>
      <Icon className={cn("size-6 shrink-0", BODY_TONE[key])} />
      <div className="flex flex-col gap-1">
        <p className={cn("text-sm font-semibold", TITLE_TONE[key])}>{title}</p>
        {children ? (
          <div className={cn("text-xs", BODY_TONE[key])}>{children}</div>
        ) : null}
      </div>
    </div>
  )
}
