"use client"
import { useState, useRef } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog } from "@/components/ui/dialog"
import { ToastContainer, type Toast } from "@/components/ui/toast"
import { reconciliationItems as initial, type ReconciliationItem, type ReconciliationStatus } from "@/lib/data"
import { formatNGNFull, formatDate } from "@/lib/utils"

type DialogMode = "investigate" | "view" | null

const statusBadge: Record<ReconciliationStatus, "green" | "red" | "yellow"> = {
  match: "green", discrepancy: "red", pending: "yellow",
}

export default function ReconciliationPage() {
  const [items, setItems] = useState<ReconciliationItem[]>(initial)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [target, setTarget] = useState<ReconciliationItem | null>(null)
  const [resolution, setResolution] = useState("")
  const [notes, setNotes] = useState("")
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  const toast = (message: string, type: Toast["type"] = "success") => {
    const id = ++counterRef.current
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }

  const handleResolve = () => {
    if (!target || !resolution) return
    const newStatus: ReconciliationStatus =
      resolution === "accept" ? "match" : resolution === "flag" ? "discrepancy" : "pending"
    setItems((i) => i.map((x) => x.id === target.id ? { ...x, status: newStatus, notes } : x))
    toast(resolution === "accept" ? "Entry accepted" : resolution === "flag" ? "Flagged for audit" : "Sent for resubmission")
    setDialogMode(null)
    setResolution("")
    setNotes("")
  }

  const handlePrompt = (item: ReconciliationItem) => {
    toast(`Prompt sent to ${item.driver.split(" ")[0]}`, "info")
  }

  const summary = {
    total: items.length,
    match: items.filter((i) => i.status === "match").length,
    discrepancy: items.filter((i) => i.status === "discrepancy").length,
    totalExpected: items.reduce((s, i) => s + i.expectedRevenue, 0),
    totalDeclared: items.reduce((s, i) => s + i.declaredRevenue, 0),
  }

  return (
    <div className="pt-14">
      <Header
        title="Reconciliation"
        subtitle={`${summary.match} matched · ${summary.discrepancy} discrepancies`}
        actions={
          <Button variant="secondary" size="sm" onClick={() => toast("CSV exported", "info")}>
            Export CSV
          </Button>
        }
      />

      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Expected", value: formatNGNFull(summary.totalExpected), color: "text-white" },
            { label: "Total Declared", value: formatNGNFull(summary.totalDeclared), color: "text-white" },
            { label: "Net Variance", value: formatNGNFull(summary.totalExpected - summary.totalDeclared), color: summary.totalExpected > summary.totalDeclared ? "text-red-400" : "text-emerald-400" },
            { label: "Match Rate", value: `${Math.round((summary.match / summary.total) * 100)}%`, color: "text-amber-400" },
          ].map((s) => (
            <div key={s.label} className="bg-[#141518] border border-white/6 rounded-xl p-4">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#141518] border border-white/6 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_100px_110px_110px_100px_140px] text-[10px] font-semibold text-white/30 uppercase tracking-wider px-5 py-3 border-b border-white/6">
            <span>Driver</span><span>Route</span><span>Date</span><span>Expected</span><span>Declared</span><span>Status</span><span>Actions</span>
          </div>
          {items.map((item) => {
            const shortfall = item.expectedRevenue - item.declaredRevenue
            return (
              <div key={item.id} className="grid grid-cols-[1fr_1fr_100px_110px_110px_100px_140px] px-5 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/2 items-center">
                <div>
                  <div className="text-sm font-medium text-white/90">{item.driver.split(" ")[0]}</div>
                  <div className="text-[10px] text-white/30">{item.bus}</div>
                </div>
                <span className="text-sm text-white/60">{item.route}</span>
                <span className="text-xs text-white/50">{formatDate(item.date)}</span>
                <span className="text-sm text-white/70">{formatNGNFull(item.expectedRevenue)}</span>
                <span className={`text-sm font-medium ${item.status === "discrepancy" ? "text-red-400" : "text-white/70"}`}>
                  {formatNGNFull(item.declaredRevenue)}
                </span>
                <Badge variant={statusBadge[item.status]} className="text-[9px] w-fit">{item.status}</Badge>
                <div className="flex gap-1.5">
                  {item.status === "discrepancy" ? (
                    <>
                      <button
                        onClick={() => { setTarget(item); setResolution(""); setNotes(""); setDialogMode("investigate") }}
                        className="text-[10px] text-amber-400/70 hover:text-amber-400 px-1.5 py-1 rounded hover:bg-amber-500/8"
                      >
                        Investigate
                      </button>
                      <button
                        onClick={() => handlePrompt(item)}
                        className="text-[10px] text-white/40 hover:text-white/70 px-1.5 py-1 rounded hover:bg-white/5"
                      >
                        Prompt
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setTarget(item); setDialogMode("view") }}
                      className="text-[10px] text-white/40 hover:text-white/70 px-1.5 py-1 rounded hover:bg-white/5"
                    >
                      View
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Investigate Dialog */}
      <Dialog open={dialogMode === "investigate"} onClose={() => setDialogMode(null)} title="Investigate Discrepancy" description={target ? `${target.driver} · ${target.route}` : ""} className="max-w-lg">
        {target && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Expected", value: formatNGNFull(target.expectedRevenue), color: "text-white" },
                { label: "Declared", value: formatNGNFull(target.declaredRevenue), color: "text-red-400" },
                { label: "Shortfall", value: formatNGNFull(target.expectedRevenue - target.declaredRevenue), color: "text-red-400" },
              ].map((s) => (
                <div key={s.label} className="bg-white/4 rounded-lg p-3 text-center">
                  <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            {target.notes && <div className="bg-red-500/8 border border-red-500/15 rounded-lg p-3 text-xs text-red-300">{target.notes}</div>}
            <Select label="Resolution" value={resolution} onChange={(e) => setResolution(e.target.value)}>
              <option value="">— Select action —</option>
              <option value="accept">Accept as declared (write off shortfall)</option>
              <option value="flag">Flag for audit</option>
              <option value="resubmit">Send back for resubmission</option>
            </Select>
            <Textarea label="Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add investigation notes..." />
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setDialogMode(null)}>Cancel</Button>
              <Button variant="primary" className="flex-1" onClick={handleResolve} disabled={!resolution}>Apply Resolution</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* View Dialog */}
      <Dialog open={dialogMode === "view"} onClose={() => setDialogMode(null)} title="Reconciliation Record" description={target ? `${target.driver} · ${target.route}` : ""}>
        {target && (
          <div className="space-y-3">
            {[
              { label: "Date", value: formatDate(target.date) },
              { label: "Trips Completed", value: target.trips },
              { label: "Expected Revenue", value: formatNGNFull(target.expectedRevenue) },
              { label: "Declared Revenue", value: formatNGNFull(target.declaredRevenue) },
              { label: "Status", value: target.status },
            ].map((f) => (
              <div key={f.label} className="flex justify-between text-sm py-1.5 border-b border-white/6 last:border-0">
                <span className="text-white/40">{f.label}</span>
                <span className="text-white/80">{f.value}</span>
              </div>
            ))}
            <Button variant="ghost" className="w-full mt-2" onClick={() => setDialogMode(null)}>Close</Button>
          </div>
        )}
      </Dialog>

      <ToastContainer toasts={toasts} />
    </div>
  )
}
