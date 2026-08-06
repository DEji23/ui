"use client"

import * as React from "react"
import {
  CheckCircle2,
  Circle,
  CircleDashed,
  PlayCircle,
  Rocket,
  XCircle,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { shortDate } from "@/lib/format"
import { ORGANISATIONS, STAFF_ONBOARDING } from "@/lib/data/organisations"
import { can, ROLE_LABEL } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import {
  ACTIVATION_CHECKLIST,
  CERTIFICATION_SCENARIOS,
  ONBOARDING_EXIT_CONDITION,
  ONBOARDING_ORDER,
  ONBOARDING_STATE_LABEL,
  ROLE_LANDING,
  evaluateActivation,
  stageIndex,
  type ChecklistStatus,
  type ScenarioOutcome,
} from "@/lib/domain/onboarding"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input, Label, Select } from "@/components/ui/input"
import { Tabs } from "@/components/ui/tabs"
import { ResultDialog } from "@/components/queues/action-dialogs"

/**
 * Onboarding workspace.
 *
 * Two journeys share this screen because the PRD defines them as one
 * sequenced flow with different actors: internal staff activation and
 * external organisation certification. The go-live button is bound to
 * `evaluateActivation`, so the gate is computed, never asserted.
 */
export function OnboardingWorkspace({ initialOrgId }: { initialOrgId?: string }) {
  const [tab, setTab] = React.useState("organisation")
  const [orgId, setOrgId] = React.useState(
    initialOrgId && ORGANISATIONS.some((o) => o.id === initialOrgId)
      ? initialOrgId
      : "org_lender_b"
  )
  const [result, setResult] = React.useState<{ title: string; message: string } | null>(
    null
  )

  const org = ORGANISATIONS.find((o) => o.id === orgId) ?? ORGANISATIONS[0]
  const [checklist, setChecklist] = React.useState<ChecklistStatus>(org.checklist)
  const [scenarios, setScenarios] = React.useState<Record<string, ScenarioOutcome>>(
    org.scenarios
  )

  // Switching organisation resets the working copy of its state.
  React.useEffect(() => {
    setChecklist(org.checklist)
    setScenarios(org.scenarios)
  }, [org])

  const verdict = evaluateActivation(checklist)
  const mayApprove = can(CURRENT_USER.role, "role.assign")

  return (
    <>
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
          <StaffJourney />
        ) : (
          <>
            <Card className="p-6">
              <CardHeader className="flex-wrap p-0 pb-4">
                <div>
                  <CardTitle>{org.tradingName}</CardTitle>
                  <CardDescription>
                    {org.legalName} · {org.serviceModel} · created{" "}
                    {shortDate(org.createdAt)}
                  </CardDescription>
                </div>
                <div className="w-full sm:w-auto sm:min-w-[260px]">
                  <Label htmlFor="org-picker">Organisation</Label>
                  <Select
                    id="org-picker"
                    className="mt-1"
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
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
                {/* Stage pipeline */}
                <ol className="flex flex-wrap gap-2">
                  {ONBOARDING_ORDER.map((state) => {
                    const current = state === org.state
                    const done = stageIndex(state) < stageIndex(org.state)
                    return (
                      <li
                        key={state}
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
                            {ONBOARDING_STATE_LABEL[state]}
                          </p>
                        </div>
                        <p className="mt-1 text-[10px] text-subtle">
                          {ONBOARDING_EXIT_CONDITION[state]}
                        </p>
                      </li>
                    )
                  })}
                </ol>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <OrgProfileCard org={org} />
              <IntegrationWizard
                checklist={checklist}
                onToggle={(key, value) =>
                  setChecklist((prev) => ({ ...prev, [key]: value }))
                }
                onTest={(message) =>
                  setResult({ title: "Endpoint test complete", message })
                }
              />
            </div>

            <SandboxConsole
              scenarios={scenarios}
              onRun={(id, outcome) =>
                setScenarios((prev) => ({ ...prev, [id]: outcome }))
              }
              onAttest={() => {
                setChecklist((prev) => ({ ...prev, uatPassed: true }))
                setResult({
                  title: "UAT attestation submitted",
                  message:
                    "All required scenarios passed. The organisation is now UAT certified and awaiting internal go-live approval.",
                })
              }}
            />

            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <div>
                  <CardTitle>Activation Checklist</CardTitle>
                  <CardDescription>
                    {verdict.completed} of {verdict.total} complete — production is
                    blocked until all pass
                  </CardDescription>
                </div>
                <Badge dot tone={verdict.canActivate ? "success" : "warning"}>
                  {verdict.canActivate ? "READY" : "BLOCKED"}
                </Badge>
              </CardHeader>

              <CardContent className="p-0">
                <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={
                      verdict.canActivate
                        ? "h-full rounded-full bg-success-500"
                        : "h-full rounded-full bg-warning-600"
                    }
                    style={{ width: `${verdict.progress}%` }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  {ACTIVATION_CHECKLIST.map((item) => {
                    const done = checklist[item.key]
                    return (
                      <label
                        key={item.key}
                        className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-nav)] border border-stroke p-3 transition-colors hover:bg-surface"
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand)]"
                          checked={done}
                          onChange={(e) =>
                            setChecklist((prev) => ({
                              ...prev,
                              [item.key]: e.target.checked,
                            }))
                          }
                        />
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              done ? "text-ink" : "text-body"
                            )}
                          >
                            {item.label}
                          </p>
                          <p className="text-xs text-subtle">{item.detail}</p>
                        </div>
                        <Badge tone="neutral" className="ml-auto shrink-0">
                          {ONBOARDING_STATE_LABEL[item.stage]}
                        </Badge>
                      </label>
                    )
                  })}
                </div>

                {!verdict.canActivate ? (
                  <Alert tone="error" title="Production activation blocked" className="mt-4">
                    {verdict.outstanding.length} item
                    {verdict.outstanding.length === 1 ? "" : "s"} outstanding:{" "}
                    {verdict.outstanding.map((i) => i.label).join("; ")}.
                  </Alert>
                ) : (
                  <Alert tone="success" title="All checks passed" className="mt-4">
                    Live credentials can be issued once an internal approver
                    countersigns.
                  </Alert>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  block
                  className="mt-4"
                  disabled={!verdict.canActivate || !mayApprove}
                  title={
                    !verdict.canActivate
                      ? "Complete every checklist item first."
                      : !mayApprove
                        ? "Go-live approval requires the role.assign permission."
                        : undefined
                  }
                  onClick={() =>
                    setResult({
                      title: "Production activation approved",
                      message: `${org.tradingName} is now Production Active. Live credentials issued and the approval written to the audit trail by ${CURRENT_USER.name}.`,
                    })
                  }
                >
                  <Rocket />
                  Approve Go-Live
                </Button>
              </CardContent>
            </Card>
          </>
        )}
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

/* ------------------------------------------------------------------ */

function OrgProfileCard({ org }: { org: (typeof ORGANISATIONS)[number] }) {
  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4">
        <div>
          <CardTitle>Organisation Profile</CardTitle>
          <CardDescription>Legal, operating and contact details</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-0">
        <Row label="Legal name">{org.legalName}</Row>
        <Row label="Trading name">{org.tradingName}</Row>
        <Row label="Service model">{org.serviceModel}</Row>
        <Row label="Recovery use case">{org.recoveryUseCase}</Row>
        <Row label="Operational contact">{org.operationalContact}</Row>
        <Row label="Finance contact">{org.financeContact}</Row>
        <Row label="Technical contact">{org.technicalContact}</Row>

        <p className="mt-2 text-xs font-semibold text-ink">Team</p>
        {org.users.length === 0 ? (
          <p className="text-xs text-subtle">No users invited yet.</p>
        ) : (
          org.users.map((u) => (
            <div
              key={u.email}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-nav)] bg-surface p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-ink">{u.name}</p>
                <p className="truncate text-[10px] text-subtle">{u.email}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge tone="info">{ROLE_LABEL[u.role]}</Badge>
                <Badge dot tone={u.status === "Active" ? "success" : "warning"}>
                  {u.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function IntegrationWizard({
  checklist,
  onToggle,
  onTest,
}: {
  checklist: ChecklistStatus
  onToggle: (key: keyof ChecklistStatus, value: boolean) => void
  onTest: (message: string) => void
}) {
  const [url, setUrl] = React.useState("https://partner.example.ng/hooks/recova")
  const [allowlist, setAllowlist] = React.useState("102.89.0.0/16")

  const valid = /^https:\/\/.+/.test(url)

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4">
        <div>
          <CardTitle>Integration Setup</CardTitle>
          <CardDescription>
            Credentials, allowlist and webhook registration with live validation
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-0">
        <div className="flex flex-col gap-2">
          <Label htmlFor="wh-url">Webhook endpoint</Label>
          <Input id="wh-url" value={url} onChange={(e) => setUrl(e.target.value)} />
          {!valid ? (
            <p className="text-xs text-error-600">
              Endpoint must be HTTPS — signed payloads are never sent over plaintext.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="ip-allow">IP allowlist</Label>
          <Input
            id="ip-allow"
            value={allowlist}
            onChange={(e) => setAllowlist(e.target.value)}
          />
        </div>

        <Button
          variant="soft"
          size="md"
          block
          disabled={!valid}
          onClick={() => {
            onToggle("webhookValidated", true)
            onTest(
              `Signed test payload delivered to ${url} and acknowledged in 214ms. Signature, timestamp and replay protection all verified.`
            )
          }}
        >
          Send Test Payload
        </Button>

        <div className="flex flex-col gap-2 rounded-[var(--radius-control)] bg-surface p-4">
          <StatusLine done={checklist.sandboxCredentials} label="Sandbox credentials issued" />
          <StatusLine done={checklist.webhookValidated} label="Webhook endpoint validated" />
          <StatusLine done={checklist.policiesConfigured} label="Recovery policies configured" />
          <StatusLine
            done={checklist.notificationsConfigured}
            label="Notification templates configured"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            size="md"
            className="sm:flex-1"
            onClick={() => onToggle("policiesConfigured", true)}
          >
            Mark policies configured
          </Button>
          <Button
            variant="outline"
            size="md"
            className="sm:flex-1"
            onClick={() => onToggle("notificationsConfigured", true)}
          >
            Mark notifications configured
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SandboxConsole({
  scenarios,
  onRun,
  onAttest,
}: {
  scenarios: Record<string, ScenarioOutcome>
  onRun: (id: string, outcome: ScenarioOutcome) => void
  onAttest: () => void
}) {
  const required = CERTIFICATION_SCENARIOS.filter((s) => s.required)
  const passed = required.filter((s) => scenarios[s.id] === "PASSED")
  const allPassed = passed.length === required.length

  return (
    <Card className="p-6">
      <CardHeader className="flex-wrap p-0 pb-4">
        <div>
          <CardTitle>Sandbox Certification</CardTitle>
          <CardDescription>
            Mock NIBSS responses. {passed.length} of {required.length} required
            scenarios passing.
          </CardDescription>
        </div>
        <Button
          variant="soft"
          size="md"
          onClick={() =>
            CERTIFICATION_SCENARIOS.forEach((s) => onRun(s.id, "PASSED"))
          }
        >
          <PlayCircle />
          Run All
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {CERTIFICATION_SCENARIOS.map((scenario) => {
            const outcome = scenarios[scenario.id] ?? "NOT_RUN"
            return (
              <div
                key={scenario.id}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-[var(--radius-control)] border p-4",
                  outcome === "PASSED"
                    ? "border-success-200 bg-success-50/50"
                    : outcome === "FAILED"
                      ? "border-error-200 bg-error-50/50"
                      : "border-stroke"
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {outcome === "PASSED" ? (
                      <CheckCircle2 className="size-4 shrink-0 text-success-600" />
                    ) : outcome === "FAILED" ? (
                      <XCircle className="size-4 shrink-0 text-error-600" />
                    ) : (
                      <Circle className="size-4 shrink-0 text-muted" />
                    )}
                    <p className="truncate text-sm font-semibold text-ink">
                      {scenario.name}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-subtle">{scenario.description}</p>
                  <p className="mt-1 font-mono text-[10px] text-subtle">
                    {scenario.simulates}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => onRun(scenario.id, "PASSED")}
                >
                  Run
                </Button>
              </div>
            )
          })}
        </div>

        <Button
          variant="primary"
          size="lg"
          block
          className="mt-4"
          disabled={!allPassed}
          title={allPassed ? undefined : "Every required scenario must pass first."}
          onClick={onAttest}
        >
          Submit UAT Attestation
        </Button>
      </CardContent>
    </Card>
  )
}

function StaffJourney() {
  const landing = ROLE_LANDING[CURRENT_USER.role]
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <div>
            <CardTitle>Staff Onboarding Journey</CardTitle>
            <CardDescription>
              An account is only marked Active after the final confirmation step
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

function StatusLine({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {done ? (
        <CheckCircle2 className="size-4 shrink-0 text-success-600" />
      ) : (
        <Circle className="size-4 shrink-0 text-muted" />
      )}
      <span className={done ? "text-ink" : "text-subtle"}>{label}</span>
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
