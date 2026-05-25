import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-lg px-3 py-1 text-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-white/10 border-zinc-300 border",
        "dark:bg-white/5 bg-white",
        "dark:text-zinc-200 text-zinc-900",
        "dark:placeholder:text-zinc-600 placeholder:text-zinc-400",
        "focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = "Input"
