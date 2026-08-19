"use client"

import * as React from "react"
import { RotateCcw, Save } from "lucide-react"

import { cn } from "@/lib/utils"
import { can } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import { ORGANISATIONS, type Organisation } from "@/lib/data/organisations"
import {
  DEBIT_PREFERENCE_LABEL,
  ESCALATION_STAGES,
  RETRY_RULE_OPTIONS,
  type DebitPreference,
  type RecoveryPolicyDraft,
} from "@/lib/domain/onboarding"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input, Label, Select } from "@/components/ui/input"
import { ResultDialog } from "@/components/queues/action-dialogs"

/**
 * Per-organisation policy overrides.
 *
 * PRD: "configurable per lender, per loan product, or per portfolio" — the
 * platform-wide policy above this card is the default every tenant starts
 * from (the same policy set during onboarding's Recovery Policy
 * Configuration phase), but each organisation can diverge from it here.
 */
export function OrgPolicyOverrides() {
  const [orgId, setOrgId] = React.useState<string>(ORGANISATIONS[0].id)
  const org = ORGANISATIONS.find((o) => o.id === orgId) ?? ORGANISATIONS[0]

  return (
    <Card>
      <CardHeader className="flex-wrap">
        <div>
          <CardTitle>Organisation Policy Overrides</CardTitle>
          <CardDescription>
            Each tenant&apos;s recovery policy, set during onboarding and editable here
          </CardDescription>
        </div>
        <div className="w-full sm:w-auto sm:min-w-[220px]">
          <Select value={orgId} onChange={(e) => setOrgId(e.target.value)}>
            {ORGANISATIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.tradingName}
              </option>
            ))}
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <OrgPolicyForm key={orgId} org={org} />
      </CardContent>
    </Card>
  )
}

function OrgPolicyForm({ org }: { org: Organisation }) {
  const [policy, setPolicy] = React.useState<RecoveryPolicyDraft>(org.recoveryPolicy)
  const [result, setResult] = React.useState<{ title: string; message: string } | null>(
    null
  )
  const mayEdit = can(CURRENT_USER.role, "policy.configure")

  const dirty = JSON.stringify(policy) !== JSON.stringify(org.recoveryPolicy)
  const valid = policy.retryRules.length > 0

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="op-debit">Debit preference</Label>
        <Select
          id="op-debit"
          value={policy.debitPreference}
          disabled={!mayEdit}
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

      <ChipToggleField
        label="Retry rules"
        options={RETRY_RULE_OPTIONS}
        selected={policy.retryRules}
        disabled={!mayEdit}
        onChange={(next) => setPolicy((p) => ({ ...p, retryRules: next }))}
      />
      {policy.retryRules.length === 0 ? (
        <p className="-mt-3 text-xs text-error-600">
          At least one retry rule is required.
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3 rounded-[var(--radius-nav)] border border-stroke p-3">
        <div>
          <p className="text-sm font-semibold text-ink">Partial recovery</p>
          <p className="text-xs text-subtle">Accept a partial debit when balance is short.</p>
        </div>
        <input
          type="checkbox"
          className="size-5 shrink-0 accent-[var(--color-brand)]"
          checked={policy.partialRecoveryEnabled}
          disabled={!mayEdit}
          onChange={(e) =>
            setPolicy((p) => ({ ...p, partialRecoveryEnabled: e.target.checked }))
          }
        />
      </div>
      {policy.partialRecoveryEnabled ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="op-min">Minimum partial amount (₦)</Label>
          <Input
            id="op-min"
            type="number"
            disabled={!mayEdit}
            value={policy.partialRecoveryMinAmount}
            onChange={(e) =>
              setPolicy((p) => ({ ...p, partialRecoveryMinAmount: Number(e.target.value) }))
            }
          />
        </div>
      ) : null}

      <ChipToggleField
        label="Escalation stages"
        options={ESCALATION_STAGES}
        selected={policy.escalationStages}
        disabled={!mayEdit}
        onChange={(next) => setPolicy((p) => ({ ...p, escalationStages: next }))}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="op-from">Quiet hours from</Label>
          <Input
            id="op-from"
            type="time"
            disabled={!mayEdit}
            value={policy.quietHoursFrom}
            onChange={(e) => setPolicy((p) => ({ ...p, quietHoursFrom: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="op-to">Quiet hours to</Label>
          <Input
            id="op-to"
            type="time"
            disabled={!mayEdit}
            value={policy.quietHoursTo}
            onChange={(e) => setPolicy((p) => ({ ...p, quietHoursTo: e.target.value }))}
          />
        </div>
      </div>

      {!mayEdit ? (
        <p className="text-xs text-subtle">
          Requires the <code>policy.configure</code> permission to edit.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          size="md"
          className="sm:flex-1"
          disabled={!dirty}
          onClick={() => setPolicy(org.recoveryPolicy)}
        >
          <RotateCcw />
          Reset to Saved
        </Button>
        <Button
          variant="primary"
          size="md"
          className="sm:flex-1"
          disabled={!mayEdit || !valid || !dirty}
          onClick={() =>
            setResult({
              title: "Organisation policy saved",
              message: `${org.tradingName}'s recovery policy is updated. It applies to this tenant only — the platform default and every other organisation are unaffected.`,
            })
          }
        >
          <Save />
          Save Organisation Policy
        </Button>
      </div>

      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </div>
  )
}

function ChipToggleField({
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
