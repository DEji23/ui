import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Pill badge — Figma: rounded-full, px-8 py-4, Plus Jakarta Bold 10/15.
 * The `dot` form is the status pill used in tables and detail panels;
 * the plain form is the uppercase rail tag (NDD / REMITA / EASY_PAY).
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-bold leading-[15px]",
  {
    variants: {
      tone: {
        neutral: "bg-gray-100 text-body",
        success: "bg-success-50 border border-success-200 text-success-700",
        warning: "bg-warning-50 border border-warning-200 text-warning-700",
        error: "bg-error-50 border border-error-100 text-error-600",
        info: "bg-info-50 text-info-600",
        purple: "bg-[#f4f0ff] text-purple-600",
        brand: "bg-brand-subtle text-brand",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

const DOT_TONE: Record<string, string> = {
  neutral: "bg-muted",
  success: "bg-success-500",
  warning: "bg-warning-600",
  error: "bg-error-600",
  info: "bg-info-600",
  purple: "bg-purple-600",
  brand: "bg-brand",
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

export function Badge({ className, tone, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot ? (
        <span
          aria-hidden
          className={cn("size-1 rounded-full", DOT_TONE[tone ?? "neutral"])}
        />
      ) : null}
      {children}
    </span>
  )
}

export { badgeVariants }
