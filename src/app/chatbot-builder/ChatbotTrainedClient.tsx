"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import DashboardStyleBackNav from "../../components/gallery/DashboardStyleBackNav";
import { ChatPanel } from "../../components/chatbot/ChatPanel";
import wb from "../website-builder/website-builder.module.css";
import { useActivePlatformBot } from "../../lib/chatbot/use-active-platform-bot";

type ChatbotTrainedClientProps = {
  backHref: string;
  saveHref: string;
};

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function ChatbotTrainedClient({ backHref, saveHref }: ChatbotTrainedClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const botIdFromUrl = useMemo(() => searchParams.get("botId"), [searchParams]);
  const {
    botId,
    bot,
    botName,
    greeting,
    purpose,
    personalityLabel,
    documentCount,
    theme,
    loading,
    error,
  } = useActivePlatformBot(botIdFromUrl);

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
                {loading ? "Loading your chatbot…" : `${botName} is ready. Try the preview chat, run a full test, or publish when you are happy.`}
              </p>
            </div>
            {error ? (
              <p className={wb.trainError} role="alert">
                {error}
              </p>
            ) : null}
            {!loading && bot ? (
              <ul className={wb.kbHint} style={{ listStyle: "none", padding: 0, margin: "0.75rem 0 0" }}>
                <li>
                  <strong>Name:</strong> {botName}
                </li>
                <li>
                  <strong>Personality:</strong> {personalityLabel ?? "—"}
                </li>
                <li>
                  <strong>Documents:</strong> {documentCount ?? 0}
                </li>
                <li>
                  <strong>Created:</strong> {formatDate(bot.createdAt)}
                </li>
                {purpose ? (
                  <li style={{ marginTop: "0.35rem" }}>
                    <strong>Helps with:</strong> {purpose}
                  </li>
                ) : null}
              </ul>
            ) : null}
            {!loading && !botId ? (
              <p className={wb.trainError} style={{ marginTop: "0.75rem" }}>
                Something went wrong — please train again from the builder.
              </p>
            ) : null}
          </article>

          <article className={wb.panel}>
            <h2 className={wb.panelTitle}>Chatbot Preview</h2>
            {loading ? (
              <p className={wb.kbHint}>Loading preview…</p>
            ) : botId ? (
              <ChatPanel
                botId={botId}
                botName={botName}
                greeting={greeting}
                tall
                savedTheme={theme}
              />
            ) : (
              <p className={wb.kbHint}>Preview unavailable — train your chatbot again to continue.</p>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
