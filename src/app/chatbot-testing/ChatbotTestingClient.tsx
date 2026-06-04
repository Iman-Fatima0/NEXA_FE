"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardStyleBackNav from "../../components/gallery/DashboardStyleBackNav";
import { ChatPanel } from "../../components/chatbot/ChatPanel";
import wb from "../website-builder/website-builder.module.css";
import { getActiveBotId, getActiveBotName } from "../../lib/chatbot/session-storage";

type ChatbotTestingClientProps = {
  hubBackHref: string;
  editHref: string;
};

export default function ChatbotTestingClient({ hubBackHref, editHref }: ChatbotTestingClientProps) {
  const [botId, setBotId] = useState<string | null>(null);
  const [botName, setBotName] = useState("Chatbot");

  useEffect(() => {
    setBotId(getActiveBotId());
    setBotName(getActiveBotName() ?? "Chatbot");
  }, []);

  if (!botId) {
    return (
      <div className={wb.page}>
        <DashboardStyleBackNav href={hubBackHref} ariaLabel="Back" />
        <main className={`${wb.main} ${wb.mainToolbarSpace}`}>
          <article className={wb.panel}>
            <h2 className={wb.panelTitle}>Chatbot testing</h2>
            <p className={wb.kbHint}>No active bot. Train a chatbot first from the builder.</p>
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
        <Link href={editHref} className={wb.topExtraPrimary}>
          Edit Chatbot
        </Link>
      </div>
      <main className={`${wb.main} ${wb.mainToolbarSpace}`}>
        <article className={wb.panel}>
          <h2 className={wb.panelTitle}>Chatbot testing</h2>
          <p className={wb.kbHint}>Live chat via NestJS POST /chat/message (RAG enabled).</p>
          <ChatPanel
            botId={botId}
            botName={botName}
            tall
            greeting="Hi! I'm your AI assistant. How can I help you today?"
          />
        </article>
      </main>
    </div>
  );
}
