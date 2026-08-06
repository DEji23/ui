import { PageHeader } from "@/components/shared/page-header"
import { OnboardingWorkspace } from "@/components/onboarding/onboarding-workspace"

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>
}) {
  const { org } = await searchParams

  return (
    <>
      <PageHeader
        title="Onboarding"
        description="Sequenced activation for internal staff and external organisations. Compliance first, configuration before activation."
      />
      <div className="px-8 pb-12">
        <OnboardingWorkspace initialOrgId={org} />
      </div>
    </>
  )
}
