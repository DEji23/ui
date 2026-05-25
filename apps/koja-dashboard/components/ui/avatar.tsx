import * as React from "react"
import { cn } from "@/lib/utils"

const colorMap = [
  "bg-amber-500/20 text-amber-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-blue-500/20 text-blue-300",
  "bg-purple-500/20 text-purple-300",
  "bg-pink-500/20 text-pink-300",
  "bg-orange-500/20 text-orange-300",
  "bg-cyan-500/20 text-cyan-300",
]

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  size?: "xs" | "sm" | "md" | "lg"
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-7 w-7 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-sm",
}

export function Avatar({ name, size = "md", className, ...props }: AvatarProps) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
  const color = colorMap[name.charCodeAt(0) % colorMap.length]
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold flex-shrink-0",
        sizeClasses[size],
        color,
        className
      )}
      {...props}
    >
      {initials}
    </div>
  )
}
