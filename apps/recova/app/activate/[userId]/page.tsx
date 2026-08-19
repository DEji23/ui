import { USERS } from "@/lib/data/users"
import { ActivationFlow } from "@/components/activation/activation-flow"

export function generateStaticParams() {
  return USERS.map((u) => ({ userId: u.id }))
}

/**
 * Account-activation landing page — Phase 2 of Internal Staff Onboarding.
 * Reached from the activation-email link a new hire receives after Phase 1.
 * Deliberately outside the (app) route group: an unactivated staff member
 * has no business seeing the authenticated sidebar shell.
 *
 * The user lookup itself lives in the client component, not here — this is
 * a server component, and a user invited via the client-side InviteUserDialog
 * only exists in the browser's copy of lib/data/users.ts's USERS array,
 * never the server's. Looking them up here would 404 anyone invited after
 * the server started.
 */
export default async function ActivatePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  return <ActivationFlow userId={userId} />
}
