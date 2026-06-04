"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardStyleBackNav from "../../components/gallery/DashboardStyleBackNav";
import { ChatPanel } from "../../components/chatbot/ChatPanel";
import wb from "../website-builder/website-builder.module.css";
import { fetchPlatformBot } from "../../lib/chatbot/chatbot-platform-api";
import { getActiveBotId, getActiveBotName, getBotTrainSummary } from "../../lib/chatbot/session-storage";

type ChatbotTrainedClientProps = {
  backHref: string;
  saveHref: string;
};

export default function ChatbotTrainedClient({ backHref, saveHref }: ChatbotTrainedClientProps) {
  const router = useRouter();
  const summary = getBotTrainSummary();
  const [botId, setBotId] = useState<string | null>(null);
  const [botName, setBotName] = useState("Chatbot");
  const [greeting, setGreeting] = useState("Hi! I'm your AI assistant. How can I help you today?");

  useEffect(() => {
    const id = getActiveBotId();
    setBotId(id);
    setBotName(summary?.name ?? getActiveBotName() ?? "Chatbot");
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
  }, [summary?.name]);

  const publishHref = botId ? `/dashboard/bots/${encodeURIComponent(botId)}/publish` : saveHref;

  return (
    <div className={`${wb.page} ${wb.botReviewPage}`}>
      <DashboardStyleBackNav href={backHref} ariaLabel="Back" />
      <div className={wb.topExtras}>
        <Link href={botId ? "/chatbot-testing" : "/chatbot-builder/create"} className={wb.topExtraGhost}>
          Test Chatbot
        </Link>
        <button type="button" className={wb.topExtraGhost} onClick={() => router.push(publishHref)}>
          Publish Chatbot
        </button>
        <Link href={saveHref} className={wb.topExtraPrimary}>
          Back to Dashboard
        </Link>
      </div>
      <main className={`${wb.main} ${wb.mainToolbarSpace}`}>
        <section className={wb.split}>
          <article className={wb.panel}>
            <h2 className={wb.panelTitle}>Chatbot ready</h2>
            <div className={wb.ctaBanner}>
              <h3 className={wb.ctaBannerTitle}>Training complete</h3>
              <p className={wb.ctaBannerText}>
                {botName} is ready. Try the preview chat, run a full test, or publish when you are happy.
              </p>
            </div>
            <ul className={wb.kbHint} style={{ listStyle: "none", padding: 0, margin: "0.75rem 0 0" }}>
              <li>
                <strong>Personality:</strong> {summary?.personalityLabel ?? "—"}
              </li>
              <li>
                <strong>Documents:</strong> {summary?.fileCount ?? 0}
              </li>
              <li>
                <strong>Websites:</strong> {summary?.urlCount ?? 0}
              </li>
              {summary?.purpose ? (
                <li style={{ marginTop: "0.35rem" }}>
                  <strong>Helps with:</strong> {summary.purpose}
                </li>
              ) : null}
            </ul>
            {!botId ? (
              <p className={wb.trainError} style={{ marginTop: "0.75rem" }}>
                Something went wrong — please train again from the builder.
              </p>
            ) : null}
          </article>

          <article className={wb.panel}>
            <h2 className={wb.panelTitle}>Chatbot Preview</h2>
            {botId ? (
              <ChatPanel botId={botId} botName={botName} greeting={greeting} />
            ) : (
              <p className={wb.kbHint}>Preview unavailable — train your chatbot again to continue.</p>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
