import { redirect } from "next/navigation"

/** Exception handling lives inside the reconciliation workspace. */
export default function ExceptionQueuePage() {
  redirect("/reconciliation")
}
