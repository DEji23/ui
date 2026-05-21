import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar } from "@/components/ui/avatar"
import { cn, formatNGN } from "@/lib/utils"
import { activeTrips } from "@/lib/data"

function statusBadge(status: string) {
  if (status === "en_route") return <Badge variant="success">En Route</Badge>
  if (status === "boarding") return <Badge variant="default">Boarding</Badge>
  if (status === "completed") return <Badge variant="muted">Completed</Badge>
  return <Badge variant="muted">{status}</Badge>
}

export function ActiveTrips() {
  const liveCount = activeTrips.filter((t) => t.status !== "completed").length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Trips</CardTitle>
          <span className="text-xs text-zinc-500">{liveCount} live</span>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="divide-y divide-white/[0.05]">
          {activeTrips.map((trip) => {
            const fill = (trip.passengers / trip.capacity) * 100
            return (
              <div
                key={trip.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                <Avatar name={trip.driver} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-zinc-200 truncate">{trip.driver}</p>
                    <span className="text-zinc-700">·</span>
                    <span className="text-xs text-zinc-500">{trip.bus}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{trip.route}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Progress
                      value={fill}
                      colorClass={fill > 80 ? "bg-emerald-500" : "bg-amber-500"}
                      className="w-20 h-1"
                    />
                    <span className="text-[11px] text-zinc-600">
                      {trip.passengers}/{trip.capacity}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="mb-1">{statusBadge(trip.status)}</div>
                  <p className="text-xs text-zinc-500">{formatNGN(trip.revenue)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
