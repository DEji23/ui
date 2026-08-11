"use client"

import * as React from "react"
import { RefreshCw, XCircle } from "lucide-react"

import { maskAccount, naira, relativeTime, shortDate } from "@/lib/format"
import { APP_NOW } from "@/lib/clock"
import { MANDATES } from "@/lib/data/operations"
import { organisationIdForCustomer } from "@/lib/data/loans"
import { DEFAULT_POLICY } from "@/lib/domain/policy"
import { can } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import { TARIFFS } from "@/lib/domain/billing"
import {
  MANDATE_FAILURE_LABEL,
  RAIL_LABEL,
  type Mandate,
  type MandateStatus,
  type Rail,
} from "@/lib/domain/types"
import { Alert } from "@/components/ui/alert"
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
import { Sheet, SheetContent, DetailRow, DetailSection } from "@/components/ui/sheet"
import { EmptyState } from "@/components/shared/empty-state"
import { QueueToolbar } from "@/components/shared/queue-toolbar"
import { OrgScopeSelector } from "@/components/shared/org-scope-selector"
import {
  MandateStatusPill,
  RailBadge,
  ValidationStatusPill,
} from "@/components/shared/status-pill"
import { ReasonDialog, ResultDialog } from "@/components/queues/action-dialogs"

const FILTERS: Array<{ value: string; label: string; states?: MandateStatus[] }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active", states: ["ACTIVE"] },
  { value: "pending", label: "Pending Approval", states: ["PENDING_APPROVAL", "INITIATED"] },
  { value: "failed", label: "Failed", states: ["FAILED"] },
  { value: "revoked", label: "Revoked", states: ["REVOKED"] },
  { value: "expired", label: "Expired", states: ["EXPIRED"] },
]

/**
 * Mandate lifecycle management.
 *
 * Mandate status and validation status are rendered as two independent
 * columns, because the Mandate Orchestration PRD treats them as separate
 * state dimensions — a mandate can be PENDING_APPROVAL at the bank while the
 * customer has not yet completed the ₦50 validation transfer, and conflating
 * them is exactly how mandates "silently fail".
 */
export function MandateModule({
  rail,
  emptyTitle = "No mandate found.",
}: {
  /** Scopes the table to one provider — used by the NDD and Remita pages. */
  rail?: Rail
  emptyTitle?: string
}) {
  const [mandates, setMandates] = React.useState<Mandate[]>(MANDATES)
  const source = React.useMemo(
    () => (rail ? mandates.filter((m) => m.provider === rail) : mandates),
    [mandates, rail]
  )

  const [tab, setTab] = React.useState("all")
  const [query, setQuery] = React.useState("")
  const [org, setOrg] = React.useState("all")
  const [selected, setSelected] = React.useState<Mandate | null>(null)

  function updateMandate(updated: Mandate) {
    setMandates((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
    setSelected(updated)
  }

  const scoped = React.useMemo(
    () =>
      org === "all"
        ? source
        : source.filter((m) => organisationIdForCustomer(m.customerId) === org),
    [source, org]
  )

  const tabItems: TabItem[] = FILTERS.map((f) => ({
    value: f.value,
    label: f.label,
    count: f.states
      ? scoped.filter((m) => f.states!.includes(m.status)).length
      : scoped.length,
  }))

  const rows = React.useMemo(() => {
    const filter = FILTERS.find((f) => f.value === tab)
    const q = query.trim().toLowerCase()
    return scoped
      .filter((m) => !filter?.states || filter.states.includes(m.status))
      .filter(
        (m) =>
          q === "" ||
          [m.customerName, m.reference, m.accountNumber, m.bankName]
            .join(" ")
            .toLowerCase()
            .includes(q)
      )
  }, [scoped, tab, query])

  return (
    <>
      <Card className="p-6">
        <QueueToolbar
          value={query}
          onValueChange={setQuery}
          placeholder="Search borrower, mandate reference, account…"
        >
          <OrgScopeSelector value={org} onValueChange={setOrg} />
        </QueueToolbar>

        <Tabs items={tabItems} value={tab} onValueChange={setTab} className="mt-6" />

        {rows.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description="Mandates are created automatically against every BVN-linked account once consent is granted."
          />
        ) : (
          <Table className="mt-2">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Borrower</TableHead>
                <TableHead>Mandate Reference</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Max Amount</TableHead>
                <TableHead>Validation</TableHead>
                <TableHead>Last Checked</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m) => (
                <TableRow
                  key={m.id}
                  onClick={() => setSelected(m)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <p className="font-semibold text-ink">{m.customerName}</p>
                    <p className="text-xs text-subtle">{m.bankName}</p>
                  </TableCell>
                  <TableCell className="text-subtle">{m.reference}</TableCell>
                  <TableCell className="tabular text-subtle">
                    {maskAccount(m.accountNumber)}
                  </TableCell>
                  <TableCell>
                    <RailBadge rail={m.provider} />
                  </TableCell>
                  <TableCell className="tabular font-semibold">
                    {naira(m.maxAmount)}
                  </TableCell>
                  <TableCell>
                    <ValidationStatusPill status={m.validationStatus} />
                  </TableCell>
                  <TableCell className="text-subtle">
                    {relativeTime(m.lastCheckedAt)}
                  </TableCell>
                  <TableCell>
                    <MandateStatusPill status={m.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <MandateDetailSheet
        mandate={selected}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        onUpdate={updateMandate}
      />
    </>
  )
}

function MandateDetailSheet({
  mandate,
  open,
  onOpenChange,
  onUpdate,
}: {
  mandate: Mandate | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (updated: Mandate) => void
}) {
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const [result, setResult] = React.useState<{ title: string; message: string } | null>(
    null
  )

  if (!mandate) return null

  const mayRetry = can(CURRENT_USER.role, "mandate.retry")
  const mayCancel = can(CURRENT_USER.role, "mandate.cancel")

  const daysToExpiry = Math.round(
    (new Date(mandate.endDate).getTime() - Date.now()) / 86_400_000
  )
  const needsRefresh =
    daysToExpiry <=
    DEFAULT_POLICY.mandate.mandateExpiryDays - DEFAULT_POLICY.mandate.autoRefreshAfterDays

  function handleCancelConfirm(reasonCode: string) {
    if (!mandate) return
    onUpdate({ ...mandate, status: "REVOKED" })
    setResult({
      title: "Mandate cancelled",
      message: `${mandate.reference} has been revoked. Reason logged as ${reasonCode}. The account is removed from the debit pool until a new mandate is created.`,
    })
  }

  function handleRetry() {
    if (!mandate) return
    const failed = mandate.retryCount + 1 >= 2
    onUpdate({
      ...mandate,
      status: failed ? "FAILED" : "PENDING_APPROVAL",
      retryCount: mandate.retryCount + 1,
      lastCheckedAt: APP_NOW.toISOString(),
      failureReason: failed ? mandate.failureReason ?? "ACCOUNT_DORMANT" : null,
    })
    setResult({
      title: failed ? "Retry exhausted" : "Mandate setup retried",
      message: failed
        ? `${mandate.reference} has used both permitted retries within 24h. Recovery will fall back to the next ranked account or EasyPay.`
        : `A new mandate request was submitted to ${mandate.bankName}. Status is Pending Approval — the ₦50 validation transfer is required within ${DEFAULT_POLICY.mandate.validationWindowHours}h.`,
    })
  }

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title="Mandate Details"
        description={mandate.reference}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row">
            {mayCancel ? (
              <Button
                variant="dangerSoft"
                size="lg"
                className="sm:flex-1"
                disabled={mandate.status === "REVOKED"}
                onClick={() => setCancelOpen(true)}
              >
                <XCircle />
                {mandate.status === "REVOKED" ? "Mandate Revoked" : "Cancel Mandate"}
              </Button>
            ) : null}
            <Button
              variant="primary"
              size="lg"
              className="sm:flex-1"
              disabled={!mayRetry || mandate.status === "ACTIVE"}
              onClick={handleRetry}
            >
              <RefreshCw />
              {mandate.status === "ACTIVE" ? "Mandate Active" : "Retry Mandate Setup"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {mandate.failureReason ? (
            <Alert tone="error" title="Mandate Failed">
              {MANDATE_FAILURE_LABEL[mandate.failureReason]}.{" "}
              {mandate.failureReason === "ACCOUNT_DORMANT"
                ? "This account has been removed from the debit pool; alternate BVN-linked accounts will be tried."
                : mandate.failureReason === "USER_ABANDONED"
                  ? "Reminder notifications have been re-queued at 6h, 12h, 18h and 24h."
                  : "The orchestration engine will fall back to the next ranked account."}
            </Alert>
          ) : null}
          {mandate.validationStatus === "USER_ACTION_REQUIRED" ? (
            <Alert tone="warning" title="Awaiting Customer Validation">
              The borrower must complete the ₦
              {TARIFFS.MANDATE_ACTIVATION.cost} validation transfer. Auto-cancels{" "}
              {DEFAULT_POLICY.mandate.validationWindowHours}h after creation.
            </Alert>
          ) : null}
          {needsRefresh && mandate.status === "ACTIVE" ? (
            <Alert tone="warning" title="Refresh Due">
              Mandate expires in {daysToExpiry} days — auto-refresh threshold reached.
            </Alert>
          ) : null}

          <DetailSection title="Borrower & Account">
            <DetailRow label="Customer">{mandate.customerName}</DetailRow>
            <DetailRow label="Bank">
              {mandate.bankName} ({mandate.bankCode})
            </DetailRow>
            <DetailRow label="Account Number">
              {maskAccount(mandate.accountNumber)}
            </DetailRow>
          </DetailSection>

          <DetailSection title="Mandate">
            <DetailRow label="Reference">{mandate.reference}</DetailRow>
            <DetailRow label="External Reference">
              {mandate.externalReference}
            </DetailRow>
            <DetailRow label="Provider">
              <RailBadge rail={mandate.provider} />
            </DetailRow>
            <DetailRow label="Mandate Status">
              <MandateStatusPill status={mandate.status} />
            </DetailRow>
            <DetailRow label="Validation Status">
              <ValidationStatusPill status={mandate.validationStatus} />
            </DetailRow>
            <DetailRow label="Maximum Amount">{naira(mandate.maxAmount)}</DetailRow>
            <DetailRow label="Start Date">{shortDate(mandate.startDate)}</DetailRow>
            <DetailRow label="End Date">{shortDate(mandate.endDate)}</DetailRow>
            <DetailRow label="Setup Retries">
              {mandate.retryCount} of 2 permitted
            </DetailRow>
          </DetailSection>

          <DetailSection title="Synchronisation" divided={false}>
            <DetailRow label="Last Polled">
              {relativeTime(mandate.lastCheckedAt)}
            </DetailRow>
            <DetailRow label="Created">{shortDate(mandate.createdAt)}</DetailRow>
            <p className="text-xs text-subtle">
              Status is merged from scheduled polling and{" "}
              {RAIL_LABEL[mandate.provider]} webhook events; on conflict the later
              timestamp wins.
            </p>
          </DetailSection>
        </div>
      </SheetContent>
    </Sheet>

      <ReasonDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        action={{
          id: "cancel_mandate",
          label: "Cancel Mandate",
          permission: "mandate.cancel",
          requiresReason: true,
          tone: "danger",
        }}
        category="mandate_cancel"
        subject={`${mandate.reference} · ${mandate.customerName}`}
        onConfirm={handleCancelConfirm}
      />

      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}
