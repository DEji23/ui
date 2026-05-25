import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `₦${(amount / 1_000_000_000).toFixed(1)}B`
  }
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(0)}K`
  }
  return formatCurrency(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "Yesterday"
  return `${diffDays}d ago`
}

export function maskBVN(bvn: string): string {
  return "●●●●●●●●●" + bvn.slice(-2)
}

export function maskAccount(account: string): string {
  return "●●●●●●●●" + account.slice(-2)
}

export function getSLAStatus(deadline: string): "safe" | "warning" | "urgent" | "breached" {
  const now = new Date()
  const end = new Date(deadline)
  const diffMs = end.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffMs < 0) return "breached"
  if (diffDays < 1) return "urgent"
  if (diffDays < 3) return "warning"
  return "safe"
}
