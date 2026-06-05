import BotsEditClient from "./BotsEditClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function BotEditPage({ params }: PageProps) {
  const { id } = await params;
  return <BotsEditClient botId={id} />;
}
