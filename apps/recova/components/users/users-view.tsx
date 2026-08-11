"use client"

import * as React from "react"
import { LogOut, ShieldPlus } from "lucide-react"

import { PERMISSIONS, ROLES, ROLE_LABEL, ROLE_PERMISSIONS, type Permission, type Role } from "@/lib/domain/rbac"
import { can } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import { TASKS } from "@/lib/data/tasks"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input, Label, Select, Textarea } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ResultDialog } from "@/components/queues/action-dialogs"

interface AppUser {
  name: string
  email: string
  role: Role
  status: "Active" | "Invited" | "Offboarded"
  mfa: boolean
}

const INITIAL_USERS: AppUser[] = [
  { name: "Adaora Nwosu", email: "adaora.nwosu@vfdmfb.com", role: "DRM", status: "Active", mfa: true },
  { name: "Chidi Okeke", email: "chidi.okeke@vfdmfb.com", role: "DRO", status: "Active", mfa: true },
  { name: "Fatima Bello", email: "fatima.bello@vfdmfb.com", role: "DRO", status: "Active", mfa: true },
  { name: "Ibrahim Musa", email: "ibrahim.musa@vfdmfb.com", role: "FINANCE", status: "Active", mfa: true },
  { name: "Sarah Okonkwo", email: "sarah.okonkwo@vfdmfb.com", role: "LEGAL", status: "Active", mfa: true },
  { name: "John Okeke", email: "john.okeke@vfdmfb.com", role: "LEGAL", status: "Invited", mfa: false },
  { name: "Tobi Adeleke", email: "tobi.adeleke@vfdmfb.com", role: "ADMIN", status: "Active", mfa: true },
  { name: "partner-api", email: "integrations@lender.ng", role: "INTEGRATOR", status: "Active", mfa: false },
]

interface CustomRole {
  id: string
  name: string
  basedOn: Role
  permissions: Permission[]
  createdAt: string
}

/** Groups mirroring the RBAC PRD's 7 permission categories. */
const PERMISSION_GROUPS: Array<{ label: string; test: (p: Permission) => boolean }> = [
  { label: "Recovery operations", test: (p) => p.startsWith("recovery.") },
  { label: "Mandate management", test: (p) => p.startsWith("mandate.") },
  { label: "Financial actions", test: (p) => p.startsWith("refund.") || p.startsWith("ledger.") || p.startsWith("reconciliation.") },
  { label: "Dispute management", test: (p) => p.startsWith("dispute.") },
  { label: "Escalation & collections", test: (p) => p.startsWith("escalation.") || p.startsWith("collections.") || p.startsWith("legal.") },
  { label: "System configuration", test: (p) => p.startsWith("role.") || p.startsWith("policy.") || p.startsWith("webhook.") },
  { label: "Reporting & audit", test: (p) => p.startsWith("report.") || p.startsWith("audit.") },
]

export function UsersManagement() {
  const [users, setUsers] = React.useState<AppUser[]>(INITIAL_USERS)
  const [customRoles, setCustomRoles] = React.useState<CustomRole[]>([])
  const [offboardTarget, setOffboardTarget] = React.useState<AppUser | null>(null)
  const [roleBuilderOpen, setRoleBuilderOpen] = React.useState(false)
  const [result, setResult] = React.useState<{ title: string; message: string } | null>(
    null
  )

  const maySuspend = can(CURRENT_USER.role, "role.assign")

  function handleOffboardConfirm(reason: string, notes: string, reassignTo: string) {
    if (!offboardTarget) return
    const openTasks = TASKS.filter(
      (t) => t.assignedTo === offboardTarget.name && t.status !== "RESOLVED" && t.status !== "CLOSED"
    )
    setUsers((prev) =>
      prev.map((u) => (u.email === offboardTarget.email ? { ...u, status: "Offboarded" } : u))
    )
    setOffboardTarget(null)
    setResult({
      title: "User offboarded",
      message: `${offboardTarget.name}'s access is revoked immediately. ${openTasks.length} open task${
        openTasks.length === 1 ? "" : "s"
      } reassigned to ${reassignTo}. Reason logged as ${reason}.${notes ? ` Notes: ${notes}` : ""}`,
    })
  }

  return (
    <div className="flex flex-col gap-6 px-8 pb-12">
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Users with escalation or write-off rights require stronger authentication
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>MFA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.email}>
                  <TableCell
                    className={cn("font-semibold", u.status === "Offboarded" ? "text-subtle line-through" : "text-ink")}
                  >
                    {u.name}
                  </TableCell>
                  <TableCell className="text-subtle">{u.email}</TableCell>
                  <TableCell>
                    <Badge tone="info">{ROLE_LABEL[u.role]}</Badge>
                  </TableCell>
                  <TableCell className="tabular text-subtle">
                    {ROLE_PERMISSIONS[u.role].length}
                  </TableCell>
                  <TableCell>
                    <Badge dot tone={u.mfa ? "success" : "warning"}>
                      {u.mfa ? "Enabled" : "Not set"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      dot
                      tone={
                        u.status === "Active"
                          ? "success"
                          : u.status === "Offboarded"
                            ? "error"
                            : "warning"
                      }
                    >
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="dangerSoft"
                      size="sm"
                      disabled={!maySuspend || u.status === "Offboarded" || u.email === CURRENT_USER.email}
                      title={
                        u.email === CURRENT_USER.email
                          ? "You cannot offboard yourself."
                          : maySuspend
                            ? undefined
                            : "Requires the role.assign permission."
                      }
                      onClick={() => setOffboardTarget(u)}
                    >
                      <LogOut className="size-3.5" />
                      Offboard
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader className="flex-wrap p-0 pb-4">
          <div>
            <CardTitle>Custom Roles</CardTitle>
            <CardDescription>
              Super Admin-authored roles, cloned from a base role and refined per portfolio
            </CardDescription>
          </div>
          <Button
            variant="primary"
            size="md"
            disabled={!maySuspend}
            title={maySuspend ? undefined : "Requires the role.assign permission."}
            onClick={() => setRoleBuilderOpen(true)}
          >
            <ShieldPlus />
            Create Custom Role
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {customRoles.length === 0 ? (
            <p className="text-sm text-subtle">
              No custom roles yet — every user currently holds one of the {ROLES.length} built-in
              roles below.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {customRoles.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-nav)] border border-stroke p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{r.name}</p>
                    <p className="text-xs text-subtle">
                      Cloned from {ROLE_LABEL[r.basedOn]} · {r.permissions.length} permissions
                    </p>
                  </div>
                  <Badge tone="warning">Pending Activation</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <OffboardDialog
        user={offboardTarget}
        onOpenChange={(o) => !o && setOffboardTarget(null)}
        onConfirm={handleOffboardConfirm}
      />

      <RoleBuilderDialog
        open={roleBuilderOpen}
        onOpenChange={setRoleBuilderOpen}
        onCreate={(role) => {
          setCustomRoles((prev) => [...prev, role])
          setRoleBuilderOpen(false)
          setResult({
            title: "Custom role created",
            message: `"${role.name}" was cloned from ${ROLE_LABEL[role.basedOn]} with ${role.permissions.length} permissions. It's pending activation — assign it to a user to bring it into effect.`,
          })
        }}
      />

      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </div>
  )
}

function OffboardDialog({
  user,
  onOpenChange,
  onConfirm,
}: {
  user: AppUser | null
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string, notes: string, reassignTo: string) => void
}) {
  const [reason, setReason] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [reassignTo, setReassignTo] = React.useState("")

  const openTasks = user
    ? TASKS.filter((t) => t.assignedTo === user.name && t.status !== "RESOLVED" && t.status !== "CLOSED")
    : []
  const candidates = user
    ? INITIAL_USERS.filter((u) => u.role === user.role && u.email !== user.email && u.status === "Active")
    : []

  React.useEffect(() => {
    if (user) {
      setReason("")
      setNotes("")
      setReassignTo(candidates[0]?.name ?? "Unassigned pool")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (!user) return null

  return (
    <Dialog open={user !== null} onOpenChange={onOpenChange}>
      <DialogContent
        title="Offboard User"
        description={`${user.name} · ${ROLE_LABEL[user.role]}`}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" size="lg" className="sm:flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="lg"
              className="sm:flex-1"
              disabled={reason === ""}
              onClick={() => onConfirm(reason, notes, reassignTo)}
            >
              Revoke Access
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="rounded-[var(--radius-control)] bg-surface p-4 text-sm text-body">
            {openTasks.length === 0 ? (
              "No open tasks are currently assigned to this user."
            ) : (
              <>
                <strong className="text-ink">{openTasks.length}</strong> open task
                {openTasks.length === 1 ? "" : "s"} will be reassigned:
                <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-xs text-subtle">
                  {openTasks.map((t) => (
                    <li key={t.taskId}>
                      {t.taskId} — {t.subjectLabel}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ob-reassign">Reassign open tasks to</Label>
            <Select id="ob-reassign" value={reassignTo} onChange={(e) => setReassignTo(e.target.value)}>
              {candidates.map((c) => (
                <option key={c.email} value={c.name}>
                  {c.name} — {ROLE_LABEL[c.role]}
                </option>
              ))}
              <option value="Unassigned pool">Unassigned pool</option>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ob-reason">Reason *</Label>
            <Select id="ob-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="">Select a reason</option>
              <option value="ROLE_CHANGE">Role change</option>
              <option value="RESIGNATION">Resignation</option>
              <option value="TERMINATION">Termination</option>
              <option value="EXTENDED_LEAVE">Extended leave</option>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ob-notes">Notes (optional)</Label>
            <Textarea
              id="ob-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Context for the audit trail…"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RoleBuilderDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (role: CustomRole) => void
}) {
  const [name, setName] = React.useState("")
  const [basedOn, setBasedOn] = React.useState<Role>("DRO")
  const [permissions, setPermissions] = React.useState<Permission[]>(ROLE_PERMISSIONS.DRO)

  React.useEffect(() => {
    if (open) {
      setName("")
      setBasedOn("DRO")
      setPermissions(ROLE_PERMISSIONS.DRO)
    }
  }, [open])

  function cloneFrom(role: Role) {
    setBasedOn(role)
    setPermissions(ROLE_PERMISSIONS[role])
  }

  function toggle(p: Permission) {
    setPermissions((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
  }

  const valid = name.trim() !== ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Create Custom Role"
        description="Clone a base role, then add or remove individual permissions"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" size="lg" className="sm:flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="sm:flex-1"
              disabled={!valid}
              onClick={() =>
                onCreate({
                  id: `role_${Date.now()}`,
                  name: name.trim(),
                  basedOn,
                  permissions,
                  createdAt: new Date().toISOString(),
                })
              }
            >
              Create Role
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="rb-name">Role name *</Label>
            <Input
              id="rb-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Senior Recovery Officer"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="rb-base">Clone permissions from</Label>
            <Select id="rb-base" value={basedOn} onChange={(e) => cloneFrom(e.target.value as Role)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-3">
            <Label>Permissions ({permissions.length} selected)</Label>
            {PERMISSION_GROUPS.map((group) => {
              const inGroup = PERMISSIONS.filter(group.test)
              if (inGroup.length === 0) return null
              return (
                <div key={group.label} className="rounded-[var(--radius-control)] border border-stroke p-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
                    {group.label}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {inGroup.map((p) => (
                      <label key={p} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          className="size-3.5 accent-[var(--color-brand)]"
                          checked={permissions.includes(p)}
                          onChange={() => toggle(p)}
                        />
                        <span className="font-mono text-body">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
