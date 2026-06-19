import { cookies } from "next/headers";
import { hubBackHrefForSession } from "../../lib/auth/hub-nav-for-session";
import { fetchBotDetailServer } from "../../lib/api/server-screen-fetch";
import ChatbotTestingClient from "./ChatbotTestingClient";

type PageProps = Readonly<{
  searchParams: Promise<{ botId?: string; back?: string }>;
}>;

export default async function ChatbotTestingPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const jar = await cookies();
  const botId = sp.botId?.trim() || null;
  const backHref = sp.back?.trim() || hubBackHrefForSession(jar, "bot");

  const bot = botId ? await fetchBotDetailServer(botId) : null;
  const initialScreen = bot ? { bot, documentCount: bot.documentCount ?? 0 } : null;

  return (
    <ChatbotTestingClient
      hubBackHref={backHref}
      botId={botId}
      initialScreen={initialScreen}
    />
  );
}
