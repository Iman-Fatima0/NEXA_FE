import BotsAnalyticsClient from "./BotsAnalyticsClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function BotAnalyticsPage({ params }: PageProps) {
  const { id } = await params;
  return <BotsAnalyticsClient botId={id} />;
}
