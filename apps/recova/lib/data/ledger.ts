import type { LedgerEntry } from "@/lib/domain/types"

/**
 * Ledger — the system of record for money movement.
 *
 * RecoveryCase.amountRecovered/outstanding is the operational queue view;
 * every real debit, reversal or refund also writes here, and
 * lib/domain/reconciliation.ts reconciles this record against settlement
 * files. A recovery attempt or a dispute resolution that doesn't produce a
 * LedgerEntry never actually happened, financially speaking.
 */
export const LEDGER: LedgerEntry[] = [
  {
    id: "led_001",
    loanId: "LN-28611",
    transactionId: "TX-88198770",
    type: "DEBIT",
    status: "FINALIZED",
    amount: 940_000,
    currency: "NGN",
    rail: "NDD",
    referenceEntryId: null,
    createdAt: "2026-08-01T09:00:00Z",
  },
  {
    id: "led_002",
    loanId: "LN-2024-1401",
    transactionId: "TX-88213004",
    type: "DEBIT",
    status: "PROVISIONAL",
    amount: 2_100_000,
    currency: "NGN",
    rail: "NDD",
    referenceEntryId: null,
    createdAt: "2026-07-30T09:00:00Z",
  },
  {
    id: "led_003",
    loanId: "LN-2024-1401",
    transactionId: "TX-88213004-R",
    type: "REVERSAL",
    status: "FINALIZED",
    amount: 2_100_000,
    currency: "NGN",
    rail: "NDD",
    referenceEntryId: "led_002",
    createdAt: "2026-08-04T11:00:00Z",
  },
  {
    id: "led_004",
    loanId: "LN-28471",
    transactionId: "TX-88201220-RF",
    type: "REFUND",
    status: "FINALIZED",
    amount: 42_500,
    currency: "NGN",
    rail: "EASY_PAY",
    referenceEntryId: "led_005",
    createdAt: "2026-07-27T14:00:00Z",
  },
  {
    id: "led_005",
    loanId: "LN-2024-1355",
    transactionId: "TX-88207001",
    type: "DEBIT",
    status: "PENDING",
    amount: 320_000,
    currency: "NGN",
    rail: "EASY_PAY",
    referenceEntryId: null,
    createdAt: "2026-08-06T08:05:00Z",
  },
]

let sequence = LEDGER.length

/** Appends a new entry to the ledger, assigning it the next sequential id. */
export function appendLedgerEntry(entry: Omit<LedgerEntry, "id">): LedgerEntry {
  sequence += 1
  const full: LedgerEntry = { ...entry, id: `led_${String(sequence).padStart(3, "0")}` }
  LEDGER.push(full)
  return full
}
