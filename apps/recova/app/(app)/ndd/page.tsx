import { PageHeader } from "@/components/shared/page-header"
import { MandateModule } from "@/components/mandates/mandate-module"
import { RailHealthStrip } from "@/components/rails/rail-health-strip"
import { QueuePageActions } from "@/components/wizards/page-actions"

export default function NddPage() {
  return (
    <>
      <PageHeader
        title="NIBSS Direct Debit"
        description="Monitor NDD mandates, approvals and recurring debit authority."
        actions={<QueuePageActions entity="NDD mandates" />}
      />
      <div className="flex flex-col gap-6 px-8 pb-12">
        <RailHealthStrip rail="NDD" />
        <MandateModule rail="NDD" emptyTitle="No NDD mandate found." />
      </div>
    </>
  )
}
