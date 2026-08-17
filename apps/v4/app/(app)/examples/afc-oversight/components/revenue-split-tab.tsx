"use client"

import * as React from "react"

import { Badge } from "@/registry/new-york-v4/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york-v4/ui/card"
import { Input } from "@/registry/new-york-v4/ui/input"
import { Label } from "@/registry/new-york-v4/ui/label"
import { Separator } from "@/registry/new-york-v4/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york-v4/ui/table"

import { revenueSplits } from "../data"

function SplitSimulator() {
  const [tickets, setTickets] = React.useState(10000)
  const [fare, setFare] = React.useState(3000)
  const operatorPct = 0.7
  const platformPct = 0.2
  const govPct = 0.1

  const total = tickets * fare
  const operator = total * operatorPct
  const platform = total * platformPct
  const gov = total * govPct

  return (
    <Card>
      <CardHeader>
        <CardTitle>Split simulation</CardTitle>
        <CardDescription>70% operator / 20% platform / 10% government levy</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="tickets">Tickets</Label>
          <Input
            id="tickets"
            type="number"
            value={tickets}
            onChange={(e) => setTickets(Number(e.target.value) || 0)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="fare-per-ticket">Fare per ticket (NGN)</Label>
          <Input
            id="fare-per-ticket"
            type="number"
            value={fare}
            onChange={(e) => setFare(Number(e.target.value) || 0)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Separator />
        <div className="flex w-full justify-between text-sm font-semibold">
          <span>Total revenue</span>
          <span className="tabular-nums">₦{total.toLocaleString()}</span>
        </div>
        <div className="flex w-full justify-between text-sm">
          <span className="text-muted-foreground">Operator share (70%)</span>
          <span className="tabular-nums">₦{operator.toLocaleString()}</span>
        </div>
        <div className="flex w-full justify-between text-sm">
          <span className="text-muted-foreground">Platform share (20%)</span>
          <span className="tabular-nums">₦{platform.toLocaleString()}</span>
        </div>
        <div className="flex w-full justify-between text-sm">
          <span className="text-muted-foreground">Compliance / government levy (10%)</span>
          <span className="tabular-nums">₦{gov.toLocaleString()}</span>
        </div>
        <Separator />
        <div className="flex w-full justify-between text-xs text-muted-foreground">
          <span>Net settlement to operator</span>
          <span className="tabular-nums">₦{operator.toLocaleString()}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

export function RevenueSplitTab() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle>Revenue split configurations</CardTitle>
          <CardDescription>Operator, joint-route, investor, and regulatory splits</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Scope</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Operator</TableHead>
                  <TableHead className="text-right">Platform</TableHead>
                  <TableHead className="text-right">Gov levy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenueSplits.map((split) => (
                  <TableRow key={split.id}>
                    <TableCell>{split.scope}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{split.model}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{split.operatorShare}%</TableCell>
                    <TableCell className="text-right tabular-nums">{split.platformShare}%</TableCell>
                    <TableCell className="text-right tabular-nums">{split.govLevy}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="xl:col-span-2">
        <SplitSimulator />
      </div>
    </div>
  )
}
