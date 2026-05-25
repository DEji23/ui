import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-amber-500 text-black hover:bg-amber-400 active:bg-amber-600 shadow-sm",
        destructive: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
        outline: "dark:border-white/10 border-zinc-200 bg-transparent dark:text-zinc-300 text-zinc-700 dark:hover:bg-white/5 hover:bg-zinc-100 dark:hover:text-zinc-100 hover:text-zinc-900",
        ghost: "dark:text-zinc-400 text-zinc-600 dark:hover:bg-white/5 hover:bg-zinc-100 dark:hover:text-zinc-200 hover:text-zinc-900",
        success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20",
        secondary: "dark:bg-white/5 bg-zinc-100 dark:text-zinc-300 text-zinc-700 dark:border-white/10 border-zinc-200 border dark:hover:bg-white/10 hover:bg-zinc-200",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 rounded-md px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-[15px]",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7 rounded-md",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
  )
)
Button.displayName = "Button"
