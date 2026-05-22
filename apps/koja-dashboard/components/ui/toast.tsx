"use client"
import { cn } from "@/lib/utils"

export interface Toast {
  id: number
  message: string
  type: "success" | "error" | "info" | "warning"
}

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border transition-all pointer-events-auto animate-in slide-in-from-bottom-2",
            t.type === "success" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
            t.type === "error" && "bg-red-500/10 border-red-500/20 text-red-300",
            t.type === "info" && "bg-amber-500/10 border-amber-500/20 text-amber-300",
            t.type === "warning" && "bg-yellow-500/10 border-yellow-500/20 text-yellow-300"
          )}
        >
          <span>
            {t.type === "success" && "✓"}
            {t.type === "error" && "✕"}
            {t.type === "info" && "ℹ"}
            {t.type === "warning" && "⚠"}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  )
}
