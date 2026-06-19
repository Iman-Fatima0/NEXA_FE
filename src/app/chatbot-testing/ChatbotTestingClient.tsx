"use client";

import Link from "next/link";
import { useMemo } from "react";
import DashboardStyleBackNav from "../../components/gallery/DashboardStyleBackNav";
import { ChatPanel } from "../../components/chatbot/ChatPanel";
import wb from "../website-builder/website-builder.module.css";
import {
  useActivePlatformBot,
  type InitialBotScreenData,
} from "../../lib/chatbot/use-active-platform-bot";

type ChatbotTestingClientProps = {
  hubBackHref: string;
  botId?: string | null;
  initialScreen?: InitialBotScreenData | null;
};

export default function ChatbotTestingClient({
  hubBackHref,
  botId: botIdProp = null,
  initialScreen = null,
}: ChatbotTestingClientProps) {
  const hookInitialScreen = useMemo(
    () =>
      initialScreen
        ? { bot: initialScreen.bot, documentCount: initialScreen.documentCount }
        : null,
    [initialScreen],
  );

  const { botId, botName, greeting, theme, loading, error } = useActivePlatformBot(
    botIdProp,
    hookInitialScreen,
  );

  if (!loading && !botId) {
    return (
      <div className={wb.page}>
        <DashboardStyleBackNav href={hubBackHref} ariaLabel="Back" />
        <main className={`${wb.main} ${wb.mainToolbarSpace}`}>
          <article className={wb.panel}>
            <h2 className={wb.panelTitle}>Chatbot testing</h2>
            <p className={wb.kbHint}>No active chatbot. Create and train one first.</p>
            <Link href="/chatbot-builder/create" className={`${wb.btnBlack} ${wb.linkAsBtn}`}>
              Create chatbot
            </Link>
          </article>
        </main>
      </div>
    );
  }

  return (
    <div className={wb.page}>
      <DashboardStyleBackNav href={hubBackHref} ariaLabel="Back" />
      {botId ? (
        <div className={wb.topExtras}>
          <Link href={`/dashboard/bots/${encodeURIComponent(botId)}/edit`} className={wb.topExtraPrimary}>
            Edit Chatbot
          </Link>
        </div>
      ) : null}
      <main className={`${wb.main} ${wb.mainToolbarSpace}`}>
        <article className={wb.panel}>
          <h2 className={wb.panelTitle}>Chatbot testing</h2>
          {error ? <p className={wb.trainError}>{error}</p> : null}
          <p className={wb.kbHint}>
            {loading ? "Loading chatbot…" : `Live conversation with ${botName}.`}
          </p>
          {botId && !loading ? (
            <ChatPanel
              botId={botId}
              botName={botName}
              tall
              greeting={greeting}
              savedTheme={theme}
            />
          ) : null}
        </article>
      </main>
    </div>
  );
}
