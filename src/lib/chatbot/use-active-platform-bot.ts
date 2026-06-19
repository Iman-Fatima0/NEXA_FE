"use client";

import { useEffect, useRef, useState } from "react";
import { parseDescriptionFields, resolveBotDisplayName } from "./bot-display";
import type { ThemeTokens } from "../theme/types";
import type { PlatformBot } from "./bot-types";
import { fetchDocumentCount, fetchPlatformBot } from "./chatbot-platform-api";
import { presetById } from "./personality-presets";
import { setBotThemeCache } from "../theme/use-bot-theme";
import { getActiveBotId, getActiveBotName, setActiveBot } from "./session-storage";

export type InitialBotScreenData = {
  bot: PlatformBot;
  documentCount: number;
};

export type ActiveBotView = {
  botId: string | null;
  bot: PlatformBot | null;
  botName: string;
  greeting: string;
  purpose: string | null;
  personalityLabel: string | null;
  documentCount: number | null;
  theme: ThemeTokens | null;
  loading: boolean;
  error: string | null;
};

function hydrateBotFromScreen(initial: InitialBotScreenData): PlatformBot {
  const displayName = resolveBotDisplayName(getActiveBotName() ?? "", initial.bot.name);
  return { ...initial.bot, name: displayName };
}

export function useActivePlatformBot(
  botIdOverride?: string | null,
  initialScreen?: InitialBotScreenData | null,
): ActiveBotView {
  const serverHydrated = initialScreen != null;
  const [botId, setBotId] = useState<string | null>(() => botIdOverride?.trim() || null);
  const [bot, setBot] = useState<PlatformBot | null>(() =>
    initialScreen ? hydrateBotFromScreen(initialScreen) : null,
  );
  const [documentCount, setDocumentCount] = useState<number | null>(() =>
    initialScreen ? initialScreen.documentCount : null,
  );
  const [loading, setLoading] = useState(!serverHydrated);
  const [error, setError] = useState<string | null>(null);

  const initialScreenRef = useRef(initialScreen);
  initialScreenRef.current = initialScreen;
  const initialBotId = initialScreen?.bot.id ?? null;
  const initialDocCount = initialScreen?.documentCount ?? null;

  useEffect(() => {
    const id = botIdOverride?.trim() || getActiveBotId();
    setBotId((prev) => (prev === id ? prev : id));
    if (!id) {
      setBot(null);
      setDocumentCount(null);
      setLoading(false);
      setError(null);
      return;
    }

    const screen = initialScreenRef.current;
    if (screen && screen.bot.id === id) {
      const resolved = hydrateBotFromScreen(screen);
      setBot(resolved);
      setDocumentCount(screen.documentCount);
      setActiveBot(resolved.id, resolved.name);
      if (resolved.theme) setBotThemeCache(resolved.id, resolved.theme);
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
        if (fetched.theme) setBotThemeCache(resolved.id, fetched.theme);
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
  }, [botIdOverride, initialBotId, initialDocCount]);

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
    theme: bot?.theme ?? null,
    loading,
    error,
  };
}
