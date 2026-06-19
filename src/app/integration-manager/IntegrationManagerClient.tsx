"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import DashboardStyleBackNav from "../../components/gallery/DashboardStyleBackNav";
import {
  connectWebsiteChatbot,
  fetchIntegrationOptions,
  type WidgetPosition,
} from "../../lib/integration/integration-api";
import { buildFrontendEmbedUrl } from "../../lib/chatbot/bot-live-links";
import type { PlatformBot } from "../../lib/chatbot/bot-types";
import IntegrationLivePreview from "../../components/integration/IntegrationLivePreview";
import { fetchUserWebsiteById } from "../../lib/fetch-user-websites";
import { readChatIntegrationFromSections } from "../../lib/integration/chat-integration";
import type { UserWebsite } from "../../lib/user-websites-types";
import { friendlyUserError } from "../../lib/api/friendly-user-error";
import wb from "../website-builder/website-builder.module.css";

const PREVIEW_WAIT_GIF = "/assets/images/redcirclesquare.gif";

type IntegrationManagerClientProps = Readonly<{
  hubBackHref: string;
}>;

export default function IntegrationManagerClient({ hubBackHref }: IntegrationManagerClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetWebsiteId = searchParams.get("websiteId")?.trim() ?? "";
  const presetChatbotId = searchParams.get("chatbotId")?.trim() ?? "";

  const [websites, setWebsites] = useState<UserWebsite[]>([]);
  const [bots, setBots] = useState<PlatformBot[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [websiteId, setWebsiteId] = useState("");
  const [chatbotId, setChatbotId] = useState("");
  const [position, setPosition] = useState<WidgetPosition>("bottom-right");
  const [showBubble, setShowBubble] = useState(true);
  const [widgetSize] = useState(60);

  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [previewSite, setPreviewSite] = useState<UserWebsite | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadingOptions(true);
      setOptionsError(null);
      try {
        const { websites: sites, bots: botList, hint } = await fetchIntegrationOptions();
        if (cancelled) return;
        if (hint) setOptionsError(hint);
        setWebsites(sites);
        setBots(botList);

        const initialWebsite =
          presetWebsiteId && sites.some((w) => w.id === presetWebsiteId)
            ? presetWebsiteId
            : sites[0]?.id ?? "";
        const initialBot =
          presetChatbotId && botList.some((b) => b.id === presetChatbotId)
            ? presetChatbotId
            : botList[0]?.id ?? "";

        if (initialWebsite) setWebsiteId(initialWebsite);
        if (initialBot) setChatbotId(initialBot);

        if (initialWebsite) {
          try {
            const detail = await fetchUserWebsiteById(initialWebsite);
            if (!cancelled) {
              setPreviewSite(detail);
              const existing = readChatIntegrationFromSections(detail.sections);
              if (existing) {
                setPosition(existing.position);
                setShowBubble(existing.showBubble);
                if (!presetChatbotId && existing.botId) setChatbotId(existing.botId);
              }
            }
          } catch {
            /* optional */
          }
        }
      } catch (e) {
        if (!cancelled) setOptionsError(friendlyUserError(e, "Could not update the connection. Please try again.", "integration"));
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [presetWebsiteId, presetChatbotId]);

  useEffect(() => {
    if (!websiteId) {
      setPreviewSite(null);
      return;
    }
    let cancelled = false;
    void fetchUserWebsiteById(websiteId)
      .then((detail) => {
        if (!cancelled) setPreviewSite(detail);
      })
      .catch(() => {
        if (!cancelled) setPreviewSite(null);
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId]);

  const selectedWebsite = useMemo(
    () => websites.find((w) => w.id === websiteId) ?? null,
    [websites, websiteId],
  );
  const selectedBot = useMemo(() => bots.find((b) => b.id === chatbotId) ?? null, [bots, chatbotId]);

  const previewEmbedUrl = useMemo(() => {
    const slug = selectedBot?.publicSlug?.trim();
    if (!slug || !selectedBot) return "";
    return buildFrontendEmbedUrl(slug, selectedBot.widgetVersion);
  }, [selectedBot]);

  const isEditing = Boolean(
    previewSite && readChatIntegrationFromSections(previewSite.sections),
  );

  const draftIntegration = useMemo(() => {
    if (!selectedBot?.publicSlug?.trim() || !chatbotId) return null;
    const existing = previewSite ? readChatIntegrationFromSections(previewSite.sections) : null;
    if (existing?.botId === chatbotId) return existing;
    return {
      botId: chatbotId,
      botName: selectedBot.name,
      publicSlug: selectedBot.publicSlug.trim(),
      position,
      showBubble,
      widgetSize,
    };
  }, [selectedBot, chatbotId, previewSite, position, showBubble, widgetSize]);

  const canConnect = Boolean(websiteId && chatbotId && !connecting && !loadingOptions);

  const onConnect = async () => {
    if (!websiteId || !chatbotId) return;
    setConnecting(true);
    setConnectError(null);
    try {
      await connectWebsiteChatbot({
        websiteId,
        chatbotId,
        position,
        showBubble,
        widgetSize,
      });
      const q = new URLSearchParams({
        websiteId,
        chatbotId,
      });
      router.push(`/integration-manager/completed?${q.toString()}`);
    } catch (e) {
      setConnectError(friendlyUserError(e, "Could not update the connection. Please try again.", "integration"));
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className={wb.page}>
      <DashboardStyleBackNav href={hubBackHref} ariaLabel="Back" />
      <main className={wb.main}>
        <section className={wb.split}>
          <div>
            <article className={wb.panel}>
              <h2 className={wb.panelTitle}>
                {isEditing ? "Change chatbot connection" : "Connect Chatbot to Website"}
              </h2>
              {optionsError ? (
                <div className={wb.errorBlock}>
                  <p className={wb.error} role="alert">
                    {optionsError}
                  </p>
                </div>
              ) : null}
              <div className={wb.field}>
                <label className={wb.label} htmlFor="im-website">
                  Select Website
                </label>
                <select
                  id="im-website"
                  className={wb.select}
                  value={websiteId}
                  disabled={loadingOptions || websites.length === 0}
                  onChange={(e) => setWebsiteId(e.target.value)}
                >
                  {websites.length === 0 ? (
                    <option value="">No websites — create one first</option>
                  ) : (
                    websites.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                        {w.publicUrl ? " (live)" : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className={wb.field}>
                <label className={wb.label} htmlFor="im-chatbot">
                  Select Chatbot
                </label>
                <select
                  id="im-chatbot"
                  className={wb.select}
                  value={chatbotId}
                  disabled={loadingOptions || bots.length === 0}
                  onChange={(e) => setChatbotId(e.target.value)}
                >
                  {bots.length === 0 ? (
                    <option value="">No chatbots — train one first</option>
                  ) : (
                    bots.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                        {b.status === "published" || b.publicSlug ? " (published)" : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </article>

            <article className={`${wb.panel} ${wb.panelGap}`}>
              <h2 className={wb.panelTitle}>Customize Widget</h2>
              <div className={wb.field}>
                <label className={wb.label} htmlFor="im-position">
                  Position on Page
                </label>
                <select
                  id="im-position"
                  className={wb.select}
                  value={position}
                  onChange={(e) => setPosition(e.target.value as WidgetPosition)}
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                </select>
              </div>
              <div className={wb.fieldRow}>
                <label className={wb.label} htmlFor="im-bubble">
                  Show Chat Bubble
                </label>
                <input
                  id="im-bubble"
                  type="checkbox"
                  className={wb.checkbox}
                  checked={showBubble}
                  onChange={(e) => setShowBubble(e.target.checked)}
                />
              </div>
              <div className={wb.field}>
                <span className={wb.label}>Widget Size</span>
                <p className={wb.hintTight} style={{ marginTop: "0.25rem" }}>
                  {widgetSize}px
                </p>
              </div>
              {connectError ? (
                <div className={wb.errorBlock}>
                  <p className={wb.error} role="alert">
                    {connectError}
                  </p>
                </div>
              ) : null}
              <button
                type="button"
                className={`${wb.btn} ${wb.btnTop}`}
                disabled={!canConnect}
                onClick={() => void onConnect()}
              >
                {connecting ? "Saving…" : isEditing ? "Update connection" : "Connect to Website"}
              </button>
            </article>
          </div>

          <article className={wb.previewShell}>
            {previewSite ? (
              <IntegrationLivePreview site={previewSite} integration={draftIntegration} minHeight={420} />
            ) : previewEmbedUrl ? (
              <iframe
                title="Chatbot preview"
                src={previewEmbedUrl}
                style={{ border: 0, width: "100%", height: "100%", minHeight: 420 }}
              />
            ) : (
              <>
                <img className={wb.previewGif} src={PREVIEW_WAIT_GIF} alt="" width={800} height={600} decoding="async" />
                <div className={wb.previewScrim} aria-hidden />
                <div className={wb.previewMessage}>
                  <h3 className={wb.previewHeading}>
                    {selectedBot ? "Publish this chatbot to preview the widget" : "Preview your integration"}
                  </h3>
                  {selectedWebsite ? (
                    <p className={wb.hintTight}>{selectedWebsite.name}</p>
                  ) : null}
                </div>
              </>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
