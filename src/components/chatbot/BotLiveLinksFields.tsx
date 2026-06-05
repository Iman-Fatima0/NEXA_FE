"use client";

import { useState } from "react";
import type { BotLiveLinks } from "../../lib/chatbot/bot-live-links";
import { resolveShareablePreviewUrl, toShareableLiveLinks } from "../../lib/chatbot/bot-live-links";
import { CopyField } from "./CopyField";
import styles from "./chatbot-platform.module.css";

type BotLiveLinksFieldsProps = {
  links: BotLiveLinks;
  /** Show widget embed script tab content inline */
  showWidgetScript?: boolean;
};

function widgetScriptFromLinks(links: BotLiveLinks): string {
  if (links.widgetScript || links.embedScript) {
    return links.widgetScript || links.embedScript || "";
  }
  if (links.widgetUrl) {
    return `<script src="${links.widgetUrl}"></script>`;
  }
  return "";
}

export function BotLiveLinksFields({ links, showWidgetScript = true }: BotLiveLinksFieldsProps) {
  const shareable = toShareableLiveLinks(links);
  const previewUrl = resolveShareablePreviewUrl(shareable);
  const embedUrl =
    shareable.embedUrl && shareable.embedUrl !== previewUrl ? shareable.embedUrl : "";
  const widgetScript = widgetScriptFromLinks(shareable);

  if (!previewUrl && !embedUrl && !widgetScript) return null;

  return (
    <div className={styles.liveLinksStack}>
      {previewUrl ? (
        <div>
          <CopyField label="Live preview link" value={previewUrl} mono={false} />
          <div className={styles.actionsRow}>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnPrimary}
              style={{ width: "auto" }}
            >
              Open live preview
            </a>
          </div>
        </div>
      ) : null}
      {embedUrl ? <CopyField label="Embed page URL" value={embedUrl} mono={false} /> : null}
      {shareable.publicSlug ? (
        <CopyField label="Public slug" value={shareable.publicSlug} mono={false} />
      ) : null}
      <p className={styles.sub}>
        Opens your bot on this app with the same chat UI and saved theme. Unique per public slug —
        no API key in the link.
      </p>
      {showWidgetScript && widgetScript ? (
        <CopyField label="Website embed code" value={widgetScript} />
      ) : null}
    </div>
  );
}

/** Compact copy row for bot detail footer */
export function BotLiveLinksCompact({ links }: { links: BotLiveLinks }) {
  const previewUrl = resolveShareablePreviewUrl(toShareableLiveLinks(links));
  const [copied, setCopied] = useState(false);

  if (!previewUrl) return null;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      <span className={styles.label}>Live preview link</span>
      <div className={styles.copyBlock}>
        <code>{previewUrl}</code>
        <button type="button" className={styles.btnSecondary} onClick={() => void onCopy()}>
          {copied ? "Copied" : "Copy"}
        </button>
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.btnSecondary}
        >
          Open
        </a>
      </div>
      {links.publicSlug ? (
        <p className={styles.sub} style={{ marginTop: "0.5rem" }}>
          Slug: <code>{links.publicSlug}</code>
        </p>
      ) : null}
    </div>
  );
}
