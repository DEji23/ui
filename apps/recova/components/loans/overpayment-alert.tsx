"use client"

import * as React from "react"
import { CornerDownRight, Wallet } from "lucide-react"

import { naira } from "@/lib/format"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ResultDialog } from "@/components/queues/action-dialogs"

/** LMS-08 — overpayment handling: the borrower paid more than was owed. */
export function OverpaymentAlert({
  amount,
  customerName,
}: {
  amount: number
  customerName: string
}) {
  const [result, setResult] = React.useState<{ title: string; message: string } | null>(
    null
  )

  return (
    <>
      <Alert tone="warning" title="Overpayment on this loan">
        <div className="flex flex-col gap-3">
          <p>
            {customerName} has paid {naira(amount)} more than every scheduled obligation
            requires. Every obligation is marked PAID and is never rewritten — this
            excess needs an explicit disposition.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="soft"
              size="sm"
              onClick={() =>
                setResult({
                  title: "Overpayment refunded",
                  message: `${naira(amount)} has been queued for refund to ${customerName}'s primary linked account, referencing this loan. Written to the ledger as a REFUND entry.`,
                })
              }
            >
              <Wallet className="size-3.5" />
              Refund {naira(amount)}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setResult({
                  title: "Overpayment carried forward",
                  message: `${naira(amount)} is held as a credit balance and will be applied automatically against ${customerName}'s next originated loan.`,
                })
              }
            >
              <CornerDownRight className="size-3.5" />
              Carry Forward to Next Loan
            </Button>
          </div>
        </div>
      </Alert>

      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}
