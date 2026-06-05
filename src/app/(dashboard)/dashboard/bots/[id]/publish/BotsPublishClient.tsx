"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BotLiveLinksFields } from "../../../../../../components/chatbot/BotLiveLinksFields";
import { CopyField } from "../../../../../../components/chatbot/CopyField";
import { ConfirmModal } from "../../../../../../components/chatbot/ConfirmModal";
import { PlatformToast } from "../../../../../../components/chatbot/PlatformToast";
import { usePlatformToast } from "../../../../../../components/chatbot/usePlatformToast";
import DashboardStyleBackNav from "../../../../../../components/gallery/DashboardStyleBackNav";
import styles from "../../../../../../components/chatbot/chatbot-platform.module.css";
import type { BotLiveLinks } from "../../../../../../lib/chatbot/bot-live-links";
import {
  resolveBotLiveLinks,
  toShareableLiveLinks,
} from "../../../../../../lib/chatbot/bot-live-links";
import type { PublishBotResult } from "../../../../../../lib/chatbot/bot-types";
import {
  fetchBotLiveLinks,
  fetchPlatformBot,
  publishPlatformBot,
  refreshWidgetConfig,
  regenerateBotApiKey,
} from "../../../../../../lib/chatbot/chatbot-platform-api";

type BotsPublishClientProps = { botId: string };

export default function BotsPublishClient({ botId }: BotsPublishClientProps) {
  const { toast, showSuccess, showError } = usePlatformToast();
  const [published, setPublished] = useState(false);
  const [publishData, setPublishData] = useState<PublishBotResult | null>(null);
  const [fetchedLinks, setFetchedLinks] = useState<BotLiveLinks | null>(null);
  const [widgetMeta, setWidgetMeta] = useState({
    status: "—",
    version: "—",
    embedMode: "—",
    domains: "—",
  });
  const [publishing, setPublishing] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const liveLinks = useMemo(
    () => toShareableLiveLinks(resolveBotLiveLinks(fetchedLinks, publishData)),
    [fetchedLinks, publishData],
  );

  const applyWidgetMeta = useCallback((links: BotLiveLinks) => {
    setWidgetMeta({
      status: links.widgetStatus ?? "Published",
      version: links.widgetVersion ?? "—",
      embedMode: links.embedMode ?? "Standard",
      domains: links.allowedDomains?.length ? links.allowedDomains.join(", ") : "All sites",
    });
  }, []);

  const loadBot = useCallback(async () => {
    try {
      const bot = await fetchPlatformBot(botId);
      if (bot.status === "published") {
        setPublished(true);
        const fromBot = resolveBotLiveLinks(bot.liveLinks ?? bot);
        setPublishData(fromBot);
        applyWidgetMeta(fromBot);

        try {
          const links = await fetchBotLiveLinks(botId);
          setFetchedLinks(links);
          applyWidgetMeta(links);
        } catch {
          setFetchedLinks(toShareableLiveLinks(fromBot));
        }
      }
    } catch {
      /* draft */
    }
  }, [applyWidgetMeta, botId]);

  useEffect(() => {
    void loadBot();
  }, [loadBot]);

  const onPublish = async () => {
    setPublishing(true);
    try {
      const result = await publishPlatformBot(botId);
      setPublished(true);
      applyWidgetMeta(result);
      if (result.apiKey) {
        setNewApiKey(result.apiKey);
        setShowKeyModal(true);
      }

      try {
        const links = await fetchBotLiveLinks(botId);
        setFetchedLinks(links);
        setPublishData({ publicSlug: links.publicSlug ?? result.publicSlug });
        applyWidgetMeta(links);
      } catch {
        setPublishData(toShareableLiveLinks(result));
      }

      showSuccess("Your chatbot is now live.");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Could not publish your chatbot.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className={styles.page}>
      <DashboardStyleBackNav href="/dashboard/bots" ariaLabel="Back to chatbots" />
      <PlatformToast toast={toast} />

      <ConfirmModal
        open={showKeyModal}
        title="New access key"
        message="Copy this key now for widget or API integration. It is not included in your shareable live link. For security, it will not be shown again after you close this dialog."
        confirmLabel="I've copied it"
        onCancel={() => {
          setShowKeyModal(false);
          setNewApiKey(null);
        }}
        onConfirm={() => {
          setShowKeyModal(false);
          setNewApiKey(null);
        }}
      />

      {showKeyModal && newApiKey ? (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <CopyField label="Access key (shown once)" value={newApiKey} />
          </div>
        </div>
      ) : null}

      <div className={styles.shell}>
        <header className={styles.header}>
          <h1 className={styles.h1}>Publish chatbot</h1>
          <p className={styles.sub}>
            Each bot gets a unique live link via its public slug. Share the preview link or embed the widget on your site.
          </p>
        </header>

        {!published ? (
          <section className={styles.card}>
            <p className={styles.sub}>
              When you publish, we generate your unique preview URL, embed page, and widget script.
            </p>
            <button type="button" className={styles.btnPrimary} disabled={publishing} onClick={() => void onPublish()}>
              {publishing ? "Publishing…" : "Publish chatbot"}
            </button>
          </section>
        ) : (
          <>
            <section className={styles.card}>
              <h2 className={styles.modalTitle}>Your chatbot is now live.</h2>
              <BotLiveLinksFields links={liveLinks} />
            </section>

            <section className={`${styles.card}`} style={{ marginTop: "1.25rem" }}>
              <h2 className={styles.cardTitle}>Widget settings</h2>
              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <div className={styles.statLabel}>Status</div>
                  <div className={styles.statValue}>{widgetMeta.status}</div>
                </div>
                <div className={styles.statBox}>
                  <div className={styles.statLabel}>Version</div>
                  <div className={styles.statValue}>{widgetMeta.version}</div>
                </div>
                <div className={styles.statBox}>
                  <div className={styles.statLabel}>Embed mode</div>
                  <div className={styles.statValue}>{widgetMeta.embedMode}</div>
                </div>
                <div className={styles.statBox}>
                  <div className={styles.statLabel}>Allowed domains</div>
                  <div className={styles.statValue} style={{ fontSize: "0.85rem" }}>
                    {widgetMeta.domains}
                  </div>
                </div>
              </div>
              <div className={styles.actionsRow}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={async () => {
                    try {
                      await refreshWidgetConfig(botId);
                      showSuccess("Widget configuration refreshed.");
                      await loadBot();
                    } catch (e) {
                      showError(e instanceof Error ? e.message : "Could not refresh configuration.");
                    }
                  }}
                >
                  Refresh widget configuration
                </button>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  disabled={regenerating}
                  onClick={async () => {
                    setRegenerating(true);
                    try {
                      const { apiKey } = await regenerateBotApiKey(botId);
                      if (apiKey) {
                        setNewApiKey(apiKey);
                        setShowKeyModal(true);
                      } else {
                        showSuccess("Access key was regenerated.");
                      }
                    } catch (e) {
                      showError(e instanceof Error ? e.message : "Could not regenerate access key.");
                    } finally {
                      setRegenerating(false);
                    }
                  }}
                >
                  Regenerate access key
                </button>
              </div>
            </section>
          </>
        )}

        <Link href="/dashboard/bots" className={styles.btnSecondary} style={{ marginTop: "1.25rem" }}>
          Back to My Chatbots
        </Link>
      </div>
    </div>
  );
}
