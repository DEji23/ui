"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { naira, nairaShort } from "@/lib/format"
import {
  RAIL_DISTRIBUTION,
  WEEKLY_PERFORMANCE,
  type DailyRecovery,
} from "@/lib/data/operations"

/** Series colours match the Figma legend: green / amber / red. */
const SERIES = [
  { key: "successful", label: "Successful", color: "#17b26a" },
  { key: "partial", label: "Partial", color: "#fdb022" },
  { key: "failed", label: "Failed", color: "#f04438" },
] as const

function PerformanceTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: DailyRecovery }>
}) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  const total = row.successful + row.partial + row.failed

  return (
    <div className="rounded-[var(--radius-control)] bg-white p-4 shadow-[var(--shadow-panel)]">
      <p className="text-sm font-semibold text-ink">{row.date}</p>
      <p className="tabular mb-2 text-sm font-bold text-ink-header">{naira(total)}</p>
      <div className="flex flex-col gap-1">
        {SERIES.map((s) => (
          <div key={s.key} className="flex items-center gap-2 text-xs">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-body">{s.label}:</span>
            <span className="tabular font-semibold text-ink">
              {nairaShort(row[s.key])}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RecoveryPerformanceChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={WEEKLY_PERFORMANCE} barGap={2} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke="#eaecf0" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6a7282", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={64}
            tick={{ fill: "#6a7282", fontSize: 12 }}
            tickFormatter={(v: number) => nairaShort(v)}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,108,73,0.04)" }}
            content={<PerformanceTooltip />}
          />
          {SERIES.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              fill={s.color}
              radius={[4, 4, 0, 0]}
              maxBarSize={14}
              // Static data: the mount animation only causes a flash of an
              // empty chart on every navigation.
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ChartLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {SERIES.map((s) => (
        <span key={s.key} className="flex items-center gap-2 text-xs text-body">
          <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
          {s.label}
        </span>
      ))}
    </div>
  )
}

export function RailDistributionChart() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={RAIL_DISTRIBUTION}
              dataKey="share"
              nameKey="label"
              innerRadius={68}
              outerRadius={104}
              paddingAngle={1}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {RAIL_DISTRIBUTION.map((entry) => (
                <Cell key={entry.rail} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full rounded-[var(--radius-control)] border border-stroke p-4">
        <div className="flex flex-col gap-4">
          {RAIL_DISTRIBUTION.map((entry) => (
            <div key={entry.rail} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-6 text-sm">
                <span className="flex items-center gap-2 text-body">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.label}
                </span>
                <span className="tabular font-semibold text-ink">{entry.share}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${entry.share}%`, backgroundColor: entry.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
