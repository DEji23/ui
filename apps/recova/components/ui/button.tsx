import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button geometry comes straight from the Figma modal footer:
 * h-56, rounded-12, Plus Jakarta Bold 16/19.6, tracking 0.14px.
 * The "soft" variant is the tinted rgba(0,108,73,0.05) secondary action.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] font-bold tracking-[0.14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-brand text-white hover:bg-brand-hover",
        soft: "bg-brand-subtle border border-stroke text-brand hover:bg-brand/10",
        outline: "border border-stroke bg-white text-ink hover:bg-gray-100",
        ghost: "text-body hover:bg-gray-100",
        danger: "bg-error-600 text-white hover:bg-error-700",
        dangerSoft:
          "bg-error-50 border border-error-100 text-error-700 hover:bg-error-100",
      },
      size: {
        lg: "h-14 px-4 text-base [&_svg]:size-6",
        md: "h-11 px-4 text-sm [&_svg]:size-5",
        sm: "h-9 px-3 text-[13px] [&_svg]:size-4",
        icon: "size-11 [&_svg]:size-5",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      block: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, block }), className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { buttonVariants }
