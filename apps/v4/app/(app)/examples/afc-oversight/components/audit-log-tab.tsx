"use client"

import { IconLock } from "@tabler/icons-react"

import { Badge } from "@/registry/new-york-v4/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york-v4/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york-v4/ui/table"

import { auditLog } from "../data"

const actionTypes = [
  "All actions",
  "Fee Structure Change",
  "Refund Approved",
  "FX Rate Changed",
  "Settlement Approved",
  "Revenue Split Updated",
]

export function AuditLogTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <IconLock className="size-4" />
          Immutable log — entries cannot be edited or deleted
        </div>
        <Select defaultValue={actionTypes[0]}>
          <SelectTrigger size="sm" className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {actionTypes.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Action type</TableHead>
              <TableHead>Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLog.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-muted-foreground">{entry.timestamp}</TableCell>
                <TableCell>{entry.admin}</TableCell>
                <TableCell>{entry.country}</TableCell>
                <TableCell>{entry.operator}</TableCell>
                <TableCell>
                  <Badge variant="outline">{entry.actionType}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{entry.detail}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
