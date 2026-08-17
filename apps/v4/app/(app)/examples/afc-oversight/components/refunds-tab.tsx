import { IconPlus } from "@tabler/icons-react"

import { Button } from "@/registry/new-york-v4/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york-v4/ui/table"

import { refunds } from "../data"
import { StatusBadge } from "./status-badge"

export function RefundsTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm">
          <IconPlus />
          Manual adjustment
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Refund ID</TableHead>
              <TableHead>Linked transaction</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Initiated by</TableHead>
              <TableHead>Approved by</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {refunds.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.id}</TableCell>
                <TableCell className="font-mono text-xs">{r.txnId}</TableCell>
                <TableCell>{r.country}</TableCell>
                <TableCell className="font-mono">{r.currency}</TableCell>
                <TableCell className="text-right tabular-nums">{r.amount.toLocaleString()}</TableCell>
                <TableCell className="max-w-48 truncate">{r.reason}</TableCell>
                <TableCell className="text-muted-foreground">{r.initiatedBy}</TableCell>
                <TableCell className="text-muted-foreground">{r.approvedBy}</TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1.5">
                    <Button variant="outline" size="sm" disabled={r.status !== "Pending"}>
                      Force refund
                    </Button>
                    <Button variant="ghost" size="sm" disabled={r.status !== "Pending"}>
                      Partial
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
