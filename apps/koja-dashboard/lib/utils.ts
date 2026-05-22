import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNGN(amount: number) {
  return `₦${(amount / 1000).toFixed(0)}K`
}

export function formatNGNFull(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
