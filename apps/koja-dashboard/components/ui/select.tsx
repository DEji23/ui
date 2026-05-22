import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-lg border border-white/10 bg-[#1a1b1e] px-3 py-1 text-sm text-zinc-200 outline-none transition-colors focus:border-amber-500/50 cursor-pointer",
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
    <option value={value} className="bg-[#16171a] text-zinc-200">
      {children}
    </option>
  )
}
