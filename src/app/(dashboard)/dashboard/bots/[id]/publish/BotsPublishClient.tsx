"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CopyField } from "../../../../../../components/chatbot/CopyField";
import { ConfirmModal } from "../../../../../../components/chatbot/ConfirmModal";
import { PlatformToast } from "../../../../../../components/chatbot/PlatformToast";
import { usePlatformToast } from "../../../../../../components/chatbot/usePlatformToast";
import DashboardStyleBackNav from "../../../../../../components/gallery/DashboardStyleBackNav";
import styles from "../../../../../../components/chatbot/chatbot-platform.module.css";
import {
  fetchPlatformBot,
  publishPlatformBot,
  refreshWidgetConfig,
  regenerateBotApiKey,
} from "../../../../../../lib/chatbot/chatbot-platform-api";
import type { PublishBotResult } from "../../../../../../lib/chatbot/bot-types";

type BotsPublishClientProps = { botId: string };

const DEFAULT_WIDGET = `<script src="${typeof window !== "undefined" ? window.location.origin : ""}/widget.js" data-nexa-bot="YOUR_BOT"></script>`;

export default function BotsPublishClient({ botId }: BotsPublishClientProps) {
  const { toast, showSuccess, showError } = usePlatformToast();
  const [tab, setTab] = useState<"widget" | "chat">("widget");
  const [published, setPublished] = useState(false);
  const [publishData, setPublishData] = useState<PublishBotResult | null>(null);
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

  const loadBot = useCallback(async () => {
    try {
      const bot = await fetchPlatformBot(botId);
      if (bot.status === "published") {
        setPublished(true);
        setPublishData({
          publicChatUrl: bot.publicChatUrl,
          widgetScript: bot.widgetScript,
          widgetStatus: bot.widgetStatus,
          widgetVersion: bot.widgetVersion,
          embedMode: bot.embedMode,
          allowedDomains: bot.allowedDomains,
        });
        setWidgetMeta({
          status: bot.widgetStatus ?? "Published",
          version: bot.widgetVersion ?? "—",
          embedMode: bot.embedMode ?? "Standard",
          domains: bot.allowedDomains?.length ? bot.allowedDomains.join(", ") : "All sites",
        });
      }
    } catch {
      /* draft */
    }
  }, [botId]);

  useEffect(() => {
    void loadBot();
  }, [loadBot]);

  const onPublish = async () => {
    setPublishing(true);
    try {
      const result = await publishPlatformBot(botId);
      setPublishData(result);
      setPublished(true);
      setWidgetMeta({
        status: result.widgetStatus ?? "Published",
        version: result.widgetVersion ?? "—",
        embedMode: result.embedMode ?? "Standard",
        domains: result.allowedDomains?.length ? result.allowedDomains.join(", ") : "All sites",
      });
      showSuccess("Your chatbot is now live.");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Could not publish your chatbot.");
    } finally {
      setPublishing(false);
    }
  };

  const widgetScript =
    publishData?.widgetScript ||
    (publishData?.widgetUrl
      ? `<script src="${publishData.widgetUrl}"></script>`
      : DEFAULT_WIDGET.replace("YOUR_BOT", "…"));

  const chatUrl =
    publishData?.publicChatUrl ||
    `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") || (typeof window !== "undefined" ? window.location.origin : "")}/chat/${botId}`;

  return (
    <div className={styles.page}>
      <DashboardStyleBackNav href="/dashboard/bots" ariaLabel="Back to chatbots" />
      <PlatformToast toast={toast} />

      <ConfirmModal
        open={showKeyModal}
        title="New access key"
        message="Copy this key now. For security, it will not be shown again after you close this dialog."
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
          <p className={styles.sub}>Share on your website or send customers a direct chat link.</p>
        </header>

        {!published ? (
          <section className={styles.card}>
            <p className={styles.sub}>When you publish, we generate your embed code and public chat page.</p>
            <button type="button" className={styles.btnPrimary} disabled={publishing} onClick={() => void onPublish()}>
              {publishing ? "Publishing…" : "Publish chatbot"}
            </button>
          </section>
        ) : (
          <>
            <section className={styles.card}>
              <h2 className={styles.modalTitle}>Your chatbot is now live.</h2>
              <div className={styles.tabs}>
                <button
                  type="button"
                  className={`${styles.tab} ${tab === "widget" ? styles.tabActive : ""}`}
                  onClick={() => setTab("widget")}
                >
                  Website widget
                </button>
                <button
                  type="button"
                  className={`${styles.tab} ${tab === "chat" ? styles.tabActive : ""}`}
                  onClick={() => setTab("chat")}
                >
                  Direct chat link
                </button>
              </div>

              {tab === "widget" ? (
                <>
                  <CopyField label="Embed code" value={widgetScript} />
                  <h3 className={styles.cardTitle}>Installation guide</h3>
                  <ol className={styles.sub} style={{ paddingLeft: "1.25rem" }}>
                    <li>Copy the embed code above.</li>
                    <li>Paste it before the closing &lt;/body&gt; tag on your site.</li>
                    <li>Publish your website and open it in a browser to verify.</li>
                  </ol>
                </>
              ) : (
                <>
                  <CopyField label="Public chat URL" value={chatUrl} mono={false} />
                  <div className={styles.actionsRow}>
                    <a href={chatUrl} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary} style={{ width: "auto" }}>
                      Open chat
                    </a>
                  </div>
                </>
              )}
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
