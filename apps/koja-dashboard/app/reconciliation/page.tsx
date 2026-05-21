import { Header } from "@/components/layout/header"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { cn, formatNGN, formatNGNFull } from "@/lib/utils"
import { reconciliationItems } from "@/lib/data"
import { TickCircle, CloseCircle, Timer1, Money } from "iconsax-react"

function statusInfo(status: string) {
  if (status === "match")
    return {
      icon: <TickCircle size={14} color="#34d399" variant="Bold" />,
      badge: <Badge variant="success">Matched</Badge>,
    }
  if (status === "discrepancy")
    return {
      icon: <CloseCircle size={14} color="#f87171" variant="Bold" />,
      badge: <Badge variant="destructive">Discrepancy</Badge>,
    }
  return {
    icon: <Timer1 size={14} color="#f59e0b" variant="Linear" />,
    badge: <Badge variant="default">Pending</Badge>,
  }
}

export default function ReconciliationPage() {
  const discrepancies = reconciliationItems.filter((r) => r.status === "discrepancy")
  const totalDiscrepancy = discrepancies.reduce(
    (sum, r) => sum + Math.abs(r.expectedCash - r.declaredCash),
    0
  )
  const totalRevenue = reconciliationItems.reduce(
    (sum, r) => sum + r.walletEarnings + r.declaredCash,
    0
  )
  const pendingCount = reconciliationItems.filter((r) => r.status === "pending").length

  return (
    <>
      <Header
        title="Cash Reconciliation"
        subtitle="End-of-shift declarations and audit trail"
      />
      <main className="flex-1 p-6 space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#111214] border border-white/[0.07] rounded-xl p-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Money size={18} color="#34d399" variant="Bold" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Total Revenue</p>
              <p className="text-xl font-bold text-zinc-100">{formatNGN(totalRevenue)}</p>
              <p className="text-xs text-zinc-600">Yesterday — all shifts</p>
            </div>
          </div>
          <div className="bg-[#111214] border border-white/[0.07] rounded-xl p-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <CloseCircle size={18} color="#f87171" variant="Bold" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Discrepancy Total</p>
              <p className="text-xl font-bold text-red-400">-{formatNGN(totalDiscrepancy)}</p>
              <p className="text-xs text-zinc-600">{discrepancies.length} unresolved</p>
            </div>
          </div>
          <div className="bg-[#111214] border border-white/[0.07] rounded-xl p-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Timer1 size={18} color="#f59e0b" variant="Linear" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Pending</p>
              <p className="text-xl font-bold text-zinc-100">{pendingCount}</p>
              <p className="text-xs text-zinc-600">Awaiting declaration</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="px-5 py-4 border-b border-white/[0.05]">
            <CardTitle>Shift Declarations</CardTitle>
          </CardHeader>
          {/* Headers */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 text-[11px] font-semibold text-zinc-600 uppercase tracking-wider border-b border-white/[0.04]">
            <span>Driver</span>
            <span>Expected Cash</span>
            <span>Declared Cash</span>
            <span>Wallet</span>
            <span>Status</span>
            <span></span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {reconciliationItems.map((item) => {
              const si = statusInfo(item.status)
              const diff = item.declaredCash - item.expectedCash
              return (
                <div
                  key={item.id}
                  className={cn(
                    "grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors",
                    item.status === "discrepancy" && "bg-red-500/[0.03]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={item.driver} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{item.driver}</p>
                      <p className="text-xs text-zinc-600">
                        {item.bus} · {item.shift}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-300">
                      {item.status === "pending" ? "—" : formatNGNFull(item.expectedCash)}
                    </p>
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        item.status === "discrepancy" ? "text-red-400" : "text-zinc-300"
                      )}
                    >
                      {item.status === "pending" ? "—" : formatNGNFull(item.declaredCash)}
                    </p>
                    {item.status === "discrepancy" && (
                      <p className="text-[11px] text-red-500">
                        {diff < 0
                          ? `${formatNGN(Math.abs(diff))} short`
                          : `${formatNGN(diff)} over`}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300">{formatNGN(item.walletEarnings)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {si.icon}
                    {si.badge}
                  </div>
                  <div>
                    {item.status === "discrepancy" && (
                      <Button variant="destructive" size="sm">Investigate</Button>
                    )}
                    {item.status === "pending" && (
                      <Button variant="outline" size="sm">Prompt</Button>
                    )}
                    {item.status === "match" && (
                      <Button variant="ghost" size="sm" className="text-zinc-600">View</Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </main>
    </>
  )
}
