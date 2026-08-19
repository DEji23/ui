import type { Role } from "@/lib/domain/rbac"

/**
 * Internal staff directory.
 *
 * Status follows the PRD's 4-phase onboarding vocabulary
 * (lib/domain/onboarding.ts INTERNAL_PHASE_STATUS) rather than a generic
 * Active/Invited pair, so the Users table and the activation flow always
 * agree on what state a staff member is actually in.
 */
export type AppUserStatus =
  | "Invitation Sent"
  | "Account Activated"
  | "Role Provisioned"
  | "Ready for Operations"
  | "Offboarded"

export interface AppUser {
  id: string
  name: string
  email: string
  businessUnit: string
  role: Role
  status: AppUserStatus
  mfa: boolean
  /** Cleared once the user sets their own password during activation. */
  tempPassword: string | null
}

export const BUSINESS_UNITS = [
  "Recovery Operations",
  "Finance & Ops",
  "Compliance",
  "Legal",
  "Customer Support",
  "Technology Operations",
  "Platform Administration",
] as const

export const USERS: AppUser[] = [
  { id: "usr_001", name: "Adaora Nwosu", email: "adaora.nwosu@vfdmfb.com", businessUnit: "Recovery Operations", role: "DRM", status: "Ready for Operations", mfa: true, tempPassword: null },
  { id: "usr_002", name: "Chidi Okeke", email: "chidi.okeke@vfdmfb.com", businessUnit: "Recovery Operations", role: "DRO", status: "Ready for Operations", mfa: true, tempPassword: null },
  { id: "usr_003", name: "Fatima Bello", email: "fatima.bello@vfdmfb.com", businessUnit: "Recovery Operations", role: "DRO", status: "Ready for Operations", mfa: true, tempPassword: null },
  { id: "usr_004", name: "Ibrahim Musa", email: "ibrahim.musa@vfdmfb.com", businessUnit: "Finance & Ops", role: "FINANCE", status: "Ready for Operations", mfa: true, tempPassword: null },
  { id: "usr_005", name: "Sarah Okonkwo", email: "sarah.okonkwo@vfdmfb.com", businessUnit: "Legal", role: "LEGAL", status: "Ready for Operations", mfa: true, tempPassword: null },
  { id: "usr_006", name: "John Okeke", email: "john.okeke@vfdmfb.com", businessUnit: "Legal", role: "LEGAL", status: "Invitation Sent", mfa: false, tempPassword: "Juniper482!" },
  { id: "usr_007", name: "Tobi Adeleke", email: "tobi.adeleke@vfdmfb.com", businessUnit: "Platform Administration", role: "ADMIN", status: "Ready for Operations", mfa: true, tempPassword: null },
  { id: "usr_008", name: "partner-api", email: "integrations@lender.ng", businessUnit: "Technology Operations", role: "INTEGRATOR", status: "Ready for Operations", mfa: false, tempPassword: null },
]

const TEMP_PASSWORD_WORDS = [
  "Amber", "Cobalt", "Delta", "Ember", "Falcon", "Granite", "Harbor", "Indigo", "Juniper", "Kestrel",
]

let sequence = USERS.length

function generateTempPassword(): string {
  sequence += 1
  const word = TEMP_PASSWORD_WORDS[sequence % TEMP_PASSWORD_WORDS.length]
  const digits = String(100 + ((sequence * 37) % 900))
  return `${word}${digits}!`
}

/** Phase 1 (User Invitation): creates the profile and generates the
 *  temporary password the activation flow will ask for. */
export function addUser(input: {
  name: string
  email: string
  businessUnit: string
  role: Role
}): AppUser {
  const user: AppUser = {
    id: `usr_${String(sequence + 1).padStart(3, "0")}`,
    ...input,
    status: "Invitation Sent",
    mfa: false,
    tempPassword: generateTempPassword(),
  }
  USERS.push(user)
  return user
}

export function userById(id: string): AppUser | undefined {
  return USERS.find((u) => u.id === id)
}

export function updateUser(id: string, patch: Partial<AppUser>): AppUser | undefined {
  const index = USERS.findIndex((u) => u.id === id)
  if (index === -1) return undefined
  USERS[index] = { ...USERS[index], ...patch }
  return USERS[index]
}
