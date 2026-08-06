import Link from "next/link"
import { Download, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { MandateModule } from "@/components/mandates/mandate-module"

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
            <Button variant="soft" className="h-12 px-5">
              Export Records
              <Download />
            </Button>
            <Button variant="primary" className="h-12 px-5">
              Sync
              <RefreshCw />
            </Button>
          </>
        }
      />
      <div className="px-8 pb-12">
        <MandateModule />
      </div>
    </>
  )
}
