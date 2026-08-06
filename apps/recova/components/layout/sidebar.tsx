"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut } from "lucide-react"

import { cn } from "@/lib/utils"
import { can } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import { NAV_GROUPS } from "./nav-config"

/**
 * Left rail — Figma node 6100:7027.
 * 255px, near-black surface, active item is a #222a3d pill with #4edea3 text,
 * section captions at 10px/50% opacity, user card pinned to the bottom.
 *
 * Items whose permission the current role lacks are not rendered at all,
 * which is the RBAC PRD's least-privilege principle applied to navigation.
 */
export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[255px] flex-col bg-rail lg:flex">
      <div className="sticky top-0 z-10 border-b border-rail-border bg-rail px-6 py-6">
        <p className="text-base font-bold tracking-[-0.8px] text-rail-brand">
          RECOVA
        </p>
        <p className="text-[10px] tracking-[2px] text-brand-accent opacity-80">
          PRODUCTION
        </p>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-32 pt-2">
        {NAV_GROUPS.map((group, groupIndex) => {
          const items = group.items.filter(
            (item) => !item.permission || can(CURRENT_USER.role, item.permission)
          )
          if (items.length === 0) return null

          return (
            <div key={group.label ?? `group-${groupIndex}`} className="flex flex-col gap-1">
              {group.label ? (
                <div className="flex flex-col gap-4 px-4 pb-1 pt-3">
                  <div className="h-px w-full bg-rail-divider" />
                  <p className="text-[10px] leading-[15px] text-rail-text opacity-50">
                    {group.label}
                  </p>
                </div>
              ) : null}

              {items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-12 items-center gap-3 rounded-[var(--radius-nav)] px-4 text-sm transition-colors",
                      active
                        ? "rounded-xl bg-rail-active font-semibold text-brand-accent"
                        : "text-rail-text hover:bg-white/5"
                    )}
                  >
                    <Icon className="size-5 shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      <div className="absolute inset-x-0 bottom-0 bg-rail p-4">
        <div className="flex items-center gap-3 rounded-[var(--radius-control)] bg-rail-card p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-accent text-xs font-bold text-rail">
            {CURRENT_USER.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-white">{CURRENT_USER.name}</p>
            <p className="truncate text-[10px] uppercase tracking-wide text-rail-text opacity-70">
              {CURRENT_USER.roleLabel}
            </p>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            className="text-rail-text transition-colors hover:text-white"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
