import { notFound } from "next/navigation";
import KeycapPreviewFullClient from "../../../../../../components/gallery/KeycapPreviewFullClient";
import { fetchIntegrationPreviewServer } from "../../../../../../lib/api/server-screen-fetch";
import { dashboardIntegrationHub } from "../../../../../../lib/dashboard-app-hubs";

type PageProps = { params: Promise<{ id: string }> };

export default async function IntegrationFullPreviewPage({ params }: PageProps) {
  const { id } = await params;
  const screen = await fetchIntegrationPreviewServer(id);
  if (!screen) {
    notFound();
  }
  return (
    <KeycapPreviewFullClient
      itemId={id}
      entity="integration"
      backHref={dashboardIntegrationHub}
      backAriaLabel="Back to integrations"
      entityNoun="integration"
      initialItem={screen.integration}
    />
  );
}
