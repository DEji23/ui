"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ledgerKPIs,
  ledgerEntries,
  reconciliationRecords,
  type LedgerEntryType,
  type LedgerEntryStatus,
  type ReconciliationMatchType,
} from "@/lib/mock-data"
import { ArrowRight, TickCircle, CloseCircle, Warning2, InfoCircle } from "iconsax-react"

const fmt = (n: number) =>
  n >= 1_000_000_000
    ? `₦${(n / 1_000_000_000).toFixed(2)}B`
    : n >= 1_000_000
    ? `₦${(n / 1_000_000).toFixed(1)}M`
    : `₦${n.toLocaleString()}`

const ENTRY_TYPE: Record<LedgerEntryType, { label: string; className: string }> = {
  DEBIT:    { label: "Debit",    className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  REVERSAL: { label: "Reversal", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  REFUND:   { label: "Refund",   className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
}

const ENTRY_STATUS: Record<LedgerEntryStatus, { label: string; className: string }> = {
  PENDING:     { label: "Pending",     className: "bg-muted text-muted-foreground border-border" },
  PROVISIONAL: { label: "Provisional", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  FINALIZED:   { label: "Finalized",   className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  REVERSED:    { label: "Reversed",    className: "bg-red-500/10 text-red-600 border-red-500/20" },
  REFUNDED:    { label: "Refunded",    className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
}

const MATCH_CONFIG: Record<ReconciliationMatchType, { label: string; className: string; Icon: React.ElementType }> = {
  MATCHED:   { label: "Matched",   className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", Icon: TickCircle },
  MISSING:   { label: "Missing",   className: "bg-amber-500/10 text-amber-600 border-amber-500/20",   Icon: Warning2 },
  DUPLICATE: { label: "Duplicate", className: "bg-red-500/10 text-red-600 border-red-500/20",         Icon: CloseCircle },
  REVERSED:  { label: "Reversed",  className: "bg-orange-500/10 text-orange-600 border-orange-500/20", Icon: Warning2 },
}

const LIFECYCLE = [
  { key: "PENDING",     label: "Pending",     trigger: "INITIATE" },
  { key: "PROVISIONAL", label: "Provisional", trigger: "BANK ACK" },
  { key: "FINALIZED",   label: "Finalized",   trigger: "SETTLEMENT" },
]

const LIFECYCLE_BRANCHES = [
  { label: "Reversed", trigger: "REVERSAL", className: "text-red-600 border-red-500/30 bg-red-500/5" },
  { label: "Refunded", trigger: "REFUND",   className: "text-purple-600 border-purple-500/30 bg-purple-500/5" },
]

const EDGE_CASES = [
  {
    title: "Bank success but webhook fails",
    description: "Bank settles the transaction but the webhook is never received. Internal entry stays PROVISIONAL indefinitely.",
    matchType: "MISSING" as ReconciliationMatchType,
    example: "TXN-2025052402 — NDD settled ₦487,500 for Emeka Okafor but webhook not received.",
    resolution: "Manual reconciliation via daily bank report. Flag entry for review.",
  },
  {
    title: "Duplicate settlement",
    description: "Bank sends duplicate debit for the same transaction. Detected via transaction_id + timestamp window matching.",
    matchType: "DUPLICATE" as ReconciliationMatchType,
    example: "TXN-2025052401-DUP — NDD debited ₦800,000 for Aisha Mohammed twice within 4 minutes.",
    resolution: "Create reversal entry for the duplicate debit and notify the bank.",
  },
  {
    title: "Partial settlement mismatch",
    description: "Bank settles an amount different from the expected debit. Triggers AMOUNT_MISMATCH in the reconciliation engine.",
    matchType: "MISSING" as ReconciliationMatchType,
    example: "RCN-008 — EasyPay report shows ₦180,000 credit for LN-55247 with no matching internal entry.",
    resolution: "Investigate partial payment logic; update outstanding loan balance accordingly.",
  },
  {
    title: "Reversal after finalized settlement",
    description: "Bank reverses a previously finalized settlement, typically due to dispute resolution or mandate challenge.",
    matchType: "REVERSED" as ReconciliationMatchType,
    example: "TXN-2025052001 — ₦800,000 reversed for Aisha Mohammed after mandate dispute DSP-001.",
    resolution: "Create reversal entry linked to original (LED-006). Update loan receivable balance.",
  },
]

export default function LedgerPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div>
          <h1 className="text-base font-semibold text-foreground">Ledger &amp; Reconciliation</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Double-entry · Immutable · Event-sourced</p>
        </div>
        <span className="rounded border px-2 py-0.5 text-[10px] font-bold text-foreground border-border bg-muted">NGN</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* KPI Bar */}
        <div className="grid grid-cols-4 gap-3 p-4 border-b border-border">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Reconciliation Accuracy</p>
            <p className={cn("mt-1 text-2xl font-bold tabular-nums", ledgerKPIs.reconciliationAccuracy >= 99.9 ? "text-emerald-600" : "text-amber-600")}>
              {ledgerKPIs.reconciliationAccuracy}%
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">Target ≥ 99.9%</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Unmatched Rate</p>
            <p className={cn("mt-1 text-2xl font-bold tabular-nums", ledgerKPIs.unmatchedRate <= 0.1 ? "text-emerald-600" : "text-red-600")}>
              {ledgerKPIs.unmatchedRate}%
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">Target ≤ 0.1%</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Pending Entries</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-amber-600">{ledgerKPIs.pendingEntries}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Awaiting bank confirmation</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Volume MTD</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{fmt(ledgerKPIs.totalVolumeMTD)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{ledgerKPIs.totalEntriesToday.toLocaleString()} entries today</p>
          </div>
        </div>

        {/* Transaction Lifecycle */}
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Transaction Lifecycle</p>
          <div className="flex items-center gap-2 flex-wrap">
            {LIFECYCLE.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5">
                  <span className="text-[9px] font-bold uppercase text-emerald-700/60">{s.trigger}</span>
                  <ArrowRight size={11} className="text-emerald-600/50" />
                  <span className="text-xs font-semibold text-emerald-700">{s.label}</span>
                </div>
                {i < LIFECYCLE.length - 1 && <ArrowRight size={13} className="shrink-0 text-muted-foreground" />}
              </div>
            ))}
            <span className="text-muted-foreground mx-1">→</span>
            <div className="flex flex-col gap-1">
              {LIFECYCLE_BRANCHES.map((b) => (
                <div key={b.label} className={cn("flex items-center gap-1.5 rounded border border-dashed px-2 py-1", b.className)}>
                  <span className="text-[9px] font-bold uppercase opacity-60">{b.trigger}</span>
                  <ArrowRight size={10} className="opacity-50" />
                  <span className="text-[11px] font-semibold">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-5 divide-x divide-border border-b border-border">
          {([
            { label: "Entries Today",    value: ledgerKPIs.totalEntriesToday.toLocaleString(), color: "" },
            { label: "Matched",          value: ledgerKPIs.matchedToday.toLocaleString(),       color: "text-emerald-600" },
            { label: "Unmatched",        value: ledgerKPIs.unmatchedToday.toString(),           color: "text-amber-600" },
            { label: "Duplicates Found", value: ledgerKPIs.duplicatesFound.toString(),          color: "text-red-600" },
            { label: "Pending",          value: ledgerKPIs.pendingEntries.toString(),           color: "text-amber-600" },
          ] as const).map((s) => (
            <div key={s.label} className="flex flex-col items-center py-3 gap-0.5">
              <span className={cn("text-lg font-bold tabular-nums", s.color || "text-foreground")}>{s.value}</span>
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="p-4">
          <Tabs defaultValue="ledger">
            <TabsList className="mb-4">
              <TabsTrigger value="ledger">Ledger Entries</TabsTrigger>
              <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
              <TabsTrigger value="edge-cases">Edge Cases</TabsTrigger>
            </TabsList>

            {/* Ledger Entries Tab */}
            <TabsContent value="ledger">
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {["Entry ID", "Loan / Borrower", "Type", "Status", "Amount (NGN)", "Dr Account", "Cr Account", "Rail", "Ref. Entry", "Created"].map((h) => (
                        <th key={h} className={cn("px-3 py-2 font-semibold text-muted-foreground", h === "Amount (NGN)" ? "text-right" : "text-left")}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerEntries.map((e, i) => (
                      <tr key={e.entryId} className={cn("border-b border-border last:border-0 hover:bg-muted/20", i % 2 ? "bg-muted/10" : "")}>
                        <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{e.entryId}</td>
                        <td className="px-3 py-2">
                          <p className="font-medium text-foreground">{e.loanId}</p>
                          <p className="text-[10px] text-muted-foreground">{e.borrower}</p>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={cn("text-[10px]", ENTRY_TYPE[e.type].className)}>{ENTRY_TYPE[e.type].label}</Badge>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={cn("text-[10px]", ENTRY_STATUS[e.status].className)}>{ENTRY_STATUS[e.status].label}</Badge>
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-semibold tabular-nums">{fmt(e.amount)}</td>
                        <td className="px-3 py-2 text-[11px] text-muted-foreground">{e.debitAccount}</td>
                        <td className="px-3 py-2 text-[11px] text-muted-foreground">{e.creditAccount}</td>
                        <td className="px-3 py-2">
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-medium">{e.rail}</span>
                        </td>
                        <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{e.referenceEntryId ?? "—"}</td>
                        <td className="px-3 py-2 text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(e.createdAt).toLocaleString("en-NG", { dateStyle: "short", timeStyle: "short" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Reconciliation Tab */}
            <TabsContent value="reconciliation">
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {["Match", "Transaction ID", "Loan / Borrower", "Source", "Internal Amt", "Bank Amt", "Internal Entry", "Notes"].map((h) => (
                        <th key={h} className={cn("px-3 py-2 font-semibold text-muted-foreground", (h === "Internal Amt" || h === "Bank Amt") ? "text-right" : "text-left")}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reconciliationRecords.map((r, i) => {
                      const cfg = MATCH_CONFIG[r.matchType]
                      const MatchIcon = cfg.Icon
                      const mismatch = r.internalAmount !== null && r.bankAmount !== null && r.internalAmount !== r.bankAmount
                      return (
                        <tr key={r.id} className={cn("border-b border-border last:border-0 hover:bg-muted/20", i % 2 ? "bg-muted/10" : "")}>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              <MatchIcon size={13} className={cfg.className.split(" ").find(c => c.startsWith("text-")) ?? "text-muted-foreground"} />
                              <Badge variant="outline" className={cn("text-[10px]", cfg.className)}>{cfg.label}</Badge>
                            </div>
                          </td>
                          <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{r.transactionId}</td>
                          <td className="px-3 py-2">
                            <p className="font-medium text-foreground">{r.loanId}</p>
                            <p className="text-[10px] text-muted-foreground">{r.borrower}</p>
                          </td>
                          <td className="px-3 py-2">
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-medium">{r.source}</span>
                          </td>
                          <td className={cn("px-3 py-2 text-right font-mono font-semibold tabular-nums", mismatch ? "text-red-600" : "")}>
                            {r.internalAmount !== null ? fmt(r.internalAmount) : "—"}
                          </td>
                          <td className={cn("px-3 py-2 text-right font-mono font-semibold tabular-nums", mismatch ? "text-red-600" : "")}>
                            {r.bankAmount !== null ? fmt(r.bankAmount) : "—"}
                          </td>
                          <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{r.internalEntryId ?? "—"}</td>
                          <td className="px-3 py-2 max-w-xs">
                            <p className="text-[10px] text-muted-foreground line-clamp-2">{r.notes ?? "—"}</p>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Edge Cases Tab */}
            <TabsContent value="edge-cases">
              <div className="grid grid-cols-2 gap-3">
                {EDGE_CASES.map((ec) => {
                  const cfg = MATCH_CONFIG[ec.matchType]
                  const EcIcon = cfg.Icon
                  return (
                    <div key={ec.title} className="rounded-lg border border-border p-4 space-y-2.5">
                      <div className="flex items-start gap-2">
                        <EcIcon size={15} className={cn("shrink-0 mt-0.5", cfg.className.split(" ").find(c => c.startsWith("text-")) ?? "")} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{ec.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{ec.description}</p>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] shrink-0 ml-2", cfg.className)}>{cfg.label}</Badge>
                      </div>
                      <div className="rounded bg-muted/50 p-2.5 space-y-0.5">
                        <p className="text-[11px] font-semibold text-foreground">Example</p>
                        <p className="text-[11px] text-muted-foreground">{ec.example}</p>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <InfoCircle size={12} className="shrink-0 text-blue-500 mt-0.5" />
                        <p className="text-[11px] text-muted-foreground">{ec.resolution}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
