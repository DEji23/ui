import { Download, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { EasyPayModule } from "@/components/rails/easypay-module"
import { RailHealthStrip } from "@/components/rails/rail-health-strip"

export default function EasyPayPage() {
  return (
    <>
      <PageHeader
        title="EasyPay"
        description="Monitor fallback recovery attempts executed through EasyPay."
        actions={
          <>
            <Button variant="soft" className="h-12 px-5">
              Export Logs
              <Download />
            </Button>
            <Button variant="primary" className="h-12 px-5">
              Sync
              <RefreshCw />
            </Button>
          </>
        }
      />
      <div className="flex flex-col gap-6 px-8 pb-12">
        <RailHealthStrip rail="EASY_PAY" />
        <EasyPayModule />
      </div>
    </>
  )
}
