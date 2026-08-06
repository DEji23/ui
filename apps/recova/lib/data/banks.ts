/** NIBSS institution codes for the banks used across the seed data. */
export interface Bank {
  code: string
  name: string
  short: string
  supportsNdd: boolean
  nddSuccessRate: number
  remitaSuccessRate: number
}

export const BANKS: Bank[] = [
  { code: "058", name: "Guaranty Trust Bank", short: "GTB", supportsNdd: true, nddSuccessRate: 0.86, remitaSuccessRate: 0.71 },
  { code: "044", name: "Access Bank", short: "Access", supportsNdd: true, nddSuccessRate: 0.79, remitaSuccessRate: 0.74 },
  { code: "057", name: "Zenith Bank", short: "Zenith", supportsNdd: true, nddSuccessRate: 0.83, remitaSuccessRate: 0.69 },
  { code: "011", name: "First Bank of Nigeria", short: "FirstBank", supportsNdd: true, nddSuccessRate: 0.72, remitaSuccessRate: 0.77 },
  { code: "033", name: "United Bank for Africa", short: "UBA", supportsNdd: true, nddSuccessRate: 0.75, remitaSuccessRate: 0.7 },
  { code: "070", name: "Fidelity Bank", short: "Fidelity", supportsNdd: false, nddSuccessRate: 0.41, remitaSuccessRate: 0.73 },
  { code: "232", name: "Sterling Bank", short: "Sterling", supportsNdd: true, nddSuccessRate: 0.68, remitaSuccessRate: 0.66 },
  { code: "566", name: "VFD Microfinance Bank", short: "VFD MFB", supportsNdd: true, nddSuccessRate: 0.91, remitaSuccessRate: 0.8 },
]

export function bankByCode(code: string): Bank {
  return BANKS.find((b) => b.code === code) ?? BANKS[0]
}
