import { Download, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { ConsentModule } from "@/components/consent/consent-module"

export default function IGreeConsentPage() {
  return (
    <>
      <PageHeader
        title="iGree Consent Management"
        description="Manage borrower identity verification and consent records before mandate creation."
        actions={
          <>
            <Button variant="soft" className="h-12 px-5">
              Export Records
              <Download />
            </Button>
            <Button variant="primary" className="h-12 px-5">
              Initiate Verification
              <ShieldCheck />
            </Button>
          </>
        }
      />
      <div className="px-8 pb-12">
        <ConsentModule />
      </div>
    </>
  )
}
