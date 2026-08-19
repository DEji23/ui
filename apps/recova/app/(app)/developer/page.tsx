import { PageHeader } from "@/components/shared/page-header"
import { DeveloperConsole } from "@/components/developer/developer-console"
import { DeveloperPlatformKpis } from "@/components/shared/engine-kpis"

export default function DeveloperPage() {
  return (
    <>
      <PageHeader
        title="Developer Console"
        description="API reference, sandbox scenario simulator, error codes and webhook verification. Target: one-day integration."
      />
      <div className="flex flex-col gap-6 px-8 pb-12">
        <DeveloperPlatformKpis />
        <DeveloperConsole />
      </div>
    </>
  )
}
