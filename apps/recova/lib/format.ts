const nairaCompact = new Intl.NumberFormat("en-NG", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const nairaFull = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** ₦487,500.00 — the form used in tables and detail panels. */
export function naira(amount: number): string {
  return `₦${nairaFull.format(amount)}`
}

/** ₦284.8M — the form used on dashboard stat tiles. */
export function nairaShort(amount: number): string {
  return `₦${nairaCompact.format(amount)}`
}

export function percent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

export function signedPercent(value: number, digits = 0): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`
}

/** Masks all but the last 4 digits — required for BVN/NUBAN in logs and UI. */
export function maskAccount(value: string): string {
  if (value.length <= 4) return value
  return `${"•".repeat(Math.max(3, value.length - 4))}${value.slice(-4)}`
}

export function relativeTime(iso: string, now: Date = new Date()): string {
  const diff = now.getTime() - new Date(iso).getTime()
  const minutes = Math.round(diff / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.round(days / 30)}mo ago`
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function dateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}
