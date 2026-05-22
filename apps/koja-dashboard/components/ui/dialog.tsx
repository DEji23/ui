"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CloseCircle } from "iconsax-react"

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
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

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 w-full max-w-md bg-[#16171a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <div className="flex items-start justify-between px-6 pt-6 pb-0">
            <div>
              {title && <h2 className="text-[15px] font-semibold text-zinc-100">{title}</h2>}
              {description && (
                <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 shrink-0 p-1 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-colors"
            >
              <CloseCircle size={18} color="currentColor" variant="Linear" />
            </button>
          </div>
        )}
        <div className={cn("p-6", (title || description) && "pt-4")}>{children}</div>
      </div>
    </div>
  )
}
