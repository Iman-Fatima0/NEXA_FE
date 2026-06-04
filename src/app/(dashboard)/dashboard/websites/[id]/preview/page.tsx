import KeycapPreviewFullClient from "../../../../../../components/gallery/KeycapPreviewFullClient";
import { dashboardWebsiteHub } from "../../../../../../lib/dashboard-app-hubs";

type PageProps = { params: Promise<{ id: string }> };

export default async function WebsiteFullPreviewPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <KeycapPreviewFullClient
      itemId={id}
      entity="website"
      backHref={dashboardWebsiteHub}
      backAriaLabel="Back to sites"
      entityNoun="site"
    />
  );
}
