import { Download, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { MandateModule } from "@/components/mandates/mandate-module"

export default function MandateSetupPage() {
  return (
    <>
      <PageHeader
        title="Mandate Setup"
        description="Create and manage borrower mandate setup requests."
        actions={
          <>
            <Button variant="soft" className="h-12 px-5">
              Export Records
              <Download />
            </Button>
            <Button variant="primary" className="h-12 px-5">
              Create Mandate
              <Plus />
            </Button>
          </>
        }
      />
      <div className="px-8 pb-12">
        <MandateModule emptyTitle="No mandate setup request found." />
      </div>
    </>
  )
}
