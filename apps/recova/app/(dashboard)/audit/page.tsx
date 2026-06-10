import { Search, Download, Filter } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { auditEvents } from "@/lib/mock-data"
import { formatDate, formatRelativeTime } from "@/lib/utils"
import { cn } from "@/lib/utils"

const MODULE_STYLE: Record<string, string> = {
  RECOVERY: "bg-primary/10 text-primary",
  MANDATE: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  DISPUTE: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  SYSTEM: "bg-muted text-muted-foreground",
  AUTH: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  SETTLEMENT: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
}

export default function AuditPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="Audit Log"
        description="Comprehensive system activity trail for compliance"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        }
      />

      <div className="p-4 sm:p-6">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="border-b border-border">
                <tr>
                  {["Time", "Actor", "Action", "Module", "IP Address", "Entity"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditEvents.map(event => (
                  <tr key={event.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">{formatRelativeTime(event.timestamp)}</span>
                        <span className="text-[11px] text-muted-foreground monospace-nums">{formatDate(event.timestamp)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">{event.actor}</span>
                        <span className="text-[11px] text-muted-foreground">{event.role}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <span className="text-xs text-foreground leading-snug">{event.action}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", MODULE_STYLE[event.module] ?? "bg-muted text-muted-foreground")}>
                        {event.module}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground monospace-nums">{event.ipAddress}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground font-mono">{event.entityId || "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{auditEvents.length} events</span>
            <span className="text-xs text-muted-foreground">Showing all records. Use filters to narrow down.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
