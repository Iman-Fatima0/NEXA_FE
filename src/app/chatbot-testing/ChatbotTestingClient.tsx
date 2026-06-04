"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardStyleBackNav from "../../components/gallery/DashboardStyleBackNav";
import { ChatPanel } from "../../components/chatbot/ChatPanel";
import wb from "../website-builder/website-builder.module.css";
import { fetchPlatformBot } from "../../lib/chatbot/chatbot-platform-api";
import { getActiveBotId, getActiveBotName } from "../../lib/chatbot/session-storage";

type ChatbotTestingClientProps = {
  hubBackHref: string;
};

export default function ChatbotTestingClient({ hubBackHref }: ChatbotTestingClientProps) {
  const [botId, setBotId] = useState<string | null>(null);
  const [botName, setBotName] = useState("Chatbot");
  const [greeting, setGreeting] = useState("Hi! How can I help you today?");

  useEffect(() => {
    const id = getActiveBotId();
    setBotId(id);
    setBotName(getActiveBotName() ?? "Chatbot");
    if (!id) return;
    void (async () => {
      try {
        const bot = await fetchPlatformBot(id);
        setBotName(bot.name);
        if (bot.config?.welcomeMessage) setGreeting(bot.config.welcomeMessage);
      } catch {
        /* keep defaults */
      }
    })();
  }, []);

  if (!botId) {
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
      <div className={wb.topExtras}>
        <Link
          href={`/dashboard/bots/${encodeURIComponent(botId)}/edit`}
          className={wb.topExtraPrimary}
        >
          Edit Chatbot
        </Link>
      </div>
      <main className={`${wb.main} ${wb.mainToolbarSpace}`}>
        <article className={wb.panel}>
          <h2 className={wb.panelTitle}>Chatbot testing</h2>
          <p className={wb.kbHint}>Live conversation with {botName}.</p>
          <ChatPanel botId={botId} botName={botName} tall greeting={greeting} />
        </article>
      </main>
    </div>
  );
}
