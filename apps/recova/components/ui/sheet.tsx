"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Right-hand detail panel — the "Side Modal" pattern that carries every
 * record view in the Figma file (620px, white, rounded-16, shadow-xl,
 * 44px round close button top-right, sticky action footer).
 */
export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

export const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    title: string
    description?: string
    footer?: React.ReactNode
  }
>(({ className, title, description, footer, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink-header/40 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-y-0 right-0 z-50 flex w-full max-w-[620px] flex-col bg-white shadow-[var(--shadow-panel)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:m-1 sm:rounded-[var(--radius-card)]",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-6">
        <div className="space-y-1">
          <DialogPrimitive.Title className="text-xl font-bold leading-[30px] text-ink-header">
            {title}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="text-xs text-subtle">
              {description}
            </DialogPrimitive.Description>
          ) : (
            <DialogPrimitive.Description className="sr-only">
              {title}
            </DialogPrimitive.Description>
          )}
        </div>
        <DialogPrimitive.Close
          className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-surface-alt text-body transition-colors hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="size-6" />
        </DialogPrimitive.Close>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>

      {footer ? (
        <div className="flex flex-col gap-4 border-t border-stroke bg-white px-6 pb-8 pt-4 sm:rounded-b-[var(--radius-card)]">
          {footer}
        </div>
      ) : null}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
SheetContent.displayName = "SheetContent"

/** Label/value row — the atom every detail panel is built from. */
export function DetailRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-medium text-body">{label}</span>
      <span className="text-right text-xs font-semibold text-ink">{children}</span>
    </div>
  )
}

export function DetailSection({
  title,
  children,
  divided = true,
}: {
  title: string
  children: React.ReactNode
  divided?: boolean
}) {
  return (
    <section
      className={cn("flex flex-col gap-4 pb-4", divided && "border-b border-stroke")}
    >
      <h4 className="text-xs font-medium text-ink">{title}</h4>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}
