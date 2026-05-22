"use client"
import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline"
  size?: "sm" | "md" | "lg"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:opacity-40 disabled:cursor-not-allowed",
          {
            "bg-amber-500 text-black hover:bg-amber-400 active:bg-amber-600": variant === "primary",
            "bg-white/8 text-white hover:bg-white/12 border border-white/10": variant === "secondary",
            "text-white/70 hover:text-white hover:bg-white/8": variant === "ghost",
            "bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20": variant === "danger",
            "border border-white/15 text-white/80 hover:bg-white/8 hover:border-white/25": variant === "outline",
          },
          {
            "h-7 px-3 text-xs": size === "sm",
            "h-9 px-4 text-sm": size === "md",
            "h-11 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
