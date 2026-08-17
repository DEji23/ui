import { Separator } from "@/registry/new-york-v4/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/new-york-v4/ui/tabs"

import { AuditLogTab } from "./components/audit-log-tab"
import { FraudTab } from "./components/fraud-tab"
import { FxReconciliationTab } from "./components/fx-reconciliation-tab"
import { OverviewTab } from "./components/overview-tab"
import { RefundsTab } from "./components/refunds-tab"
import { RevenueFeeTab } from "./components/revenue-fee-tab"
import { RevenueSplitTab } from "./components/revenue-split-tab"
import { SettlementTab } from "./components/settlement-tab"
import { TransactionsTab } from "./components/transactions-tab"
import { ValidationTab } from "./components/validation-tab"

const TABS = [
  { value: "overview", label: "Overview", content: <OverviewTab /> },
  { value: "transactions", label: "Transactions Monitor", content: <TransactionsTab /> },
  { value: "validation", label: "Validation Monitor", content: <ValidationTab /> },
  { value: "revenue-fee", label: "Revenue & Fee Engine", content: <RevenueFeeTab /> },
  { value: "fx", label: "Multi-Currency Reconciliation", content: <FxReconciliationTab /> },
  { value: "revenue-split", label: "Revenue Split Management", content: <RevenueSplitTab /> },
  { value: "settlement", label: "Settlement Supervision", content: <SettlementTab /> },
  { value: "refunds", label: "Refunds & Adjustments", content: <RefundsTab /> },
  { value: "fraud", label: "Fraud & Exceptions", content: <FraudTab /> },
  { value: "audit", label: "Audit & Compliance Log", content: <AuditLogTab /> },
]

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <p className="text-sm text-muted-foreground">Platform Admin</p>
        <h1 className="text-2xl font-semibold tracking-tight">AFC Oversight</h1>
        <p className="text-sm text-muted-foreground">
          Automated Fare Collection Supervision — multi-country, multi-currency, revenue-split enabled
        </p>
      </div>
      <Separator />
      <Tabs defaultValue="overview">
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-muted"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
