"use client"

import * as React from "react"
import { Play, ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  API_ENDPOINTS,
  ERROR_CODES,
  WEBHOOK_SAMPLE,
  type ApiEndpoint,
} from "@/lib/data/api-catalogue"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label, Select } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs } from "@/components/ui/tabs"

/** Simulated NIBSS outcomes the sandbox can force. */
const SIMULATIONS = [
  { value: "SUCCESS", label: "Success — full recovery" },
  { value: "PARTIAL", label: "Partial — balance below amount due" },
  { value: "INSUFFICIENT_FUNDS", label: "Insufficient funds" },
  { value: "DO_NOT_HONOR", label: "Do not honour" },
  { value: "BANK_TIMEOUT", label: "Bank timeout" },
  { value: "REVERSAL", label: "Reversal after settlement" },
  { value: "DISPUTE_OPEN", label: "Dispute open — recovery blocked" },
  { value: "IDEMPOTENCY_CONFLICT", label: "Idempotency key reused" },
]

const SIMULATED_RESPONSE: Record<string, string> = {
  SUCCESS: `202 Accepted

{
  "recovery_id": "rec_sbx_001",
  "status": "SUCCESS",
  "amount_recovered": 487500,
  "rail": "NDD",
  "transaction_reference": "TX-SBX-0001",
  "ledger_status": "PROVISIONAL"
}`,
  PARTIAL: `202 Accepted

{
  "recovery_id": "rec_sbx_002",
  "status": "PARTIAL",
  "amount_requested": 487500,
  "amount_recovered": 210000,
  "rail": "NDD",
  "next_retry_at": "2026-08-07T09:00:00Z"
}`,
  INSUFFICIENT_FUNDS: `402 Payment Required

{
  "code": "INSUFFICIENT_FUNDS",
  "message": "Account has no balance",
  "next_action": "WAIT_FOR_CREDIT_EVENT",
  "retry_scheduled_at": "2026-08-07T09:00:00Z"
}`,
  DO_NOT_HONOR: `402 Payment Required

{
  "code": "DO_NOT_HONOR",
  "message": "Bank declined the debit",
  "next_action": "REMOVE_ACCOUNT",
  "account_blacklisted": true
}`,
  BANK_TIMEOUT: `504 Gateway Timeout

{
  "code": "BANK_TIMEOUT",
  "message": "Bank did not respond within the timeout",
  "next_action": "RETRY_SAME_ACCOUNT",
  "guidance": "Query transaction status before resubmitting."
}`,
  REVERSAL: `200 OK

{
  "event": "reversal.received",
  "original_transaction": "TX-SBX-0001",
  "reversal_entry": "led_sbx_r01",
  "amount": 487500,
  "ledger_status": "REVERSED",
  "retry_eligible": false
}`,
  DISPUTE_OPEN: `423 Locked

{
  "code": "DISPUTE_OPEN",
  "message": "Loan is in DISPUTE OPEN — recovery is blocked",
  "dispute_id": "DSP-2026-0031",
  "retry_eligible": false
}`,
  IDEMPOTENCY_CONFLICT: `409 Conflict

{
  "code": "IDEMPOTENCY_CONFLICT",
  "message": "Idempotency key reused with a different payload",
  "original_request_id": "rec_req_7781"
}`,
}

/**
 * Developer console.
 * The sandbox panel is the important half — it lets an integrator reproduce
 * every failure branch (including the dispute block and an idempotency
 * conflict) before touching production.
 */
export function DeveloperConsole() {
  const [tab, setTab] = React.useState("reference")
  const [selected, setSelected] = React.useState<ApiEndpoint>(API_ENDPOINTS[1])
  const [simulation, setSimulation] = React.useState("SUCCESS")
  const [response, setResponse] = React.useState<string | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <Tabs
        items={[
          { value: "reference", label: "API Reference", count: API_ENDPOINTS.length },
          { value: "sandbox", label: "Sandbox" },
          { value: "errors", label: "Error Codes", count: ERROR_CODES.length },
          { value: "webhooks", label: "Webhooks" },
        ]}
        value={tab}
        onValueChange={setTab}
      />

      {tab === "reference" ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_1fr]">
          <Card className="p-4">
            <div className="flex flex-col gap-1">
              {API_ENDPOINTS.map((endpoint) => (
                <button
                  key={endpoint.id}
                  type="button"
                  onClick={() => setSelected(endpoint)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-[var(--radius-nav)] p-3 text-left transition-colors",
                    selected.id === endpoint.id ? "bg-brand-subtle" : "hover:bg-surface"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Badge tone={endpoint.method === "POST" ? "success" : "info"}>
                      {endpoint.method}
                    </Badge>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        selected.id === endpoint.id ? "text-brand" : "text-ink"
                      )}
                    >
                      {endpoint.title}
                    </span>
                  </span>
                  <span className="font-mono text-[10px] text-subtle">
                    {endpoint.path}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <div>
                <CardTitle>{selected.title}</CardTitle>
                <CardDescription>{selected.description}</CardDescription>
              </div>
              {selected.idempotent ? (
                <Badge tone="brand">
                  <ShieldCheck className="size-3" />
                  IDEMPOTENT
                </Badge>
              ) : null}
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-0">
              <CodeBlock label="Request" code={selected.requestSample} />
              <CodeBlock label="Response" code={selected.responseSample} />
              {selected.idempotent ? (
                <Alert tone="info" title="Idempotency required">
                  Every mandate, debit, refund and reversal request must carry an
                  Idempotency-Key. Replaying the same key returns the original
                  response instead of creating a second transaction.
                </Alert>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "sandbox" ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <div>
                <CardTitle>Scenario Simulator</CardTitle>
                <CardDescription>
                  Force a mock NIBSS response against POST /recoveries
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-0">
              <Alert tone="warning" title="Sandbox uses synthetic data only">
                Production data is never exposed in sandbox or UAT. Test environments
                are seeded with masked or synthetic records.
              </Alert>

              <div className="flex flex-col gap-2">
                <Label htmlFor="sim">Simulate outcome</Label>
                <Select
                  id="sim"
                  value={simulation}
                  onChange={(e) => {
                    setSimulation(e.target.value)
                    setResponse(null)
                  }}
                >
                  {SIMULATIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </div>

              <CodeBlock
                label="Request"
                code={`POST /recoveries
x-api-key: rk_test_41ab…
Idempotency-Key: sbx_${simulation.toLowerCase()}_001
X-Simulate: ${simulation}

{
  "loan_id": "LN-SANDBOX-0001",
  "amount_due": 487500,
  "due_date": "2026-08-06"
}`}
              />

              <Button
                variant="primary"
                size="md"
                block
                onClick={() => setResponse(SIMULATED_RESPONSE[simulation])}
              >
                <Play />
                Send Request
              </Button>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <div>
                <CardTitle>Response</CardTitle>
                <CardDescription>
                  What your integration will receive for this scenario
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {response ? (
                <CodeBlock label="" code={response} />
              ) : (
                <p className="py-12 text-center text-sm text-subtle">
                  Send a request to see the simulated response.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "errors" ? (
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Error Codes</CardTitle>
              <CardDescription>
                Branch on the code, not the message — messages may change
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-[820px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Code</TableHead>
                  <TableHead>HTTP</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Retryable</TableHead>
                  <TableHead>Client guidance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ERROR_CODES.map((error) => (
                  <TableRow key={error.code}>
                    <TableCell className="whitespace-nowrap font-mono text-xs font-semibold text-ink">
                      {error.code}
                    </TableCell>
                    <TableCell className="tabular text-subtle">{error.http}</TableCell>
                    <TableCell className="text-subtle">{error.message}</TableCell>
                    <TableCell>
                      <Badge dot tone={error.retryable ? "warning" : "error"}>
                        {error.retryable ? "Retryable" : "Terminal"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[340px] whitespace-normal text-xs text-body">
                      {error.guidance}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {tab === "webhooks" ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <div>
                <CardTitle>Sample Event</CardTitle>
                <CardDescription>
                  Signed, timestamped and replay-protected
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <CodeBlock label="" code={WEBHOOK_SAMPLE} />
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <div>
                <CardTitle>Verification Requirements</CardTitle>
                <CardDescription>Mandatory for every consumer</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-0">
              <Alert tone="error" title="Unverified webhooks are an injection vector">
                A consumer that does not verify the signature can be fed false
                repayment, reversal or dispute updates.
              </Alert>
              {[
                "Recompute the HMAC over `t.payload` using your webhook secret and compare in constant time.",
                "Reject events whose timestamp is outside a 5-minute tolerance.",
                "Deduplicate on the event id — at-least-once delivery means retries are normal.",
                "Return 2xx quickly; process asynchronously. Slow handlers trigger redelivery.",
                "Failed deliveries retry with exponential backoff, then land in a dead-letter queue.",
              ].map((rule) => (
                <div key={rule} className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
                  <p className="text-sm text-body">{rule}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
          {label}
        </p>
      ) : null}
      <pre className="overflow-x-auto rounded-[var(--radius-control)] bg-rail p-4 font-mono text-xs leading-relaxed text-rail-text">
        {code}
      </pre>
    </div>
  )
}
