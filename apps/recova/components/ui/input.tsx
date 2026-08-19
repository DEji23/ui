import * as React from "react"

import { cn } from "@/lib/utils"

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-[var(--radius-control)] border border-stroke bg-white px-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-brand/40 focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
))
Input.displayName = "Input"

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-24 w-full rounded-[var(--radius-control)] border border-stroke bg-white p-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-brand/40 focus:ring-2 focus:ring-brand/15",
      className
    )}
    {...props}
  />
))
Textarea.displayName = "Textarea"

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-xs font-medium text-body", className)}
      {...props}
    />
  )
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full appearance-none rounded-[var(--radius-control)] border border-stroke bg-white px-4 text-sm text-ink outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/15",
        className
      )}
      {...props}
    />
  )
}
