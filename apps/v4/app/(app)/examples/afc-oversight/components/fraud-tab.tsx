import { IconAlertTriangle } from "@tabler/icons-react"

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
import { Progress } from "@/registry/new-york-v4/ui/progress"

import { fraudFlags } from "../data"

const SEVERITY_VARIANT: Record<string, "outline" | "secondary" | "destructive"> = {
  Low: "outline",
  Medium: "secondary",
  High: "destructive",
  Critical: "destructive",
}

function ScoreBar({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
  const bad = invert ? value < 50 : value > 50
  return (
    <div className="flex items-center gap-2">
      <span className="w-36 text-xs text-muted-foreground">{label}</span>
      <Progress value={value} className={bad ? "[&>div]:bg-destructive" : "[&>div]:bg-emerald-500"} />
      <span className="w-8 text-right text-xs tabular-nums">{value}</span>
    </div>
  )
}

export function FraudTab() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {fraudFlags.map((flag) => (
        <Card key={flag.operator}>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>{flag.operator}</CardTitle>
                <CardDescription className="mt-1 flex items-start gap-1.5">
                  <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  {flag.trigger}
                </CardDescription>
              </div>
              <Badge variant={SEVERITY_VARIANT[flag.severity]}>{flag.severity}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <ScoreBar label="Fraud risk score" value={flag.fraudRisk} />
            <ScoreBar label="Compliance score" value={flag.complianceScore} invert />
            <ScoreBar label="Device integrity score" value={flag.deviceIntegrity} invert />
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline" size="sm">
              Trigger investigation
            </Button>
            <Button variant="outline" size="sm" className="text-destructive">
              Freeze settlements
            </Button>
            <Button variant="destructive" size="sm">
              Suspend operator
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
