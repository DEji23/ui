/**
 * Loan management + repayment scheduler.
 *
 * PRD: "To create a single source of truth for what is owed, when it is owed,
 *  and how it evolves after partials, retries, penalties."
 *
 * This service owns loan principal, repayment schedule, penalties and loan
 * state. The recovery engine consumes the obligations it emits — it never
 * computes a schedule itself.
 */

export type AmortizationType = "FLAT" | "DECLINING_BALANCE" | "BULLET"
export type RepaymentFrequency = "MONTHLY" | "WEEKLY" | "BIWEEKLY"

export type LoanState =
  | "CREATED"
  | "DISBURSED"
  | "ACTIVE"
  | "DUE"
  | "OVERDUE"
  | "IN_RECOVERY"
  | "PARTIALLY_RECOVERED"
  | "CLOSED"
  | "WRITE_OFF"

export const LOAN_STATE_LABEL: Record<LoanState, string> = {
  CREATED: "Created",
  DISBURSED: "Disbursed",
  ACTIVE: "Active",
  DUE: "Due",
  OVERDUE: "Overdue",
  IN_RECOVERY: "In Recovery",
  PARTIALLY_RECOVERED: "Partially Recovered",
  CLOSED: "Closed",
  WRITE_OFF: "Write Off",
}

export type ObligationState =
  | "PENDING"
  | "DUE"
  | "PARTIALLY_PAID"
  | "PAID"
  | "DEFAULTED"
  | "RESTRUCTURED"

export const OBLIGATION_STATE_LABEL: Record<ObligationState, string> = {
  PENDING: "Pending",
  DUE: "Due",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
  DEFAULTED: "Defaulted",
  RESTRUCTURED: "Restructured",
}

export interface RepaymentObligation {
  obligationId: string
  loanId: string
  dueDate: string
  principalComponent: number
  interestComponent: number
  penaltyComponent: number
  totalDue: number
  outstandingAmount: number
  status: ObligationState
  createdAt: string
  updatedAt: string
}

export interface Loan {
  id: string
  customerId: string
  customerName: string
  amount: number
  interestRate: number
  tenureMonths: number
  repaymentFrequency: RepaymentFrequency
  amortizationType: AmortizationType
  disbursementDate: string
  state: LoanState
  productName: string
  organisationId: string
}

export interface LoanInput {
  customerId: string
  amount: number
  interestRate: number
  tenureMonths: number
  repaymentFrequency: RepaymentFrequency
  amortizationType: AmortizationType
  disbursementDate: string
}

/* ------------------------------------------------------------------ */
/* Schedule generation                                                 */
/* ------------------------------------------------------------------ */

function addMonths(iso: string, months: number): string {
  const d = new Date(iso)
  const day = d.getDate()
  d.setMonth(d.getMonth() + months)
  // Guard against month-end rollover (31 Jan + 1 month must not become 3 Mar).
  if (d.getDate() < day) d.setDate(0)
  return d.toISOString().slice(0, 10)
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Equated instalment for a declining-balance loan.
 * EMI = P·r·(1+r)^n / ((1+r)^n − 1), with the zero-rate case handled.
 */
export function emi(principal: number, monthlyRate: number, periods: number): number {
  if (monthlyRate === 0) return principal / periods
  const factor = Math.pow(1 + monthlyRate, periods)
  return (principal * monthlyRate * factor) / (factor - 1)
}

/**
 * Generates the obligation ladder for a loan.
 *
 * FLAT — interest computed on the original principal every period.
 * DECLINING_BALANCE — EMI, with interest on the reducing balance.
 * BULLET — interest each period, entire principal in the final period.
 */
export function generateSchedule(
  loanId: string,
  input: LoanInput,
  now: Date = new Date()
): RepaymentObligation[] {
  const periods = input.tenureMonths
  const monthlyRate = input.interestRate / 12
  const timestamp = now.toISOString()
  const obligations: RepaymentObligation[] = []

  let balance = input.amount

  for (let i = 1; i <= periods; i++) {
    let principal: number
    let interest: number

    switch (input.amortizationType) {
      case "FLAT": {
        principal = input.amount / periods
        interest = input.amount * monthlyRate
        break
      }
      case "DECLINING_BALANCE": {
        const instalment = emi(input.amount, monthlyRate, periods)
        interest = balance * monthlyRate
        principal = instalment - interest
        // Absorb rounding drift into the final principal component.
        if (i === periods) principal = balance
        break
      }
      case "BULLET": {
        interest = balance * monthlyRate
        principal = i === periods ? input.amount : 0
        break
      }
    }

    balance = round2(balance - principal)
    const total = round2(principal + interest)

    obligations.push({
      obligationId: `${loanId}-OB-${String(i).padStart(2, "0")}`,
      loanId,
      dueDate: addMonths(input.disbursementDate, i),
      principalComponent: round2(principal),
      interestComponent: round2(interest),
      penaltyComponent: 0,
      totalDue: total,
      outstandingAmount: total,
      status: "PENDING",
      createdAt: timestamp,
      updatedAt: timestamp,
    })
  }

  return obligations
}

/* ------------------------------------------------------------------ */
/* Payment application                                                 */
/* ------------------------------------------------------------------ */

export interface PaymentAllocation {
  obligationId: string
  applied: number
  resultingStatus: ObligationState
}

export interface PaymentResult {
  allocations: PaymentAllocation[]
  obligations: RepaymentObligation[]
  /** Positive when the payment exceeded everything owed. */
  overpayment: number
}

/**
 * Applies a payment oldest-obligation-first, exactly as the PRD specifies.
 * Returns new obligation objects rather than mutating, so a caller can
 * preview an allocation before committing it.
 */
export function applyPayment(
  obligations: RepaymentObligation[],
  paymentAmount: number,
  now: Date = new Date()
): PaymentResult {
  const timestamp = now.toISOString()
  let remaining = paymentAmount
  const allocations: PaymentAllocation[] = []

  const ordered = [...obligations].sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate)
  )

  const updated = ordered.map((ob) => {
    if (remaining <= 0 || ob.outstandingAmount <= 0) return ob

    if (remaining >= ob.outstandingAmount) {
      const applied = ob.outstandingAmount
      remaining = round2(remaining - applied)
      allocations.push({
        obligationId: ob.obligationId,
        applied,
        resultingStatus: "PAID",
      })
      return {
        ...ob,
        outstandingAmount: 0,
        status: "PAID" as ObligationState,
        updatedAt: timestamp,
      }
    }

    const applied = remaining
    const outstanding = round2(ob.outstandingAmount - applied)
    remaining = 0
    allocations.push({
      obligationId: ob.obligationId,
      applied,
      resultingStatus: "PARTIALLY_PAID",
    })
    return {
      ...ob,
      outstandingAmount: outstanding,
      status: "PARTIALLY_PAID" as ObligationState,
      updatedAt: timestamp,
    }
  })

  return { allocations, obligations: updated, overpayment: round2(remaining) }
}

/* ------------------------------------------------------------------ */
/* Penalty engine                                                      */
/* ------------------------------------------------------------------ */

export interface PenaltyRule {
  type: "PERCENTAGE" | "FLAT"
  value: number
  gracePeriodDays: number
}

/** 1% penalty on default — the rate the PRD uses for manually disbursed loans. */
export const DEFAULT_PENALTY: PenaltyRule = {
  type: "PERCENTAGE",
  value: 0.01,
  gracePeriodDays: 7,
}

export function penaltyFor(
  obligation: RepaymentObligation,
  rule: PenaltyRule = DEFAULT_PENALTY,
  now: Date = new Date()
): number {
  const dpd = daysPastDue(obligation, now)
  if (dpd <= rule.gracePeriodDays) return 0
  if (obligation.outstandingAmount <= 0) return 0
  return rule.type === "FLAT"
    ? rule.value
    : round2(obligation.outstandingAmount * rule.value)
}

export function applyPenalty(
  obligation: RepaymentObligation,
  rule: PenaltyRule = DEFAULT_PENALTY,
  now: Date = new Date()
): RepaymentObligation {
  const penalty = penaltyFor(obligation, rule, now)
  if (penalty === 0) return obligation
  return {
    ...obligation,
    penaltyComponent: round2(obligation.penaltyComponent + penalty),
    totalDue: round2(obligation.totalDue + penalty),
    outstandingAmount: round2(obligation.outstandingAmount + penalty),
    status: "DEFAULTED",
    updatedAt: now.toISOString(),
  }
}

export function daysPastDue(
  obligation: RepaymentObligation,
  now: Date = new Date()
): number {
  const diff = now.getTime() - new Date(obligation.dueDate).getTime()
  return Math.max(0, Math.floor(diff / 86_400_000))
}

/* ------------------------------------------------------------------ */
/* Derived loan views                                                  */
/* ------------------------------------------------------------------ */

export interface LoanSummary {
  totalDue: number
  totalOutstanding: number
  totalPaid: number
  totalPenalty: number
  dpd: number
  nextObligation: RepaymentObligation | null
  paidCount: number
  obligationCount: number
}

export function summarise(
  obligations: RepaymentObligation[],
  now: Date = new Date()
): LoanSummary {
  const totalDue = obligations.reduce((s, o) => s + o.totalDue, 0)
  const totalOutstanding = obligations.reduce((s, o) => s + o.outstandingAmount, 0)
  const totalPenalty = obligations.reduce((s, o) => s + o.penaltyComponent, 0)

  const overdue = obligations
    .filter((o) => o.outstandingAmount > 0 && new Date(o.dueDate) < now)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  const next =
    obligations
      .filter((o) => o.outstandingAmount > 0)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] ?? null

  return {
    totalDue: round2(totalDue),
    totalOutstanding: round2(totalOutstanding),
    totalPaid: round2(totalDue - totalOutstanding),
    totalPenalty: round2(totalPenalty),
    dpd: overdue.length ? daysPastDue(overdue[0], now) : 0,
    nextObligation: next,
    paidCount: obligations.filter((o) => o.status === "PAID").length,
    obligationCount: obligations.length,
  }
}

/**
 * Restructuring: paid obligations are preserved untouched and only the
 * unpaid tail is regenerated — the PRD's explicit requirement.
 */
export function restructure(
  obligations: RepaymentObligation[],
  loanId: string,
  input: LoanInput,
  now: Date = new Date()
): RepaymentObligation[] {
  const keep = obligations.filter((o) => o.status === "PAID")
  const superseded = obligations
    .filter((o) => o.status !== "PAID")
    .map((o) => ({ ...o, status: "RESTRUCTURED" as ObligationState }))
  const fresh = generateSchedule(loanId, input, now).map((o, i) => ({
    ...o,
    obligationId: `${o.obligationId}-R${keep.length + i + 1}`,
  }))
  return [...keep, ...superseded, ...fresh]
}

/** Scheduler events the recovery engine subscribes to. */
export type SchedulerEvent =
  | "obligation.due"
  | "obligation.overdue"
  | "obligation.partially_paid"
  | "obligation.defaulted"

export function eventsFor(
  obligation: RepaymentObligation,
  now: Date = new Date()
): SchedulerEvent[] {
  const events: SchedulerEvent[] = []
  const dpd = daysPastDue(obligation, now)
  if (obligation.status === "PARTIALLY_PAID") events.push("obligation.partially_paid")
  if (obligation.status === "DEFAULTED") events.push("obligation.defaulted")
  if (obligation.outstandingAmount > 0) {
    if (dpd > 0) events.push("obligation.overdue")
    else if (obligation.dueDate === now.toISOString().slice(0, 10))
      events.push("obligation.due")
  }
  return events
}
