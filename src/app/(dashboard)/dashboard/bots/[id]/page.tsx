import { notFound } from "next/navigation";
import { fetchBotScreenServer } from "../../../../../lib/api/server-screen-fetch";
import BotDetailClient from "./BotDetailClient";

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default async function BotDetailPage({ params }: PageProps) {
  const { id } = await params;
  const screen = await fetchBotScreenServer(id);
  if (!screen) {
    notFound();
  }
  return <BotDetailClient botId={id} initialScreen={screen} />;
}
