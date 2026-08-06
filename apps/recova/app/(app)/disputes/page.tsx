import { Download, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { DisputesModule } from "@/components/disputes/disputes-module"

export default function DisputesPage() {
  return (
    <>
      <PageHeader
        title="Disputes"
        description="Review borrower disputes and bank indemnity claims. Recovery is paused while a dispute is open."
        actions={
          <>
            <Button variant="soft" className="h-12 px-5">
              Export Logs
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
        <DisputesModule />
      </div>
    </>
  )
}
