"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { alerts } from "@/lib/data"
import { leaveRequests } from "@/lib/data"

const unread = alerts.filter((a) => !a.acknowledged).length
const pendingLeave = leaveRequests.filter((l) => l.status === "pending").length

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/drivers", label: "Drivers", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { href: "/fleet", label: "Fleet", icon: "M8 17h8a2 2 0 002-2V7a2 2 0 00-2-2H8a2 2 0 00-2 2v8a2 2 0 002 2z M6 8h12M6 12h12" },
  { href: "/dispatch", label: "Dispatch", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { href: "/alerts", label: "Alerts", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", badge: unread },
  { href: "/reconciliation", label: "Reconciliation", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
  { href: "/leave", label: "Leave Requests", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", badge: pendingLeave },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-[220px] bg-[#0f1012] border-r border-white/6 flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-14 border-b border-white/6">
        <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
          <span className="text-black font-bold text-sm">K</span>
        </div>
        <div>
          <div className="text-white font-semibold text-sm leading-none">KOJA</div>
          <div className="text-white/40 text-[10px] leading-none mt-0.5">Fleet Dashboard</div>
        </div>
        <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[9px] font-semibold text-white/30 uppercase tracking-widest px-2 mb-2">Operations</p>
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all group",
                  active
                    ? "bg-amber-500/12 text-amber-400"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                )}
              >
                {active && <div className="absolute left-3 w-0.5 h-5 bg-amber-400 rounded-full" />}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                  <path d={item.icon} />
                </svg>
                <span className="flex-1 font-medium">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={cn(
                    "text-[10px] font-semibold px-1.5 py-0.5 rounded-md min-w-[18px] text-center",
                    active ? "bg-amber-500/30 text-amber-300" : "bg-red-500/20 text-red-400"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/6 px-3 py-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all mb-1",
            pathname === "/settings"
              ? "bg-amber-500/12 text-amber-400"
              : "text-white/50 hover:text-white/80 hover:bg-white/5"
          )}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium">Settings</span>
        </Link>
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-[9px] font-bold shrink-0">FM</div>
          <div className="min-w-0">
            <div className="text-white/70 text-xs font-medium truncate">Fleet Manager</div>
            <div className="text-white/30 text-[10px]">Admin</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
