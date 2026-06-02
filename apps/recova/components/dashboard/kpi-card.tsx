import { type ReactNode } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  icon: ReactNode
  iconColor?: string
  description?: string
  suffix?: string
  variant?: "default" | "success" | "warning" | "destructive"
}

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconColor = "text-primary",
  description,
  suffix,
  variant = "default",
}: KPICardProps) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const isNeutral = change === 0

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground truncate">
              {title}
            </p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {value}
              </span>
              {suffix && (
                <span className="text-sm text-muted-foreground">{suffix}</span>
              )}
            </div>

            {change !== undefined && (
              <div className="mt-2 flex items-center gap-1.5">
                <div
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-medium",
                    isPositive && "text-emerald-600 dark:text-emerald-400",
                    isNegative && "text-red-600 dark:text-red-400",
                    isNeutral && "text-muted-foreground"
                  )}
                >
                  {isPositive && <TrendingUp className="h-3 w-3" />}
                  {isNegative && <TrendingDown className="h-3 w-3" />}
                  {isNeutral && <Minus className="h-3 w-3" />}
                  <span>{isPositive ? "+" : ""}{change}%</span>
                </div>
                {changeLabel && (
                  <span className="text-xs text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}

            {description && !change && (
              <p className="mt-2 text-xs text-muted-foreground">{description}</p>
            )}
          </div>

          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              variant === "default" && "bg-primary/10",
              variant === "success" && "bg-emerald-500/10",
              variant === "warning" && "bg-amber-500/10",
              variant === "destructive" && "bg-red-500/10",
            )}
          >
            <span className={cn("h-5 w-5", iconColor)}>{icon}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
