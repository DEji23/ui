import { PageHeader } from "@/components/shared/page-header"
import { DisputesModule } from "@/components/disputes/disputes-module"
import { QueuePageActions } from "@/components/wizards/page-actions"
import { DisputeIndemnityKpis } from "@/components/shared/engine-kpis"

export default function DisputesPage() {
  return (
    <>
      <PageHeader
        title="Disputes"
        description="Review borrower disputes and bank indemnity claims. Recovery is paused while a dispute is open."
        actions={<QueuePageActions entity="Dispute cases" exportLabel="Export Logs" />}
      />
      <div className="flex flex-col gap-6 px-8 pb-12">
        <DisputeIndemnityKpis />
        <DisputesModule />
      </div>
    </>
  )
}
