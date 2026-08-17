"use client"

import * as React from "react"
import { IconDownload, IconSearch } from "@tabler/icons-react"

import { Button } from "@/registry/new-york-v4/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/registry/new-york-v4/ui/dialog"
import { Input } from "@/registry/new-york-v4/ui/input"
import { Separator } from "@/registry/new-york-v4/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york-v4/ui/table"

import { transactions, type Transaction } from "../data"
import { FilterBar } from "./filter-bar"
import { StatusBadge } from "./status-badge"

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}

function TransactionDetail({ txn }: { txn: Transaction }) {
  return (
    <div className="grid gap-4">
      <div>
        <h4 className="mb-1 text-sm font-medium">Trip data</h4>
        <DetailRow label="Route" value={txn.route} />
        <DetailRow label="Bus" value={txn.bus} />
        <DetailRow label="Driver" value={txn.driver} />
        <DetailRow label="GPS validation" value="Matched boarding stop" />
      </div>
      <Separator />
      <div>
        <h4 className="mb-1 text-sm font-medium">Financial breakdown</h4>
        <DetailRow label="Fare amount" value={`${txn.fareAmount.toLocaleString()} ${txn.currency}`} />
        <DetailRow label="Platform fee" value={`${txn.platformFee.toLocaleString()} ${txn.currency}`} />
        <DetailRow label="Compliance levy" value={`${txn.complianceCost.toLocaleString()} ${txn.currency}`} />
        <DetailRow label="Net operator amount" value={`${txn.netRevenue.toLocaleString()} ${txn.currency}`} />
      </div>
      <Separator />
      <div>
        <h4 className="mb-1 text-sm font-medium">Technical metadata</h4>
        <DetailRow label="AFC device ID" value={txn.deviceId} />
        <DetailRow label="Validation timestamp" value={txn.timestamp} />
        <DetailRow label="Sync status" value={<StatusBadge status={txn.syncStatus} />} />
        <DetailRow label="Payment gateway reference" value={txn.gatewayRef} />
        <DetailRow label="Hybrid payment" value={txn.hybrid ? "Yes" : "No"} />
      </div>
      <Separator />
      <div>
        <h4 className="mb-1 text-sm font-medium">Audit trail</h4>
        <DetailRow label="Created at" value={txn.timestamp} />
        <DetailRow label="Modified at" value={txn.timestamp} />
        <DetailRow label="Refund events" value={txn.status === "Refunded" ? "1 refund" : "None"} />
      </div>
    </div>
  )
}

export function TransactionsTab() {
  const [selected, setSelected] = React.useState<Transaction | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterBar />
        <div className="flex items-center gap-2">
          <div className="relative">
            <IconSearch className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search transaction ID" className="w-56 pl-8" />
          </div>
          <Button variant="outline" size="sm">
            <IconDownload />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Payment type</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="text-right">Fare</TableHead>
              <TableHead className="text-right">Platform fee</TableHead>
              <TableHead className="text-right">Net revenue</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn) => (
              <TableRow
                key={txn.id}
                className="cursor-pointer"
                onClick={() => setSelected(txn)}
              >
                <TableCell className="font-mono text-xs">{txn.id}</TableCell>
                <TableCell className="text-muted-foreground">{txn.timestamp}</TableCell>
                <TableCell>{txn.operator}</TableCell>
                <TableCell>{txn.route}</TableCell>
                <TableCell>{txn.paymentType}</TableCell>
                <TableCell className="font-mono">{txn.currency}</TableCell>
                <TableCell className="text-right tabular-nums">{txn.fareAmount.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{txn.platformFee.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{txn.netRevenue.toLocaleString()}</TableCell>
                <TableCell>
                  <StatusBadge status={txn.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.id}</DialogTitle>
            <DialogDescription>
              {selected?.operator} · {selected?.timestamp}
            </DialogDescription>
          </DialogHeader>
          {selected && <TransactionDetail txn={selected} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
