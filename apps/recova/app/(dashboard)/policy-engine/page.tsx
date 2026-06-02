import { Settings2, Plus, ToggleLeft, ToggleRight } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const policies = [
  { id: "P001", name: "Auto-escalate to Legal after 180 DPD", module: "Escalation", enabled: true, lastModified: "2025-04-12", modifiedBy: "Adaora Nwosu" },
  { id: "P002", name: "Retry NDD mandate after 3 business days", module: "Mandate", enabled: true, lastModified: "2025-03-28", modifiedBy: "Emeka Obi" },
  { id: "P003", name: "Trigger EasyPay after 2 mandate failures", module: "EasyPay", enabled: true, lastModified: "2025-04-01", modifiedBy: "Adaora Nwosu" },
  { id: "P004", name: "Send SMS reminder at 7 DPD", module: "Notifications", enabled: false, lastModified: "2025-02-15", modifiedBy: "Kemi Okonkwo" },
  { id: "P005", name: "Flag AT_RISK loans above ₦500K outstanding", module: "Risk", enabled: true, lastModified: "2025-04-18", modifiedBy: "Adaora Nwosu" },
  { id: "P006", name: "Require maker-checker for write-offs", module: "Approval", enabled: true, lastModified: "2025-03-10", modifiedBy: "Emeka Obi" },
  { id: "P007", name: "Auto-suspend mandate after dispute filing", module: "Dispute", enabled: true, lastModified: "2025-04-22", modifiedBy: "Adaora Nwosu" },
  { id: "P008", name: "Daily reconciliation report at 08:00", module: "Reports", enabled: false, lastModified: "2025-01-30", modifiedBy: "Kemi Okonkwo" },
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

export default function PolicyEnginePage() {
  return (
    <div className="flex flex-col">
      <Header
        title="Policy Engine"
        description="Configure automation rules and recovery policies"
        actions={
          <Button size="sm" className="gap-2 text-xs">
            <Plus className="h-3.5 w-3.5" />
            New Policy
          </Button>
        }
      />

      <div className="p-6">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {policies.map(policy => (
              <div key={policy.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/40 transition-colors">
                <Switch defaultChecked={policy.enabled} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{policy.name}</p>
                    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", MODULE_STYLE[policy.module])}>
                      {policy.module}
                    </span>
                    {!policy.enabled && (
                      <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold bg-muted text-muted-foreground">
                        DISABLED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last modified {policy.lastModified} by {policy.modifiedBy}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs shrink-0">
                  Configure
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
