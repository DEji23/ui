import { UserPlus } from "lucide-react"

import { ROLES, ROLE_LABEL, ROLE_PERMISSIONS, type Role } from "@/lib/domain/rbac"
import { STATE_OWNER, ASSIGNMENT_RULES } from "@/lib/domain/rbac"
import { RECOVERY_STATE_LABEL, type RecoveryState } from "@/lib/domain/types"
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

/**
 * User management + the live RBAC matrix.
 * Rendering the matrix straight from ROLE_PERMISSIONS means the screen can
 * never drift from what the app actually enforces.
 */
const USERS = [
  { name: "Adaora Nwosu", email: "adaora.nwosu@vfdmfb.com", role: "DRM" as Role, status: "Active", mfa: true },
  { name: "Chidi Okeke", email: "chidi.okeke@vfdmfb.com", role: "DRO" as Role, status: "Active", mfa: true },
  { name: "Fatima Bello", email: "fatima.bello@vfdmfb.com", role: "DRO" as Role, status: "Active", mfa: true },
  { name: "Ibrahim Musa", email: "ibrahim.musa@vfdmfb.com", role: "FINANCE" as Role, status: "Active", mfa: true },
  { name: "Sarah Okonkwo", email: "sarah.okonkwo@vfdmfb.com", role: "LEGAL" as Role, status: "Active", mfa: true },
  { name: "John Okeke", email: "john.okeke@vfdmfb.com", role: "LEGAL" as Role, status: "Invited", mfa: false },
  { name: "Tobi Adeleke", email: "tobi.adeleke@vfdmfb.com", role: "ADMIN" as Role, status: "Active", mfa: true },
  { name: "partner-api", email: "integrations@lender.ng", role: "INTEGRATOR" as Role, status: "Active", mfa: false },
]

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
  return (
    <>
      <PageHeader
        title="User Management"
        description="Roles, permissions and workflow ownership across the recovery lifecycle."
        actions={
          <Button variant="primary" className="h-12 px-5">
            Invite User
            <UserPlus />
          </Button>
        }
      />

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {USERS.map((u) => (
                  <TableRow key={u.email}>
                    <TableCell className="font-semibold text-ink">{u.name}</TableCell>
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
                      <Badge dot tone={u.status === "Active" ? "success" : "warning"}>
                        {u.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
