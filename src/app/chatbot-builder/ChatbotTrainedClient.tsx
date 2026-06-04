"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChatPanel } from "../../components/chatbot/ChatPanel";
import wb from "../website-builder/website-builder.module.css";
import { getActiveBotId, getActiveBotName } from "../../lib/chatbot/session-storage";

type ChatbotTrainedClientProps = {
  backHref: string;
  saveHref: string;
};

export default function ChatbotTrainedClient({ backHref, saveHref }: ChatbotTrainedClientProps) {
  const searchParams = useSearchParams();
  const [botId, setBotId] = useState<string | null>(null);
  const [botName, setBotName] = useState("Chatbot");

  useEffect(() => {
    const fromUrl = searchParams.get("botId")?.trim();
    setBotId(fromUrl || getActiveBotId());
    setBotName(getActiveBotName() ?? "Chatbot");
  }, [searchParams]);

  return (
    <div className={`${wb.page} ${wb.botReviewPage}`}>
      <Link href={backHref} className={wb.backNav} aria-label="Back">
        <img src="/assets/images/redarrowithoutbg.png" alt="" width={24} height={24} className={wb.backNavImg} decoding="async" />
      </Link>
      <div className={wb.topExtras}>
        <Link href={botId ? `/chatbot-testing` : "/chatbot-builder/create"} className={wb.topExtraGhost}>
          Test Bot
        </Link>
        <Link href={saveHref} className={wb.topExtraPrimary}>
          Save Chatbot
        </Link>
      </div>
      <main className={`${wb.main} ${wb.mainToolbarSpace}`}>
        <section className={wb.split}>
          <article className={wb.panel}>
            <h2 className={wb.panelTitle}>Training complete</h2>
            <div className={wb.ctaBanner}>
              <h3 className={wb.ctaBannerTitle}>Chatbot ready</h3>
              <p className={wb.ctaBannerText}>
                Documents were ingested into the vector store. Try the preview chat or open full testing.
              </p>
            </div>
            {botId ? (
              <p className={wb.hintTight}>
                Bot ID: <code>{botId}</code>
              </p>
            ) : (
              <p className={wb.trainError}>Missing bot id — train again from the builder.</p>
            )}
          </article>

          <article className={wb.panel}>
            <h2 className={wb.panelTitle}>Chatbot Preview</h2>
            {botId ? (
              <ChatPanel
                botId={botId}
                botName={botName}
                greeting="Hi! I'm your AI assistant. How can I help you today?"
              />
            ) : (
              <p className={wb.kbHint}>Preview unavailable without a trained bot.</p>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
