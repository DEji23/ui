"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home2, TaskSquare, DocumentText, People, Judge, ShieldTick, ClipboardText,
  Category2, Flash, Moneys, MessageQuestion, Setting2, Notification,
  ProfileCircle, TickSquare, Eye, Code, StatusUp, Chart, LogoutCurve,
  Setting, Moon, Sun, Cpu, Calendar, Routing, ReceiptEdit, Key,
} from "iconsax-react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useSidebar } from "./sidebar-context"

const ENV = "PRODUCTION" as "PRODUCTION" | "UAT" | "SANDBOX"

const envConfig = {
  PRODUCTION: { label: "PRODUCTION", className: "bg-red-500/15 text-red-600 border-red-500/20" },
  UAT: { label: "UAT", className: "bg-amber-500/15 text-amber-500 border-amber-500/20" },
  SANDBOX: { label: "SANDBOX", className: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: Home2 },
    ],
  },
  {
    title: "Recovery Operations",
    items: [
      { label: "Recovery Queue", href: "/recovery-queue", icon: TaskSquare },
      { label: "Loan Cases", href: "/loan-cases", icon: DocumentText },
      { label: "Repayment Scheduler", href: "/repayment-scheduler", icon: Calendar },
      { label: "Collections", href: "/collections", icon: People },
      { label: "Legal Review", href: "/legal-review", icon: Judge },
      { label: "Decision Engine", href: "/decision-engine", icon: Cpu },
      { label: "Orchestration Engine", href: "/recovery-orchestration", icon: Routing },
    ],
  },
  {
    title: "Onboarding",
    items: [
      { label: "iGree Consent", href: "/igree", icon: ShieldTick },
      { label: "Mandate Setup", href: "/mandate-setup", icon: ClipboardText },
    ],
  },
  {
    title: "Mandates & Rails",
    items: [
      { label: "Mandates", href: "/mandates", icon: Category2 },
      { label: "EasyPay Fallback", href: "/easypay", icon: Flash },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Settlements", href: "/settlements", icon: Moneys },
      { label: "Disputes", href: "/disputes", icon: MessageQuestion },
      { label: "Ledger & Reconciliation", href: "/ledger", icon: ReceiptEdit },
    ],
  },
  {
    title: "Configuration",
    items: [
      { label: "Policy Engine", href: "/policy-engine", icon: Setting2 },
      { label: "Notification Rules", href: "/notification-rules", icon: Notification },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "User Management", href: "/users", icon: ProfileCircle },
      { label: "Maker-Checker", href: "/maker-checker", icon: TickSquare },
      { label: "RBAC & Workflow", href: "/rbac", icon: Key },
      { label: "Audit & Compliance", href: "/audit", icon: Eye },
      { label: "API & Webhooks", href: "/api-webhooks", icon: Code },
      { label: "System Health", href: "/system-health", icon: StatusUp },
      { label: "Reports", href: "/reports", icon: Chart },
    ],
  },
]

function NavLink({ item, collapsed, onClick }: { item: NavItem; collapsed: boolean; onClick?: () => void }) {
  const pathname = usePathname()
  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 py-2 text-sm transition-colors duration-100",
        collapsed ? "px-3 justify-center" : "px-4",
        isActive ? "text-sidebar-foreground" : "text-sidebar-muted-foreground hover:text-sidebar-foreground"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
      )}
      <span className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
        isActive ? "bg-sidebar-accent text-sidebar-foreground" : "group-hover:bg-sidebar-accent/60"
      )}>
        <Icon size={16} variant={isActive ? "Bold" : "Linear"} className="shrink-0" />
      </span>
      {!collapsed && (
        <>
          <span className="truncate font-medium">{item.label}</span>
          {item.badge !== undefined && (
            <span className="ml-auto flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
              {item.badge}
            </span>
          )}
        </>
      )}
      {collapsed && item.badge !== undefined && (
        <span className="absolute right-1 top-1 flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-bold text-white">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

export function Sidebar() {
  const { theme, setTheme } = useTheme()
  const { collapsed, toggleCollapsed, mobileOpen, closeMobile } = useSidebar()
  const env = envConfig[ENV]

  const sidebarContent = (
    <aside className={cn(
      "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200",
      collapsed ? "w-14" : "w-60",
    )}>
      {/* Header */}
      <div className={cn(
        "flex h-14 shrink-0 items-center border-b border-sidebar-border",
        collapsed ? "justify-center px-0" : "gap-2.5 px-4"
      )}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
          <span className="text-sm font-bold text-white">R</span>
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">RECOVA</span>
            <span className={cn("ml-2 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider", env.className)}>
              {env.label}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 no-scrollbar">
        {navSections.map((section) => (
          <div key={section.title} className="mb-1">
            {!collapsed && (
              <p className="mb-1 px-4 pt-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted-foreground">
                {section.title}
              </p>
            )}
            {collapsed && <div className="mb-1 mt-2 mx-3 h-px bg-sidebar-border/50" />}
            {section.items.map((item) => (
              <NavLink key={item.href} item={item} collapsed={collapsed} onClick={closeMobile} />
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={collapsed ? (theme === "dark" ? "Light mode" : "Dark mode") : undefined}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg py-2 text-sm text-sidebar-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed ? "justify-center px-0" : "px-3"
          )}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </span>
          {!collapsed && <span className="font-medium">{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
        </button>

        <div className={cn(
          "flex items-center gap-2.5 rounded-lg py-2 transition-colors hover:bg-sidebar-accent cursor-pointer",
          collapsed ? "justify-center px-0" : "px-3"
        )}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-[11px] font-bold text-white">AN</div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold text-sidebar-foreground">Adaora Nwosu</p>
              <p className="truncate text-[10px] text-sidebar-muted-foreground">Debt Recovery Manager</p>
            </div>
          )}
          {!collapsed && <Setting size={14} className="shrink-0 text-sidebar-muted-foreground" />}
        </div>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "hidden lg:flex w-full items-center gap-2.5 rounded-lg py-2 text-sm text-sidebar-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed ? "justify-center px-0" : "px-3"
          )}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </span>
          {!collapsed && <span className="font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-screen shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMobile}
          />
          <div className="relative flex h-full w-60 shrink-0">
            {sidebarContent}
            <button
              onClick={closeMobile}
              className="absolute right-2 top-3.5 flex h-7 w-7 items-center justify-center rounded-lg text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
