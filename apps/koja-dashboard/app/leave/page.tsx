import { Header } from "@/components/layout/header"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { leaveRequests, type LeaveRequest } from "@/lib/data"
import { Calendar, TickCircle, CloseCircle, Timer1 } from "iconsax-react"

const leaveTypeStyle: Record<LeaveRequest["type"], string> = {
  annual: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  sick: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  emergency: "text-red-400 bg-red-500/10 border-red-500/20",
  personal: "text-purple-400 bg-purple-500/10 border-purple-500/20",
}

const leaveTypeLabels: Record<LeaveRequest["type"], string> = {
  annual: "Annual Leave",
  sick: "Sick Leave",
  emergency: "Emergency",
  personal: "Personal",
}

function statusBadge(status: LeaveRequest["status"]) {
  switch (status) {
    case "approved": return <Badge variant="success">Approved</Badge>
    case "declined": return <Badge variant="destructive">Declined</Badge>
    case "pending": return <Badge variant="default">Pending</Badge>
    case "modified": return <Badge variant="warning">Modified</Badge>
    default: return null
  }
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function LeavePage() {
  const pending = leaveRequests.filter((l) => l.status === "pending")

  const summary = [
    { label: "Pending", count: leaveRequests.filter((l) => l.status === "pending").length, iconColor: "#f59e0b", bg: "bg-amber-500/10", Icon: Timer1 },
    { label: "Approved", count: leaveRequests.filter((l) => l.status === "approved").length, iconColor: "#34d399", bg: "bg-emerald-500/10", Icon: TickCircle },
    { label: "Declined", count: leaveRequests.filter((l) => l.status === "declined").length, iconColor: "#f87171", bg: "bg-red-500/10", Icon: CloseCircle },
    { label: "On Leave Today", count: 1, iconColor: "#60a5fa", bg: "bg-blue-500/10", Icon: Calendar },
  ]

  return (
    <>
      <Header
        title="Leave Requests"
        subtitle={`${pending.length} pending approval`}
      />
      <main className="flex-1 p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          {summary.map((s) => (
            <div key={s.label} className="bg-[#111214] border border-white/[0.07] rounded-xl p-4 flex items-center gap-3">
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", s.bg)}>
                <s.Icon size={16} color={s.iconColor} variant="Bold" />
              </div>
              <div>
                <p className="text-xl font-bold text-zinc-100">{s.count}</p>
                <p className="text-xs text-zinc-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pending (needs action) */}
        {pending.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Pending Approval
            </p>
            <div className="space-y-3">
              {pending.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#111214] border border-amber-500/20 bg-amber-500/[0.03] rounded-xl p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={req.driver} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-zinc-100">{req.driver}</p>
                          <span className="text-xs text-zinc-600">{req.driverCode}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                              leaveTypeStyle[req.type]
                            )}
                          >
                            {leaveTypeLabels[req.type]}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-zinc-500">
                            <Calendar size={11} color="currentColor" variant="Linear" />
                            <span>
                              {fmtDate(req.from)} – {fmtDate(req.to)}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-600">
                            {req.affectedDuties} duties affected
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="destructive" size="sm">Decline</Button>
                      <Button size="sm">Approve</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All requests */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            All Requests
          </p>
          <Card>
            <div className="divide-y divide-white/[0.04]">
              {leaveRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <Avatar name={req.driver} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-200">{req.driver}</p>
                      <span className="text-xs text-zinc-600">{req.driverCode}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium border",
                          leaveTypeStyle[req.type]
                        )}
                      >
                        {leaveTypeLabels[req.type]}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {fmtDate(req.from)} – {fmtDate(req.to)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {statusBadge(req.status)}
                    {req.reason && (
                      <p className="text-[11px] text-zinc-600 mt-1 max-w-[220px] text-right leading-snug">
                        {req.reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </>
  )
}
