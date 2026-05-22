"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Dialog } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { cn, formatNGN, formatNGNFull } from "@/lib/utils"
import { reconciliationItems as initial, type ReconciliationItem } from "@/lib/data"
import { TickCircle, CloseCircle, Timer1, Money, Warning2 } from "iconsax-react"

type Toast = { id: number; message: string; type: "success" | "error" | "info" }
type DialogMode = "investigate" | "view" | "prompt" | null

function statusInfo(status: string) {
  if (status === "match") return { icon: <TickCircle size={14} color="#34d399" variant="Bold" />, badge: <Badge variant="success">Matched</Badge> }
  if (status === "discrepancy") return { icon: <CloseCircle size={14} color="#f87171" variant="Bold" />, badge: <Badge variant="destructive">Discrepancy</Badge> }
  return { icon: <Timer1 size={14} color="#f59e0b" variant="Linear" />, badge: <Badge variant="default">Pending</Badge> }
}

export default function ReconciliationPage() {
  const [items, setItems] = useState<ReconciliationItem[]>(initial)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [target, setTarget] = useState<ReconciliationItem | null>(null)
  const [resolution, setResolution] = useState("")
  const [notes, setNotes] = useState("")
  const [toasts, setToasts] = useState<Toast[]>([])

  function addToast(message: string, type: Toast["type"] = "success") {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }

  function openInvestigate(item: ReconciliationItem) {
    setTarget(item); setResolution(""); setNotes("")
    setDialogMode("investigate")
  }

  function openView(item: ReconciliationItem) {
    setTarget(item)
    setDialogMode("view")
  }

  function handlePrompt(item: ReconciliationItem) {
    addToast(`Prompt sent to ${item.driver}`, "info")
  }

  function handleResolve() {
    if (!target || !resolution) return
    const newStatus: ReconciliationItem["status"] =
      resolution === "accept" ? "match" :
      resolution === "flag" ? "discrepancy" : "pending"
    setItems((list) =>
      list.map((x) =>
        x.id === target.id
          ? { ...x, status: newStatus, discrepancyReason: resolution === "flag" ? "Flagged for review" : x.discrepancyReason }
          : x
      )
    )
    const msg =
      resolution === "accept" ? `Declaration accepted for ${target.driver}` :
      resolution === "flag" ? `${target.driver} flagged — compliance notified` :
      `Resubmission requested from ${target.driver}`
    addToast(msg, resolution === "flag" ? "error" : "success")
    setDialogMode(null)
  }

  const discrepancies = items.filter((r) => r.status === "discrepancy")
  const totalDiscrepancy = discrepancies.reduce((sum, r) => sum + Math.abs(r.expectedCash - r.declaredCash), 0)
  const totalRevenue = items.reduce((sum, r) => sum + r.walletEarnings + r.declaredCash, 0)
  const pendingCount = items.filter((r) => r.status === "pending").length

  return (
    <>
      <Header title="Cash Reconciliation" subtitle="End-of-shift declarations and audit trail" />
      <main className="flex-1 p-6 space-y-5">
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

        <Card>
          <CardHeader className="px-5 py-4 border-b border-white/[0.05]">
            <CardTitle>Shift Declarations</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 text-[11px] font-semibold text-zinc-600 uppercase tracking-wider border-b border-white/[0.04]">
            <span>Driver</span><span>Expected Cash</span><span>Declared Cash</span><span>Wallet</span><span>Status</span><span></span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {items.map((item) => {
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
                      <p className="text-xs text-zinc-600">{item.bus} · {item.shift}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-zinc-300">
                    {item.status === "pending" ? "—" : formatNGNFull(item.expectedCash)}
                  </p>
                  <div>
                    <p className={cn("text-sm font-medium", item.status === "discrepancy" ? "text-red-400" : "text-zinc-300")}>
                      {item.status === "pending" ? "—" : formatNGNFull(item.declaredCash)}
                    </p>
                    {item.status === "discrepancy" && (
                      <p className="text-[11px] text-red-500">{diff < 0 ? `${formatNGN(Math.abs(diff))} short` : `${formatNGN(diff)} over`}</p>
                    )}
                  </div>
                  <p className="text-sm text-zinc-300">{formatNGN(item.walletEarnings)}</p>
                  <div className="flex items-center gap-1.5">{si.icon}{si.badge}</div>
                  <div>
                    {item.status === "discrepancy" && (
                      <Button variant="destructive" size="sm" onClick={() => openInvestigate(item)}>Investigate</Button>
                    )}
                    {item.status === "pending" && (
                      <Button variant="outline" size="sm" onClick={() => handlePrompt(item)}>Prompt</Button>
                    )}
                    {item.status === "match" && (
                      <Button variant="ghost" size="sm" className="text-zinc-600" onClick={() => openView(item)}>View</Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </main>

      {/* Investigate dialog */}
      <Dialog
        open={dialogMode === "investigate"}
        onClose={() => setDialogMode(null)}
        title="Investigate Discrepancy"
        className="max-w-lg"
      >
        {target && (
          <div className="space-y-4">
            <div className="rounded-xl bg-red-500/[0.06] border border-red-500/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Avatar name={target.driver} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{target.driver}</p>
                  <p className="text-xs text-zinc-500">{target.bus} · {target.shift} shift</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Expected</p>
                  <p className="text-sm font-bold text-zinc-200">{formatNGNFull(target.expectedCash)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Declared</p>
                  <p className="text-sm font-bold text-red-400">{formatNGNFull(target.declaredCash)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Shortfall</p>
                  <p className="text-sm font-bold text-red-400">{formatNGN(Math.abs(target.declaredCash - target.expectedCash))}</p>
                </div>
              </div>
              {target.discrepancyReason && (
                <div className="flex items-start gap-2 pt-1">
                  <Warning2 size={14} color="#fbbf24" variant="Bold" className="mt-0.5 shrink-0" />
                  <p className="text-xs text-zinc-400">{target.discrepancyReason}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Resolution</label>
              <Select value={resolution} onChange={(e) => setResolution(e.target.value)}>
                <option value="">Select action…</option>
                <option value="accept">Accept declaration — waive shortfall</option>
                <option value="flag">Flag driver — notify compliance</option>
                <option value="resubmit">Request resubmission from driver</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Investigator notes</label>
              <Textarea placeholder="Document your findings…" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setDialogMode(null)}>Cancel</Button>
              <Button
                size="sm"
                variant={resolution === "flag" ? "destructive" : "default"}
                onClick={handleResolve}
                disabled={!resolution}
              >
                {resolution === "accept" ? "Accept & Close" : resolution === "flag" ? "Flag Driver" : "Request Resubmission"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* View matched record dialog */}
      <Dialog
        open={dialogMode === "view"}
        onClose={() => setDialogMode(null)}
        title="Shift Record"
        className="max-w-md"
      >
        {target && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={target.driver} size="md" />
              <div>
                <p className="text-sm font-semibold text-zinc-100">{target.driver}</p>
                <p className="text-xs text-zinc-500">{target.bus} · {target.shift} shift · {target.timestamp}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              {[
                { label: "Expected Cash", value: formatNGNFull(target.expectedCash), color: "text-zinc-300" },
                { label: "Declared Cash", value: formatNGNFull(target.declaredCash), color: "text-emerald-400" },
                { label: "Wallet Earnings", value: formatNGNFull(target.walletEarnings), color: "text-zinc-300" },
                { label: "Total", value: formatNGNFull(target.declaredCash + target.walletEarnings), color: "text-zinc-100" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-xs text-zinc-500">{row.label}</span>
                  <span className={cn("text-sm font-semibold", row.color)}>{row.value}</span>
                </div>
              ))}
            </div>
            <div className="pt-1">
              <Button size="sm" variant="outline" className="w-full" onClick={() => setDialogMode(null)}>Close</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "px-4 py-3 rounded-xl text-sm font-medium shadow-xl border backdrop-blur-sm",
              t.type === "success" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
              t.type === "error" && "bg-red-500/10 border-red-500/20 text-red-300",
              t.type === "info" && "bg-blue-500/10 border-blue-500/20 text-blue-300"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </>
  )
}
