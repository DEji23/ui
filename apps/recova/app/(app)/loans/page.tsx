import { Download, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { LoansTable } from "@/components/loans/loans-table"

export default function LoansPage() {
  return (
    <>
      <PageHeader
        title="Loan Cases"
        description="The loan book with generated repayment schedules. Open a loan for the full customer 360 view."
        actions={
          <>
            <Button variant="soft" className="h-12 px-5">
              Export Book
              <Download />
            </Button>
            <Button variant="primary" className="h-12 px-5">
              Create Loan
              <Plus />
            </Button>
          </>
        }
      />
      <div className="px-8 pb-12">
        <LoansTable />
      </div>
    </>
  )
}
