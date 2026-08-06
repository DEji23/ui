import { PageHeader } from "@/components/shared/page-header"
import { ActionQueue } from "@/components/queues/action-queue"

export default function Page() {
  return (
    <>
      <PageHeader title="Collections Queue" description="Tier 3 and Tier 4 cases assigned to collections agents for negotiation or legal escalation." />
      <div className="px-8 pb-12">
        <ActionQueue type="COLLECTIONS_CASE" />
      </div>
    </>
  )
}
