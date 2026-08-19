import { PageHeader } from "@/components/shared/page-header"
import { LegalModule } from "@/components/escalation/legal-module"
import { QueuePageActions } from "@/components/wizards/page-actions"

export default function LegalReviewPage() {
  return (
    <>
      <PageHeader
        title="Legal Review"
        description="Track loans escalated to legal, approvals and write-off recommendations."
        actions={<QueuePageActions entity="Legal cases" exportLabel="Export Logs" />}
      />
      <div className="px-8 pb-12">
        <LegalModule />
      </div>
    </>
  )
}
