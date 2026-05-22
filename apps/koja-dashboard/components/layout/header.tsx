"use client"
import { useState } from "react"
import { notifications as initialNotifications } from "@/lib/data"
import type { Notification } from "@/lib/data"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState<Notification[]>(initialNotifications)

  const unread = notes.filter((n) => !n.read).length

  const markAll = () => setNotes(notes.map((n) => ({ ...n, read: true })))
  const markOne = (id: string) => setNotes(notes.map((n) => n.id === id ? { ...n, read: true } : n))

  const typeIcon: Record<Notification["type"], string> = {
    alert: "⚠",
    dispatch: "🚌",
    leave: "📅",
    reconciliation: "₦",
    system: "ℹ",
  }

  const typeColor: Record<Notification["type"], string> = {
    alert: "text-red-400",
    dispatch: "text-amber-400",
    leave: "text-blue-400",
    reconciliation: "text-emerald-400",
    system: "text-white/40",
  }

  return (
    <>
      <header className="fixed left-[220px] right-0 top-0 h-14 bg-[#0c0d0f]/95 backdrop-blur-sm border-b border-white/6 flex items-center px-6 z-20">
        <div className="flex-1">
          <h1 className="text-base font-semibold text-white leading-none">{title}</h1>
          {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {/* Notification bell */}
          <button
            onClick={() => setOpen(true)}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 text-white/50 hover:text-white transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold bg-red-500 text-white rounded-full">
                {unread}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Notification Drawer */}
      <>
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "fixed right-0 top-0 h-full w-[380px] z-50 bg-[#14151a] border-l border-white/8 shadow-2xl transition-transform duration-300 flex flex-col",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <div>
              <h2 className="text-sm font-semibold text-white">Notifications</h2>
              {unread > 0 && <p className="text-xs text-white/40 mt-0.5">{unread} unread</p>}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAll} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white transition-colors ml-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M10 4L4 10M4 4l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {notes.length === 0 && (
              <div className="flex items-center justify-center h-40 text-white/30 text-sm">No notifications</div>
            )}
            {notes.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "px-5 py-4 border-b border-white/5 cursor-pointer hover:bg-white/3 transition-colors",
                  !n.read && "bg-white/3"
                )}
                onClick={() => markOne(n.id)}
              >
                <div className="flex items-start gap-3">
                  <span className={cn("text-base mt-0.5 shrink-0", typeColor[n.type])}>
                    {typeIcon[n.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-xs font-semibold", !n.read ? "text-white" : "text-white/60")}>
                        {n.title}
                      </p>
                      {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-white/25 mt-1">
                      {new Date(n.timestamp).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                {n.link && (
                  <Link
                    href={n.link}
                    className="mt-2 ml-7 text-[10px] text-amber-400/70 hover:text-amber-400 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    View →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </>
    </>
  )
}
