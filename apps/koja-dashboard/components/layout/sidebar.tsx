"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "./app-layout"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Category,
  People,
  Bus,
  Map1,
  Danger,
  Money,
  Calendar,
  Setting2,
  ArrowLeft2,
  ArrowRight2,
} from "iconsax-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: Category },
  { href: "/drivers", label: "Drivers", icon: People },
  { href: "/fleet", label: "Fleet", icon: Bus },
  { href: "/dispatch", label: "Dispatch", icon: Map1 },
  { href: "/alerts", label: "Alerts", icon: Danger, badge: 2 },
  { href: "/reconciliation", label: "Reconciliation", icon: Money },
  { href: "/leave", label: "Leave Requests", icon: Calendar, badge: 2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, mobileOpen, toggleCollapsed, closeMobile } = useSidebar()
  const settingsActive = pathname === "/settings"

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeMobile}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300",
          "border-r dark:border-white/[0.06] border-zinc-200",
          "bg-[var(--bg-sidebar)]",
          collapsed ? "lg:w-[60px]" : "lg:w-[220px]",
          "w-[220px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo + collapse toggle */}
        <div className="flex h-14 items-center gap-3 border-b dark:border-white/[0.06] border-zinc-200 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 shadow-lg shadow-amber-500/30 shrink-0">
            <span className="text-[11px] font-black text-black tracking-tight">J</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold dark:text-white text-zinc-900 tracking-tight leading-none">JEHGO</p>
              <p className="text-[10px] text-zinc-500 leading-none mt-1">Fleet Dashboard</p>
            </div>
          )}
          {!collapsed && (
            <div
              className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0"
              style={{ boxShadow: "0 0 6px #34d399" }}
            />
          )}
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md dark:text-zinc-600 text-zinc-400 dark:hover:text-zinc-300 hover:text-zinc-700 dark:hover:bg-white/[0.05] hover:bg-zinc-100 transition-colors ml-auto shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ArrowRight2 size={12} color="currentColor" />
            ) : (
              <ArrowLeft2 size={12} color="currentColor" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-600">
              Operations
            </p>
          )}
          <div className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon, badge }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobile}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "group relative flex items-center rounded-lg transition-colors",
                    collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2",
                    isActive
                      ? "bg-amber-500/10 text-amber-500 dark:text-amber-400"
                      : "dark:text-zinc-400 text-zinc-600 dark:hover:bg-white/[0.04] hover:bg-zinc-100 dark:hover:text-zinc-200 hover:text-zinc-900"
                  )}
                >
                  {isActive && !collapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-amber-500" />
                  )}
                  <Icon
                    size={16}
                    color={isActive ? "#f59e0b" : "currentColor"}
                    variant={isActive ? "Bold" : "Linear"}
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">{label}</span>
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
                    </>
                  )}
                  {collapsed && badge && (
                    <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t dark:border-white/[0.06] border-zinc-200 p-2 space-y-0.5">
          <ThemeToggle collapsed={collapsed} />

          <Link
            href="/settings"
            onClick={closeMobile}
            title={collapsed ? "Settings" : undefined}
            className={cn(
              "relative flex items-center rounded-lg transition-colors",
              collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2",
              settingsActive
                ? "bg-amber-500/10 text-amber-500 dark:text-amber-400"
                : "text-zinc-500 dark:hover:bg-white/[0.04] hover:bg-zinc-100 dark:hover:text-zinc-300 hover:text-zinc-700"
            )}
          >
            {settingsActive && !collapsed && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-amber-500" />
            )}
            <Setting2
              size={16}
              color={settingsActive ? "#f59e0b" : "currentColor"}
              variant={settingsActive ? "Bold" : "Linear"}
            />
            {!collapsed && <span className="text-sm">Settings</span>}
          </Link>

          {collapsed ? (
            <div className="flex justify-center py-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 dark:text-amber-300 text-[10px] font-bold">
                FM
              </div>
            </div>
          ) : (
            <div className="mx-1 flex items-center gap-2 rounded-lg dark:bg-white/[0.03] bg-zinc-50 p-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 dark:text-amber-300 text-[10px] font-bold shrink-0">
                FM
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium dark:text-zinc-300 text-zinc-700 leading-none truncate">Fleet Manager</p>
                <p className="text-[10px] dark:text-zinc-600 text-zinc-500 leading-none mt-0.5">Admin</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
