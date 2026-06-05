"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { CopyField } from "../../../../../components/chatbot/CopyField";
import { ChatPanel } from "../../../../../components/chatbot/ChatPanel";
import { PlatformToast } from "../../../../../components/chatbot/PlatformToast";
import { usePlatformToast } from "../../../../../components/chatbot/usePlatformToast";
import DashboardStyleBackNav from "../../../../../components/gallery/DashboardStyleBackNav";
import wb from "../../../../website-builder/website-builder.module.css";
import type { PublishBotResult } from "../../../../../lib/chatbot/bot-types";
import { publishPlatformBot } from "../../../../../lib/chatbot/chatbot-platform-api";
import { useActivePlatformBot } from "../../../../../lib/chatbot/use-active-platform-bot";

type BotDetailClientProps = { botId: string };

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

function resolvePublicChatUrl(botId: string, publishData?: PublishBotResult | null, botUrl?: string | null): string {
  if (publishData?.publicChatUrl) return publishData.publicChatUrl;
  if (botUrl) return botUrl;
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/chat/${botId}`;
}

export default function BotDetailClient({ botId }: BotDetailClientProps) {
  const router = useRouter();
  const { toast, showSuccess, showError } = usePlatformToast();
  const [publishing, setPublishing] = useState(false);
  const [publishData, setPublishData] = useState<PublishBotResult | null>(null);

  const {
    bot,
    botName,
    greeting,
    purpose,
    personalityLabel,
    documentCount,
    loading,
    error,
  } = useActivePlatformBot(botId);

  const isPublished = bot?.status === "published" || publishData !== null;
  const publicChatUrl = useMemo(
    () => resolvePublicChatUrl(botId, publishData, bot?.publicChatUrl),
    [botId, publishData, bot?.publicChatUrl],
  );

  const onMakeLive = useCallback(async () => {
    setPublishing(true);
    try {
      const result = await publishPlatformBot(botId);
      setPublishData(result);
      showSuccess("Your chatbot is now live.");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Could not publish your chatbot.");
    } finally {
      setPublishing(false);
    }
  }, [botId, showError, showSuccess]);

  const editHref = `/dashboard/bots/${encodeURIComponent(botId)}/edit`;

  return (
    <div className={`${wb.page} ${wb.botReviewPage}`}>
      <DashboardStyleBackNav href="/dashboard/bots" ariaLabel="Back to bots" />
      <PlatformToast toast={toast} />

      <div className={wb.topExtras}>
        <Link href={editHref} className={wb.topExtraPrimary}>
          Edit bot
        </Link>
        <button
          type="button"
          className={wb.topExtraGhost}
          disabled={!botId || loading}
          onClick={() => router.push("/chatbot-testing")}
        >
          Test chatbot
        </button>
        {isPublished ? (
          <Link
            href={`/dashboard/bots/${encodeURIComponent(botId)}/publish`}
            className={wb.topExtraGhost}
          >
            Embed on website
          </Link>
        ) : null}
      </div>

      <main className={`${wb.main} ${wb.mainToolbarSpace}`}>
        <section className={wb.split}>
          <article className={wb.panel}>
            <h2 className={wb.panelTitle}>{loading ? "Loading…" : botName}</h2>

            <div className={wb.ctaBanner}>
              <h3 className={wb.ctaBannerTitle}>
                {isPublished ? "Live" : "Not live yet"}
              </h3>
              <p className={wb.ctaBannerText}>
                {loading
                  ? "Loading your chatbot…"
                  : isPublished
                    ? `${botName} is published. Share the public chat link below or embed it on your site.`
                    : `${botName} is ready. Edit settings, test the chat, then make it live when you are happy.`}
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
                  <strong>Status:</strong> {isPublished ? "Live" : "Draft"}
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

            {!loading && bot ? (
              <div style={{ marginTop: "1.25rem" }}>
                {isPublished ? (
                  <CopyField label="Public chat URL" value={publicChatUrl} />
                ) : (
                  <button
                    type="button"
                    className={wb.topExtraPrimary}
                    disabled={publishing}
                    onClick={() => void onMakeLive()}
                    style={{ width: "100%", marginTop: "0.5rem" }}
                  >
                    {publishing ? "Publishing…" : "Make it live"}
                  </button>
                )}
              </div>
            ) : null}
          </article>

          <article className={wb.panel}>
            <h2 className={wb.panelTitle}>Chatbot preview</h2>
            {loading ? (
              <p className={wb.kbHint}>Loading preview…</p>
            ) : botId ? (
              <ChatPanel botId={botId} botName={botName} greeting={greeting} tall />
            ) : (
              <p className={wb.kbHint}>Preview unavailable.</p>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
