"use client"

import * as React from "react"

import { Button } from "@/registry/new-york-v4/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/registry/new-york-v4/ui/dialog"
import { Separator } from "@/registry/new-york-v4/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york-v4/ui/table"

import { settlements, type Settlement } from "../data"
import { StatusBadge } from "./status-badge"

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}

export function SettlementTab() {
  const [selected, setSelected] = React.useState<Settlement | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Settlement ID</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Cycle</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="text-right">Gross</TableHead>
              <TableHead className="text-right">Platform fee</TableHead>
              <TableHead className="text-right">Compliance cost</TableHead>
              <TableHead className="text-right">Net payout</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settlements.map((s) => (
              <TableRow key={s.id}>
                <TableCell
                  className="cursor-pointer font-mono text-xs underline-offset-4 hover:underline"
                  onClick={() => setSelected(s)}
                >
                  {s.id}
                </TableCell>
                <TableCell>{s.operator}</TableCell>
                <TableCell>{s.cycle}</TableCell>
                <TableCell className="font-mono">{s.currency}</TableCell>
                <TableCell className="text-right tabular-nums">{s.gross.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{s.platformFee.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{s.complianceCost.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums font-medium">{s.netPayout.toLocaleString()}</TableCell>
                <TableCell>
                  <StatusBadge status={s.status} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1.5">
                    <Button variant="outline" size="sm" disabled={s.status !== "Pending"}>
                      Approve
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" disabled={s.status !== "Pending"}>
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selected?.id}</DialogTitle>
            <DialogDescription>{selected?.operator} · {selected?.cycle} cycle</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="grid gap-1">
              <DetailRow label="Linked transactions" value="1,214 transactions" />
              <DetailRow label="Fee structure version used" value="v4" />
              <DetailRow label="FX rate snapshot" value="NGN/USD 0.00062" />
              <DetailRow label="Revenue split applied" value="70 / 20 / 10" />
              <Separator className="my-1" />
              <DetailRow label="Gross" value={`${selected.gross.toLocaleString()} ${selected.currency}`} />
              <DetailRow label="Platform fee" value={`${selected.platformFee.toLocaleString()} ${selected.currency}`} />
              <DetailRow label="Compliance cost" value={`${selected.complianceCost.toLocaleString()} ${selected.currency}`} />
              <DetailRow label="Adjustment entries" value="None" />
              <Separator className="my-1" />
              <DetailRow label="Net payout" value={`${selected.netPayout.toLocaleString()} ${selected.currency}`} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
