import {
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Banknote,
  Activity,
  ArrowRight,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { KPICard } from "@/components/dashboard/kpi-card"
import { RecoveryChart, RailDistributionChart } from "@/components/dashboard/recovery-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoanStateBadge } from "@/components/recovery/loan-state-badge"
import { dashboardKPIs, loans, auditEvents } from "@/lib/mock-data"
import { formatCurrency, formatCurrencyCompact, formatRelativeTime } from "@/lib/utils"
import Link from "next/link"

export default function DashboardPage() {
  const criticalLoans = loans.filter(l =>
    l.state === "AT_RISK" || l.state === "LEGAL_REVIEW" || l.state === "DISPUTE_OPEN"
  ).slice(0, 5)

  return (
    <div className="flex flex-col">
      <Header
        title="Dashboard"
        description="Overview of loan recovery operations"
        showSearch={false}
      />

      <div className="flex-1 p-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Recovery Rate"
            value={`${dashboardKPIs.recoveryRate}%`}
            change={2.1}
            changeLabel="vs last month"
            icon={<TrendingUp className="h-5 w-5" />}
            iconColor="text-primary"
            variant="default"
          />
          <KPICard
            title="Loans in Recovery"
            value={dashboardKPIs.loansInRecovery.toLocaleString()}
            change={-3.4}
            changeLabel="vs last month"
            icon={<Users className="h-5 w-5" />}
            iconColor="text-amber-500"
            variant="warning"
          />
          <KPICard
            title="Collected (MTD)"
            value={formatCurrencyCompact(dashboardKPIs.collectedMTD)}
            change={8.7}
            changeLabel="vs last MTD"
            icon={<Banknote className="h-5 w-5" />}
            iconColor="text-emerald-500"
            variant="success"
          />
          <KPICard
            title="Outstanding"
            value={formatCurrencyCompact(dashboardKPIs.outstanding)}
            change={-1.2}
            changeLabel="vs last month"
            icon={<AlertTriangle className="h-5 w-5" />}
            iconColor="text-red-500"
            variant="destructive"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Active Mandates"
            value={dashboardKPIs.activeMandates.toLocaleString()}
            description="NDD + Remita live"
            icon={<CheckCircle2 className="h-5 w-5" />}
            iconColor="text-primary"
          />
          <KPICard
            title="Open Disputes"
            value={dashboardKPIs.openDisputes.toString()}
            change={-2}
            changeLabel="vs yesterday"
            icon={<AlertTriangle className="h-5 w-5" />}
            iconColor="text-amber-500"
            variant="warning"
          />
          <KPICard
            title="SLA Breaches"
            value={dashboardKPIs.slaBreaches.toString()}
            change={1}
            changeLabel="new today"
            icon={<Clock className="h-5 w-5" />}
            iconColor="text-red-500"
            variant="destructive"
          />
          <KPICard
            title="Pending Approvals"
            value={dashboardKPIs.pendingApprovals.toString()}
            description="Maker-checker queue"
            icon={<Activity className="h-5 w-5" />}
            iconColor="text-primary"
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RecoveryChart />
          </div>
          <RailDistributionChart />
        </div>

        {/* Bottom row */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Critical Cases */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-semibold">Critical Cases</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Requiring immediate attention</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/recovery-queue" className="text-xs gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {criticalLoans.map(loan => (
                  <div key={loan.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{loan.borrower}</p>
                        <LoanStateBadge state={loan.state} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {loan.loanId} · {formatCurrency(loan.outstanding)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-foreground">{loan.dro}</p>
                      <p className="text-xs text-muted-foreground">{loan.dpd} DPD</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">System audit log</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/audit" className="text-xs gap-1">
                  Full log <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {auditEvents.slice(0, 5).map(event => (
                  <div key={event.id} className="flex items-start gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug truncate">{event.action}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-muted-foreground">{event.actor}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(event.timestamp)}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{event.module}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
