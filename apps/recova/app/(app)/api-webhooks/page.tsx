import { KeyRound, Webhook } from "lucide-react"

import { relativeTime } from "@/lib/format"
import { WEBHOOK_EVENTS } from "@/lib/data/notifications"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/shared/page-header"
import { ApiWebhooksPageActions } from "@/components/wizards/misc-page-actions"

/** Developer platform — API keys, webhook endpoints and delivery health. */
const API_KEYS = [
  {
    id: "key_prod_01",
    label: "VFD MFB — Production",
    prefix: "rk_live_9f2c",
    environment: "Production",
    scopes: ["customers:write", "mandates:write", "recoveries:write"],
    ipAllowlist: "102.89.0.0/16",
    lastUsedAt: "2026-08-06T10:41:00Z",
    rotatedAt: "2026-06-01T09:00:00Z",
  },
  {
    id: "key_uat_01",
    label: "VFD MFB — UAT",
    prefix: "rk_test_41ab",
    environment: "UAT",
    scopes: ["customers:write", "mandates:write"],
    ipAllowlist: "Any",
    lastUsedAt: "2026-08-05T14:20:00Z",
    rotatedAt: "2026-07-15T09:00:00Z",
  },
  {
    id: "key_sbx_01",
    label: "Partner Lender — Sandbox",
    prefix: "rk_test_77de",
    environment: "Sandbox",
    scopes: ["customers:write"],
    ipAllowlist: "Any",
    lastUsedAt: "2026-08-04T08:00:00Z",
    rotatedAt: "2026-08-01T09:00:00Z",
  },
]

const ENDPOINTS = [
  {
    url: "https://api.vfdmfb.com/hooks/recova",
    events: 9,
    delivered: 12_884,
    failed: 12,
    status: "Healthy" as const,
  },
  {
    url: "https://partner-lender.ng/callbacks/recovery",
    events: 4,
    delivered: 3_210,
    failed: 214,
    status: "Degraded" as const,
  },
]

const ENV_TONE = {
  Production: "success",
  UAT: "warning",
  Sandbox: "neutral",
} as const

export default function ApiWebhooksPage() {
  return (
    <>
      <PageHeader
        title="API & Webhooks"
        description="Credentials, event subscriptions and delivery health for client integrations."
        actions={<ApiWebhooksPageActions />}
      />

      <div className="flex flex-col gap-6 px-8 pb-12">
        <Alert tone="warning" title="Webhook authenticity">
          Every event is signed, timestamped and replay-protected. Consumers must
          verify the signature and reject events outside the timestamp tolerance —
          otherwise false repayment, reversal or dispute updates can be injected into
          client systems.
        </Alert>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Scoped, rotatable, environment-separated. Keys are never shown in full
                after creation.
              </CardDescription>
            </div>
            <KeyRound className="size-5 text-brand" />
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Label</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>IP Allowlist</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Rotated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {API_KEYS.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-semibold text-ink">
                      {key.label}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-subtle">
                      {key.prefix}••••••••
                    </TableCell>
                    <TableCell>
                      <Badge tone={ENV_TONE[key.environment as keyof typeof ENV_TONE]}>
                        {key.environment}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-subtle">
                      {key.scopes.join(", ")}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-subtle">
                      {key.ipAllowlist}
                    </TableCell>
                    <TableCell className="text-subtle">
                      {relativeTime(key.lastUsedAt)}
                    </TableCell>
                    <TableCell className="text-subtle">
                      {relativeTime(key.rotatedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <div>
                <CardTitle>Webhook Endpoints</CardTitle>
                <CardDescription>Delivery health per registered URL</CardDescription>
              </div>
              <Webhook className="size-5 text-brand" />
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-0">
              {ENDPOINTS.map((endpoint) => {
                const rate =
                  (endpoint.delivered / (endpoint.delivered + endpoint.failed)) * 100
                return (
                  <div
                    key={endpoint.url}
                    className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-stroke p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="break-all font-mono text-xs text-ink">
                        {endpoint.url}
                      </p>
                      <Badge
                        dot
                        tone={endpoint.status === "Healthy" ? "success" : "warning"}
                      >
                        {endpoint.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-subtle">
                      {endpoint.events} events subscribed ·{" "}
                      {endpoint.delivered.toLocaleString()} delivered ·{" "}
                      {endpoint.failed} failed ({rate.toFixed(2)}% success)
                    </p>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={
                          rate >= 98
                            ? "h-full rounded-full bg-success-500"
                            : "h-full rounded-full bg-warning-600"
                        }
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              <p className="text-xs text-subtle">
                Failed deliveries retry with exponential backoff, then land in a
                dead-letter queue for manual replay.
              </p>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <div>
                <CardTitle>Event Catalogue</CardTitle>
                <CardDescription>
                  Subscribable events emitted in near real time
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 p-0">
              {WEBHOOK_EVENTS.map((event) => (
                <Badge key={event} tone="info" className="font-mono">
                  {event}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
