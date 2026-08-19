import type { Rail, ReconciliationOutcome } from "./types"

/**
 * Reconciliation classification engine.
 *
 * PRD objective: "every naira debited = correctly recorded, settled,
 * accounted, or resolved". The matching rules below implement the
 * classification table from the Reconciliation Engine PRD §6.
 */

export interface InternalTransaction {
  transactionId: string
  externalReference: string
  loanId: string
  rail: Rail
  amount: number
  status: "PENDING" | "SUCCESS" | "FAILED"
  createdAt: string
}

export interface SettlementRecord {
  externalReference: string
  amount: number
  settlementDate: string
  reversed: boolean
}

export interface MatchResult {
  transactionId: string
  outcome: ReconciliationOutcome
  internalAmount: number | null
  bankAmount: number | null
  detail: string
}

/** Settlement windows differ per rail, so the tolerance does too. */
export const SETTLEMENT_WINDOW_HOURS: Record<Rail, number> = {
  NDD: 48,
  REMITA: 48,
  EASY_PAY: 2,
}

/**
 * Matches internal transactions against bank settlement files.
 *
 * Deliberately handles the three edge cases the PRD names explicitly:
 *   1. success internally but no settlement yet (wait, then raise),
 *   2. settlement with no internal record (critical — fraud or a system bug),
 *   3. more than one settlement per reference (duplicate debit).
 */
export function reconcile(
  internal: InternalTransaction[],
  settlements: SettlementRecord[],
  now: Date = new Date()
): MatchResult[] {
  const byReference = new Map<string, SettlementRecord[]>()
  for (const s of settlements) {
    const list = byReference.get(s.externalReference) ?? []
    list.push(s)
    byReference.set(s.externalReference, list)
  }

  const results: MatchResult[] = internal.map((tx) => {
    const matches = byReference.get(tx.externalReference) ?? []

    if (matches.length > 1) {
      return {
        transactionId: tx.transactionId,
        outcome: "DUPLICATE",
        internalAmount: tx.amount,
        bankAmount: matches.reduce((s, m) => s + m.amount, 0),
        detail: `${matches.length} settlement records against one debit reference.`,
      }
    }

    if (matches.length === 0) {
      if (tx.status !== "SUCCESS") {
        return {
          transactionId: tx.transactionId,
          outcome: "MATCHED",
          internalAmount: tx.amount,
          bankAmount: null,
          detail: "Failed internally and never settled — consistent.",
        }
      }
      const ageHours =
        (now.getTime() - new Date(tx.createdAt).getTime()) / 3_600_000
      const window = SETTLEMENT_WINDOW_HOURS[tx.rail]
      return {
        transactionId: tx.transactionId,
        outcome: "MISSING_SETTLEMENT",
        internalAmount: tx.amount,
        bankAmount: null,
        detail:
          ageHours > window
            ? `No settlement ${Math.round(ageHours)}h after debit — past the ${window}h ${tx.rail} window.`
            : `Within the ${window}h ${tx.rail} settlement window — still expected.`,
      }
    }

    const settlement = matches[0]

    if (settlement.reversed) {
      return {
        transactionId: tx.transactionId,
        outcome: "REVERSED",
        internalAmount: tx.amount,
        bankAmount: settlement.amount,
        detail: "Bank reversed the debit after settlement — adjust the ledger.",
      }
    }

    if (settlement.amount !== tx.amount) {
      return {
        transactionId: tx.transactionId,
        outcome: "MISSING_INTERNAL",
        internalAmount: tx.amount,
        bankAmount: settlement.amount,
        detail: `Amount mismatch: internal ₦${tx.amount.toLocaleString()} vs bank ₦${settlement.amount.toLocaleString()}.`,
      }
    }

    return {
      transactionId: tx.transactionId,
      outcome: "MATCHED",
      internalAmount: tx.amount,
      bankAmount: settlement.amount,
      detail: "Amount and reference match.",
    }
  })

  // Settlement without a corresponding internal transaction is the
  // critical case — surfaced rather than silently dropped.
  const internalRefs = new Set(internal.map((t) => t.externalReference))
  for (const s of settlements) {
    if (!internalRefs.has(s.externalReference)) {
      results.push({
        transactionId: s.externalReference,
        outcome: "MISSING_INTERNAL",
        internalAmount: null,
        bankAmount: s.amount,
        detail: "Bank settled a debit with no internal record — investigate immediately.",
      })
    }
  }

  return results
}

export function reconciliationSummary(results: MatchResult[]) {
  const counts = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.outcome] = (acc[r.outcome] ?? 0) + 1
    return acc
  }, {})
  const matched = counts.MATCHED ?? 0
  return {
    counts,
    total: results.length,
    accuracy: results.length === 0 ? 100 : (matched / results.length) * 100,
    unmatched: results.length - matched,
  }
}
