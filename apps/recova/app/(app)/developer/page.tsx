import { PageHeader } from "@/components/shared/page-header"
import { DeveloperConsole } from "@/components/developer/developer-console"

export default function DeveloperPage() {
  return (
    <>
      <PageHeader
        title="Developer Console"
        description="API reference, sandbox scenario simulator, error codes and webhook verification. Target: one-day integration."
      />
      <div className="px-8 pb-12">
        <DeveloperConsole />
      </div>
    </>
  )
}
