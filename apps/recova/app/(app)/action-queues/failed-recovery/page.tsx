import { PageHeader } from "@/components/shared/page-header"
import { ActionQueue } from "@/components/queues/action-queue"

export default function Page() {
  return (
    <>
      <PageHeader title="Failed Recovery Queue" description="Failed debit attempts with the engine's recommended next action. Retry, reschedule, escalate, pause or assign." />
      <div className="px-8 pb-12">
        <ActionQueue type="FAILED_RECOVERY" />
      </div>
    </>
  )
}
