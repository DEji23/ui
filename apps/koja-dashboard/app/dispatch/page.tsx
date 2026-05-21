import { Header } from "@/components/layout/header"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { dispatchPlans } from "@/lib/data"
import { Add, Send2, TickCircle, CloseCircle, Warning2 } from "iconsax-react"

function dispatchStatusBadge(status: string) {
  switch (status) {
    case "active": return <Badge variant="success">Active</Badge>
    case "completed": return <Badge variant="muted">Completed</Badge>
    case "no_show": return <Badge variant="destructive">No-Show</Badge>
    case "pending": return <Badge variant="default">Pending</Badge>
    default: return null
  }
}

export default function DispatchPage() {
  const activeCount = dispatchPlans.filter((d) => d.status === "active").length
  const noShowCount = dispatchPlans.filter((d) => d.status === "no_show").length
  const completedCount = dispatchPlans.filter((d) => d.status === "completed").length

  return (
    <>
      <Header
        title="Dispatch"
        subtitle="Today’s plan — Wednesday 21 May 2026"
        action={
          <div className="flex gap-2 mr-1">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Send2 size={14} color="currentColor" />
              Publish All
            </Button>
            <Button size="sm" className="gap-1.5">
              <Add size={14} color="currentColor" />
              New Assignment
            </Button>
          </div>
        }
      />
      <main className="flex-1 p-6 space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#111214] border border-white/[0.07] rounded-xl p-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TickCircle size={16} color="#34d399" variant="Bold" />
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-100">{activeCount}</p>
              <p className="text-xs text-zinc-500">Active assignments</p>
            </div>
          </div>
          <div className="bg-[#111214] border border-white/[0.07] rounded-xl p-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <CloseCircle size={16} color="#f87171" variant="Bold" />
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-100">{noShowCount}</p>
              <p className="text-xs text-zinc-500">No-shows flagged</p>
            </div>
          </div>
          <div className="bg-[#111214] border border-white/[0.07] rounded-xl p-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Warning2 size={16} color="#f59e0b" variant="Bold" />
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-100">{completedCount}</p>
              <p className="text-xs text-zinc-500">Completed today</p>
            </div>
          </div>
        </div>

        {/* Dispatch table */}
        <Card>
          <CardHeader className="px-5 py-4 border-b border-white/[0.05]">
            <CardTitle>Today’s Assignments</CardTitle>
          </CardHeader>
          {/* Column headers */}
          <div className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3 text-[11px] font-semibold text-zinc-600 uppercase tracking-wider border-b border-white/[0.04]">
            <span>Driver</span>
            <span>Bus</span>
            <span>Route</span>
            <span>Trips / Dep.</span>
            <span>Status</span>
            <span></span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {dispatchPlans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "grid grid-cols-[2fr_1fr_2fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors",
                  plan.status === "no_show" && "bg-red-500/[0.03]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={plan.driver} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{plan.driver}</p>
                    <p className="text-xs text-zinc-600">{plan.driverCode}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-300">{plan.bus}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-300">{plan.route}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-300">{plan.trips} trips</p>
                  <p className="text-xs text-zinc-600">Dep {plan.departure}</p>
                </div>
                <div>{dispatchStatusBadge(plan.status)}</div>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="sm">Edit</Button>
                  {plan.status === "no_show" && (
                    <Button variant="destructive" size="sm">Replace</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </>
  )
}
