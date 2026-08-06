import { Download, Lock } from "lucide-react"

import { dateTime } from "@/lib/format"
import { AUDIT_EVENTS } from "@/lib/data/operations"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/shared/page-header"

const CATEGORY_TONE = {
  RECOVERY: "brand",
  MANDATE: "info",
  DISPUTE: "purple",
  SYSTEM: "neutral",
  FINANCE: "success",
  ACCESS: "info",
} as const

/**
 * Audit trail.
 * Each row carries actor, timestamp, reason code and the previous/new state —
 * the exact evidence set the PRD requires for a material manual override.
 */
export default function AuditTrailPage() {
  return (
    <>
      <PageHeader
        title="Audit Trail"
        description="Immutable, exportable record of every consent, mandate, debit, retry, escalation and override."
        actions={
          <Button variant="soft" className="h-12 px-5">
            Export Log
            <Download />
          </Button>
        }
      />

      <div className="flex flex-col gap-6 px-8 pb-12">
        <Alert tone="info" title="Append-only">
          Audit entries cannot be edited or deleted. Records are searchable by
          borrower, loan ID, mandate reference, transaction reference, recovery cycle
          and integration rail, and are retained per NDPA, CBN and NIBSS rules.
        </Alert>

        <Card className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Reason Code</TableHead>
                <TableHead>Previous → New</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {AUDIT_EVENTS.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="tabular whitespace-nowrap text-subtle">
                    {dateTime(e.at)}
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-ink">{e.actor}</p>
                    <p className="text-xs text-subtle">{e.actorRole}</p>
                  </TableCell>
                  <TableCell className="max-w-[280px]">{e.action}</TableCell>
                  <TableCell className="text-subtle">{e.subject}</TableCell>
                  <TableCell className="text-subtle">{e.reasonCode ?? "—"}</TableCell>
                  <TableCell className="text-xs text-subtle">
                    {e.previousState ? (
                      <>
                        <span className="line-through">{e.previousState}</span>
                        {" → "}
                        <span className="font-semibold text-ink">{e.newState}</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge tone={CATEGORY_TONE[e.category]}>{e.category}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <p className="mt-6 flex items-center gap-2 text-xs text-subtle">
            <Lock className="size-4" />
            Sensitive fields (BVN, account numbers, tokens) are masked in this view and
            in every export.
          </p>
        </Card>
      </div>
    </>
  )
}
