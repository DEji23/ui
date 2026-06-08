"use client"

import { useState } from "react"
import { AlertTriangle, Shield, User, Building2, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { type Dispute, type RecoveryRail } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type DisputeType = Dispute["type"]

interface FlagDisputeModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (dispute: Omit<Dispute, "id" | "evidence" | "decisionOutcome" | "decisionNote" | "decisionAt" | "decisionBy">) => void
}

const DISPUTE_TYPES_CUSTOMER: DisputeType[] = [
  "Unauthorised Mandate",
  "Duplicate Debit",
  "Incorrect Debit",
  "Insufficient Notice",
  "Fraud",
]

const DISPUTE_TYPES_BANK: DisputeType[] = ["AT_RISK Transaction"]

const RAILS: RecoveryRail[] = ["NDD", "REMITA", "EASY_PAY", "MANUAL"]

function getSLADeadline(type: DisputeType): string {
  const hours = type === "Fraud" || type === "Unauthorised Mandate" ? 48 : type === "AT_RISK Transaction" ? 120 : 72
  return new Date(Date.now() + hours * 3600000).toISOString()
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export function FlagDisputeModal({ open, onClose, onSubmit }: FlagDisputeModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [initiatedBy, setInitiatedBy] = useState<"CUSTOMER" | "BANK">("CUSTOMER")
  const [type, setType] = useState<DisputeType>("Unauthorised Mandate")
  const [loanId, setLoanId] = useState("")
  const [borrower, setBorrower] = useState("")
  const [phone, setPhone] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [amount, setAmount] = useState("")
  const [rail, setRail] = useState<RecoveryRail>("NDD")
  const [assignedTo, setAssignedTo] = useState("Adaora Nwosu")
  const [description, setDescription] = useState("")
  const [isIndemnity, setIsIndemnity] = useState(false)
  const [indemnityAmount, setIndemnityAmount] = useState("")

  function resetForm() {
    setStep(1)
    setInitiatedBy("CUSTOMER")
    setType("Unauthorised Mandate")
    setLoanId("")
    setBorrower("")
    setPhone("")
    setTransactionId("")
    setAmount("")
    setRail("NDD")
    setAssignedTo("Adaora Nwosu")
    setDescription("")
    setIsIndemnity(false)
    setIndemnityAmount("")
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  function handleNext() {
    if (!loanId.trim()) { toast.error("Loan ID is required"); return }
    if (!borrower.trim()) { toast.error("Borrower name is required"); return }
    if (!transactionId.trim()) { toast.error("Transaction ID is required"); return }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { toast.error("Valid amount is required"); return }
    setStep(2)
  }

  function handleSubmit() {
    if (!description.trim()) { toast.error("Description is required"); return }

    const newDispute = {
      loanId: loanId.trim(),
      borrower: borrower.trim(),
      phone: phone.trim() || "—",
      initiatedBy,
      type,
      transactionId: transactionId.trim(),
      amount: Number(amount),
      status: "OPEN" as const,
      slaDeadline: getSLADeadline(type),
      assignedTo,
      filedAt: new Date().toISOString(),
      description: description.trim(),
      rail,
      isIndemnity: initiatedBy === "BANK" ? isIndemnity : false,
      indemnityAmount: isIndemnity && indemnityAmount ? Number(indemnityAmount) : null,
      recoveryPaused: type === "Fraud" || type === "Unauthorised Mandate",
      mandateLocked: type === "Fraud" || type === "Unauthorised Mandate",
    }

    onSubmit(newDispute as any)

    const autoActions: string[] = []
    if (newDispute.recoveryPaused) autoActions.push("recovery paused")
    if (newDispute.mandateLocked) autoActions.push("mandate locked")
    if (autoActions.length > 0) {
      toast.warning(`Auto-actions triggered: ${autoActions.join(", ")}`)
    }
    toast.success(`Dispute filed — ${type}. SLA clock started.`)
    handleClose()
  }

  const disputeTypes = initiatedBy === "BANK" ? DISPUTE_TYPES_BANK : DISPUTE_TYPES_CUSTOMER

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Flag Dispute</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {step === 1 ? "Dispute details" : "Description & assignment"}
              </p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                  step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {step > s ? <CheckCircle2 className="h-3.5 w-3.5" /> : s}
                </div>
                <span className={cn("text-xs", step >= s ? "text-foreground" : "text-muted-foreground")}>
                  {s === 1 ? "Transaction" : "Detail"}
                </span>
                {s < 2 && <div className={cn("h-px w-8", step > s ? "bg-primary" : "bg-border")} />}
              </div>
            ))}
          </div>
        </DialogHeader>

        <Separator />

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <>
              {/* Initiated By */}
              <Field label="Initiated By" required>
                <div className="grid grid-cols-2 gap-2">
                  {(["CUSTOMER", "BANK"] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        setInitiatedBy(opt)
                        setType(opt === "BANK" ? "AT_RISK Transaction" : "Unauthorised Mandate")
                        setIsIndemnity(opt === "BANK")
                      }}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-colors text-left",
                        initiatedBy === opt
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted/40"
                      )}
                    >
                      {opt === "CUSTOMER" ? <User className="h-4 w-4 shrink-0" /> : <Building2 className="h-4 w-4 shrink-0" />}
                      {opt === "CUSTOMER" ? "Customer" : "Bank (Internal)"}
                    </button>
                  ))}
                </div>
                {initiatedBy === "BANK" && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3" />
                    Bank-initiated disputes trigger an indemnity claim with the payment processor.
                  </p>
                )}
              </Field>

              {/* Type */}
              <Field label="Dispute Type" required>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as DisputeType)}
                  className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {disputeTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Loan ID" required>
                  <input
                    value={loanId}
                    onChange={e => setLoanId(e.target.value)}
                    placeholder="LN-XXXXX"
                    className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </Field>
                <Field label="Rail" required>
                  <select
                    value={rail}
                    onChange={e => setRail(e.target.value as RecoveryRail)}
                    className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {RAILS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Borrower Name" required>
                <input
                  value={borrower}
                  onChange={e => setBorrower(e.target.value)}
                  placeholder="Full name"
                  className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </Field>

              <Field label="Phone">
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+234 XXX XXX XXXX"
                  className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Transaction ID" required>
                  <input
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                    placeholder="TXN-XXXXXXXXXX"
                    className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </Field>
                <Field label="Amount in Dispute (₦)" required>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    min={0}
                    className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </Field>
              </div>

              {initiatedBy === "BANK" && (
                <div className="space-y-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" />
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Indemnity Claim</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsIndemnity(!isIndemnity)}
                      className={cn(
                        "relative h-5 w-9 rounded-full transition-colors",
                        isIndemnity ? "bg-amber-500" : "bg-muted"
                      )}
                    >
                      <span className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                        isIndemnity ? "translate-x-4" : "translate-x-0.5"
                      )} />
                    </button>
                    <span className="text-xs text-foreground">File indemnity claim with processor</span>
                  </div>
                  {isIndemnity && (
                    <Field label="Indemnity Amount (₦)">
                      <input
                        type="number"
                        value={indemnityAmount}
                        onChange={e => setIndemnityAmount(e.target.value)}
                        placeholder="Defaults to dispute amount"
                        className="w-full text-xs rounded-lg border border-border bg-background px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </Field>
                  )}
                </div>
              )}

              {/* Auto-action preview */}
              {(type === "Fraud" || type === "Unauthorised Mandate") && (
                <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 p-4">
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">Auto-actions on submit</p>
                  <div className="space-y-1">
                    <p className="text-xs text-red-600/80 dark:text-red-400/80 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Recovery paused immediately
                    </p>
                    <p className="text-xs text-red-600/80 dark:text-red-400/80 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Mandate locked pending investigation
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              {/* Summary */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Summary</p>
                {[
                  ["Loan", loanId],
                  ["Borrower", borrower],
                  ["Type", type],
                  ["Amount", `₦${Number(amount).toLocaleString()}`],
                  ["Rail", rail],
                  ["Initiated By", initiatedBy],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium text-foreground">{v}</span>
                  </div>
                ))}
              </div>

              <Field label="Description" required>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the dispute in detail — what happened, when, what the customer/bank is claiming…"
                  className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
              </Field>

              <Field label="Assign To">
                <select
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {["Adaora Nwosu", "Fatima Bello", "Chidi Okeke", "Yusuf Ibrahim"].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </Field>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs text-primary font-medium">
                  SLA clock starts immediately on submission.{" "}
                  {type === "Fraud" || type === "Unauthorised Mandate" ? "48-hour SLA applies." : type === "AT_RISK Transaction" ? "120-hour SLA applies." : "72-hour SLA applies."}
                </p>
              </div>
            </>
          )}
        </div>

        <Separator />

        <div className="flex items-center justify-between p-4">
          {step === 2 ? (
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setStep(1)}>
              ← Back
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="text-xs" onClick={handleClose}>
              Cancel
            </Button>
          )}
          {step === 1 ? (
            <Button size="sm" className="text-xs gap-2" onClick={handleNext}>
              Next →
            </Button>
          ) : (
            <Button size="sm" className="text-xs gap-2 bg-amber-600 hover:bg-amber-700 text-white" onClick={handleSubmit}>
              <AlertTriangle className="h-3.5 w-3.5" />
              File Dispute
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
