import { PageHeader } from "@/components/shared/page-header"
import { LoansTable } from "@/components/loans/loans-table"
import { LoansPageActions } from "@/components/wizards/misc-page-actions"
import { LoanSchedulerKpis } from "@/components/shared/engine-kpis"

export default function LoansPage() {
  return (
    <>
      <PageHeader
        title="Loan Cases"
        description="The loan book with generated repayment schedules. Open a loan for the full customer 360 view."
        actions={<LoansPageActions />}
      />
      <div className="flex flex-col gap-6 px-8 pb-12">
        <LoanSchedulerKpis />
        <LoansTable />
      </div>
    </>
  )
}
