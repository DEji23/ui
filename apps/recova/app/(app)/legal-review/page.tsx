import { Download, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { LegalModule } from "@/components/escalation/legal-module"

export default function LegalReviewPage() {
  return (
    <>
      <PageHeader
        title="Legal Review"
        description="Track loans escalated to legal, approvals and write-off recommendations."
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
        <LegalModule />
      </div>
    </>
  )
}
