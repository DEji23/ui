import Link from "next/link"
import { Building2, CheckCircle2, ShieldAlert } from "lucide-react"

import { shortDate } from "@/lib/format"
import { ORGANISATIONS } from "@/lib/data/organisations"
import {
  EXTERNAL_PHASE_LABEL,
  EXTERNAL_PHASE_ORDER,
  currentExternalPhase,
  evaluateExternalReadiness,
  isLive,
  type ExternalPhase,
} from "@/lib/domain/onboarding"
import { can } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
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
import { StatCard } from "@/components/shared/stat-card"
import { OrganisationsPageActions } from "@/components/wizards/misc-page-actions"

type Tone = "neutral" | "success" | "warning" | "error" | "info" | "purple" | "brand"

// Tone for the *current, not-yet-complete* phase — "success" is reserved
// for organisations that are actually live (see the badge below).
const PHASE_TONE: Record<ExternalPhase, Tone> = {
  ORG_REGISTRATION: "neutral",
  COMPLIANCE_APPROVAL: "info",
  ADMIN_USER_CREATION: "info",
  RECOVERY_POLICY_CONFIGURATION: "warning",
  API_INTEGRATION: "warning",
  SANDBOX_CERTIFICATION: "purple",
  PRODUCTION_APPROVAL: "warning",
}

/**
 * Tenant register.
 * The pipeline strip makes the environment gate visible: an organisation
 * cannot skip a phase, and "awaiting go-live" is a real, computed queue —
 * every phase but Production Approval has already passed.
 */
export default function OrganisationsPage() {
  const live = ORGANISATIONS.filter((o) => isLive(o.phasesComplete))
  const awaitingApproval = ORGANISATIONS.filter(
    (o) => !isLive(o.phasesComplete) && currentExternalPhase(o.phasesComplete) === "PRODUCTION_APPROVAL"
  )
  const inSetup = ORGANISATIONS.filter(
    (o) => !isLive(o.phasesComplete) && currentExternalPhase(o.phasesComplete) !== "PRODUCTION_APPROVAL"
  )
  const mayApprove = can(CURRENT_USER.role, "role.assign")

  return (
    <>
      <PageHeader
        title="Organisations"
        description="Tenants onboarding onto the platform. Live recovery is gated on all seven onboarding phases."
        actions={<OrganisationsPageActions mayApprove={mayApprove} />}
      />

      <div className="flex flex-col gap-6 px-8 pb-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Production Enabled"
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
            caption="Sandbox certified, approval pending"
          />
          <StatCard
            label="In Setup"
            value={String(inSetup.length)}
            icon={Building2}
            tone="info"
            caption="Registration through sandbox certification"
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
            {awaitingApproval.map((o) => o.tradingName).join(", ")} passed sandbox
            certification but has not been countersigned. Production credentials are
            withheld until VFD Operations signs off.
          </Alert>
        ) : null}

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Onboarding Pipeline</CardTitle>
              <CardDescription>
                Registration → Compliance → Admin → Policy → Integration → Sandbox →
                Production. No phase may be skipped.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-wrap gap-2">
              {EXTERNAL_PHASE_ORDER.map((phase) => {
                const count = ORGANISATIONS.filter(
                  (o) => !isLive(o.phasesComplete) && currentExternalPhase(o.phasesComplete) === phase
                ).length
                return (
                  <div
                    key={phase}
                    className="min-w-[150px] flex-1 rounded-[var(--radius-control)] border border-stroke p-4"
                  >
                    <p className="tabular text-2xl font-bold text-ink-header">{count}</p>
                    <p className="mt-1 text-xs font-semibold text-ink">
                      {EXTERNAL_PHASE_LABEL[phase]}
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
                Onboarding progress is computed from completed phases, not self-reported
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
                  <TableHead>Readiness</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Go-Live</TableHead>
                  <TableHead>Phase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ORGANISATIONS.map((org) => {
                  const readiness = evaluateExternalReadiness(org.phasesComplete)
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
                        <Badge tone={readiness.live ? "success" : "neutral"}>
                          {readiness.live ? "PRODUCTION" : "SANDBOX"}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-[160px]">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={
                                readiness.live
                                  ? "h-full rounded-full bg-success-500"
                                  : "h-full rounded-full bg-warning-600"
                              }
                              style={{ width: `${readiness.progress}%` }}
                            />
                          </div>
                          <span className="tabular text-xs text-subtle">
                            {readiness.completed}/{readiness.total}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-subtle">
                        {shortDate(org.createdAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-subtle">
                        {org.goLiveAt ? shortDate(org.goLiveAt) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge dot tone={readiness.live ? "success" : PHASE_TONE[readiness.currentPhase]}>
                          {readiness.live
                            ? "Production Enabled"
                            : EXTERNAL_PHASE_LABEL[readiness.currentPhase]}
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
