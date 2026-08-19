"use client"

import * as React from "react"

import { ROLES, ROLE_LABEL, ROLE_PERMISSIONS } from "@/lib/domain/rbac"
import { STATE_OWNER, ASSIGNMENT_RULES } from "@/lib/domain/rbac"
import { RECOVERY_STATE_LABEL, type RecoveryState } from "@/lib/domain/types"
import { USERS, type AppUser } from "@/lib/data/users"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { UsersManagement } from "@/components/users/users-view"
import { UsersPageActions } from "@/components/wizards/misc-page-actions"

const OWNED_STATES: RecoveryState[] = [
  "IN_RECOVERY",
  "PARTIALLY_RECOVERED",
  "AT_RISK",
  "COLLECTIONS",
  "LEGAL_REVIEW",
  "DISPUTE_OPEN",
  "CLOSED_PAID",
]

export default function UsersPage() {
  const [users, setUsers] = React.useState<AppUser[]>(() => [...USERS])

  return (
    <>
      <PageHeader
        title="User Management"
        description="Roles, permissions and workflow ownership across the recovery lifecycle."
        actions={<UsersPageActions onUserAdded={(user) => setUsers((prev) => [...prev, user])} />}
      />

      <UsersManagement users={users} setUsers={setUsers} />

      <div className="flex flex-col gap-6 px-8 pb-12">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <div>
                <CardTitle>Workflow Ownership</CardTitle>
                <CardDescription>Who owns a loan at each recovery state</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {OWNED_STATES.map((state) => (
                <div
                  key={state}
                  className="flex items-center justify-between border-b border-stroke py-3 last:border-0"
                >
                  <span className="text-sm text-body">
                    {RECOVERY_STATE_LABEL[state]}
                  </span>
                  <Badge tone="brand">{STATE_OWNER[state]}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <div>
                <CardTitle>Assignment Rules</CardTitle>
                <CardDescription>
                  Automatic allocation when a trigger event fires
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {ASSIGNMENT_RULES.map((rule) => (
                <div
                  key={rule.triggerEvent}
                  className="flex items-center justify-between gap-3 border-b border-stroke py-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-ink">
                      {rule.triggerEvent}
                    </p>
                    <p className="text-xs text-subtle">
                      → {ROLE_LABEL[rule.role]}
                    </p>
                  </div>
                  <Badge tone="neutral">{rule.allocationStrategy}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <div>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                Action-level, not screen-level — separation of duties is enforced here
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col gap-4">
              {ROLES.map((role) => (
                <div key={role} className="flex flex-col gap-2">
                  <p className="text-sm font-bold text-ink">{ROLE_LABEL[role]}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ROLE_PERMISSIONS[role].length === 0 ? (
                      <span className="text-xs text-subtle">
                        API-only access — no dashboard permissions.
                      </span>
                    ) : (
                      ROLE_PERMISSIONS[role].map((p) => (
                        <Badge key={p} tone="neutral" className="font-mono">
                          {p}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
