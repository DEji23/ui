import * as React from "react"
import { Inbox } from "lucide-react"
import type { LucideIcon } from "lucide-react"

/** Centred empty state — matches the "No recovery case found." screen. */
export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-gray-100">
        <Icon className="size-8 text-muted" />
      </div>
      <div>
        <p className="text-lg font-bold text-ink">{title}</p>
        {description ? (
          <p className="mt-1 max-w-md text-sm text-subtle">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
