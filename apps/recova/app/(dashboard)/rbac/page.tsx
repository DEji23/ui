"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  rbacKPIs,
  roleDefinitions,
  permissionGroups,
  workflowOwnership,
  assignmentRules,
  approvalPolicies,
  type UserRole,
  type AllocationStrategy,
} from "@/lib/rbac-data"
import { TickCircle, Warning2, ArrowRight } from "iconsax-react"

const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN:  "bg-red-500/10 text-red-700 border-red-500/20",
  ADMIN:        "bg-orange-500/10 text-orange-700 border-orange-500/20",
  DRO:          "bg-blue-500/10 text-blue-700 border-blue-500/20",
  DRM:          "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  FINANCE_OPS:  "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  LEGAL:        "bg-purple-500/10 text-purple-700 border-purple-500/20",
  INTEGRATOR:   "bg-slate-500/10 text-slate-700 border-slate-500/20",
}

const STRATEGY_CONFIG: Record<AllocationStrategy, { label: string; className: string }> = {
  ROUND_ROBIN:   { label: "Round Robin",   className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  LOAD_BALANCED: { label: "Load Balanced", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  SKILL_BASED:   { label: "Skill Based",   className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  MANUAL:        { label: "Manual",        className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
}

const EDGE_CASES = [
  {
    title: "User leaves organisation",
    description: "Access is immediately disabled and all assigned tasks are auto-reassigned.",
    resolution: "Auto-reassign open tasks via LOAD_BALANCED. Disable all active sessions immediately.",
    severity: "HIGH",
  },
  {
    title: "Task left unassigned",
    description: "No eligible user found for a trigger event — fallback kicks in.",
    resolution: "Add task to admin-visible unassigned queue and trigger Admin notification.",
    severity: "MEDIUM",
  },
  {
    title: "Conflict of roles detected",
    description: "User attempts to hold two conflicting roles (e.g. DRO + Finance/Ops).",
    resolution: "System rejects dual-role assignment. Super Admin must resolve manually.",
    severity: "HIGH",
  },
]

export default function RBACPage() {
  const totalUsers = roleDefinitions.reduce((a, r) => a + r.userCount, 0)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div>
          <h1 className="text-base font-semibold text-foreground">RBAC &amp; Workflow Assignment</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Least privilege · Separation of duties · Full traceability</p>
        </div>
        <div className="flex items-center gap-1.5 rounded border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1">
          <TickCircle size={12} className="text-emerald-600" />
          <span className="text-[11px] font-semibold text-emerald-700">{rbacKPIs.unauthorizedAttempts} Unauthorized Attempts</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* KPI Bar */}
        <div className="grid grid-cols-4 gap-3 p-4 border-b border-border">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Unauthorized Attempts</p>
            <p className={cn("mt-1 text-2xl font-bold tabular-nums", rbacKPIs.unauthorizedAttempts === 0 ? "text-emerald-600" : "text-red-600")}>
              {rbacKPIs.unauthorizedAttempts}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">Target: 0</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Active Roles</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{rbacKPIs.activeRoles}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{totalUsers} total users</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Pending Assignments</p>
            <p className={cn("mt-1 text-2xl font-bold tabular-nums", rbacKPIs.pendingAssignments > 0 ? "text-amber-600" : "text-emerald-600")}>
              {rbacKPIs.pendingAssignments}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">Unassigned tasks</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Avg Approval Time</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{rbacKPIs.avgApprovalHours}h</p>
            <p className="text-[10px] text-muted-foreground mt-1">{rbacKPIs.taskCompletionOwnership}% ownership rate</p>
          </div>
        </div>

        {/* Role Cards Strip */}
        <div className="flex gap-2 px-4 py-3 border-b border-border overflow-x-auto no-scrollbar">
          {roleDefinitions.map((r) => (
            <div key={r.role} className="shrink-0 rounded-lg border border-border bg-card px-3 py-2 min-w-[110px]">
              <Badge variant="outline" className={cn("text-[9px] font-bold mb-1", ROLE_COLORS[r.role])}>{r.label}</Badge>
              <p className="text-sm font-bold text-foreground">{r.userCount}</p>
              <p className="text-[10px] text-muted-foreground">{r.permissions.length} perms</p>
            </div>
          ))}
        </div>

        <div className="p-4">
          <Tabs defaultValue="matrix">
            <TabsList className="mb-4">
              <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
              <TabsTrigger value="workflow">Workflow Ownership</TabsTrigger>
              <TabsTrigger value="assignment">Assignment Rules</TabsTrigger>
              <TabsTrigger value="approvals">Approval Policies</TabsTrigger>
              <TabsTrigger value="edge-cases">Edge Cases</TabsTrigger>
            </TabsList>

            {/* Permission Matrix */}
            <TabsContent value="matrix">
              <div className="rounded-lg border border-border overflow-x-auto">
                <table className="text-xs" style={{ minWidth: "900px" }}>
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-3 py-2 text-left font-semibold text-muted-foreground w-56">Permission</th>
                      {roleDefinitions.map((r) => (
                        <th key={r.role} className="px-2 py-2 text-center font-semibold min-w-[96px]">
                          <Badge variant="outline" className={cn("text-[9px]", ROLE_COLORS[r.role])}>{r.label}</Badge>
                          <p className="text-[9px] text-muted-foreground mt-0.5">{r.userCount}u</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permissionGroups.map((group) => (
                      <React.Fragment key={group.category}>
                        <tr className="bg-muted/30 border-b border-border">
                          <td colSpan={roleDefinitions.length + 1} className="px-3 py-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{group.category}</span>
                          </td>
                        </tr>
                        {group.permissions.map((perm, pi) => (
                          <tr key={perm.key} className={cn("border-b border-border last:border-0 hover:bg-muted/20", pi % 2 ? "bg-muted/10" : "")}>
                            <td className="px-3 py-2">
                              <p className="font-medium text-foreground">{perm.label}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{perm.key}</p>
                            </td>
                            {roleDefinitions.map((r) => (
                              <td key={r.role} className="px-2 py-2 text-center">
                                {r.permissions.includes(perm.key) ? (
                                  <TickCircle size={14} className="mx-auto text-emerald-600" />
                                ) : (
                                  <span className="text-muted-foreground/25 text-sm">—</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Workflow Ownership */}
            <TabsContent value="workflow">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border bg-muted/40">
                    <p className="text-xs font-semibold text-foreground">Loan State → Role Ownership</p>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Loan State</th>
                        <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Assigned To</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workflowOwnership.map((w, i) => (
                        <tr key={w.state} className={cn("border-b border-border last:border-0", i % 2 ? "bg-muted/10" : "")}>
                          <td className="px-3 py-2">
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-medium">{w.state}</span>
                          </td>
                          <td className="px-3 py-2">
                            {w.ownerRole ? (
                              <Badge variant="outline" className={cn("text-[10px]", ROLE_COLORS[w.ownerRole])}>{w.ownerLabel}</Badge>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">{w.ownerLabel}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm font-semibold text-foreground mb-3">Separation of Duties</p>
                    <div className="space-y-2">
                      {[
                        "No single user can initiate + approve + settle financial actions",
                        "DRO cannot approve refunds",
                        "Admin cannot execute debits",
                        "Finance cannot access mandate setup",
                        "DRO cannot escalate to legal",
                      ].map((rule) => (
                        <div key={rule} className="flex items-start gap-2">
                          <TickCircle size={13} className="shrink-0 text-emerald-600 mt-0.5" />
                          <p className="text-xs text-muted-foreground">{rule}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm font-semibold text-foreground mb-2">Allocation Strategies</p>
                    <div className="space-y-2">
                      {([
                        { s: "ROUND_ROBIN",   desc: "Rotate evenly across available agents" },
                        { s: "LOAD_BALANCED", desc: "Assign to agent with least open tasks" },
                        { s: "SKILL_BASED",   desc: "Match by loan size, bank, or product tag" },
                        { s: "MANUAL",        desc: "Admin assigns explicitly" },
                      ] as const).map(({ s, desc }) => (
                        <div key={s} className="flex items-center gap-2">
                          <Badge variant="outline" className={cn("text-[9px] shrink-0", STRATEGY_CONFIG[s].className)}>
                            {STRATEGY_CONFIG[s].label}
                          </Badge>
                          <p className="text-[11px] text-muted-foreground">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Assignment Rules */}
            <TabsContent value="assignment">
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {["ID", "Trigger Event", "Assigned Role", "Strategy", "Conditions", "Status"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assignmentRules.map((rule, i) => (
                      <tr key={rule.id} className={cn("border-b border-border last:border-0 hover:bg-muted/20", i % 2 ? "bg-muted/10" : "")}>
                        <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{rule.id}</td>
                        <td className="px-3 py-2">
                          <p className="font-medium text-foreground">{rule.triggerLabel}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{rule.triggerEvent}</p>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={cn("text-[10px]", ROLE_COLORS[rule.role])}>
                            {roleDefinitions.find(r => r.role === rule.role)?.label ?? rule.role}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={cn("text-[10px]", STRATEGY_CONFIG[rule.allocationStrategy].className)}>
                            {STRATEGY_CONFIG[rule.allocationStrategy].label}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{rule.conditions ?? "—"}</td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={rule.active
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                            : "bg-muted text-muted-foreground border-border text-[10px]"
                          }>
                            {rule.active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Approval Policies */}
            <TabsContent value="approvals">
              <div className="space-y-3">
                {approvalPolicies.map((policy) => (
                  <div key={policy.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{policy.actionLabel}</p>
                          <span className="font-mono text-[10px] text-muted-foreground">{policy.action}</span>
                          {policy.threshold && (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/20">
                              ₦{policy.threshold.toLocaleString()}+ threshold
                            </Badge>
                          )}
                          <Badge variant="outline" className={policy.active
                            ? "text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "text-[10px] bg-muted text-muted-foreground border-border"
                          }>
                            {policy.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{policy.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Required Approvers:</span>
                      {policy.requiredApprovers.map((r, i) => (
                        <React.Fragment key={r}>
                          <Badge variant="outline" className={cn("text-[10px]", ROLE_COLORS[r])}>
                            {roleDefinitions.find(rd => rd.role === r)?.label ?? r}
                          </Badge>
                          {i < policy.requiredApprovers.length - 1 && (
                            <ArrowRight size={11} className="text-muted-foreground" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Edge Cases */}
            <TabsContent value="edge-cases">
              <div className="grid grid-cols-3 gap-3">
                {EDGE_CASES.map((ec) => (
                  <div key={ec.title} className="rounded-lg border border-border p-4 space-y-2.5">
                    <div className="flex items-start gap-2">
                      <Warning2 size={14} className={cn("shrink-0 mt-0.5", ec.severity === "HIGH" ? "text-red-600" : "text-amber-600")} />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{ec.title}</p>
                        <Badge variant="outline" className={cn("text-[10px] mt-1",
                          ec.severity === "HIGH"
                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}>
                          {ec.severity}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{ec.description}</p>
                    <div className="rounded bg-muted/50 p-2">
                      <p className="text-[11px] font-semibold text-foreground mb-0.5">Resolution</p>
                      <p className="text-[11px] text-muted-foreground">{ec.resolution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
