import KeycapPreviewFullClient from "../../../../../../components/gallery/KeycapPreviewFullClient";
import { dashboardIntegrationHub } from "../../../../../../lib/dashboard-app-hubs";

type PageProps = { params: Promise<{ id: string }> };

export default async function IntegrationFullPreviewPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <KeycapPreviewFullClient
      itemId={id}
      entity="integration"
      backHref={dashboardIntegrationHub}
      backAriaLabel="Back to integrations"
      entityNoun="integration"
    />
  );
}
