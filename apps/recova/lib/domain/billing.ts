import type { Rail } from "./types"

/**
 * Billing & unit economics engine.
 *
 * Costs are the published rail tariffs from the PRD appendix
 * ("API Consumption Cost"). Prices carry the platform margin, so
 * `cost` and `price` are tracked separately exactly as the PRD requires:
 * "COST VS PRICE SEPARATION".
 */

export type BillableEvent =
  | "IGREE_SMS_OTP"
  | "IGREE_CONSENT"
  | "IGREE_BVN_DATA"
  | "IGREE_LINKED_ACCOUNTS"
  | "MANDATE_ACTIVATION"
  | "NDD_DEBIT"
  | "NDD_BALANCE_ENQUIRY"
  | "NDD_NAME_ENQUIRY"
  | "EASYPAY_TRANSFER"
  | "EASYPAY_BALANCE_ENQUIRY"
  | "EASYPAY_NAME_ENQUIRY"

export interface Tariff {
  event: BillableEvent
  label: string
  cost: number
  price: number
  optional: boolean
}

/** Unit costs in naira, verbatim from the PRD appendix. */
export const TARIFFS: Record<BillableEvent, Tariff> = {
  IGREE_SMS_OTP: {
    event: "IGREE_SMS_OTP",
    label: "iGree SMS (OTP)",
    cost: 6.0,
    price: 9.0,
    optional: false,
  },
  IGREE_CONSENT: {
    event: "IGREE_CONSENT",
    label: "iGree consent received",
    cost: 3.0,
    price: 4.5,
    optional: false,
  },
  IGREE_BVN_DATA: {
    event: "IGREE_BVN_DATA",
    label: "iGree BVN validation",
    cost: 3.5,
    price: 5.25,
    optional: false,
  },
  IGREE_LINKED_ACCOUNTS: {
    event: "IGREE_LINKED_ACCOUNTS",
    label: "iGree accounts linked to BVN",
    cost: 250.0,
    price: 300.0,
    optional: false,
  },
  MANDATE_ACTIVATION: {
    event: "MANDATE_ACTIVATION",
    label: "Mandate activation",
    cost: 50.0,
    price: 65.0,
    optional: false,
  },
  NDD_DEBIT: {
    event: "NDD_DEBIT",
    label: "Direct debit processing",
    cost: 30.0,
    price: 40.0,
    optional: true,
  },
  NDD_BALANCE_ENQUIRY: {
    event: "NDD_BALANCE_ENQUIRY",
    label: "NDD balance enquiry",
    cost: 5.0,
    price: 7.5,
    optional: true,
  },
  NDD_NAME_ENQUIRY: {
    event: "NDD_NAME_ENQUIRY",
    label: "NDD name enquiry (>3 queries)",
    cost: 2.0,
    price: 3.0,
    optional: true,
  },
  EASYPAY_TRANSFER: {
    event: "EASYPAY_TRANSFER",
    label: "EasyPay fund transfer",
    cost: 3.75,
    price: 6.0,
    optional: false,
  },
  EASYPAY_BALANCE_ENQUIRY: {
    event: "EASYPAY_BALANCE_ENQUIRY",
    label: "EasyPay balance enquiry",
    cost: 3.0,
    price: 5.0,
    optional: false,
  },
  EASYPAY_NAME_ENQUIRY: {
    event: "EASYPAY_NAME_ENQUIRY",
    label: "EasyPay name enquiry",
    cost: 2.0,
    price: 3.5,
    optional: false,
  },
}

/** ₦262.50 per the appendix total. */
export const IGREE_ONBOARDING_COST =
  TARIFFS.IGREE_SMS_OTP.cost +
  TARIFFS.IGREE_CONSENT.cost +
  TARIFFS.IGREE_BVN_DATA.cost +
  TARIFFS.IGREE_LINKED_ACCOUNTS.cost

/** ₦6.75 per EasyPay fallback attempt. */
export const EASYPAY_ATTEMPT_COST =
  TARIFFS.EASYPAY_TRANSFER.cost +
  TARIFFS.EASYPAY_BALANCE_ENQUIRY.cost +
  TARIFFS.EASYPAY_NAME_ENQUIRY.cost

export interface UsageLine {
  event: BillableEvent
  quantity: number
}

export interface InvoiceTotals {
  totalCost: number
  totalCharge: number
  margin: number
  marginPct: number
  lines: Array<Tariff & { quantity: number; cost: number; charge: number }>
}

export function aggregateUsage(usage: UsageLine[]): InvoiceTotals {
  const lines = usage.map((line) => {
    const tariff = TARIFFS[line.event]
    return {
      ...tariff,
      quantity: line.quantity,
      cost: tariff.cost * line.quantity,
      charge: tariff.price * line.quantity,
    }
  })

  const totalCost = lines.reduce((sum, l) => sum + l.cost, 0)
  const totalCharge = lines.reduce((sum, l) => sum + l.charge, 0)
  const margin = totalCharge - totalCost

  return {
    totalCost,
    totalCharge,
    margin,
    marginPct: totalCharge === 0 ? 0 : (margin / totalCharge) * 100,
    lines,
  }
}

/** Cost per naira recovered — the engine KPI the PRD tracks. */
export function costPerNairaRecovered(
  totalCost: number,
  totalRecovered: number
): number {
  return totalRecovered === 0 ? 0 : totalCost / totalRecovered
}

/** Rail cost of a single attempt, used to price retries in the queue UI. */
export function attemptCost(rail: Rail): number {
  return rail === "EASY_PAY"
    ? EASYPAY_ATTEMPT_COST
    : TARIFFS.NDD_DEBIT.cost + TARIFFS.NDD_BALANCE_ENQUIRY.cost
}
