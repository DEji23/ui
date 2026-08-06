import Link from "next/link"
import { Building2, CheckCircle2, Plus, ShieldAlert } from "lucide-react"

import { shortDate } from "@/lib/format"
import { ORGANISATIONS } from "@/lib/data/organisations"
import {
  ONBOARDING_ORDER,
  ONBOARDING_STATE_LABEL,
  evaluateActivation,
  stageIndex,
  type OnboardingState,
} from "@/lib/domain/onboarding"
import { can } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { StatCard } from "@/components/shared/stat-card"

type Tone = "neutral" | "success" | "warning" | "error" | "info" | "purple" | "brand"

const STATE_TONE: Record<OnboardingState, Tone> = {
  INVITED: "neutral",
  PROFILE_IN_PROGRESS: "info",
  COMPLIANCE_REVIEW: "warning",
  CONFIGURATION_IN_PROGRESS: "warning",
  SANDBOX_READY: "info",
  UAT_CERTIFIED: "purple",
  PRODUCTION_ACTIVE: "success",
}

const ENV_TONE = {
  SANDBOX: "neutral",
  UAT: "warning",
  PRODUCTION: "success",
} as const

/**
 * Tenant register.
 * The pipeline strip makes the environment gate visible: an organisation
 * cannot skip from Sandbox to Production, and the awaiting-approval count
 * is the queue an internal admin actually works.
 */
export default function OrganisationsPage() {
  const live = ORGANISATIONS.filter((o) => o.state === "PRODUCTION_ACTIVE")
  const awaitingApproval = ORGANISATIONS.filter(
    (o) => o.state === "UAT_CERTIFIED" && !o.checklist.productionApproved
  )
  const inSetup = ORGANISATIONS.filter(
    (o) => stageIndex(o.state) < stageIndex("SANDBOX_READY")
  )
  const mayApprove = can(CURRENT_USER.role, "role.assign")

  return (
    <>
      <PageHeader
        title="Organisations"
        description="Tenants onboarding onto the platform. Live recovery is gated on the activation checklist."
        actions={
          <Button variant="primary" className="h-12 px-5" disabled={!mayApprove}>
            Create Organisation
            <Plus />
          </Button>
        }
      />

      <div className="flex flex-col gap-6 px-8 pb-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Production Active"
            value={String(live.length)}
            icon={CheckCircle2}
            tone="success"
            caption="Live recovery permitted"
          />
          <StatCard
            label="Awaiting Go-Live"
            value={String(awaitingApproval.length)}
            icon={ShieldAlert}
            tone="warning"
            caption="UAT certified, approval pending"
          />
          <StatCard
            label="In Setup"
            value={String(inSetup.length)}
            icon={Building2}
            tone="info"
            caption="Profile, compliance or configuration"
          />
          <StatCard
            label="Total Tenants"
            value={String(ORGANISATIONS.length)}
            icon={Building2}
            tone="brand"
            caption="Internal and external"
          />
        </div>

        {awaitingApproval.length > 0 ? (
          <Alert tone="warning" title="Go-live approvals outstanding">
            {awaitingApproval.map((o) => o.tradingName).join(", ")} passed UAT but has
            not been countersigned. Production credentials are withheld until an
            internal approver signs off.
          </Alert>
        ) : null}

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Onboarding Pipeline</CardTitle>
              <CardDescription>
                Sandbox → UAT → Production. No stage may be skipped.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-wrap gap-2">
              {ONBOARDING_ORDER.map((state) => {
                const count = ORGANISATIONS.filter((o) => o.state === state).length
                return (
                  <div
                    key={state}
                    className="min-w-[150px] flex-1 rounded-[var(--radius-control)] border border-stroke p-4"
                  >
                    <p className="tabular text-2xl font-bold text-ink-header">{count}</p>
                    <p className="mt-1 text-xs font-semibold text-ink">
                      {ONBOARDING_STATE_LABEL[state]}
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Tenants</CardTitle>
              <CardDescription>
                Activation progress is computed from the checklist, not self-reported
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Organisation</TableHead>
                  <TableHead>Service Model</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Checklist</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Activated</TableHead>
                  <TableHead>Stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ORGANISATIONS.map((org) => {
                  const verdict = evaluateActivation(org.checklist)
                  return (
                    <TableRow key={org.id}>
                      <TableCell className="whitespace-nowrap">
                        <Link
                          href={`/onboarding?org=${org.id}`}
                          className="font-semibold text-ink hover:text-brand"
                        >
                          {org.tradingName}
                        </Link>
                        <p className="text-xs text-subtle">{org.legalName}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-subtle">
                        {org.serviceModel}
                      </TableCell>
                      <TableCell className="tabular text-subtle">
                        {org.users.length}
                      </TableCell>
                      <TableCell>
                        <Badge tone={ENV_TONE[org.environment]}>{org.environment}</Badge>
                      </TableCell>
                      <TableCell className="min-w-[160px]">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={
                                verdict.canActivate
                                  ? "h-full rounded-full bg-success-500"
                                  : "h-full rounded-full bg-warning-600"
                              }
                              style={{ width: `${verdict.progress}%` }}
                            />
                          </div>
                          <span className="tabular text-xs text-subtle">
                            {verdict.completed}/{verdict.total}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-subtle">
                        {shortDate(org.createdAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-subtle">
                        {org.activatedAt ? shortDate(org.activatedAt) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge dot tone={STATE_TONE[org.state]}>
                          {ONBOARDING_STATE_LABEL[org.state]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
