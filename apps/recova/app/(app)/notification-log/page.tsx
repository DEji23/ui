"use client"

import * as React from "react"
import { Mail, MessageSquare, MonitorSmartphone, RefreshCw } from "lucide-react"

import { relativeTime } from "@/lib/format"
import { NOTIFICATION_LOG, type DeliveryStatus } from "@/lib/data/risk"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, type TabItem } from "@/components/ui/tabs"
import { EmptyState } from "@/components/shared/empty-state"
import { QueueToolbar } from "@/components/shared/queue-toolbar"
import { PageHeader } from "@/components/shared/page-header"
import { ResultDialog } from "@/components/queues/action-dialogs"

type Tone = "neutral" | "success" | "warning" | "error" | "info" | "purple" | "brand"

const STATUS_TONE: Record<DeliveryStatus, Tone> = {
  DELIVERED: "success",
  SENT: "info",
  QUEUED: "neutral",
  FAILED: "error",
}

const CHANNEL_ICON = {
  SMS: MessageSquare,
  EMAIL: Mail,
  DASHBOARD: MonitorSmartphone,
} as const

const FILTERS: Array<{ value: string; label: string; states?: DeliveryStatus[] }> = [
  { value: "all", label: "All" },
  { value: "delivered", label: "Delivered", states: ["DELIVERED"] },
  { value: "sent", label: "Sent", states: ["SENT"] },
  { value: "queued", label: "Queued", states: ["QUEUED"] },
  { value: "failed", label: "Failed", states: ["FAILED"] },
]

/**
 * Notification delivery log.
 * Confirms the PRD's "instant" requirement is actually met, per channel,
 * with a visible reason on every failure rather than a silent drop.
 */
export default function NotificationLogPage() {
  const [tab, setTab] = React.useState("all")
  const [query, setQuery] = React.useState("")
  const [result, setResult] = React.useState<{ title: string; message: string } | null>(
    null
  )

  const tabItems: TabItem[] = FILTERS.map((f) => ({
    value: f.value,
    label: f.label,
    count: f.states
      ? NOTIFICATION_LOG.filter((n) => f.states!.includes(n.status)).length
      : NOTIFICATION_LOG.length,
  }))

  const rows = React.useMemo(() => {
    const filter = FILTERS.find((f) => f.value === tab)
    const q = query.trim().toLowerCase()
    return NOTIFICATION_LOG.filter(
      (n) => !filter?.states || filter.states.includes(n.status)
    ).filter(
      (n) =>
        q === "" ||
        [n.recipientName, n.recipient, n.event, n.loanId ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q)
    )
  }, [tab, query])

  const failed = NOTIFICATION_LOG.filter((n) => n.status === "FAILED")

  return (
    <>
      <PageHeader
        title="Notification Log"
        description="Delivery history for every borrower and operator notification across SMS, email and dashboard."
        actions={
          <Button
            variant="primary"
            className="h-12 px-5"
            onClick={() =>
              setResult({
                title: "Retry queued",
                message: `${failed.length} failed ${failed.length === 1 ? "delivery" : "deliveries"} re-queued for redelivery.`,
              })
            }
            disabled={failed.length === 0}
          >
            Retry Failed
            <RefreshCw />
          </Button>
        }
      />

      <div className="px-8 pb-12">
        <Card className="p-6">
          <QueueToolbar
            value={query}
            onValueChange={setQuery}
            placeholder="Search recipient, loan ID, event…"
          />
          <Tabs items={tabItems} value={tab} onValueChange={setTab} className="mt-6" />

          {rows.length === 0 ? (
            <EmptyState
              title="No notification found."
              description="Deliveries appear here the instant a lifecycle event fires."
            />
          ) : (
            <Table className="mt-2">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Event</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Loan</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Failure Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((n) => {
                  const Icon = CHANNEL_ICON[n.channel]
                  return (
                    <TableRow key={n.id}>
                      <TableCell className="max-w-[220px] whitespace-normal font-semibold text-ink">
                        {n.event}
                      </TableCell>
                      <TableCell>
                        <p className="text-ink">{n.recipientName}</p>
                        <p className="text-xs text-subtle">{n.recipient}</p>
                      </TableCell>
                      <TableCell className="text-subtle">{n.loanId ?? "—"}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-xs text-body">
                          <Icon className="size-3.5" />
                          {n.channel}
                        </span>
                      </TableCell>
                      <TableCell className="text-subtle">
                        {relativeTime(n.sentAt)}
                      </TableCell>
                      <TableCell>
                        <Badge dot tone={STATUS_TONE[n.status]}>
                          {n.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-error-600">
                        {n.failureReason ?? "—"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}
