export type TxnStatus = "Success" | "Failed" | "Refunded" | "Flagged"

export type Transaction = {
  id: string
  timestamp: string
  country: string
  operator: string
  route: string
  bus: string
  driver: string
  paymentType: "AFC QR" | "NFC" | "POS" | "Wallet" | "Cash Entry"
  currency: string
  fareAmount: number
  platformFee: number
  complianceCost: number
  netRevenue: number
  status: TxnStatus
  gatewayRef: string
  deviceId: string
  syncStatus: "Synced" | "Pending" | "Failed"
  hybrid: boolean
}

export const transactions: Transaction[] = [
  {
    id: "TXN-88213",
    timestamp: "2026-08-17 08:12",
    country: "Nigeria",
    operator: "LagRide Transit",
    route: "Ikeja → CMS",
    bus: "BUS-041",
    driver: "T. Adeyemi",
    paymentType: "AFC QR",
    currency: "NGN",
    fareAmount: 500,
    platformFee: 40,
    complianceCost: 15,
    netRevenue: 445,
    status: "Success",
    gatewayRef: "GTW-NG-99213",
    deviceId: "DEV-1042",
    syncStatus: "Synced",
    hybrid: false,
  },
  {
    id: "TXN-88214",
    timestamp: "2026-08-17 08:14",
    country: "Kenya",
    operator: "Nairobi Metro",
    route: "CBD → Westlands",
    bus: "BUS-118",
    driver: "J. Otieno",
    paymentType: "NFC",
    currency: "KES",
    fareAmount: 80,
    platformFee: 6.4,
    complianceCost: 2.4,
    netRevenue: 71.2,
    status: "Success",
    gatewayRef: "GTW-KE-33210",
    deviceId: "DEV-2091",
    syncStatus: "Synced",
    hybrid: false,
  },
  {
    id: "TXN-88215",
    timestamp: "2026-08-17 08:15",
    country: "Nigeria",
    operator: "AbujaLink",
    route: "Wuse → Nyanya",
    bus: "BUS-007",
    driver: "M. Bello",
    paymentType: "Cash Entry",
    currency: "NGN",
    fareAmount: 350,
    platformFee: 28,
    complianceCost: 10.5,
    netRevenue: 311.5,
    status: "Flagged",
    gatewayRef: "—",
    deviceId: "DEV-0587",
    syncStatus: "Pending",
    hybrid: true,
  },
  {
    id: "TXN-88216",
    timestamp: "2026-08-17 08:19",
    country: "Ghana",
    operator: "Accra Fast Transit",
    route: "Circle → Achimota",
    bus: "BUS-063",
    driver: "K. Mensah",
    paymentType: "POS",
    currency: "GHS",
    fareAmount: 12,
    platformFee: 0.96,
    complianceCost: 0.36,
    netRevenue: 10.68,
    status: "Success",
    gatewayRef: "GTW-GH-11820",
    deviceId: "DEV-3305",
    syncStatus: "Synced",
    hybrid: false,
  },
  {
    id: "TXN-88217",
    timestamp: "2026-08-17 08:21",
    country: "Nigeria",
    operator: "LagRide Transit",
    route: "Yaba → Ikorodu",
    bus: "BUS-041",
    driver: "T. Adeyemi",
    paymentType: "Wallet",
    currency: "NGN",
    fareAmount: 700,
    platformFee: 56,
    complianceCost: 21,
    netRevenue: 623,
    status: "Refunded",
    gatewayRef: "GTW-NG-99244",
    deviceId: "DEV-1042",
    syncStatus: "Synced",
    hybrid: false,
  },
  {
    id: "TXN-88218",
    timestamp: "2026-08-17 08:24",
    country: "Kenya",
    operator: "Nairobi Metro",
    route: "Westlands → CBD",
    bus: "BUS-118",
    driver: "J. Otieno",
    paymentType: "AFC QR",
    currency: "KES",
    fareAmount: 80,
    platformFee: 6.4,
    complianceCost: 2.4,
    netRevenue: 71.2,
    status: "Failed",
    gatewayRef: "GTW-KE-33256",
    deviceId: "DEV-2091",
    syncStatus: "Failed",
    hybrid: false,
  },
]

export type AfcDevice = {
  deviceId: string
  bus: string
  operator: string
  status: "Online" | "Offline"
  lastSync: string
  validationAttempts: number
  failedValidations: number
  duplicateScans: number
  suspicionScore: number
}

export const devices: AfcDevice[] = [
  {
    deviceId: "DEV-1042",
    bus: "BUS-041",
    operator: "LagRide Transit",
    status: "Online",
    lastSync: "2 min ago",
    validationAttempts: 412,
    failedValidations: 6,
    duplicateScans: 0,
    suspicionScore: 4,
  },
  {
    deviceId: "DEV-2091",
    bus: "BUS-118",
    operator: "Nairobi Metro",
    status: "Online",
    lastSync: "1 min ago",
    validationAttempts: 388,
    failedValidations: 21,
    duplicateScans: 3,
    suspicionScore: 38,
  },
  {
    deviceId: "DEV-0587",
    bus: "BUS-007",
    operator: "AbujaLink",
    status: "Offline",
    lastSync: "3 hr ago",
    validationAttempts: 96,
    failedValidations: 34,
    duplicateScans: 11,
    suspicionScore: 82,
  },
  {
    deviceId: "DEV-3305",
    bus: "BUS-063",
    operator: "Accra Fast Transit",
    status: "Online",
    lastSync: "just now",
    validationAttempts: 205,
    failedValidations: 2,
    duplicateScans: 0,
    suspicionScore: 6,
  },
]

export type FeeRule = {
  id: string
  country: string
  state?: string
  operator?: string
  route?: string
  commissionType: "Percentage" | "Flat" | "Hybrid"
  commissionValue: string
  complianceCost: string
  regulatoryTax: string
  gatewayFee: string
  settlementDelayDays: number
  version: number
  updatedAt: string
}

export const feeRules: FeeRule[] = [
  {
    id: "FEE-NG-001",
    country: "Nigeria",
    state: "Lagos",
    commissionType: "Percentage",
    commissionValue: "8%",
    complianceCost: "3%",
    regulatoryTax: "1.5%",
    gatewayFee: "1.2%",
    settlementDelayDays: 2,
    version: 4,
    updatedAt: "2026-08-01",
  },
  {
    id: "FEE-NG-002",
    country: "Nigeria",
    state: "Abuja (FCT)",
    operator: "AbujaLink",
    commissionType: "Hybrid",
    commissionValue: "₦10 + 6%",
    complianceCost: "3%",
    regulatoryTax: "1.5%",
    gatewayFee: "1.2%",
    settlementDelayDays: 3,
    version: 2,
    updatedAt: "2026-07-22",
  },
  {
    id: "FEE-KE-001",
    country: "Kenya",
    commissionType: "Percentage",
    commissionValue: "8%",
    complianceCost: "3%",
    regulatoryTax: "2%",
    gatewayFee: "1%",
    settlementDelayDays: 1,
    version: 6,
    updatedAt: "2026-06-30",
  },
  {
    id: "FEE-GH-001",
    country: "Ghana",
    commissionType: "Flat",
    commissionValue: "GHS 0.80",
    complianceCost: "GHS 0.30",
    regulatoryTax: "1%",
    gatewayFee: "1%",
    settlementDelayDays: 2,
    version: 1,
    updatedAt: "2026-05-10",
  },
]

export type FxRate = {
  pair: string
  rate: number
  effectiveDate: string
  source: "Manual" | "Automated"
}

export const fxRates: FxRate[] = [
  { pair: "NGN/USD", rate: 0.00062, effectiveDate: "2026-08-17", source: "Automated" },
  { pair: "KES/USD", rate: 0.0077, effectiveDate: "2026-08-17", source: "Automated" },
  { pair: "GHS/USD", rate: 0.068, effectiveDate: "2026-08-17", source: "Automated" },
  { pair: "NGN/USD", rate: 0.00061, effectiveDate: "2026-08-16", source: "Automated" },
]

export type CurrencyReconciliation = {
  currency: string
  grossRevenue: number
  platformEarnings: number
  operatorNet: number
  complianceRevenue: number
  fxImpact: number
}

export const reconciliation: CurrencyReconciliation[] = [
  { currency: "NGN", grossRevenue: 18420500, platformEarnings: 1473640, complianceRevenue: 552615, operatorNet: 16394245, fxImpact: -12400 },
  { currency: "KES", grossRevenue: 3120400, platformEarnings: 249632, complianceRevenue: 93612, operatorNet: 2777156, fxImpact: 4210 },
  { currency: "GHS", grossRevenue: 214300, platformEarnings: 17144, complianceRevenue: 6429, operatorNet: 190727, fxImpact: -820 },
]

export type RevenueSplit = {
  id: string
  scope: string
  model: "Percentage" | "Tier-based" | "Volume-based"
  operatorShare: number
  platformShare: number
  govLevy: number
}

export const revenueSplits: RevenueSplit[] = [
  { id: "RS-001", scope: "LagRide Transit – all routes", model: "Percentage", operatorShare: 70, platformShare: 20, govLevy: 10 },
  { id: "RS-002", scope: "Ikeja → CMS (joint route)", model: "Tier-based", operatorShare: 65, platformShare: 25, govLevy: 10 },
  { id: "RS-003", scope: "Nairobi Metro – all routes", model: "Percentage", operatorShare: 72, platformShare: 20, govLevy: 8 },
  { id: "RS-004", scope: "Accra Fast Transit – all routes", model: "Volume-based", operatorShare: 68, platformShare: 22, govLevy: 10 },
]

export type Settlement = {
  id: string
  operator: string
  cycle: "Daily" | "Weekly"
  currency: string
  gross: number
  platformFee: number
  complianceCost: number
  netPayout: number
  status: "Pending" | "Approved" | "Paid"
}

export const settlements: Settlement[] = [
  { id: "STL-4471", operator: "LagRide Transit", cycle: "Daily", currency: "NGN", gross: 812400, platformFee: 64992, complianceCost: 24372, netPayout: 723036, status: "Pending" },
  { id: "STL-4472", operator: "Nairobi Metro", cycle: "Daily", currency: "KES", gross: 138200, platformFee: 11056, complianceCost: 4146, netPayout: 122998, status: "Approved" },
  { id: "STL-4473", operator: "AbujaLink", cycle: "Weekly", currency: "NGN", gross: 2114300, platformFee: 190287, complianceCost: 63429, netPayout: 1860584, status: "Paid" },
  { id: "STL-4474", operator: "Accra Fast Transit", cycle: "Daily", currency: "GHS", gross: 9640, platformFee: 771, complianceCost: 289, netPayout: 8580, status: "Pending" },
]

export type Refund = {
  id: string
  txnId: string
  country: string
  currency: string
  amount: number
  reason: string
  initiatedBy: string
  approvedBy: string
  status: "Pending" | "Approved" | "Rejected"
}

export const refunds: Refund[] = [
  { id: "RFD-2201", txnId: "TXN-88217", country: "Nigeria", currency: "NGN", amount: 700, reason: "Duplicate charge", initiatedBy: "Passenger App", approvedBy: "—", status: "Pending" },
  { id: "RFD-2202", txnId: "TXN-88190", country: "Kenya", currency: "KES", amount: 80, reason: "Trip cancelled by operator", initiatedBy: "Ops Admin", approvedBy: "F. Wanjiru", status: "Approved" },
  { id: "RFD-2203", txnId: "TXN-88104", country: "Nigeria", currency: "NGN", amount: 500, reason: "Incorrect fare applied", initiatedBy: "Support Agent", approvedBy: "—", status: "Rejected" },
]

export type FraudFlag = {
  operator: string
  trigger: string
  fraudRisk: number
  complianceScore: number
  deviceIntegrity: number
  severity: "Low" | "Medium" | "High" | "Critical"
}

export const fraudFlags: FraudFlag[] = [
  { operator: "AbujaLink", trigger: "Excessive duplicate QR scans on BUS-007", fraudRisk: 82, complianceScore: 41, deviceIntegrity: 38, severity: "Critical" },
  { operator: "Nairobi Metro", trigger: "Abnormal offline validation spike on DEV-2091", fraudRisk: 38, complianceScore: 74, deviceIntegrity: 61, severity: "Medium" },
  { operator: "LagRide Transit", trigger: "High refund rate on route Yaba → Ikorodu", fraudRisk: 21, complianceScore: 88, deviceIntegrity: 90, severity: "Low" },
]

export type AuditEntry = {
  id: string
  timestamp: string
  admin: string
  country: string
  operator: string
  actionType: string
  detail: string
}

export const auditLog: AuditEntry[] = [
  { id: "AUD-9001", timestamp: "2026-08-17 07:40", admin: "O. Fashola", country: "Nigeria", operator: "—", actionType: "Fee Structure Change", detail: "FEE-NG-001 commission 7% → 8%" },
  { id: "AUD-9002", timestamp: "2026-08-17 06:55", admin: "F. Wanjiru", country: "Kenya", operator: "Nairobi Metro", actionType: "Refund Approved", detail: "RFD-2202 approved (KES 80)" },
  { id: "AUD-9003", timestamp: "2026-08-16 22:10", admin: "System (FX Sync)", country: "—", operator: "—", actionType: "FX Rate Changed", detail: "NGN/USD 0.00061 → 0.00062" },
  { id: "AUD-9004", timestamp: "2026-08-16 18:02", admin: "O. Fashola", country: "Nigeria", operator: "AbujaLink", actionType: "Settlement Approved", detail: "STL-4473 approved for payout" },
  { id: "AUD-9005", timestamp: "2026-08-16 14:37", admin: "O. Fashola", country: "Nigeria", operator: "LagRide Transit", actionType: "Revenue Split Updated", detail: "RS-001 platform share 22% → 20%" },
]

export const countries = ["All Countries", "Nigeria", "Kenya", "Ghana"]
export const currencies = ["All Currencies", "NGN", "KES", "GHS", "USD"]
export const paymentTypes = ["All Types", "AFC QR", "NFC", "POS", "Wallet", "Cash Entry"]
