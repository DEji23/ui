import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  colorClass?: string
}

export function Progress({ className, value = 0, colorClass = "bg-amber-500", ...props }: ProgressProps) {
  return (
    <div
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]", className)}
      {...props}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500", colorClass)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
