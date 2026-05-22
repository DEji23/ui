import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "green" | "red" | "yellow" | "amber" | "gray" | "blue"
  className?: string
}

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
        {
          "bg-emerald-500/15 text-emerald-400": variant === "green",
          "bg-red-500/15 text-red-400": variant === "red",
          "bg-yellow-500/15 text-yellow-400": variant === "yellow",
          "bg-amber-500/15 text-amber-400": variant === "amber",
          "bg-white/8 text-white/60": variant === "gray",
          "bg-blue-500/15 text-blue-400": variant === "blue",
        },
        className
      )}
    >
      {children}
    </span>
  )
}
