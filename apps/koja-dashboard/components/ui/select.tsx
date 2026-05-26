import * as React from "react"
import { cn } from "@/lib/utils"

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-lg border border-line-input bg-input-bg px-3 py-1 text-sm text-fg outline-none transition-colors focus:border-amber-500/50 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
)
Select.displayName = "Select"

export function SelectOption({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <option value={value} className="bg-elevated text-fg">
      {children}
    </option>
  )
}
