"use client"

import * as React from "react"
import { Download, Plus, RefreshCw, ShieldCheck } from "lucide-react"

import { can } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import { Button } from "@/components/ui/button"
import { ResultDialog } from "@/components/queues/action-dialogs"
import { CreateMandateDialog } from "./create-mandate-dialog"
import { InitiateVerificationDialog } from "./initiate-verification-dialog"

/** Export and Sync are real actions everywhere, so they share one implementation. */
function useExportSync(entity: string) {
  const [result, setResult] = React.useState<{ title: string; message: string } | null>(
    null
  )
  const exportRecords = () =>
    setResult({
      title: "Export queued",
      message: `${entity} export queued for generation. Sensitive fields (BVN, account numbers, tokens) are masked. You will be notified when the file is ready to download.`,
    })
  const sync = () =>
    setResult({
      title: "Sync started",
      message: `Pulling the latest ${entity.toLowerCase()} state from the loan service and the rails. Mandate polling and webhook events are merged, with the later timestamp winning on conflict.`,
    })
  return { result, setResult, exportRecords, sync }
}

export function ConsentPageActions() {
  const [open, setOpen] = React.useState(false)
  const { result, setResult, exportRecords } = useExportSync("Consent records")
  const mayCreate = can(CURRENT_USER.role, "recovery.create_customer")

  return (
    <>
      <Button variant="soft" className="h-12 px-5" onClick={exportRecords}>
        Export Records
        <Download />
      </Button>
      <Button
        variant="primary"
        className="h-12 px-5"
        disabled={!mayCreate}
        title={mayCreate ? undefined : "Requires recovery.create_customer."}
        onClick={() => setOpen(true)}
      >
        Initiate Verification
        <ShieldCheck />
      </Button>

      <InitiateVerificationDialog open={open} onOpenChange={setOpen} />
      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}

export function MandatePageActions({ showCreate = true }: { showCreate?: boolean }) {
  const [open, setOpen] = React.useState(false)
  const { result, setResult, exportRecords, sync } = useExportSync("Mandate records")
  const mayCreate = can(CURRENT_USER.role, "mandate.create")

  return (
    <>
      <Button variant="soft" className="h-12 px-5" onClick={exportRecords}>
        Export Records
        <Download />
      </Button>
      {showCreate ? (
        <Button
          variant="primary"
          className="h-12 px-5"
          disabled={!mayCreate}
          title={mayCreate ? undefined : "Requires mandate.create."}
          onClick={() => setOpen(true)}
        >
          Create Mandate
          <Plus />
        </Button>
      ) : (
        <Button variant="primary" className="h-12 px-5" onClick={sync}>
          Sync
          <RefreshCw />
        </Button>
      )}

      <CreateMandateDialog open={open} onOpenChange={setOpen} />
      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}

export function QueuePageActions({
  entity,
  exportLabel = "Export Records",
}: {
  entity: string
  exportLabel?: string
}) {
  const { result, setResult, exportRecords, sync } = useExportSync(entity)

  return (
    <>
      <Button variant="soft" className="h-12 px-5" onClick={exportRecords}>
        {exportLabel}
        <Download />
      </Button>
      <Button variant="primary" className="h-12 px-5" onClick={sync}>
        Sync
        <RefreshCw />
      </Button>

      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}
