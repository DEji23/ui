"use client"

import * as React from "react"
import { type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { CloseCircle } from "iconsax-react"

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function Sheet({ open, onClose, title, subtitle, children, footer, className }: SheetProps) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (open) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", onKey)
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed top-0 right-0 z-[101] h-full w-[520px] bg-panel border-l border-line-soft shadow-2xl flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line-soft shrink-0">
          <div>
            <p className="text-sm font-semibold text-fg">{title}</p>
            {subtitle && <p className="text-xs text-fg-muted mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-fg-dim hover:text-fg-muted hover:bg-[var(--hover-bg)] transition-colors"
          >
            <CloseCircle size={16} color="currentColor" variant="Linear" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center gap-2 px-6 py-4 border-t border-line-soft shrink-0">
            {footer}
          </div>
        )}
      </div>
    </>
  )
}
