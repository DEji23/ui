import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle2 } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const notifications = [
  { id: 1, type: "alert", title: "SLA Breach: Dispute #DSP-004", body: "Chidi Okonkwo's fraud dispute has exceeded the 5-day resolution SLA.", time: "2 min ago", read: false },
  { id: 2, type: "warning", title: "EasyPay Service Degraded", body: "Response times for EasyPay are above threshold (380ms). Monitor closely.", time: "18 min ago", read: false },
  { id: 3, type: "info", title: "Mandate Created: MND-0053", body: "NDD mandate for Segun Adewale has been approved and activated.", time: "1 hour ago", read: false },
  { id: 4, type: "success", title: "Recovery: ₦280,000 collected", body: "Aisha Mohammed — REMITA debit successful. Account now fully settled.", time: "2 hours ago", read: true },
  { id: 5, type: "alert", title: "Maker-Checker Pending", body: "Write-off request for Babatunde Adekoya awaiting approval. 4 hours remaining.", time: "3 hours ago", read: true },
  { id: 6, type: "info", title: "iGree Consent: Loan LN-2024-0007", body: "Kemi Olusanya has completed iGree onboarding. Mandate setup can proceed.", time: "5 hours ago", read: true },
  { id: 7, type: "success", title: "Daily Reconciliation Complete", body: "All settlements for 24 May 2025 have been reconciled. 0 exceptions.", time: "Yesterday", read: true },
  { id: 8, type: "warning", title: "AT_RISK: 3 new loans flagged", body: "Emeka Okafor, Ngozi Adeyemi, Tunde Fashola flagged as AT_RISK by policy engine.", time: "Yesterday", read: true },
]

const TYPE_STYLE: Record<string, { icon: React.ReactNode; bg: string; dot: string }> = {
  alert: { icon: <AlertTriangle className="h-4 w-4 text-red-500" />, bg: "bg-red-500/10", dot: "bg-red-500" },
  warning: { icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, bg: "bg-amber-500/10", dot: "bg-amber-500" },
  info: { icon: <Info className="h-4 w-4 text-blue-500" />, bg: "bg-blue-500/10", dot: "bg-blue-500" },
  success: { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, bg: "bg-emerald-500/10", dot: "bg-emerald-500" },
}

export default function NotificationsPage() {
  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="flex flex-col">
      <Header
        title="Notifications"
        description={`${unread} unread notification${unread !== 1 ? "s" : ""}`}
        actions={
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        }
      />

      <div className="p-4 sm:p-6">
        <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
          {notifications.map(notif => {
            const style = TYPE_STYLE[notif.type]
            return (
              <div
                key={notif.id}
                className={cn(
                  "flex items-start gap-3.5 px-5 py-4 hover:bg-muted/40 transition-colors cursor-pointer",
                  !notif.read && "bg-primary/[0.03]"
                )}
              >
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl mt-0.5", style.bg)}>
                  {style.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-medium", !notif.read ? "text-foreground" : "text-muted-foreground")}>
                      {notif.title}
                    </p>
                    {!notif.read && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", style.dot)} />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.body}</p>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0 mt-0.5 whitespace-nowrap">{notif.time}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
