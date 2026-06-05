"use client";

import { useEffect, useState } from "react";
import { ChatPanel } from "../../../../components/chatbot/ChatPanel";
import { fetchPublicEmbedConfig } from "../../../../lib/chatbot/public-chat-api";
import { parsePublicEmbedConfig, type PublicEmbedConfig } from "../../../../lib/chatbot/public-embed-parse";
import { setBotThemeCache } from "../../../../lib/theme/use-bot-theme";
import pe from "./public-embed.module.css";

type PublicEmbedClientProps = { slug: string };

export default function PublicEmbedClient({ slug }: PublicEmbedClientProps) {
  const [config, setConfig] = useState<PublicEmbedConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await fetchPublicEmbedConfig(slug);
        if (cancelled) return;
        const parsed = parsePublicEmbedConfig(raw, slug);
        if (!parsed) {
          setError("This chatbot is not available.");
          return;
        }
        if (parsed.status && parsed.status !== "published") {
          setError("This chatbot is not live yet.");
          return;
        }
        setBotThemeCache(parsed.publicSlug, parsed.theme);
        setConfig(parsed);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "This chatbot is not available.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className={pe.page}>
        <div className={pe.loading}>Loading chatbot…</div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className={pe.page}>
        <div className={pe.error} role="alert">
          {error ?? "This chatbot is not available."}
        </div>
      </div>
    );
  }

  return (
    <div className={pe.page}>
      <div className={pe.shell}>
        <ChatPanel
          publicSlug={config.publicSlug}
          botName={config.name}
          greeting={config.welcomeMessage}
          savedTheme={config.theme}
          tall
          fullPage
        />
      </div>
    </div>
  );
}
