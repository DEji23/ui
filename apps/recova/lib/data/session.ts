import { ROLE_LABEL, type Role } from "@/lib/domain/rbac"

/**
 * Signed-in operator.
 *
 * A single seam: swapping this for a real session lookup is the only change
 * needed to move the whole UI onto authenticated identity, because every
 * permission check in the app reads `CURRENT_USER.role`.
 */
export interface SessionUser {
  id: string
  name: string
  initials: string
  role: Role
  roleLabel: string
  email: string
  businessUnit: string
}

const role: Role = "DRM"

export const CURRENT_USER: SessionUser = {
  id: "usr_dro_001",
  name: "Adaora Nwosu",
  initials: "AN",
  role,
  roleLabel: ROLE_LABEL[role],
  email: "adaora.nwosu@vfdmfb.com",
  businessUnit: "Retail Recovery — Lagos",
}

export const ACTIVE_USERS = 1247
