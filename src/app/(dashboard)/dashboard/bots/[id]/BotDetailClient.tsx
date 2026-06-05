"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ChatPanel } from "../../../../../components/chatbot/ChatPanel";
import { PlatformToast } from "../../../../../components/chatbot/PlatformToast";
import { usePlatformToast } from "../../../../../components/chatbot/usePlatformToast";
import DashboardStyleBackNav from "../../../../../components/gallery/DashboardStyleBackNav";
import wb from "../../../../website-builder/website-builder.module.css";
import type { PublishBotResult } from "../../../../../lib/chatbot/bot-types";
import { publishPlatformBot } from "../../../../../lib/chatbot/chatbot-platform-api";
import { useActivePlatformBot } from "../../../../../lib/chatbot/use-active-platform-bot";
import bd from "./bot-detail.module.css";

type BotDetailClientProps = { botId: string };

const METER_SEGMENTS = 10;
const METER_MAX_DOCS = 10;

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

function knowledgePercent(documentCount: number | null | undefined): number {
  const n = documentCount ?? 0;
  return Math.min(100, Math.round((Math.min(n, METER_MAX_DOCS) / METER_MAX_DOCS) * 100));
}

function SegmentedMeter({ percent }: { percent: number }) {
  const filled = Math.round((percent / 100) * METER_SEGMENTS);
  return (
    <div className={bd.meterWrap}>
      <div className={bd.meterBars} aria-hidden>
        {Array.from({ length: METER_SEGMENTS }, (_, i) => (
          <span
            key={i}
            className={`${bd.meterBar} ${i < filled ? bd.meterBarOn : ""}`}
            style={{ height: `${40 + (i % 3) * 18}%` }}
          />
        ))}
      </div>
      <span className={bd.meterPct}>{percent}%</span>
    </div>
  );
}

function BotAvatarIcon() {
  return (
    <span className={bd.botAvatar} aria-hidden>
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M7 10.5c0-2.2 1.8-4 5-4s5 1.8 5 4v1.5h1c.9 0 1.5.6 1.5 1.5v5.5c0 .9-.6 1.5-1.5 1.5H6c-.9 0-1.5-.6-1.5-1.5v-5.5c0-.9.6-1.5 1.5-1.5h1V10.5z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="13" r="1" fill="currentColor" />
        <circle cx="14" cy="13" r="1" fill="currentColor" />
      </svg>
    </span>
  );
}

function StatusBadge({ live }: { live: boolean }) {
  if (live) {
    return <span className={`${bd.statusBadge} ${bd.statusActive}`}>Active</span>;
  }
  return <span className={`${bd.statusBadge} ${bd.statusPaused}`}>Paused</span>;
}

function CopyUrlField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={bd.urlSection}>
      <span className={bd.urlLabel}>Public chat link</span>
      <div className={bd.urlRow}>
        <pre className={bd.urlValue}>{value}</pre>
        <button type="button" className={bd.copyBtn} onClick={() => void onCopy()}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
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
  const knowledgePct = knowledgePercent(documentCount);

  const headerMeta = useMemo(() => {
    if (loading) return "Loading…";
    const parts = [
      isPublished ? "Live" : "Draft",
      `${documentCount ?? 0} Docs`,
      personalityLabel ?? "—",
    ];
    return parts.join(" • ");
  }, [loading, isPublished, documentCount, personalityLabel]);

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
          <article className={`${wb.panel} ${bd.detailPanel}`}>
            {loading ? (
              <div className={bd.loadingCard}>
                <div className={bd.loadingShimmer} />
                <div className={bd.loadingShimmer} />
                <div className={bd.loadingShimmer} />
              </div>
            ) : null}

            {!loading && bot ? (
              <>
                <div className={bd.servicesCard}>
                  <header className={bd.servicesHeader}>
                    <div className={bd.servicesTitleWrap}>
                      <span
                        className={`${bd.servicesDot} ${isPublished ? bd.servicesDotLive : bd.servicesDotDraft}`}
                        aria-hidden
                      />
                      <h1 className={bd.servicesTitle}>Bot Overview</h1>
                      <span className={bd.servicesMeta}>{headerMeta}</span>
                    </div>
                  </header>

                  <div className={bd.tableWrap}>
                    <div className={bd.tableHead} role="row">
                      <span>NO</span>
                      <span>Bot name</span>
                      <span>Personality</span>
                      <span>Created</span>
                      <span>Knowledge</span>
                      <span>Status</span>
                    </div>

                    <div
                      className={`${bd.tableRow} ${isPublished ? bd.tableRowLive : bd.tableRowDraft}`}
                      role="row"
                    >
                      <span className={bd.rowNo}>01</span>

                      <div className={bd.rowName}>
                        <BotAvatarIcon />
                        <div className={bd.nameStack}>
                          <span className={bd.namePrimary}>{botName}</span>
                          <span className={bd.nameSecondary}>(Chatbot)</span>
                        </div>
                      </div>

                      <span className={bd.cellText}>{personalityLabel ?? "—"}</span>
                      <span className={bd.cellMuted}>{formatDate(bot.createdAt)}</span>
                      <SegmentedMeter percent={knowledgePct} />

                      <div className={bd.statusCell}>
                        <StatusBadge live={isPublished} />
                      </div>
                    </div>

                    {purpose ? (
                      <div className={bd.scopeRow}>
                        <span className={bd.scopeNo}>02</span>
                        <div className={bd.scopeBody}>
                          <p className={bd.scopeLabel}>Helps with</p>
                          <p className={bd.scopeText}>{purpose}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className={bd.footerActions}>
                  {isPublished ? (
                    <CopyUrlField value={publicChatUrl} />
                  ) : (
                    <button
                      type="button"
                      className={bd.makeLiveBtn}
                      disabled={publishing}
                      onClick={() => void onMakeLive()}
                    >
                      {publishing ? "Publishing…" : "Make it live"}
                    </button>
                  )}
                </div>
              </>
            ) : null}

            {error ? (
              <p className={bd.errorBanner} role="alert">
                {error}
              </p>
            ) : null}
          </article>

          <article className={`${wb.panel} ${bd.previewPanel}`}>
            <div className={bd.previewLabel}>
              <span>Chatbot preview</span>
              <span className={bd.previewBadge}>Live test</span>
            </div>
            {loading ? (
              <div className={bd.loadingShimmer} style={{ flex: 1, minHeight: "320px" }} />
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
