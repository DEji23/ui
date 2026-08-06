import { PageHeader } from "@/components/shared/page-header"
import { MandateModule } from "@/components/mandates/mandate-module"
import { RailHealthStrip } from "@/components/rails/rail-health-strip"
import { QueuePageActions } from "@/components/wizards/page-actions"

export default function RemitaPage() {
  return (
    <>
      <PageHeader
        title="Remita Direct Debit"
        description="Monitor Remita mandates and the alternate direct debit rail."
        actions={<QueuePageActions entity="Remita mandates" />}
      />
      <div className="flex flex-col gap-6 px-8 pb-12">
        <RailHealthStrip rail="REMITA" />
        <MandateModule rail="REMITA" emptyTitle="No Remita mandate found." />
      </div>
    </>
  )
}
