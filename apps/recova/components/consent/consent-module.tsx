"use client"

import * as React from "react"
import { BadgeCheck, ShieldOff, UserRoundX, Users, WalletCards } from "lucide-react"

import { maskAccount, naira, shortDate } from "@/lib/format"
import { CONSENTS } from "@/lib/data/operations"
import { IGREE_ONBOARDING_COST } from "@/lib/domain/billing"
import type { ConsentRecord, ConsentStatus } from "@/lib/domain/types"
import { Alert } from "@/components/ui/alert"
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
import { Sheet, SheetContent, DetailRow, DetailSection } from "@/components/ui/sheet"
import { EmptyState } from "@/components/shared/empty-state"
import { QueueToolbar } from "@/components/shared/queue-toolbar"
import { StatCard } from "@/components/shared/stat-card"
import { ConsentStatusPill } from "@/components/shared/status-pill"
import { ResultDialog } from "@/components/queues/action-dialogs"
import { CreateMandateDialog } from "@/components/wizards/create-mandate-dialog"

const FILTERS: Array<{ value: string; label: string; states?: ConsentStatus[] }> = [
  { value: "all", label: "All" },
  { value: "granted", label: "Granted", states: ["GRANTED"] },
  { value: "pending", label: "Pending", states: ["PENDING", "OTP_SENT"] },
  { value: "declined", label: "Declined", states: ["DECLINED"] },
  { value: "failed", label: "Verification Failed", states: ["VERIFICATION_FAILED"] },
  { value: "no-accounts", label: "No Linked Accounts", states: ["NO_LINKED_ACCOUNTS"] },
  { value: "revoked", label: "Revoked", states: ["REVOKED", "EXPIRED"] },
]

const CHANNEL_LABEL = {
  SMS_OTP: "SMS OTP",
  USSD: "USSD",
  BANK_APP: "Bank app",
} as const

/**
 * iGree consent management.
 *
 * The exit states from the PRD's three onboarding failure paths are first
 * class here — consent declined, identity verification failed (3 OTP retries
 * then a 24h lockout), and no BVN-linked accounts each get their own filter
 * and their own explanatory panel, because each needs a different operator
 * response.
 */
export function ConsentModule() {
  const [tab, setTab] = React.useState("all")
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<ConsentRecord | null>(null)

  const counts = React.useMemo(() => {
    const by = (s: ConsentStatus) => CONSENTS.filter((c) => c.status === s).length
    return {
      granted: by("GRANTED"),
      pending: by("PENDING") + by("OTP_SENT"),
      declined: by("DECLINED"),
      failed: by("VERIFICATION_FAILED"),
      noAccounts: by("NO_LINKED_ACCOUNTS"),
    }
  }, [])

  const tabItems: TabItem[] = FILTERS.map((f) => ({
    value: f.value,
    label: f.label,
    count: f.states
      ? CONSENTS.filter((c) => f.states!.includes(c.status)).length
      : CONSENTS.length,
  }))

  const rows = React.useMemo(() => {
    const filter = FILTERS.find((f) => f.value === tab)
    const q = query.trim().toLowerCase()
    return CONSENTS.filter((c) => !filter?.states || filter.states.includes(c.status)).filter(
      (c) =>
        q === "" ||
        [c.borrowerName, c.phone, c.email, c.bvnMasked].join(" ").toLowerCase().includes(q)
    )
  }, [tab, query])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Consent Granted"
          value={(1532 + counts.granted).toLocaleString()}
          icon={BadgeCheck}
          tone="success"
          delta={5.4}
          caption="vs last month"
        />
        <StatCard
          label="Pending Verification"
          value={(186 + counts.pending).toLocaleString()}
          icon={Users}
          tone="warning"
          caption="Awaiting OTP"
        />
        <StatCard
          label="Consent Declined"
          value={(54 + counts.declined).toLocaleString()}
          icon={ShieldOff}
          tone="error"
          caption="Application halted"
        />
        <StatCard
          label="Verification Failed"
          value={(75 + counts.failed).toLocaleString()}
          icon={UserRoundX}
          tone="error"
          caption="3 OTP retries · 24h lockout"
        />
        <StatCard
          label="No Linked Accounts"
          value={(3 + counts.noAccounts).toLocaleString()}
          icon={WalletCards}
          tone="warning"
          caption="KYC update required"
        />
      </div>

      <Card className="p-6">
        <QueueToolbar
          value={query}
          onValueChange={setQuery}
          placeholder="Search borrower, BVN, phone…"
        />

        <Tabs items={tabItems} value={tab} onValueChange={setTab} className="mt-6" />

        {rows.length === 0 ? (
          <EmptyState
            title="No consent record found."
            description="Initiate a verification to send the borrower through the iGree BVN journey."
          />
        ) : (
          <Table className="mt-2">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Borrower</TableHead>
                <TableHead>BVN</TableHead>
                <TableHead>Auth Channel</TableHead>
                <TableHead>Linked Accounts</TableHead>
                <TableHead>Consent Version</TableHead>
                <TableHead>Granted</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <p className="font-semibold text-ink">{c.borrowerName}</p>
                    <p className="text-xs text-subtle">{c.phone}</p>
                  </TableCell>
                  <TableCell className="tabular text-subtle">{c.bvnMasked}</TableCell>
                  <TableCell className="text-subtle">
                    {CHANNEL_LABEL[c.authChannel]}
                  </TableCell>
                  <TableCell className="tabular font-semibold">
                    {c.linkedAccounts.length}
                  </TableCell>
                  <TableCell className="text-subtle">{c.version}</TableCell>
                  <TableCell className="text-subtle">
                    {c.grantedAt ? shortDate(c.grantedAt) : "—"}
                  </TableCell>
                  <TableCell className="text-subtle">
                    {c.expiresAt ? shortDate(c.expiresAt) : "—"}
                  </TableCell>
                  <TableCell>
                    <ConsentStatusPill status={c.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <ConsentDetailSheet
        record={selected}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  )
}

function ConsentDetailSheet({
  record,
  open,
  onOpenChange,
}: {
  record: ConsentRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [createOpen, setCreateOpen] = React.useState(false)
  const [result, setResult] = React.useState<{ title: string; message: string } | null>(
    null
  )

  if (!record) return null

  const canCreateMandates =
    record.status === "GRANTED" && record.linkedAccounts.length > 0

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title="Consent Record"
        description={`${record.borrowerName} · ${record.bvnMasked}`}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="soft"
              size="lg"
              className="sm:flex-1"
              onClick={() =>
                setResult({
                  title: "Evidence queued",
                  message: `The signed consent artefact for ${record.borrowerName} — version ${record.version}, ${CHANNEL_LABEL[record.authChannel]}, with timestamp — has been queued for download as NDPA evidence.`,
                })
              }
            >
              Download Evidence
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="sm:flex-1"
              disabled={!canCreateMandates}
              title={canCreateMandates ? undefined : "Consent must be granted with at least one linked account first."}
              onClick={() => setCreateOpen(true)}
            >
              Create Mandates
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {record.status === "DECLINED" ? (
            <Alert tone="error" title="Consent Declined">
              The loan application is halted. iGree returned{" "}
              <code className="font-mono">consent_denied</code> — no further workflow
              runs until the borrower re-consents.
            </Alert>
          ) : null}
          {record.status === "VERIFICATION_FAILED" ? (
            <Alert tone="error" title="Identity Verification Failed">
              {record.otpAttempts} of 3 OTP attempts used. The borrower is locked out
              for 24 hours; both borrower and loan officer have been notified.
            </Alert>
          ) : null}
          {record.status === "NO_LINKED_ACCOUNTS" ? (
            <Alert tone="warning" title="No BVN-Linked Accounts">
              iGree returned identity data but no active accounts. The borrower must
              update KYC with their bank before recovery can proceed.
            </Alert>
          ) : null}
          {record.status === "GRANTED" ? (
            <Alert tone="success" title="Consent Granted">
              Stored for compliance with version, scope, timestamp and auth channel as
              NDPA evidence.
            </Alert>
          ) : null}

          <DetailSection title="Identity">
            <DetailRow label="Full Name">{record.borrowerName}</DetailRow>
            <DetailRow label="BVN">{record.bvnMasked}</DetailRow>
            <DetailRow label="Phone Number">{record.phone}</DetailRow>
            <DetailRow label="Email Address">{record.email}</DetailRow>
          </DetailSection>

          <DetailSection title="Consent Artefact">
            <DetailRow label="Status">
              <ConsentStatusPill status={record.status} />
            </DetailRow>
            <DetailRow label="Consent Version">{record.version}</DetailRow>
            <DetailRow label="Authentication Channel">
              {CHANNEL_LABEL[record.authChannel]}
            </DetailRow>
            <DetailRow label="Granted At">
              {record.grantedAt ? shortDate(record.grantedAt) : "—"}
            </DetailRow>
            <DetailRow label="Expires At">
              {record.expiresAt ? shortDate(record.expiresAt) : "—"}
            </DetailRow>
            <DetailRow label="Scope">
              {record.scope.length ? record.scope.join(", ") : "—"}
            </DetailRow>
            <DetailRow label="₦50 Execution Debit">
              {record.executionFeeCharged ? "Charged" : "Not charged"}
            </DetailRow>
            <DetailRow label="Onboarding Cost">
              {naira(record.executionFeeCharged ? IGREE_ONBOARDING_COST : 0)}
            </DetailRow>
          </DetailSection>

          <DetailSection title="BVN-Linked Accounts" divided={false}>
            {record.linkedAccounts.length === 0 ? (
              <p className="text-xs text-subtle">No accounts returned by iGree.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {record.linkedAccounts.map((account) => (
                  <div
                    key={account.accountNumber}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-nav)] bg-surface p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-ink">
                        {account.bankName} · {maskAccount(account.accountNumber)}
                        {account.isPrimary ? (
                          <Badge tone="brand" className="ml-2">
                            PRIMARY
                          </Badge>
                        ) : null}
                      </p>
                      <p className="text-[10px] text-subtle">
                        Inflow score {account.inflowScore.toFixed(2)} · mandate{" "}
                        {account.mandateStatus}
                      </p>
                    </div>
                    <span className="tabular shrink-0 text-xs font-semibold text-ink">
                      {account.lastBalance === null ? "—" : naira(account.lastBalance)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DetailSection>
        </div>
      </SheetContent>
    </Sheet>

      <CreateMandateDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}
