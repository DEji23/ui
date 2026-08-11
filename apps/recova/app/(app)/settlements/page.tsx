import { PageHeader } from "@/components/shared/page-header"
import { SettlementsPageActions } from "@/components/wizards/misc-page-actions"
import { SettlementsView } from "@/components/settlements/settlements-view"

export default function SettlementsPage() {
  return (
    <>
      <PageHeader
        title="Settlements"
        description="Immutable double-entry ledger and settlement status across every recovery rail."
        actions={<SettlementsPageActions />}
      />
      <SettlementsView />
    </>
  )
}
