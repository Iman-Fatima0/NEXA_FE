"use client";

import { useEffect, useState } from "react";
import { parseDescriptionFields, resolveBotDisplayName } from "./bot-display";
import type { PlatformBot } from "./bot-types";
import { fetchDocumentCount, fetchPlatformBot } from "./chatbot-platform-api";
import { presetById } from "./personality-presets";
import { getActiveBotId, getActiveBotName, setActiveBot } from "./session-storage";

export type ActiveBotView = {
  botId: string | null;
  bot: PlatformBot | null;
  botName: string;
  greeting: string;
  purpose: string | null;
  personalityLabel: string | null;
  documentCount: number | null;
  loading: boolean;
  error: string | null;
};

export function useActivePlatformBot(botIdOverride?: string | null): ActiveBotView {
  const [botId, setBotId] = useState<string | null>(null);
  const [bot, setBot] = useState<PlatformBot | null>(null);
  const [documentCount, setDocumentCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = botIdOverride?.trim() || getActiveBotId();
    setBotId(id);
    if (!id) {
      setBot(null);
      setDocumentCount(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const [fetched, docs] = await Promise.all([fetchPlatformBot(id), fetchDocumentCount(id)]);
        if (cancelled) return;
        const displayName = resolveBotDisplayName(getActiveBotName() ?? "", fetched.name);
        const resolved = { ...fetched, name: displayName };
        setBot(resolved);
        setDocumentCount(fetched.documentCount ?? docs);
        setActiveBot(resolved.id, displayName);
      } catch (e) {
        if (!cancelled) {
          setBot(null);
          setError(e instanceof Error ? e.message : "Could not load chatbot.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [botIdOverride]);

  const descMeta = parseDescriptionFields(bot?.description);
  const personalityLabel =
    (bot?.config?.personalityPreset ? presetById(bot.config.personalityPreset).label : null) ??
    descMeta.personalityLabel ??
    null;

  return {
    botId,
    bot,
    botName: bot?.name ?? "Chatbot",
    greeting: bot?.config?.welcomeMessage ?? "Hi! How can I help you today?",
    purpose: descMeta.purpose ?? null,
    personalityLabel,
    documentCount,
    loading,
    error,
  };
}
