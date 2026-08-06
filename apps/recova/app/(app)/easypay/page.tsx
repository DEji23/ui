import { PageHeader } from "@/components/shared/page-header"
import { EasyPayModule } from "@/components/rails/easypay-module"
import { RailHealthStrip } from "@/components/rails/rail-health-strip"
import { QueuePageActions } from "@/components/wizards/page-actions"

export default function EasyPayPage() {
  return (
    <>
      <PageHeader
        title="EasyPay"
        description="Monitor fallback recovery attempts executed through EasyPay."
        actions={<QueuePageActions entity="EasyPay attempts" exportLabel="Export Logs" />}
      />
      <div className="flex flex-col gap-6 px-8 pb-12">
        <RailHealthStrip rail="EASY_PAY" />
        <EasyPayModule />
      </div>
    </>
  )
}
