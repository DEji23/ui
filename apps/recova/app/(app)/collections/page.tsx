import { PageHeader } from "@/components/shared/page-header"
import { CollectionsModule } from "@/components/escalation/collections-module"
import { QueuePageActions } from "@/components/wizards/page-actions"

export default function CollectionsPage() {
  return (
    <>
      <PageHeader
        title="Collections"
        description="Work Tier 3 cases, negotiate payment plans and track agent ownership."
        actions={<QueuePageActions entity="Collections cases" exportLabel="Export Logs" />}
      />
      <div className="px-8 pb-12">
        <CollectionsModule />
      </div>
    </>
  )
}
