"use client"

import * as React from "react"

import { Badge } from "@/registry/new-york-v4/ui/badge"
import { Button } from "@/registry/new-york-v4/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york-v4/ui/select"
import { Separator } from "@/registry/new-york-v4/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york-v4/ui/table"

import { feeRules } from "../data"

function FeeSimulator() {
  const [fare, setFare] = React.useState(5000)
  const commissionPct = 0.08
  const compliancePct = 0.03
  const taxPct = 0.015
  const gatewayPct = 0.012

  const platformFee = fare * commissionPct
  const complianceCost = fare * compliancePct
  const tax = fare * taxPct
  const gatewayFee = fare * gatewayPct
  const netOperator = fare - platformFee - complianceCost - tax - gatewayFee

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee simulation</CardTitle>
        <CardDescription>
          Preview the active Nigeria · Lagos configuration against a sample fare
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-1.5">
          <Label htmlFor="sample-fare">Sample fare (NGN)</Label>
          <Input
            id="sample-fare"
            type="number"
            value={fare}
            onChange={(e) => setFare(Number(e.target.value) || 0)}
            className="w-40"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Separator />
        {[
          ["Platform commission (8%)", platformFee],
          ["Compliance cost (3%)", complianceCost],
          ["Regulatory tax (1.5%)", tax],
          ["Payment gateway fee (1.2%)", gatewayFee],
        ].map(([label, value]) => (
          <div key={label as string} className="flex w-full justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="tabular-nums">₦{(value as number).toLocaleString()}</span>
          </div>
        ))}
        <Separator />
        <div className="flex w-full justify-between text-sm font-semibold">
          <span>Net operator amount</span>
          <span className="tabular-nums">₦{netOperator.toLocaleString()}</span>
        </div>
        <div className="flex w-full justify-between text-xs text-muted-foreground">
          <span>Settlement amount (T+2)</span>
          <span className="tabular-nums">₦{netOperator.toLocaleString()}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

function FeeConfigForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New fee configuration</CardTitle>
        <CardDescription>Scope to a country, state, operator, or route</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label>Country</Label>
          <Select defaultValue="Nigeria">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nigeria">Nigeria</SelectItem>
              <SelectItem value="Kenya">Kenya</SelectItem>
              <SelectItem value="Ghana">Ghana</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>State (optional)</Label>
          <Input placeholder="e.g. Lagos" />
        </div>
        <div className="grid gap-1.5">
          <Label>Operator (optional)</Label>
          <Input placeholder="e.g. LagRide Transit" />
        </div>
        <div className="grid gap-1.5">
          <Label>Route (optional)</Label>
          <Input placeholder="e.g. Ikeja → CMS" />
        </div>
        <div className="grid gap-1.5">
          <Label>Commission model</Label>
          <Select defaultValue="Percentage">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Percentage">Percentage</SelectItem>
              <SelectItem value="Flat">Flat</SelectItem>
              <SelectItem value="Hybrid">Hybrid (flat + %)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Commission value</Label>
          <Input placeholder="e.g. 8%" />
        </div>
        <div className="grid gap-1.5">
          <Label>Compliance cost</Label>
          <Input placeholder="e.g. 3%" />
        </div>
        <div className="grid gap-1.5">
          <Label>Regulatory tax</Label>
          <Input placeholder="e.g. 1.5%" />
        </div>
        <div className="grid gap-1.5">
          <Label>Payment gateway fee</Label>
          <Input placeholder="e.g. 1.2%" />
        </div>
        <div className="grid gap-1.5">
          <Label>Settlement delay (days)</Label>
          <Input type="number" placeholder="2" />
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Discard</Button>
        <Button>Save as new version</Button>
      </CardFooter>
    </Card>
  )
}

export function RevenueFeeTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <FeeConfigForm />
        <FeeSimulator />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active fee configurations</CardTitle>
          <CardDescription>Versioned per country / state / operator / route scope</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Scope</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Gateway fee</TableHead>
                  <TableHead className="text-right">Settlement</TableHead>
                  <TableHead>Version</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div className="font-medium">{rule.country}</div>
                      <div className="text-xs text-muted-foreground">
                        {[rule.state, rule.operator, rule.route].filter(Boolean).join(" · ") || "All"}
                      </div>
                    </TableCell>
                    <TableCell>{rule.commissionType}</TableCell>
                    <TableCell className="font-mono text-xs">{rule.commissionValue}</TableCell>
                    <TableCell className="font-mono text-xs">{rule.complianceCost}</TableCell>
                    <TableCell className="font-mono text-xs">{rule.regulatoryTax}</TableCell>
                    <TableCell className="font-mono text-xs">{rule.gatewayFee}</TableCell>
                    <TableCell className="text-right tabular-nums">T+{rule.settlementDelayDays}</TableCell>
                    <TableCell>
                      <Badge variant="outline">v{rule.version}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
