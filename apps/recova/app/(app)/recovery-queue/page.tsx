import { PageHeader } from "@/components/shared/page-header"
import { RecoveryQueue } from "@/components/recovery/recovery-queue"
import { QueuePageActions } from "@/components/wizards/page-actions"
import { RecoveryOrchestrationEngineKpis, RiskDecisionEngineKpis } from "@/components/shared/engine-kpis"

export default function RecoveryQueuePage() {
  return (
    <>
      <PageHeader
        title="Recovery Queue"
        description="Manage borrower recovery activities and recovery attempts."
        actions={<QueuePageActions entity="Recovery cases" />}
      />
      <div className="flex flex-col gap-6 px-8 pb-6">
        <RiskDecisionEngineKpis />
        <RecoveryOrchestrationEngineKpis />
      </div>
      <div className="px-8 pb-12">
        <RecoveryQueue />
      </div>
    </>
  )
}
