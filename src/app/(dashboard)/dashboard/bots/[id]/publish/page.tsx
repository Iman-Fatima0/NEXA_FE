import BotsPublishClient from "./BotsPublishClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function BotPublishPage({ params }: PageProps) {
  const { id } = await params;
  return <BotsPublishClient botId={id} />;
}
