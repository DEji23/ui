import { PageHeader } from "@/components/shared/page-header"
import { ActionQueue } from "@/components/queues/action-queue"

export default function Page() {
  return (
    <>
      <PageHeader title="Mandate Issue Queue" description="Mandates that failed setup, validation or were revoked, with alternate-account recommendations." />
      <div className="px-8 pb-12">
        <ActionQueue type="MANDATE_ISSUE" />
      </div>
    </>
  )
}
