import KeycapPreviewFullClient from "../../../../../../components/gallery/KeycapPreviewFullClient";
import { dashboardBotHub } from "../../../../../../lib/dashboard-app-hubs";

type PageProps = { params: Promise<{ id: string }> };

export default async function BotFullPreviewPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <KeycapPreviewFullClient
      itemId={id}
      entity="bot"
      backHref={dashboardBotHub}
      backAriaLabel="Back to bots"
      entityNoun="bot"
    />
  );
}
