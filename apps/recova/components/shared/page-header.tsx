import * as React from "react"
import { Bell } from "lucide-react"

/**
 * Page header — Figma: title 30/36 bold, subtitle 16/24 subtle,
 * right-aligned actions plus a bell with a red count badge.
 */
export function PageHeader({
  title,
  description,
  actions,
  notificationCount = 3,
}: {
  title: string
  description: string
  actions?: React.ReactNode
  notificationCount?: number
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 px-8 pb-6 pt-8">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold leading-9 text-ink-header">{title}</h1>
        <p className="mt-1 text-base text-subtle">{description}</p>
      </div>
      <div className="flex items-center gap-4">
        {actions}
        <button
          type="button"
          className="relative flex size-11 items-center justify-center rounded-full text-body transition-colors hover:bg-white"
          aria-label={`Notifications: ${notificationCount} unread`}
        >
          <Bell className="size-6" />
          {notificationCount > 0 ? (
            <span className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-full bg-error-600 text-[10px] font-bold text-white">
              {notificationCount}
            </span>
          ) : null}
        </button>
      </div>
    </header>
  )
}
