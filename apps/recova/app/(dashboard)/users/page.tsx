import { UserPlus, Shield } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { droUsers } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const ROLE_STYLE: Record<string, string> = {
  "Debt Recovery Officer": "bg-primary/10 text-primary",
  "Senior DRO": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "Recovery Manager": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "Team Lead": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Compliance Officer": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
}

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  INACTIVE: "bg-muted text-muted-foreground",
  SUSPENDED: "bg-red-500/10 text-red-600 dark:text-red-400",
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
}

export default function UsersPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="User Management"
        description="Manage DRO accounts, roles, and permissions"
        actions={
          <Button size="sm" className="gap-2 text-xs">
            <UserPlus className="h-3.5 w-3.5" />
            Add User
          </Button>
        }
      />

      <div className="p-6">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-border">
                <tr>
                  {["User", "Role", "Cases Assigned", "Recovery Rate", "Status", "Last Active", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {droUsers.map(user => (
                  <tr key={user.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-[11px] text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", ROLE_STYLE[user.role] ?? "bg-muted text-muted-foreground")}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-foreground">{user.casesAssigned}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-sm font-semibold",
                        user.recoveryRate >= 85 ? "text-emerald-600 dark:text-emerald-400" :
                        user.recoveryRate >= 70 ? "text-amber-600 dark:text-amber-400" :
                        "text-red-600 dark:text-red-400"
                      )}>
                        {user.recoveryRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", STATUS_STYLE[user.status])}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{user.lastActive}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border px-4 py-2.5">
            <span className="text-xs text-muted-foreground">{droUsers.length} users</span>
          </div>
        </div>
      </div>
    </div>
  )
}
