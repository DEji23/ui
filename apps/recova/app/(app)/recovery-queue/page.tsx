import { PageHeader } from "@/components/shared/page-header"
import { RecoveryQueue } from "@/components/recovery/recovery-queue"
import { QueuePageActions } from "@/components/wizards/page-actions"

export default function RecoveryQueuePage() {
  return (
    <>
      <PageHeader
        title="Recovery Queue"
        description="Manage borrower recovery activities and recovery attempts."
        actions={<QueuePageActions entity="Recovery cases" />}
      />
      <div className="px-8 pb-12">
        <RecoveryQueue />
      </div>
    </>
  )
}
