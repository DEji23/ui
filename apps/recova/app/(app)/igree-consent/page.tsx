import { PageHeader } from "@/components/shared/page-header"
import { ConsentModule } from "@/components/consent/consent-module"
import { ConsentPageActions } from "@/components/wizards/page-actions"

export default function IGreeConsentPage() {
  return (
    <>
      <PageHeader
        title="iGree Consent Management"
        description="Manage borrower identity verification and consent records before mandate creation."
        actions={<ConsentPageActions />}
      />
      <div className="px-8 pb-12">
        <ConsentModule />
      </div>
    </>
  )
}
