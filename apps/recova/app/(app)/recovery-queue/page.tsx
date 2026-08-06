import { Download, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { RecoveryQueue } from "@/components/recovery/recovery-queue"

export default function RecoveryQueuePage() {
  return (
    <>
      <PageHeader
        title="Recovery Queue"
        description="Manage borrower recovery activities and recovery attempts."
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
      <div className="px-8 pb-12">
        <RecoveryQueue />
      </div>
    </>
  )
}
