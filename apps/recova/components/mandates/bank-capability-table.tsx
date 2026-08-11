import { BANKS } from "@/lib/data/banks"
import { percent } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/**
 * Bank capability registry — Mandate Orchestration PRD §5:
 * "IF bank supports NDD reliably: use NDD. ELSE: fallback to REMITA."
 * This is the BankCapability table that decision reads from; it's shown
 * here so an operator can see why the wizard routed a mandate the way it did.
 */
export function BankCapabilityTable() {
  const sorted = [...BANKS].sort((a, b) => b.nddSuccessRate - a.nddSuccessRate)

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4">
        <div>
          <CardTitle>Bank Capabilities</CardTitle>
          <CardDescription>
            Provider selection reads this table — NDD is used only where it&apos;s reliable,
            otherwise mandate creation falls back to Remita
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Bank</TableHead>
              <TableHead>NDD Support</TableHead>
              <TableHead>NDD Success Rate</TableHead>
              <TableHead>Remita Success Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((bank) => (
              <TableRow key={bank.code}>
                <TableCell className="font-semibold text-ink">{bank.name}</TableCell>
                <TableCell>
                  <Badge dot tone={bank.supportsNdd ? "success" : "error"}>
                    {bank.supportsNdd ? "Supported" : "Unreliable"}
                  </Badge>
                </TableCell>
                <TableCell className="tabular">
                  <span
                    className={
                      bank.supportsNdd
                        ? "font-semibold text-ink"
                        : "text-subtle line-through"
                    }
                  >
                    {percent(bank.nddSuccessRate * 100, 0)}
                  </span>
                </TableCell>
                <TableCell className="tabular text-subtle">
                  {percent(bank.remitaSuccessRate * 100, 0)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
