"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Category,
  People,
  Bus,
  Map1,
  Danger,
  Money,
  Calendar,
  Setting2,
} from "iconsax-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: Category },
  { href: "/drivers", label: "Drivers", icon: People },
  { href: "/fleet", label: "Fleet", icon: Bus },
  { href: "/dispatch", label: "Dispatch", icon: Map1 },
  { href: "/alerts", label: "Alerts", icon: Danger, badge: 2 },
  { href: "/reconciliation", label: "Reconciliation", icon: Money },
  { href: "/leave", label: "Leave Requests", icon: Calendar, badge: 3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-white/[0.06] bg-[#0c0d0e]">
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-white/[0.06] px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 shadow-lg shadow-amber-500/30">
          <span className="text-[11px] font-black text-black tracking-tight">K</span>
        </div>
        <div>
          <p className="text-[13px] font-bold text-white tracking-tight leading-none">KOJA</p>
          <p className="text-[10px] text-zinc-500 leading-none mt-1">Fleet Dashboard</p>
        </div>
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #34d399" }} />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Operations
        </p>
        <div className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon, badge }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-amber-500/10 text-amber-400"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-amber-500" />
                )}
                <Icon
                  size={16}
                  color={isActive ? "#f59e0b" : "currentColor"}
                  variant={isActive ? "Bold" : "Linear"}
                />
                <span className="flex-1 font-medium">{label}</span>
                {badge && (
                  <span
                    className={cn(
                      "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                      isActive ? "bg-amber-500 text-black" : "bg-red-500/20 text-red-400"
                    )}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] p-2 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors"
        >
          <Setting2 size={16} color="currentColor" variant="Linear" />
          <span>Settings</span>
        </Link>
        <div className="mx-1 flex items-center gap-2 rounded-lg bg-white/[0.03] p-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
            FM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-300 leading-none truncate">Fleet Manager</p>
            <p className="text-[10px] text-zinc-600 leading-none mt-0.5">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
