import { notFound } from "next/navigation";
import KeycapPreviewFullClient from "../../../../../../components/gallery/KeycapPreviewFullClient";
import { fetchBotPreviewServer } from "../../../../../../lib/api/server-screen-fetch";
import { dashboardBotHub } from "../../../../../../lib/dashboard-app-hubs";

type PageProps = { params: Promise<{ id: string }> };

export default async function BotFullPreviewPage({ params }: PageProps) {
  const { id } = await params;
  const item = await fetchBotPreviewServer(id);
  if (!item) {
    notFound();
  }
  return (
    <KeycapPreviewFullClient
      itemId={id}
      entity="bot"
      backHref={dashboardBotHub}
      backAriaLabel="Back to bots"
      entityNoun="bot"
      initialItem={item}
    />
  );
}
