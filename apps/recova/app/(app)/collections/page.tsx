import { Download, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { CollectionsModule } from "@/components/escalation/collections-module"

export default function CollectionsPage() {
  return (
    <>
      <PageHeader
        title="Collections"
        description="Work Tier 3 cases, negotiate payment plans and track agent ownership."
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
        <CollectionsModule />
      </div>
    </>
  )
}
