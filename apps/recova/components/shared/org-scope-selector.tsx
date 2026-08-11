"use client"

import { Building2 } from "lucide-react"

import { ORGANISATIONS } from "@/lib/data/organisations"
import { Select } from "@/components/ui/input"

/**
 * Tenant scope filter.
 *
 * The RBAC PRD requires that "one client cannot access another client's
 * borrowers, mandates, ledgers." This is the visible mechanism for that —
 * every queue that renders cross-tenant data (Loans, Recovery, Mandates,
 * Settlements) mounts one of these so scoping to a single organisation is a
 * real, working filter rather than something only true in the data model.
 */
export function OrgScopeSelector({
  value,
  onValueChange,
}: {
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <div className="relative w-full sm:w-auto sm:min-w-[220px]">
      <Building2 className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <Select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="h-12 rounded-full pl-11"
        aria-label="Filter by organisation"
      >
        <option value="all">All Organisations</option>
        {ORGANISATIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.tradingName}
          </option>
        ))}
      </Select>
    </div>
  )
}
