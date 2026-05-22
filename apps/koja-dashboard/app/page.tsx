import { Header } from "@/components/layout/header"
import { StatCards } from "@/components/dashboard/stat-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { AlertFeed } from "@/components/dashboard/alert-feed"
import { ActiveTrips } from "@/components/dashboard/active-trips"

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Operations Overview"
        subtitle="Wednesday, 21 May 2026 — 09:17 AM"
      />
      <main className="flex-1 p-6 space-y-6">
        <StatCards />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <RevenueChart />
            <ActiveTrips />
          </div>
          <div className="col-span-1">
            <AlertFeed />
          </div>
        </div>
      </main>
    </>
  )
}
