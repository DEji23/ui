import Link from "next/link"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { MandateModule } from "@/components/mandates/mandate-module"
import { MandatePageActions } from "@/components/wizards/page-actions"
import { BankCapabilityTable } from "@/components/mandates/bank-capability-table"

export default function MandatesPage() {
  return (
    <>
      <PageHeader
        title="Mandates"
        description="Manage active, pending, expired, revoked, and failed borrower mandates."
        actions={
          <>
            <Button variant="outline" className="h-12 px-5" asChild>
              <Link href="/mandate-setup">View Setup Requests</Link>
            </Button>
            <MandatePageActions showCreate={false} />
          </>
        }
      />
      <div className="flex flex-col gap-6 px-8 pb-12">
        <MandateModule />
        <BankCapabilityTable />
      </div>
    </>
  )
}
