"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardStyleBackNav from "../../../components/gallery/DashboardStyleBackNav";
import IntegrationLivePreview from "../../../components/integration/IntegrationLivePreview";
import { fetchUserWebsiteById } from "../../../lib/fetch-user-websites";
import { fetchPlatformBot } from "../../../lib/chatbot/chatbot-platform-api";
import {
  readChatIntegrationFromSections,
  type ChatIntegrationMeta,
} from "../../../lib/integration/chat-integration";
import { disconnectIntegration, integrationEditHref } from "../../../lib/integration/integration-api";
import { ConfirmModal } from "../../../components/chatbot/ConfirmModal";
import type { UserGalleryItem } from "../../../lib/user-gallery-item";
import { resolveWebsitePublicUrl } from "../../../lib/website-public-url";
import wb from "../../website-builder/website-builder.module.css";

type IntegrationCompletedClientProps = Readonly<{
  hubBackHref: string;
}>;

export default function IntegrationCompletedClient({ hubBackHref }: IntegrationCompletedClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("websiteId")?.trim() ?? "";
  const chatbotId = searchParams.get("chatbotId")?.trim() ?? "";

  const [site, setSite] = useState<UserGalleryItem | null>(null);
  const [link, setLink] = useState<ChatIntegrationMeta | null>(null);
  const [websiteName, setWebsiteName] = useState("My Business Website");
  const [botName, setBotName] = useState("Customer Support Bot");
  const [position, setPosition] = useState("Bottom Right");
  const [showBubble, setShowBubble] = useState(true);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  useEffect(() => {
    if (!websiteId) return;
    let cancelled = false;
    void (async () => {
      try {
        const loaded = await fetchUserWebsiteById(websiteId);
        if (cancelled) return;
        setSite(loaded);
        setWebsiteName(loaded.name);
        const resolved = resolveWebsitePublicUrl({
          publicUrl: loaded.publicUrl,
          slug: loaded.slug,
          status: loaded.status,
        });
        setLiveUrl(resolved || null);
        const integration = readChatIntegrationFromSections(loaded.sections);
        if (integration) {
          setLink(integration);
          setPosition(integration.position.replace(/-/g, " "));
          setShowBubble(integration.showBubble);
          if (integration.botName) setBotName(integration.botName);
        }
      } catch {
        /* keep defaults */
      }
      const botIdForName = chatbotId;
      if (botIdForName && !cancelled) {
        try {
          const bot = await fetchPlatformBot(botIdForName);
          if (!cancelled) setBotName(bot.name);
        } catch {
          /* keep defaults */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [websiteId, chatbotId]);

  const editHref = websiteId ? integrationEditHref(websiteId, chatbotId || link?.botId) : null;

  const onRemoveConnection = async () => {
    if (!websiteId) return;
    setRemoving(true);
    setRemoveError(null);
    try {
      await disconnectIntegration(websiteId);
      setRemoveOpen(false);
      router.push("/dashboard/integrations");
    } catch (e) {
      setRemoveError(e instanceof Error ? e.message : "Could not remove connection.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className={wb.page}>
      <DashboardStyleBackNav href={hubBackHref} ariaLabel="Back" />
      <ConfirmModal
        open={removeOpen}
        title="Remove connection?"
        message={`The chat widget will be removed from "${websiteName}". The website and chatbot will not be deleted.`}
        confirmLabel="Remove connection"
        danger
        busy={removing}
        onCancel={() => setRemoveOpen(false)}
        onConfirm={() => void onRemoveConnection()}
      />
      <div className={wb.topExtras}>
        {editHref ? (
          <Link href={editHref} className={wb.topExtraGhost}>
            Change connection
          </Link>
        ) : null}
        {websiteId ? (
          <button type="button" className={wb.topExtraGhost} onClick={() => setRemoveOpen(true)}>
            Remove connection
          </button>
        ) : null}
        {liveUrl ? (
          <Link href={liveUrl} className={wb.topExtraPrimary} target="_blank" rel="noreferrer">
            View live site
          </Link>
        ) : (
          <Link href={`/website-builder/create?id=${encodeURIComponent(websiteId)}`} className={wb.topExtraPrimary}>
            Publish website
          </Link>
        )}
      </div>
      <main className={`${wb.main} ${wb.mainToolbarSpace}`}>
        <section className={wb.split}>
          <div>
            <article className={wb.panel}>
              <h2 className={wb.panelTitle}>Connect Chatbot to Website</h2>
              <div className={wb.field}>
                <label className={wb.label} htmlFor="im-done-website">
                  Website
                </label>
                <input id="im-done-website" className={wb.input} value={websiteName} readOnly />
              </div>
              <div className={wb.field}>
                <label className={wb.label} htmlFor="im-done-bot">
                  Chatbot
                </label>
                <input id="im-done-bot" className={wb.input} value={botName} readOnly />
              </div>
            </article>

            <article className={`${wb.panel} ${wb.panelGap}`}>
              <h2 className={wb.panelTitle}>Widget settings</h2>
              <div className={wb.field}>
                <label className={wb.label} htmlFor="im-done-pos">
                  Position on Page
                </label>
                <input id="im-done-pos" className={wb.input} value={position} readOnly />
              </div>
              <div className={wb.fieldRow}>
                <label className={wb.label} htmlFor="im-done-bubble">
                  Show Chat Bubble
                </label>
                <input id="im-done-bubble" type="checkbox" className={wb.checkbox} checked={showBubble} disabled />
              </div>
              <p className={wb.hintTight}>
                Connected integrations appear under{" "}
                <Link href="/dashboard/integrations">Dashboard → Integrations</Link>.
              </p>
              {removeError ? (
                <div className={wb.errorBlock}>
                  <p className={wb.error}>{removeError}</p>
                </div>
              ) : null}
            </article>
          </div>

          <article className={wb.panel}>
            <h2 className={wb.panelTitle}>Live Preview</h2>
            <div className={wb.ctaBanner}>
              <h3 className={wb.ctaBannerTitle}>Integration complete</h3>
              <p className={wb.ctaBannerText}>
                {liveUrl
                  ? "Your chatbot widget is on the live site below."
                  : "Preview below — publish the website to share a live URL."}
              </p>
            </div>
            {site ? (
              <IntegrationLivePreview site={site} integration={link} minHeight={480} />
            ) : (
              <p className={wb.hint}>Loading preview…</p>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
