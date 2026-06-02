import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-destructive/20 bg-destructive/12 text-destructive",
        outline: "border-border text-foreground bg-transparent",
        success: "border-success/20 bg-success/12 text-success",
        warning: "border-warning/20 bg-warning/12 text-amber-700",
        info: "border-info/20 bg-info/12 text-info",
        muted: "border-transparent bg-muted text-muted-foreground",
        purple: "border-purple-500/20 bg-purple-500/12 text-purple-600",
        orange: "border-orange-500/20 bg-orange-500/12 text-orange-600",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
