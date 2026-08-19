"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/** Centred modal — Figma "Modal" frames (736px wide, rounded-16). */
export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export const DialogContent = React.forwardRef<
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
        "fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-[736px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-panel)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
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
        <div className="flex flex-col gap-4 border-t border-stroke px-6 pb-8 pt-4">
          {footer}
        </div>
      ) : null}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = "DialogContent"
