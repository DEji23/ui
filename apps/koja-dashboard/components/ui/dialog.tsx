"use client"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 w-full max-w-md mx-4 rounded-xl bg-[#16171a] border border-white/8 shadow-2xl",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <div className="px-6 pt-6 pb-4 border-b border-white/8">
            {title && <h2 className="text-base font-semibold text-white">{title}</h2>}
            {description && <p className="text-sm text-white/50 mt-1">{description}</p>}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
