import {
  Activity,
  BadgeCheck,
  Banknote,
  Building2,
  CreditCard,
  FileCheck2,
  FileClock,
  Gavel,
  KeyRound,
  Landmark,
  LayoutGrid,
  ListChecks,
  FileText,
  Rocket,
  Code2,
  MessageSquareWarning,
  Receipt,
  ScrollText,
  Scale,
  Settings2,
  ShieldCheck,
  Layers,
  TriangleAlert,
  Users,
  Wallet,
  BellRing,
  Undo2,
  History,
  ShieldAlert,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { Permission } from "@/lib/domain/rbac"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** Hidden entirely when the signed-in role lacks this permission. */
  permission?: Permission
}

export interface NavGroup {
  label: string | null
  items: NavItem[]
}

/**
 * Navigation transcribed from the Figma sidebar (node 6100:7027):
 * Dashboard, then ONBOARDING / RECOVERY OPERATIONS / RECOVERY RAILS /
 * FINANCE / REPORTING / CONFIGURATION / ADMIN.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
      { label: "Action Queues", href: "/action-queues", icon: ListChecks },
    ],
  },
  {
    label: "ONBOARDING",
    items: [
      { label: "iGree Consent", href: "/igree-consent", icon: BadgeCheck },
      { label: "Mandate Setup", href: "/mandate-setup", icon: FileCheck2 },
    ],
  },
  {
    label: "RECOVERY OPERATIONS",
    items: [
      { label: "Recovery Queue", href: "/recovery-queue", icon: Layers },
      { label: "Loan Cases", href: "/loans", icon: FileText },
      { label: "Collections", href: "/collections", icon: CreditCard },
      { label: "Legal Review", href: "/legal-review", icon: Gavel },
      { label: "Disputes", href: "/disputes", icon: MessageSquareWarning },
    ],
  },
  {
    label: "RECOVERY RAILS",
    items: [
      { label: "Mandates", href: "/mandates", icon: Landmark },
      { label: "NDD", href: "/ndd", icon: FileClock },
      { label: "Remita", href: "/remita", icon: Building2 },
      { label: "EasyPay", href: "/easypay", icon: Wallet },
    ],
  },
  {
    label: "FINANCE",
    items: [
      {
        label: "Settlements",
        href: "/settlements",
        icon: Banknote,
        permission: "ledger.view",
      },
      {
        label: "Reconciliation",
        href: "/reconciliation",
        icon: Scale,
        permission: "ledger.view",
      },
      {
        label: "Exception Queue",
        href: "/exception-queue",
        icon: TriangleAlert,
        permission: "ledger.view",
      },
      {
        label: "Refunds & Reversals",
        href: "/refunds",
        icon: Undo2,
        permission: "refund.initiate",
      },
    ],
  },
  {
    label: "REPORTING",
    items: [
      { label: "Reports", href: "/reports", icon: Receipt, permission: "report.view" },
      {
        label: "Audit Trail",
        href: "/audit-trail",
        icon: ScrollText,
        permission: "audit.view",
      },
    ],
  },
  {
    label: "CONFIGURATION",
    items: [
      {
        label: "Policy Engine",
        href: "/policy-engine",
        icon: Settings2,
        permission: "policy.configure",
      },
      {
        label: "Notification Rules",
        href: "/notification-rules",
        icon: BellRing,
        permission: "policy.configure",
      },
      {
        label: "Notification Log",
        href: "/notification-log",
        icon: History,
      },
      {
        label: "Risk & Abuse Controls",
        href: "/risk-controls",
        icon: ShieldAlert,
        permission: "recovery.override",
      },
    ],
  },
  {
    label: "ADMIN",
    items: [
      { label: "Organisations", href: "/organisations", icon: Building2 },
      { label: "Onboarding", href: "/onboarding", icon: Rocket },
      { label: "Developer Console", href: "/developer", icon: Code2 },
      { label: "User Management", href: "/users", icon: Users, permission: "role.assign" },
      { label: "Maker-Checker", href: "/maker-checker", icon: ShieldCheck },
      {
        label: "API & Webhooks",
        href: "/api-webhooks",
        icon: KeyRound,
        permission: "webhook.configure",
      },
      { label: "System Health", href: "/system-health", icon: Activity },
    ],
  },
]
