"use client"

import * as React from "react"
import { Search, SlidersHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/** Search + Filter row that sits above every queue table in the design. */
export function QueueToolbar({
  value,
  onValueChange,
  placeholder,
  children,
  className,
}: {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-4", className)}>
      <div className="relative min-w-0 flex-1 sm:max-w-[290px]">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-12 w-full rounded-full border border-stroke bg-white pl-12 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-brand/40 focus:ring-2 focus:ring-brand/15"
        />
      </div>
      <div className="flex items-center gap-3">
        {children}
        <Button variant="outline" className="h-12 rounded-full px-5">
          <SlidersHorizontal />
          Filter
        </Button>
      </div>
    </div>
  )
}
