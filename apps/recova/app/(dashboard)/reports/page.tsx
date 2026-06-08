"use client"

import { useState } from "react"
import { Download, FileText, Calendar, Filter, BarChart2, Table, FileSpreadsheet } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { loans, settlements, disputes, mandates } from "@/lib/mock-data"
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const REPORT_TYPES = [
  {
    id: "recovery-summary",
    name: "Recovery Summary",
    description: "Overall recovery performance, rate trends, and collection outcomes by period.",
    icon: <BarChart2 className="h-5 w-5" />,
    color: "text-primary",
    bg: "bg-primary/10",
    rows: loans.length,
  },
  {
    id: "mandate-activity",
    name: "Mandate Activity",
    description: "NDD and Remita mandate setups, successes, failures, and debit history.",
    icon: <FileText className="h-5 w-5" />,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
    rows: mandates.length,
  },
  {
    id: "settlement-recon",
    name: "Settlement Reconciliation",
    description: "All debit settlements, pending amounts, reversals, and reconciliation status.",
    icon: <Table className="h-5 w-5" />,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    rows: settlements.length,
  },
  {
    id: "dispute-resolution",
    name: "Dispute Resolution",
    description: "Open and closed disputes, SLA compliance, resolution times, and escalations.",
    icon: <FileSpreadsheet className="h-5 w-5" />,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    rows: disputes.length,
  },
  {
    id: "dro-performance",
    name: "DRO Performance",
    description: "Recovery officer productivity, cases handled, recovery rates, and SLA adherence.",
    icon: <BarChart2 className="h-5 w-5" />,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    rows: 6,
  },
  {
    id: "audit-trail",
    name: "Audit Trail Export",
    description: "Full compliance-ready audit log with actor, action, timestamp, and IP address.",
    icon: <FileText className="h-5 w-5" />,
    color: "text-muted-foreground",
    bg: "bg-muted",
    rows: 8,
  },
]

const DATE_PRESETS = ["Today", "Last 7 days", "Last 30 days", "This month", "Last month", "Custom range"]
const FORMATS = ["CSV", "Excel", "PDF"]

function generateCSV(reportId: string): string {
  if (reportId === "recovery-summary") {
    const header = "Loan ID,Borrower,Outstanding,DPD,State,Rail,DRO\n"
    const rows = loans.map(l => `${l.loanId},${l.borrower},${l.outstanding},${l.dpd},${l.state},${l.rail},${l.dro ?? ""}`).join("\n")
    return header + rows
  }
  if (reportId === "settlement-recon") {
    const header = "Reference,Borrower,Amount,Rail,Type,Status,Settled\n"
    const rows = settlements.map(s => `${s.reference},${s.borrower},${s.amount},${s.rail},${s.type},${s.status},${s.settledAt}`).join("\n")
    return header + rows
  }
  return "id,data\n1,sample"
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [datePreset, setDatePreset] = useState("Last 30 days")
  const [format, setFormat] = useState("CSV")
  const [generating, setGenerating] = useState(false)

  const report = REPORT_TYPES.find(r => r.id === selected)

  async function handleGenerate() {
    if (!selected) { toast.error("Please select a report type"); return }
    setGenerating(true)
    await new Promise(r => setTimeout(r, 900))
    setGenerating(false)
    if (format === "CSV") {
      const content = generateCSV(selected)
      downloadCSV(content, `recova-${selected}-${Date.now()}.csv`)
      toast.success("Report downloaded")
    } else {
      toast.info(`${format} export coming soon — CSV available now`)
    }
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Reports"
        description="Generate and export compliance and operational reports"
      />

      <div className="p-6 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Report selector */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Select Report Type</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {REPORT_TYPES.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelected(r.id)}
                  className={cn(
                    "text-left rounded-xl border p-4 transition-all",
                    selected === r.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl mb-3", r.bg)}>
                    <span className={r.color}>{r.icon}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-2 font-medium">{r.rows} records in current view</p>
                </button>
              ))}
            </div>
          </div>

          {/* Config panel */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Configure Export</h2>

            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              {/* Date range */}
              <div>
                <p className="text-xs font-medium text-foreground mb-2">Date Range</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {DATE_PRESETS.map(p => (
                    <button
                      key={p}
                      onClick={() => setDatePreset(p)}
                      className={cn(
                        "text-xs rounded-lg px-2.5 py-1.5 border transition-colors text-left",
                        datePreset === p
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div>
                <p className="text-xs font-medium text-foreground mb-2">Export Format</p>
                <div className="flex gap-1.5">
                  {FORMATS.map(f => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={cn(
                        "flex-1 text-xs rounded-lg px-2.5 py-1.5 border transition-colors font-medium",
                        format === f
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selection summary */}
              <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Report</span>
                  <span className="font-medium text-foreground">{report?.name ?? "None selected"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Period</span>
                  <span className="font-medium text-foreground">{datePreset}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-medium text-foreground">{format}</span>
                </div>
                {report && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Est. rows</span>
                    <span className="font-medium text-foreground">{report.rows}</span>
                  </div>
                )}
              </div>

              <Button
                className="w-full gap-2 text-xs"
                onClick={handleGenerate}
                disabled={!selected || generating}
              >
                <Download className="h-3.5 w-3.5" />
                {generating ? "Generating…" : `Generate ${format}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
