import { Header } from "@/components/layout/header"
import { StatCards } from "@/components/dashboard/stat-cards"
import { OperationsPanel } from "@/components/dashboard/operations-panel"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { AlertFeed } from "@/components/dashboard/alert-feed"
import { ActiveTrips } from "@/components/dashboard/active-trips"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { FleetMap } from "@/components/dashboard/fleet-map"

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Operations Overview"
        subtitle="Sunday, 25 May 2026 — 09:17 AM"
      />
      <main className="flex-1 p-6 space-y-6">
        {/* Zone 1: KPI Cards */}
        <StatCards />

        {/* Zone 2: Today's Operations Panel */}
        <OperationsPanel />

        {/* Zone 3: Revenue + Trips | Quick Actions + Alerts */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <RevenueChart />
            <ActiveTrips />
          </div>
          <div className="col-span-1 space-y-6">
            <QuickActions />
            <AlertFeed />
          </div>
        </div>

        {/* Zone 4: Live Fleet Map */}
        <FleetMap />
      </main>
    </>
  )
}
