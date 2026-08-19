"use client"

import * as React from "react"
import {
  CheckCircle2,
  Circle,
  CircleDashed,
  ExternalLink,
  FileCheck2,
  Lock,
  PlayCircle,
  Rocket,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { shortDate } from "@/lib/format"
import { ORGANISATIONS, STAFF_ONBOARDING, type Organisation } from "@/lib/data/organisations"
import { can, ROLE_LABEL } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import {
  ADMIN_ACTIVATION_STEPS,
  API_INTEGRATION_CREDENTIALS,
  API_VALIDATIONS,
  AVAILABLE_APIS,
  COMPLIANCE_REVIEW_ITEMS,
  DEBIT_PREFERENCE_LABEL,
  DEVELOPER_ACTIONS,
  ESCALATION_STAGES,
  EXTERNAL_PHASE_EXIT_CONDITION,
  EXTERNAL_PHASE_LABEL,
  EXTERNAL_PHASE_ORDER,
  EXTERNAL_PHASE_STATUS_PENDING,
  EXTERNAL_PHASE_STATUS_SUCCESS,
  EXTERNAL_USER_JOURNEY,
  INTERNAL_PHASE_LABEL,
  INTERNAL_PHASES,
  MUST_HAVE_CAPABILITIES,
  ORG_REGISTRATION_SYSTEM_CHECKS,
  ORG_REGISTRATION_UPLOADS,
  PRODUCTION_APPROVAL_STEPS,
  PRODUCT_WALKTHROUGH_CHECKLIST,
  PRODUCT_WALKTHROUGH_TOUR,
  ROLE_CONFIGURATION_PERMISSIONS,
  ROLE_LANDING,
  RETRY_RULE_OPTIONS,
  SANDBOX_SCENARIOS,
  TENANT_PROVISIONING_STEPS,
  evaluateExternalReadiness,
  sandboxCertified,
  type ComplianceReviewItem,
  type DebitPreference,
  type PhaseCompletion,
  type RecoveryPolicyDraft,
  type SandboxScenarioName,
  type ScenarioOutcome,
} from "@/lib/domain/onboarding"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input, Label, Select } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs } from "@/components/ui/tabs"
import { GuidedBorrowerTestCard } from "@/components/onboarding/guided-borrower-test"

/**
 * Onboarding workspace — rebuilt phase-for-phase from the
 * "Automated Loan Recovery Platform Onboarding Flow" document.
 *
 * Two journeys share this screen because the source document defines them
 * as one sequenced flow with different actors: internal staff activation
 * (4 phases) and external lending-institution certification (7 phases).
 * Each external phase card is only interactive while it is the current
 * phase — a later phase cannot be configured before an earlier one exits,
 * which is the "environment-gated, not directly to live" guardrail made
 * literal rather than asserted in copy.
 */
export function OnboardingWorkspace({ initialOrgId }: { initialOrgId?: string }) {
  const [tab, setTab] = React.useState("organisation")
  const [orgId, setOrgId] = React.useState(
    initialOrgId && ORGANISATIONS.some((o) => o.id === initialOrgId)
      ? initialOrgId
      : "org_lender_c"
  )
  const org = ORGANISATIONS.find((o) => o.id === orgId) ?? ORGANISATIONS[0]

  return (
    <div className="flex flex-col gap-6">
      <Tabs
        items={[
          { value: "organisation", label: "Organisation Onboarding" },
          { value: "staff", label: "Staff Onboarding" },
        ]}
        value={tab}
        onValueChange={setTab}
      />

      {tab === "staff" ? (
        <InternalJourney />
      ) : (
        // `key` forces a remount on organisation switch so each org's
        // working state (policy draft, scenario runs) starts fresh.
        <ExternalJourney key={orgId} org={org} orgId={orgId} onOrgChange={setOrgId} />
      )}
    </div>
  )
}

/* ============================================================ */
/* External (lending institution) journey — 7 phases              */
/* ============================================================ */

const JOURNEY_THRESHOLDS = [1, 2, 2, 3, 4, 5, 6, 7, 7]

function ExternalJourney({
  org,
  orgId,
  onOrgChange,
}: {
  org: Organisation
  orgId: string
  onOrgChange: (id: string) => void
}) {
  const [advancedThrough, setAdvancedThrough] = React.useState(
    evaluateExternalReadiness(org.phasesComplete).completed
  )
  const [complianceReview, setComplianceReview] = React.useState(org.complianceReview)
  const [recoveryPolicy, setRecoveryPolicy] = React.useState<RecoveryPolicyDraft>(org.recoveryPolicy)
  const [scenarios, setScenarios] = React.useState<Record<SandboxScenarioName, ScenarioOutcome>>(
    org.sandboxScenarios
  )

  const phasesComplete: PhaseCompletion = React.useMemo(
    () =>
      Object.fromEntries(
        EXTERNAL_PHASE_ORDER.map((p, i) => [p, i < advancedThrough])
      ) as PhaseCompletion,
    [advancedThrough]
  )
  const readiness = evaluateExternalReadiness(phasesComplete)
  const mayApprove = can(CURRENT_USER.role, "role.assign")

  return (
    <div className="flex flex-col gap-6">
      <OrgHeaderCard
        org={org}
        orgId={orgId}
        onOrgChange={onOrgChange}
        advancedThrough={advancedThrough}
      />
      <OrgPipeline advancedThrough={advancedThrough} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RegistrationCard
          org={org}
          advancedThrough={advancedThrough}
          onAdvance={() => setAdvancedThrough(1)}
          mayApprove={mayApprove}
        />
        <ComplianceCard
          org={org}
          advancedThrough={advancedThrough}
          complianceReview={complianceReview}
          setComplianceReview={setComplianceReview}
          onAdvance={() => setAdvancedThrough(2)}
          mayApprove={mayApprove}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminCreationCard
          org={org}
          advancedThrough={advancedThrough}
          onAdvance={() => setAdvancedThrough(3)}
          mayApprove={mayApprove}
        />
        <RecoveryPolicyCard
          advancedThrough={advancedThrough}
          policy={recoveryPolicy}
          setPolicy={setRecoveryPolicy}
          onAdvance={() => setAdvancedThrough(4)}
          mayApprove={mayApprove}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ApiIntegrationCard
          org={org}
          advancedThrough={advancedThrough}
          onAdvance={() => setAdvancedThrough(5)}
          mayApprove={mayApprove}
        />
        <SandboxCard
          advancedThrough={advancedThrough}
          scenarios={scenarios}
          setScenarios={setScenarios}
          onAdvance={() => setAdvancedThrough(6)}
          mayApprove={mayApprove}
        />
      </div>

      <GuidedBorrowerTestCard orgName={org.tradingName} visible={advancedThrough > 5} />

      <ProductionApprovalCard
        org={org}
        advancedThrough={advancedThrough}
        onAdvance={() => setAdvancedThrough(7)}
        mayApprove={mayApprove}
      />

      <MustHavesPanel readiness={readiness} />
    </div>
  )
}

function OrgHeaderCard({
  org,
  orgId,
  onOrgChange,
  advancedThrough,
}: {
  org: Organisation
  orgId: string
  onOrgChange: (id: string) => void
  advancedThrough: number
}) {
  return (
    <Card className="p-6">
      <CardHeader className="flex-wrap p-0 pb-4">
        <div>
          <CardTitle>{org.tradingName}</CardTitle>
          <CardDescription>
            {org.legalName} · {org.serviceModel} · created {shortDate(org.createdAt)}
          </CardDescription>
        </div>
        <div className="w-full sm:w-auto sm:min-w-[260px]">
          <Label htmlFor="org-picker">Organisation</Label>
          <Select
            id="org-picker"
            className="mt-1"
            value={orgId}
            onChange={(e) => onOrgChange(e.target.value)}
          >
            {ORGANISATIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.tradingName}
              </option>
            ))}
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-muted">
          External User Journey
        </p>
        <ol className="flex flex-wrap items-center gap-y-2">
          {EXTERNAL_USER_JOURNEY.map((step, i) => {
            const done = advancedThrough >= JOURNEY_THRESHOLDS[i]
            return (
              <li key={step} className="flex items-center gap-1">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                    done
                      ? "border-success-200 bg-success-50 text-success-700"
                      : "border-stroke text-subtle"
                  )}
                >
                  {step}
                </span>
                {i < EXTERNAL_USER_JOURNEY.length - 1 ? (
                  <span className="px-1 text-xs text-muted">→</span>
                ) : null}
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

function OrgPipeline({ advancedThrough }: { advancedThrough: number }) {
  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4">
        <div>
          <CardTitle>Onboarding Phases</CardTitle>
          <CardDescription>
            Each phase&apos;s exit condition must pass before the next unlocks
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ol className="flex flex-wrap gap-2">
          {EXTERNAL_PHASE_ORDER.map((phase, i) => {
            const done = advancedThrough > i
            const current = advancedThrough === i
            return (
              <li
                key={phase}
                className={cn(
                  "min-w-[150px] flex-1 rounded-[var(--radius-control)] border p-3",
                  current
                    ? "border-brand bg-brand-subtle"
                    : done
                      ? "border-success-200 bg-success-50"
                      : "border-stroke"
                )}
              >
                <div className="flex items-center gap-2">
                  {done ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success-600" />
                  ) : current ? (
                    <CircleDashed className="size-4 shrink-0 text-brand" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-muted" />
                  )}
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      current ? "text-brand" : done ? "text-success-700" : "text-subtle"
                    )}
                  >
                    {EXTERNAL_PHASE_LABEL[phase]}
                  </p>
                </div>
                <p className="mt-1 text-[10px] text-subtle">
                  {EXTERNAL_PHASE_EXIT_CONDITION[phase]}
                </p>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

/* --- Phase 1 — Organization Registration --- */
function RegistrationCard({
  org,
  advancedThrough,
  onAdvance,
  mayApprove,
}: {
  org: Organisation
  advancedThrough: number
  onAdvance: () => void
  mayApprove: boolean
}) {
  const index = 0
  const done = advancedThrough > index
  const current = advancedThrough === index

  const [cacFile, setCacFile] = React.useState<File | null>(null)
  const [licenseFile, setLicenseFile] = React.useState<File | null>(null)
  const [signatoryName, setSignatoryName] = React.useState("")
  const [signatoryTitle, setSignatoryTitle] = React.useState("")
  const [signatoryId, setSignatoryId] = React.useState("")

  const uploadsComplete = cacFile !== null && licenseFile !== null
  const signatoryComplete =
    signatoryName.trim() !== "" && signatoryTitle.trim() !== "" && signatoryId.trim() !== ""
  const registrationComplete = uploadsComplete && signatoryComplete

  return (
    <PhaseCard
      index={index}
      advancedThrough={advancedThrough}
      title={EXTERNAL_PHASE_LABEL.ORG_REGISTRATION}
      description="Client enters company details and uploads compliance documents."
    >
      <div className="flex flex-col gap-2">
        <Row label="Company Name">{org.tradingName}</Row>
        <Row label="RC Number">{org.rcNumber}</Row>
        <Row label="Business Email">{org.businessEmail}</Row>
        <Row label="Contact Person">{org.contactPerson}</Row>
        <Row label="Phone Number">{org.phoneNumber}</Row>
        <Row label="CBN License">{org.cbnLicense ?? "Not applicable"}</Row>
      </div>

      {current ? (
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            Uploads
          </p>
          <FileUploadField
            label="CAC Certificate *"
            file={cacFile}
            onChange={setCacFile}
            accept=".pdf,.png,.jpg,.jpeg"
          />
          <FileUploadField
            label="Regulatory License *"
            file={licenseFile}
            onChange={setLicenseFile}
            accept=".pdf,.png,.jpg,.jpeg"
          />
          <div className="rounded-[var(--radius-control)] border border-stroke p-3">
            <p className="mb-2 text-xs font-semibold text-ink">Authorized Signatory *</p>
            <div className="flex flex-col gap-2">
              <Input
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                placeholder="Full name"
              />
              <Input
                value={signatoryTitle}
                onChange={(e) => setSignatoryTitle(e.target.value)}
                placeholder="Title / authority level (e.g. Managing Director)"
              />
              <Input
                value={signatoryId}
                onChange={(e) => setSignatoryId(e.target.value)}
                placeholder="Government-issued ID number"
              />
            </div>
          </div>
        </div>
      ) : (
        <ItemList title="Uploads" items={ORG_REGISTRATION_UPLOADS} done={done} />
      )}

      <ItemList title="System checks" items={ORG_REGISTRATION_SYSTEM_CHECKS} done={done} />
      <PhaseActionFooter
        current={current}
        done={done}
        successStatus={EXTERNAL_PHASE_STATUS_SUCCESS.ORG_REGISTRATION}
        pendingStatus={EXTERNAL_PHASE_STATUS_PENDING.ORG_REGISTRATION}
        actionLabel="Confirm Registration Verified"
        onAction={onAdvance}
        disabled={!mayApprove || !registrationComplete}
        disabledReason={
          !registrationComplete
            ? "Upload both documents and designate an authorized signatory first."
            : "Requires the role.assign permission."
        }
      />
    </PhaseCard>
  )
}

function FileUploadField({
  label,
  file,
  onChange,
  accept,
}: {
  label: string
  file: File | null
  onChange: (file: File | null) => void
  accept: string
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-3.5" />
          Choose File
        </Button>
        {file ? (
          <span className="flex min-w-0 items-center gap-1.5 truncate text-xs font-medium text-success-700">
            <FileCheck2 className="size-3.5 shrink-0" />
            {file.name}
          </span>
        ) : (
          <span className="text-xs text-subtle">No file chosen</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  )
}

/* --- Phase 2 — Compliance Approval --- */
function ComplianceCard({
  org,
  advancedThrough,
  complianceReview,
  setComplianceReview,
  onAdvance,
  mayApprove,
}: {
  org: Organisation
  advancedThrough: number
  complianceReview: Record<ComplianceReviewItem, boolean>
  setComplianceReview: React.Dispatch<React.SetStateAction<Record<ComplianceReviewItem, boolean>>>
  onAdvance: () => void
  mayApprove: boolean
}) {
  const index = 1
  const done = advancedThrough > index
  const current = advancedThrough === index
  const allReviewed = COMPLIANCE_REVIEW_ITEMS.every((item) => complianceReview[item])

  return (
    <PhaseCard
      index={index}
      advancedThrough={advancedThrough}
      title={EXTERNAL_PHASE_LABEL.COMPLIANCE_APPROVAL}
      description="Internal Compliance reviews KYC, regulatory documents, contract and risk assessment."
    >
      <div className="flex flex-col gap-2">
        {COMPLIANCE_REVIEW_ITEMS.map((item) => (
          <label
            key={item}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-nav)] border border-stroke p-3",
              current && "cursor-pointer hover:bg-surface"
            )}
          >
            <input
              type="checkbox"
              className="size-4 shrink-0 accent-[var(--color-brand)]"
              checked={complianceReview[item]}
              disabled={!current}
              onChange={(e) =>
                setComplianceReview((prev) => ({ ...prev, [item]: e.target.checked }))
              }
            />
            <span className="text-sm font-medium text-ink">{item}</span>
          </label>
        ))}
      </div>
      <ItemList title="On approval" items={TENANT_PROVISIONING_STEPS} done={done} ordered />
      {done ? <Row label="Tenant ID">{org.tenantId ?? "—"}</Row> : null}
      <PhaseActionFooter
        current={current}
        done={done}
        successStatus={EXTERNAL_PHASE_STATUS_SUCCESS.COMPLIANCE_APPROVAL}
        pendingStatus={EXTERNAL_PHASE_STATUS_PENDING.COMPLIANCE_APPROVAL}
        actionLabel="Create Tenant"
        onAction={onAdvance}
        disabled={!allReviewed || !mayApprove}
        disabledReason={
          !allReviewed
            ? "All four review items must be checked first."
            : "Requires the role.assign permission."
        }
      />
    </PhaseCard>
  )
}

/* --- Phase 3 — Admin User Creation --- */
function AdminCreationCard({
  org,
  advancedThrough,
  onAdvance,
  mayApprove,
}: {
  org: Organisation
  advancedThrough: number
  onAdvance: () => void
  mayApprove: boolean
}) {
  const index = 2
  const done = advancedThrough > index
  const current = advancedThrough === index
  const admin = org.users.find((u) => u.role === "ADMIN")

  return (
    <PhaseCard
      index={index}
      advancedThrough={advancedThrough}
      title={EXTERNAL_PHASE_LABEL.ADMIN_USER_CREATION}
      description="Client creates the Company Admin who administers the tenant."
    >
      <div className="flex flex-col gap-2">
        <Row label="Name">{admin?.name ?? org.contactPerson}</Row>
        <Row label="Email">{admin?.email ?? org.businessEmail}</Row>
        <Row label="Phone">{org.phoneNumber}</Row>
      </div>
      <ItemList title="Activation sequence" items={ADMIN_ACTIVATION_STEPS} done={done} ordered />
      <PhaseActionFooter
        current={current}
        done={done}
        successStatus={EXTERNAL_PHASE_STATUS_SUCCESS.ADMIN_USER_CREATION}
        actionLabel="Confirm Admin Activated"
        onAction={onAdvance}
        disabled={!mayApprove}
        disabledReason="Requires the role.assign permission."
      />
    </PhaseCard>
  )
}

/* --- Phase 4 — Recovery Policy Configuration --- */
function RecoveryPolicyCard({
  advancedThrough,
  policy,
  setPolicy,
  onAdvance,
  mayApprove,
}: {
  advancedThrough: number
  policy: RecoveryPolicyDraft
  setPolicy: React.Dispatch<React.SetStateAction<RecoveryPolicyDraft>>
  onAdvance: () => void
  mayApprove: boolean
}) {
  const index = 3
  const done = advancedThrough > index
  const current = advancedThrough === index

  return (
    <PhaseCard
      index={index}
      advancedThrough={advancedThrough}
      title={EXTERNAL_PHASE_LABEL.RECOVERY_POLICY_CONFIGURATION}
      description="Company Admin configures debit preference, retry rules, partial recovery, escalation and quiet hours."
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="debit-pref">Debit preference</Label>
        <Select
          id="debit-pref"
          value={policy.debitPreference}
          disabled={!current}
          onChange={(e) =>
            setPolicy((p) => ({ ...p, debitPreference: e.target.value as DebitPreference }))
          }
        >
          {(Object.keys(DEBIT_PREFERENCE_LABEL) as DebitPreference[]).map((k) => (
            <option key={k} value={k}>
              {DEBIT_PREFERENCE_LABEL[k]}
            </option>
          ))}
        </Select>
      </div>

      <ToggleList
        label="Retry rules"
        options={RETRY_RULE_OPTIONS}
        selected={policy.retryRules}
        disabled={!current}
        onChange={(next) => setPolicy((p) => ({ ...p, retryRules: next }))}
      />

      <div className="flex items-center justify-between gap-3 rounded-[var(--radius-nav)] border border-stroke p-3">
        <div>
          <p className="text-sm font-semibold text-ink">Partial recovery</p>
          <p className="text-xs text-subtle">Enable through toggle, set minimum amount.</p>
        </div>
        <input
          type="checkbox"
          className="size-5 shrink-0 accent-[var(--color-brand)]"
          checked={policy.partialRecoveryEnabled}
          disabled={!current}
          onChange={(e) =>
            setPolicy((p) => ({ ...p, partialRecoveryEnabled: e.target.checked }))
          }
        />
      </div>
      {policy.partialRecoveryEnabled ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="min-amt">Minimum amount (₦)</Label>
          <Input
            id="min-amt"
            type="number"
            value={policy.partialRecoveryMinAmount}
            disabled={!current}
            onChange={(e) =>
              setPolicy((p) => ({ ...p, partialRecoveryMinAmount: Number(e.target.value) }))
            }
          />
        </div>
      ) : null}

      <ToggleList
        label="Escalation"
        options={ESCALATION_STAGES}
        selected={policy.escalationStages}
        disabled={!current}
        onChange={(next) => setPolicy((p) => ({ ...p, escalationStages: next }))}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="qh-from">Quiet hours from</Label>
          <Input
            id="qh-from"
            type="time"
            value={policy.quietHoursFrom}
            disabled={!current}
            onChange={(e) => setPolicy((p) => ({ ...p, quietHoursFrom: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="qh-to">Quiet hours to</Label>
          <Input
            id="qh-to"
            type="time"
            value={policy.quietHoursTo}
            disabled={!current}
            onChange={(e) => setPolicy((p) => ({ ...p, quietHoursTo: e.target.value }))}
          />
        </div>
      </div>

      <PhaseActionFooter
        current={current}
        done={done}
        successStatus={EXTERNAL_PHASE_STATUS_SUCCESS.RECOVERY_POLICY_CONFIGURATION}
        actionLabel="Publish Recovery Policy"
        onAction={onAdvance}
        disabled={policy.retryRules.length === 0 || !mayApprove}
        disabledReason={
          policy.retryRules.length === 0
            ? "Select at least one retry rule."
            : "Requires the role.assign permission."
        }
      />
    </PhaseCard>
  )
}

/* --- Phase 5 — API Integration --- */
function ApiIntegrationCard({
  org,
  advancedThrough,
  onAdvance,
  mayApprove,
}: {
  org: Organisation
  advancedThrough: number
  onAdvance: () => void
  mayApprove: boolean
}) {
  const index = 4
  const done = advancedThrough > index
  const current = advancedThrough === index
  const credentials: Record<string, string> = {
    "Client ID": `clnt_${org.id}`,
    "API Key": "sk_sandbox_••••••••••••8f2a",
    "Sandbox credentials": "Issued",
    "Webhook Secret": "whsec_••••••••••••c91d",
  }

  return (
    <PhaseCard
      index={index}
      advancedThrough={advancedThrough}
      title={EXTERNAL_PHASE_LABEL.API_INTEGRATION}
      description="Integrator accesses the Developer Portal and validates authentication, signature, idempotency and webhooks."
    >
      <div className="flex flex-col gap-2">
        {API_INTEGRATION_CREDENTIALS.map((c) => (
          <Row key={c} label={c}>
            <span className="font-mono">{credentials[c]}</span>
          </Row>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Label>Available APIs</Label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_APIS.map((api) => (
            <Badge key={api} tone="info">
              {api}
            </Badge>
          ))}
        </div>
      </div>
      <ItemList title="Developer performs" items={DEVELOPER_ACTIONS} done={done || current} />
      <ItemList title="System validates" items={API_VALIDATIONS} done={done} />
      <Button variant="soft" size="md" block asChild>
        <a href="/developer">
          Open Developer Portal
          <ExternalLink />
        </a>
      </Button>
      <PhaseActionFooter
        current={current}
        done={done}
        successStatus={EXTERNAL_PHASE_STATUS_SUCCESS.API_INTEGRATION}
        actionLabel="Confirm Integration Validated"
        onAction={onAdvance}
        disabled={!mayApprove}
        disabledReason="Requires the role.assign permission."
      />
    </PhaseCard>
  )
}

/* --- Phase 6 — Sandbox Certification --- */
function SandboxCard({
  advancedThrough,
  scenarios,
  setScenarios,
  onAdvance,
  mayApprove,
}: {
  advancedThrough: number
  scenarios: Record<SandboxScenarioName, ScenarioOutcome>
  setScenarios: React.Dispatch<React.SetStateAction<Record<SandboxScenarioName, ScenarioOutcome>>>
  onAdvance: () => void
  mayApprove: boolean
}) {
  const index = 5
  const done = advancedThrough > index
  const current = advancedThrough === index
  const passedCount = SANDBOX_SCENARIOS.filter((s) => scenarios[s] === "PASSED").length
  const allPassed = sandboxCertified(scenarios)

  return (
    <PhaseCard
      index={index}
      advancedThrough={advancedThrough}
      title={EXTERNAL_PHASE_LABEL.SANDBOX_CERTIFICATION}
      description={`Client executes every required scenario. ${passedCount} of ${SANDBOX_SCENARIOS.length} passing.`}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SANDBOX_SCENARIOS.map((scenario) => {
          const outcome = scenarios[scenario]
          return (
            <div
              key={scenario}
              className={cn(
                "flex items-center justify-between gap-2 rounded-[var(--radius-control)] border p-3",
                outcome === "PASSED"
                  ? "border-success-200 bg-success-50/50"
                  : outcome === "FAILED"
                    ? "border-error-200 bg-error-50/50"
                    : "border-stroke"
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                {outcome === "PASSED" ? (
                  <CheckCircle2 className="size-4 shrink-0 text-success-600" />
                ) : outcome === "FAILED" ? (
                  <XCircle className="size-4 shrink-0 text-error-600" />
                ) : (
                  <Circle className="size-4 shrink-0 text-muted" />
                )}
                <span className="truncate text-xs font-semibold text-ink">{scenario}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                disabled={!current}
                onClick={() => setScenarios((prev) => ({ ...prev, [scenario]: "PASSED" }))}
              >
                Run
              </Button>
            </div>
          )
        })}
      </div>
      {current ? (
        <Button
          variant="soft"
          size="md"
          block
          onClick={() =>
            setScenarios(
              Object.fromEntries(SANDBOX_SCENARIOS.map((s) => [s, "PASSED"])) as Record<
                SandboxScenarioName,
                ScenarioOutcome
              >
            )
          }
        >
          <PlayCircle />
          Run All
        </Button>
      ) : null}
      <PhaseActionFooter
        current={current}
        done={done}
        successStatus={EXTERNAL_PHASE_STATUS_SUCCESS.SANDBOX_CERTIFICATION}
        actionLabel="Certify Sandbox"
        onAction={onAdvance}
        disabled={!allPassed || !mayApprove}
        disabledReason={
          !allPassed ? "Every scenario must pass first." : "Requires the role.assign permission."
        }
      />
    </PhaseCard>
  )
}

/* --- Phase 7 — Production Approval --- */
function ProductionApprovalCard({
  org,
  advancedThrough,
  onAdvance,
  mayApprove,
}: {
  org: Organisation
  advancedThrough: number
  onAdvance: () => void
  mayApprove: boolean
}) {
  const index = 6
  const live = advancedThrough > index
  const current = advancedThrough === index

  return (
    <PhaseCard
      index={index}
      advancedThrough={advancedThrough}
      title={EXTERNAL_PHASE_LABEL.PRODUCTION_APPROVAL}
      description="VFD Operations approves production keys, webhooks and settlement account, then goes live."
    >
      <ItemList title="Approval sequence" items={PRODUCTION_APPROVAL_STEPS} done={live} ordered />
      {live ? (
        <Alert tone="success" title={EXTERNAL_PHASE_STATUS_SUCCESS.PRODUCTION_APPROVAL}>
          {org.tradingName} is live. Production credentials issued and countersigned by{" "}
          {CURRENT_USER.name}.
        </Alert>
      ) : (
        <Button
          variant="primary"
          size="lg"
          block
          disabled={!current || !mayApprove}
          title={
            !current
              ? "Complete every prior phase first."
              : !mayApprove
                ? "Requires the role.assign permission."
                : undefined
          }
          onClick={onAdvance}
        >
          <Rocket />
          Approve Go-Live
        </Button>
      )}
    </PhaseCard>
  )
}

function MustHavesPanel({
  readiness,
}: {
  readiness: ReturnType<typeof evaluateExternalReadiness>
}) {
  const [healthChecked, setHealthChecked] = React.useState(false)
  const healthChecks = [
    "Webhook URL reachable",
    "TLS certificate valid",
    "IP allowlist configured",
    "API connectivity",
  ]

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4">
        <div>
          <CardTitle>Important Must Haves</CardTitle>
          <CardDescription>
            Platform capabilities the onboarding PRD calls out as required
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 p-0">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-control)] border border-stroke p-4">
            <p className="text-xs font-semibold text-subtle">Go-live readiness score</p>
            <p className="tabular mt-1 text-3xl font-bold text-ink-header">
              {readiness.progress.toFixed(0)}%
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={
                  readiness.live
                    ? "h-full rounded-full bg-success-500"
                    : "h-full rounded-full bg-warning-600"
                }
                style={{ width: `${readiness.progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-subtle">
              {readiness.completed} of {readiness.total} onboarding phases complete
            </p>
          </div>

          <div className="rounded-[var(--radius-control)] border border-stroke p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-subtle">Environment health check</p>
              <Button variant="outline" size="sm" onClick={() => setHealthChecked(true)}>
                <ShieldCheck className="size-3.5" />
                Run Check
              </Button>
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              {healthChecks.map((c) => (
                <div key={c} className="flex items-center gap-2 text-xs">
                  {healthChecked ? (
                    <CheckCircle2 className="size-3.5 shrink-0 text-success-600" />
                  ) : (
                    <Circle className="size-3.5 shrink-0 text-muted" />
                  )}
                  <span className={healthChecked ? "text-ink" : "text-subtle"}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[var(--radius-control)] border border-stroke p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Self-service API testing console</p>
            <p className="text-xs text-subtle">Reduces implementation support effort.</p>
          </div>
          <Button variant="soft" size="md" asChild>
            <a href="/developer">
              Open Developer Console
              <ExternalLink />
            </a>
          </Button>
        </div>

        <Table className="min-w-0">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Capability</TableHead>
              <TableHead>Business Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MUST_HAVE_CAPABILITIES.map((c) => (
              <TableRow key={c.capability}>
                <TableCell className="whitespace-nowrap font-semibold text-ink">
                  {c.capability}
                </TableCell>
                <TableCell className="text-body">{c.businessValue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

/* ============================================================ */
/* Internal staff journey — 4 phases                              */
/* ============================================================ */

function InternalJourney() {
  const landing = ROLE_LANDING[CURRENT_USER.role]
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Internal User Journey</CardTitle>
              <CardDescription>
                An account is only marked Ready for Operations after the final checklist step
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-0">
            {STAFF_ONBOARDING.map((step, i) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-start gap-3 rounded-[var(--radius-control)] border p-4",
                  step.status === "CURRENT"
                    ? "border-brand bg-brand-subtle"
                    : step.status === "DONE"
                      ? "border-success-200 bg-success-50/50"
                      : "border-stroke"
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    step.status === "DONE"
                      ? "bg-success-500 text-white"
                      : step.status === "CURRENT"
                        ? "bg-brand text-white"
                        : "bg-gray-100 text-subtle"
                  )}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{step.title}</p>
                  <p className="text-xs text-subtle">{step.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Phase Detail</CardTitle>
              <CardDescription>
                System actions, user actions and the status each phase produces
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-0">
            {INTERNAL_PHASES.map((phase, i) => (
              <div
                key={phase.phase}
                className="rounded-[var(--radius-control)] border border-stroke p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">
                    {i + 1}. {INTERNAL_PHASE_LABEL[phase.phase]}
                  </p>
                  <Badge tone="brand">{phase.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-subtle">{phase.trigger}</p>
                {phase.systemActions ? (
                  <PhaseBullets label="System actions" items={phase.systemActions} />
                ) : null}
                {phase.userActions ? (
                  <PhaseBullets label="User performs" items={phase.userActions} />
                ) : null}
                {phase.systemVerifies ? (
                  <PhaseBullets label="System verifies" items={phase.systemVerifies} />
                ) : null}
                {phase.phase === "PRODUCT_WALKTHROUGH" ? (
                  <>
                    <PhaseBullets label="Guided tour" items={PRODUCT_WALKTHROUGH_TOUR} />
                    <PhaseBullets label="Checklist" items={PRODUCT_WALKTHROUGH_CHECKLIST} />
                  </>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Your Role Landing</CardTitle>
              <CardDescription>Where {ROLE_LABEL[CURRENT_USER.role]} starts</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-sm text-body">{landing.focus}</p>
            <Button variant="soft" size="md" block className="mt-4" asChild>
              <a href={landing.href}>Go to my dashboard</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Role Configuration</CardTitle>
              <CardDescription>Phase 3 permission grants by role</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-0">
            {ROLE_CONFIGURATION_PERMISSIONS.map((r) => (
              <div key={r.role} className="rounded-[var(--radius-nav)] bg-surface p-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-ink">{r.label}</p>
                  {r.additional ? <Badge tone="info">Additional permissions</Badge> : null}
                </div>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {r.permissions.map((p) => (
                    <li
                      key={p}
                      className="rounded-full border border-stroke bg-white px-2 py-0.5 text-[10px] font-medium text-subtle"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Operating Context</CardTitle>
              <CardDescription>Scopes the data this user can see</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-0">
            <div className="flex flex-col gap-2">
              <Label htmlFor="bu">Business unit</Label>
              <Select id="bu" defaultValue={CURRENT_USER.businessUnit}>
                <option>{CURRENT_USER.businessUnit}</option>
                <option>Retail Recovery — Abuja</option>
                <option>SME Recovery — National</option>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="portfolio">Portfolio scope</Label>
              <Select id="portfolio" defaultValue="All retail products">
                <option>All retail products</option>
                <option>Salary loans only</option>
                <option>Micro loans only</option>
              </Select>
            </div>
            <Alert tone="info" title="Stronger authentication required">
              Users with escalation or write-off permissions must complete MFA and are
              subject to maker-checker on sensitive actions.
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ============================================================ */
/* Shared primitives                                              */
/* ============================================================ */

function PhaseCard({
  index,
  advancedThrough,
  title,
  description,
  children,
}: {
  index: number
  advancedThrough: number
  title: string
  description: string
  children: React.ReactNode
}) {
  const done = advancedThrough > index
  const current = advancedThrough === index
  return (
    <Card className={cn("p-6", current && "border border-brand", done && "border border-success-200")}>
      <CardHeader className="flex-wrap items-center p-0 pb-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              done
                ? "bg-success-500 text-white"
                : current
                  ? "bg-brand text-white"
                  : "bg-gray-100 text-subtle"
            )}
          >
            {index + 1}
          </span>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        <Badge dot tone={done ? "success" : current ? "brand" : "neutral"}>
          {done ? "Complete" : current ? "In Progress" : "Locked"}
        </Badge>
      </CardHeader>
      <CardContent
        className={cn("flex flex-col gap-4 p-0", !current && !done && "opacity-60")}
      >
        {children}
      </CardContent>
    </Card>
  )
}

function PhaseActionFooter({
  current,
  done,
  successStatus,
  pendingStatus,
  actionLabel,
  onAction,
  disabled,
  disabledReason,
}: {
  current: boolean
  done: boolean
  successStatus: string
  pendingStatus?: string
  actionLabel: string
  onAction: () => void
  disabled?: boolean
  disabledReason?: string
}) {
  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-[var(--radius-control)] border border-success-200 bg-success-50 px-3 py-2 text-xs font-semibold text-success-700">
        <CheckCircle2 className="size-4 shrink-0" />
        {successStatus}
      </div>
    )
  }
  if (!current) {
    return (
      <div className="flex items-center gap-2 rounded-[var(--radius-control)] border border-stroke bg-surface px-3 py-2 text-xs font-medium text-subtle">
        <Lock className="size-3.5 shrink-0" />
        Locked until the prior phase completes
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {pendingStatus ? (
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
          {pendingStatus}
        </p>
      ) : null}
      <Button
        variant="primary"
        size="md"
        block
        disabled={disabled}
        title={disabled ? disabledReason : undefined}
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </div>
  )
}

function ItemList({
  title,
  items,
  done,
  ordered,
}: {
  title: string
  items: readonly string[]
  done: boolean
  ordered?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{title}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <React.Fragment key={item}>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                done
                  ? "border-success-200 bg-success-50 text-success-700"
                  : "border-stroke text-body"
              )}
            >
              {done ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <Circle className="size-3 text-muted" />
              )}
              {item}
            </span>
            {ordered && i < items.length - 1 ? (
              <span className="text-xs text-muted">→</span>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function ToggleList({
  label,
  options,
  selected,
  disabled,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  disabled?: boolean
  onChange: (next: string[]) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange(active ? selected.filter((o) => o !== opt) : [...selected, opt])
              }
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                active
                  ? "border-brand bg-brand-subtle text-brand"
                  : "border-stroke text-body hover:bg-surface"
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PhaseBullets({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="mt-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <ul className="mt-1 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-body"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-stroke pb-2 last:border-0">
      <span className="text-xs font-medium text-body">{label}</span>
      <span className="text-right text-xs font-semibold text-ink">{children}</span>
    </div>
  )
}
