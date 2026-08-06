import { Download, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { MandateModule } from "@/components/mandates/mandate-module"
import { RailHealthStrip } from "@/components/rails/rail-health-strip"

export default function RemitaPage() {
  return (
    <>
      <PageHeader
        title="Remita Direct Debit"
        description="Monitor Remita mandates and the alternate direct debit rail."
        actions={
          <>
            <Button variant="soft" className="h-12 px-5">
              Export Records
              <Download />
            </Button>
            <Button variant="primary" className="h-12 px-5">
              Sync
              <RefreshCw />
            </Button>
          </>
        }
      />
      <div className="flex flex-col gap-6 px-8 pb-12">
        <RailHealthStrip rail="REMITA" />
        <MandateModule rail="REMITA" emptyTitle="No Remita mandate found." />
      </div>
    </>
  )
}
