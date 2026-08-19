import { PageHeader } from "@/components/shared/page-header"
import { MandateModule } from "@/components/mandates/mandate-module"
import { MandatePageActions } from "@/components/wizards/page-actions"

export default function MandateSetupPage() {
  return (
    <>
      <PageHeader
        title="Mandate Setup"
        description="Create and manage borrower mandate setup requests."
        actions={<MandatePageActions />}
      />
      <div className="px-8 pb-12">
        <MandateModule emptyTitle="No mandate setup request found." />
      </div>
    </>
  )
}
