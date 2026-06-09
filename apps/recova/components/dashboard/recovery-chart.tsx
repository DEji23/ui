"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { recoveryChartData, railDistributionData } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrencyCompact } from "@/lib/utils"

const RAIL_COLORS = ["#6366f1", "#8b5cf6", "#ec4899"]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2.5 shadow-lg text-sm">
      <p className="font-medium text-foreground mb-1.5">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-muted-foreground capitalize">{entry.name}:</span>
          <span className="font-medium text-foreground">{formatCurrencyCompact(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-foreground">{name}</p>
      <p className="text-muted-foreground text-xs">{value}% of collections</p>
    </div>
  )
}

export function RecoveryChart() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">7-Day Recovery Performance</CardTitle>
        <p className="text-xs text-muted-foreground">Daily breakdown by outcome</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={recoveryChartData} barSize={14} barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatCurrencyCompact(v)}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", radius: 4 }} />
            <Bar dataKey="success" name="success" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="partial" name="partial" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            <Bar dataKey="failed" name="failed" fill="#ef4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-3 flex items-center gap-5">
          {[
            { label: "Successful", color: "#10b981" },
            { label: "Partial", color: "#f59e0b" },
            { label: "Failed", color: "#ef4444" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function RailDistributionChart() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Recovery Rail Distribution</CardTitle>
        <p className="text-xs text-muted-foreground">Active collection channels</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={railDistributionData}
                innerRadius={44}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {railDistributionData.map((_, i) => (
                  <Cell key={i} fill={RAIL_COLORS[i % RAIL_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex-1 space-y-3">
            {railDistributionData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: RAIL_COLORS[i % RAIL_COLORS.length] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-foreground truncate">{item.name}</span>
                    <span className="text-xs font-semibold text-foreground">{item.value}%</span>
                  </div>
                  <div className="mt-1 h-1 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.value}%`, background: RAIL_COLORS[i % RAIL_COLORS.length] }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
