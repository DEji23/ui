import {
  IconAlertTriangle,
  IconCash,
  IconCloudDataConnection,
  IconReceiptRefund,
  IconRoute,
  IconScale,
  IconShieldCheck,
  IconTicket,
} from "@tabler/icons-react"

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york-v4/ui/card"
import { Badge } from "@/registry/new-york-v4/ui/badge"

import { reconciliation } from "../data"

const operationalKpis = [
  { label: "Tickets Sold Today", value: "142,318", icon: IconTicket, trend: "+4.2%" },
  { label: "Active Trips", value: "3,904", icon: IconRoute, trend: "+1.8%" },
  { label: "Validation Success Rate", value: "98.4%", icon: IconShieldCheck, trend: "+0.3%" },
  { label: "Offline Sync Pending", value: "212 devices", icon: IconCloudDataConnection, trend: "-6.1%" },
]

const financialKpis = [
  { label: "Gross Revenue", value: "₦21.75M equiv.", icon: IconCash, trend: "+3.1%" },
  { label: "Platform Fees", value: "₦1.74M equiv.", icon: IconScale, trend: "+2.6%" },
  { label: "Compliance Costs", value: "₦652.6K equiv.", icon: IconShieldCheck, trend: "+1.2%" },
  { label: "Net Operator Earnings", value: "₦19.36M equiv.", icon: IconCash, trend: "+3.0%" },
  { label: "Refund Volume", value: "₦48.2K equiv.", icon: IconReceiptRefund, trend: "-0.8%" },
  { label: "Failed Payments %", value: "1.6%", icon: IconAlertTriangle, trend: "-0.2%" },
]

function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string
  value: string
  icon: React.ElementType
  trend: string
}) {
  const positive = trend.startsWith("+")
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription className="flex items-center gap-1.5">
          <Icon className="size-4" />
          {label}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[220px]/card:text-3xl">
          {value}
        </CardTitle>
        <CardAction>
          <Badge variant="outline" className={positive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>
            {trend}
          </Badge>
        </CardAction>
      </CardHeader>
    </Card>
  )
}

export function OverviewTab() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Operational Metrics
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {operationalKpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Financial Metrics
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {financialKpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by currency</CardTitle>
          <CardDescription>
            Grouped by operating currency, converted to USD base rate for comparison
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3">
          {reconciliation.map((row) => {
            const share = (row.grossRevenue / reconciliation.reduce((a, b) => a + b.grossRevenue, 0)) * 100
            return (
              <div key={row.currency} className="flex w-full items-center gap-3">
                <Badge variant="secondary" className="w-14 justify-center font-mono">
                  {row.currency}
                </Badge>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${share}%` }}
                  />
                </div>
                <span className="w-32 text-right text-sm tabular-nums text-muted-foreground">
                  {row.grossRevenue.toLocaleString()} {row.currency}
                </span>
              </div>
            )
          })}
        </CardFooter>
      </Card>
    </div>
  )
}
