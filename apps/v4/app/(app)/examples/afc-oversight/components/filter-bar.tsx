"use client"

import { Button } from "@/registry/new-york-v4/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york-v4/ui/select"

import { countries, currencies, paymentTypes } from "../data"

export function FilterBar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select defaultValue={countries[0]}>
        <SelectTrigger size="sm" className="w-40">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          {countries.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select defaultValue="All Operators">
        <SelectTrigger size="sm" className="w-40">
          <SelectValue placeholder="Operator" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All Operators">All Operators</SelectItem>
          <SelectItem value="LagRide Transit">LagRide Transit</SelectItem>
          <SelectItem value="Nairobi Metro">Nairobi Metro</SelectItem>
          <SelectItem value="AbujaLink">AbujaLink</SelectItem>
          <SelectItem value="Accra Fast Transit">Accra Fast Transit</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue={currencies[0]}>
        <SelectTrigger size="sm" className="w-36">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select defaultValue={paymentTypes[0]}>
        <SelectTrigger size="sm" className="w-40">
          <SelectValue placeholder="Payment type" />
        </SelectTrigger>
        <SelectContent>
          {paymentTypes.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm">
        Last 24 hours
      </Button>
      <Button variant="ghost" size="sm" className="text-muted-foreground">
        Reset filters
      </Button>
    </div>
  )
}
