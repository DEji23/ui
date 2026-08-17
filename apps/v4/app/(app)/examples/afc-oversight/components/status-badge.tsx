import { Badge } from "@/registry/new-york-v4/ui/badge"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Success: "default",
  Paid: "default",
  Approved: "default",
  Online: "default",
  Synced: "default",
  Low: "secondary",
  Pending: "secondary",
  Medium: "secondary",
  Failed: "destructive",
  Rejected: "destructive",
  Offline: "destructive",
  Critical: "destructive",
  High: "destructive",
  Flagged: "outline",
  Refunded: "outline",
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={STATUS_VARIANT[status] ?? "outline"}>{status}</Badge>
}
