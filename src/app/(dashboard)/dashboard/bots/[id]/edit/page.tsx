import { notFound } from "next/navigation";
import { fetchBotDetailServer } from "../../../../../../lib/api/server-screen-fetch";
import BotsEditClient from "./BotsEditClient";

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default async function BotEditPage({ params }: PageProps) {
  const { id } = await params;
  const bot = await fetchBotDetailServer(id);
  if (!bot) {
    notFound();
  }
  return <BotsEditClient botId={id} initialBot={bot} />;
}
