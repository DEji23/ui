import { PageHeader } from "@/components/shared/page-header"
import { ActionQueue } from "@/components/queues/action-queue"

export default function Page() {
  return (
    <>
      <PageHeader title="Reconciliation Exception Queue" description="Unmatched, duplicate and reversed transactions requiring finance investigation." />
      <div className="px-8 pb-12">
        <ActionQueue type="RECONCILIATION_EXCEPTION" />
      </div>
    </>
  )
}
