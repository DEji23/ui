"use client"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  wide?: boolean
}

export function Sheet({ open, onClose, title, subtitle, children, footer, className, wide }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed right-0 top-0 h-full z-50 bg-[#14151a] border-l border-white/8 shadow-2xl transition-transform duration-300 flex flex-col",
          wide ? "w-[640px]" : "w-[520px]",
          open ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-white/8 shrink-0">
          <div>
            {title && <h2 className="text-base font-semibold text-white">{title}</h2>}
            {subtitle && <p className="text-sm text-white/50 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors ml-4 mt-0.5"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-white/8 flex items-center gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </>
  )
}
