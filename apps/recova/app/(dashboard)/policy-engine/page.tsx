"use client"

import { useState } from "react"
import { Settings2, Plus, Save, RotateCcw, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { policyConfig as initial, type PolicyConfig, type RecoveryRail } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const RAIL_OPTIONS: RecoveryRail[] = ["NDD", "REMITA", "EASY_PAY", "MANUAL"]

const RULES = [
  { id: "R001", name: "Auto-escalate to Legal after DPD threshold", module: "Escalation", enabled: true },
  { id: "R002", name: "Retry NDD mandate after interval", module: "Mandate", enabled: true },
  { id: "R003", name: "Trigger EasyPay after N mandate failures", module: "EasyPay", enabled: true },
  { id: "R004", name: "Send SMS reminder at 7 DPD", module: "Notifications", enabled: false },
  { id: "R005", name: "Flag AT_RISK loans above amount threshold", module: "Risk", enabled: true },
  { id: "R006", name: "Require maker-checker for write-offs", module: "Approval", enabled: true },
  { id: "R007", name: "Auto-suspend mandate after dispute filing", module: "Dispute", enabled: true },
  { id: "R008", name: "Daily reconciliation report at 08:00", module: "Reports", enabled: false },
]

const MODULE_STYLE: Record<string, string> = {
  Escalation: "bg-red-500/10 text-red-600 dark:text-red-400",
  Mandate: "bg-primary/10 text-primary",
  EasyPay: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  Notifications: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Risk: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  Approval: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  Dispute: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Reports: "bg-muted text-muted-foreground",
}

function NumberInput({ value, onChange, min = 0, step = 1, suffix }: {
  value: number; onChange: (v: number) => void; min?: number; step?: number; suffix?: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="w-20 text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring monospace-nums text-right"
      />
      {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
    </div>
  )
}

export default function PolicyEnginePage() {
  const [config, setConfig] = useState<PolicyConfig>(initial)
  const [rules, setRules] = useState(RULES)
  const [dirty, setDirty] = useState(false)
  const [retryInput, setRetryInput] = useState(config.retry_intervals.join(", "))

  function update<K extends keyof PolicyConfig>(key: K, value: PolicyConfig[K]) {
    setConfig(c => ({ ...c, [key]: value }))
    setDirty(true)
  }

  function toggleRule(id: string) {
    setRules(r => r.map(rule => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule))
    setDirty(true)
  }

  function toggleRailPriority(rail: RecoveryRail) {
    setConfig(c => {
      const next = c.rail_priority.includes(rail)
        ? c.rail_priority.filter(r => r !== rail)
        : [...c.rail_priority, rail]
      setDirty(true)
      return { ...c, rail_priority: next }
    })
  }

  function moveRailUp(index: number) {
    if (index === 0) return
    setConfig(c => {
      const arr = [...c.rail_priority]
      ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
      setDirty(true)
      return { ...c, rail_priority: arr }
    })
  }

  function applyRetryIntervals() {
    const parsed = retryInput.split(/[,\s]+/).map(Number).filter(n => !isNaN(n) && n > 0)
    if (parsed.length === 0) { toast.error("Enter valid intervals"); return }
    update("retry_intervals", parsed)
  }

  function save() {
    // Validate retry intervals
    if (config.retry_intervals.length === 0) { toast.error("At least one retry interval required"); return }
    setDirty(false)
    toast.success("Policy configuration saved — pending maker-checker approval")
  }

  function reset() {
    setConfig(initial)
    setRules(RULES)
    setRetryInput(initial.retry_intervals.join(", "))
    setDirty(false)
    toast.info("Config reset to last saved state")
  }

  const configJson = JSON.stringify({
    retry_intervals: config.retry_intervals,
    max_attempts: config.max_attempts,
    partial_recovery_enabled: config.partial_recovery_enabled,
    min_partial_amount: config.min_partial_amount,
    rail_priority: config.rail_priority,
    quiet_hours: config.quiet_hours,
    escalation_dpd_threshold: config.escalation_dpd_threshold,
    legal_dpd_threshold: config.legal_dpd_threshold,
    at_risk_amount_threshold: config.at_risk_amount_threshold,
    easypay_trigger_after_failures: config.easypay_trigger_after_failures,
  }, null, 2)

  return (
    <div className="flex flex-col">
      <Header
        title="Policy Engine"
        description="Configure automation rules and recovery behaviour"
        actions={
          <div className="flex items-center gap-2">
            {dirty && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                Unsaved changes
              </div>
            )}
            <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={reset} disabled={!dirty}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button size="sm" className="gap-2 text-xs" onClick={save} disabled={!dirty}>
              <Save className="h-3.5 w-3.5" />
              Save & Submit
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Left: Parameters */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Recovery Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Retry intervals */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Retry Intervals (hours)</p>
                      <p className="text-xs text-muted-foreground">Hours between consecutive retry attempts</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={retryInput}
                      onChange={e => setRetryInput(e.target.value)}
                      className="flex-1 text-xs rounded-lg border border-border bg-background px-3 py-1.5 text-foreground monospace-nums focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="24, 72, 168"
                    />
                    <Button variant="outline" size="sm" className="text-xs h-8 shrink-0" onClick={applyRetryIntervals}>Apply</Button>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {config.retry_intervals.map((h, i) => (
                      <span key={i} className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium monospace-nums">{h}h</span>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Max attempts */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Max Attempts</p>
                    <p className="text-xs text-muted-foreground">Before escalation is triggered</p>
                  </div>
                  <NumberInput value={config.max_attempts} onChange={v => update("max_attempts", v)} min={1} />
                </div>

                <Separator />

                {/* Partial recovery */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Partial Recovery</p>
                    <p className="text-xs text-muted-foreground">Accept amounts below full outstanding</p>
                  </div>
                  <Switch checked={config.partial_recovery_enabled} onCheckedChange={v => update("partial_recovery_enabled", v)} />
                </div>
                {config.partial_recovery_enabled && (
                  <div className="flex items-center justify-between pl-4 border-l-2 border-primary/20">
                    <p className="text-xs text-muted-foreground">Minimum partial amount (₦)</p>
                    <NumberInput value={config.min_partial_amount} onChange={v => update("min_partial_amount", v)} min={100} step={100} />
                  </div>
                )}

                <Separator />

                {/* Quiet hours */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Quiet Hours</p>
                    <p className="text-xs text-muted-foreground">No debit attempts during this window</p>
                  </div>
                  <input
                    value={config.quiet_hours}
                    onChange={e => update("quiet_hours", e.target.value)}
                    className="w-28 text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 text-foreground monospace-nums focus:outline-none focus:ring-1 focus:ring-ring text-center"
                    placeholder="22:00-06:00"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Escalation Thresholds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Escalation DPD</p>
                    <p className="text-xs text-muted-foreground">Trigger escalation at this many days past due</p>
                  </div>
                  <NumberInput value={config.escalation_dpd_threshold} onChange={v => update("escalation_dpd_threshold", v)} min={1} suffix="days" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Legal DPD Threshold</p>
                    <p className="text-xs text-muted-foreground">Auto-escalate to Legal Review</p>
                  </div>
                  <NumberInput value={config.legal_dpd_threshold} onChange={v => update("legal_dpd_threshold", v)} min={1} suffix="days" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">AT_RISK Amount</p>
                    <p className="text-xs text-muted-foreground">Flag loans above this outstanding balance</p>
                  </div>
                  <NumberInput value={config.at_risk_amount_threshold} onChange={v => update("at_risk_amount_threshold", v)} min={0} step={10000} suffix="₦" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">EasyPay Trigger</p>
                    <p className="text-xs text-muted-foreground">Switch to EasyPay after N mandate failures</p>
                  </div>
                  <NumberInput value={config.easypay_trigger_after_failures} onChange={v => update("easypay_trigger_after_failures", v)} min={1} suffix="failures" />
                </div>
              </CardContent>
            </Card>

            {/* Rail Priority */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Rail Priority Order</CardTitle>
                <p className="text-xs text-muted-foreground">Drag to reorder. Toggle to enable/disable.</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {config.rail_priority.map((rail, i) => (
                  <div key={rail} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 bg-muted/30">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium text-foreground">{rail}</span>
                    <button
                      onClick={() => moveRailUp(i)}
                      disabled={i === 0}
                      className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 px-1"
                    >
                      ↑
                    </button>
                  </div>
                ))}
                <div className="pt-1 flex gap-2 flex-wrap">
                  {RAIL_OPTIONS.filter(r => !config.rail_priority.includes(r)).map(r => (
                    <button
                      key={r}
                      onClick={() => toggleRailPriority(r)}
                      className="text-xs rounded-md px-2 py-1 border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                    >
                      + {r}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Rule toggles + JSON preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Automation Rules</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {rules.map(rule => (
                    <div key={rule.id} className="flex items-start gap-3 px-5 py-3.5">
                      <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} className="mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">{rule.name}</p>
                          <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold", MODULE_STYLE[rule.module])}>
                            {rule.module}
                          </span>
                        </div>
                        {!rule.enabled && <p className="text-[10px] text-muted-foreground mt-0.5">Disabled</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Live JSON preview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Config Preview (JSON)</CardTitle>
                <p className="text-xs text-muted-foreground">This is what gets submitted for maker-checker approval</p>
              </CardHeader>
              <CardContent>
                <pre className="text-[11px] font-mono text-foreground/80 bg-muted/50 rounded-lg p-3 overflow-x-auto leading-relaxed">
                  {configJson}
                </pre>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}
