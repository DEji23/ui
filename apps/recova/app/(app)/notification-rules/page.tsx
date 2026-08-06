import { Mail, MessageSquare, MonitorSmartphone, Save } from "lucide-react"

import { NOTIFICATION_TEMPLATES } from "@/lib/data/notifications"
import { can } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

const CHANNEL_ICON = {
  SMS: MessageSquare,
  EMAIL: Mail,
  DASHBOARD: MonitorSmartphone,
} as const

/**
 * Notification rules.
 * The PRD requires escalation copy to be "clear, factual, and not overly
 * aggressive" — so the exact borrower-facing text is shown inline for review
 * rather than hidden behind an edit modal.
 */
export default function NotificationRulesPage() {
  const mayEdit = can(CURRENT_USER.role, "policy.configure")

  return (
    <>
      <PageHeader
        title="Notification Rules"
        description="Borrower and operator messaging across SMS, email and dashboard channels."
        actions={
          <Button variant="primary" className="h-12 px-5" disabled={!mayEdit}>
            Save Changes
            <Save />
          </Button>
        }
      />

      <div className="flex flex-col gap-6 px-8 pb-12">
        <Alert tone="info" title="Consumer protection review">
          Escalation messaging is reviewed before Collections and Legal Review stages.
          Copy must be factual and must not overstate consequences.
        </Alert>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {NOTIFICATION_TEMPLATES.map((template) => (
            <Card key={template.id} className="flex flex-col gap-4 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">{template.event}</p>
                  <p className="font-mono text-xs text-subtle">{template.trigger}</p>
                </div>
                <Badge dot tone={template.enabled ? "success" : "neutral"}>
                  {template.enabled ? "Active" : "Disabled"}
                </Badge>
              </div>

              {template.subject ? (
                <p className="text-xs text-body">
                  <span className="font-semibold text-ink">Subject:</span>{" "}
                  {template.subject}
                </p>
              ) : null}

              <p className="rounded-[var(--radius-nav)] bg-surface p-3 text-xs leading-relaxed text-body">
                {template.body}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {template.channels.map((channel) => {
                  const Icon = CHANNEL_ICON[channel]
                  return (
                    <span
                      key={channel}
                      className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-bold text-body"
                    >
                      <Icon className="size-3" />
                      {channel}
                    </span>
                  )
                })}
                <span className="text-[10px] text-subtle">
                  → {template.audience.join(", ")}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
