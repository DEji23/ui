import { PageHeader } from "@/components/shared/page-header"
import { LoansTable } from "@/components/loans/loans-table"
import { LoansPageActions } from "@/components/wizards/misc-page-actions"

export default function LoansPage() {
  return (
    <>
      <PageHeader
        title="Loan Cases"
        description="The loan book with generated repayment schedules. Open a loan for the full customer 360 view."
        actions={<LoansPageActions />}
      />
      <div className="px-8 pb-12">
        <LoansTable />
      </div>
    </>
  )
}
