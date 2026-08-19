import { PageHeader } from "@/components/shared/page-header"
import { ActionQueue } from "@/components/queues/action-queue"

export default function Page() {
  return (
    <>
      <PageHeader title="Dispute Queue" description="Borrower disputes and bank indemnity claims. Recovery is paused on every open case." />
      <div className="px-8 pb-12">
        <ActionQueue type="DISPUTE" />
      </div>
    </>
  )
}
