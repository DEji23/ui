"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TabItem {
  value: string
  label: string
  count?: number
}

/**
 * Underline tab strip with per-tab counts — the filter row above every
 * queue table in the Figma file.
 */
export function Tabs({
  items,
  value,
  onValueChange,
  className,
}: {
  items: TabItem[]
  value: string
  onValueChange: (value: string) => void
  className?: string
}) {
  return (
    <div
      role="tablist"
      className={cn("flex flex-wrap items-center gap-6 border-b border-stroke", className)}
    >
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onValueChange(item.value)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm transition-colors",
              active
                ? "border-brand font-semibold text-brand"
                : "border-transparent text-body hover:text-ink"
            )}
          >
            {item.label}
            {item.count !== undefined ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  active ? "bg-brand-subtle text-brand" : "bg-gray-100 text-subtle"
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
