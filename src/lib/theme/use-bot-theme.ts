"use client";

import { useEffect, useState } from "react";
import { fetchPlatformBotRaw } from "../chatbot/chatbot-platform-api";
import { defaultBotTheme, parseBotTheme } from "./parse-theme";
import { presetTokens } from "./presets";
import type { ThemeTokens } from "./types";

const themeCache = new Map<string, ThemeTokens>();

export function invalidateBotThemeCache(botId: string): void {
  themeCache.delete(botId);
}

export function setBotThemeCache(botId: string, theme: ThemeTokens): void {
  themeCache.set(botId, theme);
}

/** Load saved theme for a bot (memory-cached). Falls back to modern preset. */
export function useBotTheme(botId: string, initialTheme?: ThemeTokens | null): ThemeTokens {
  const [theme, setTheme] = useState<ThemeTokens>(
    () => initialTheme ?? themeCache.get(botId) ?? presetTokens("modern"),
  );

  useEffect(() => {
    if (initialTheme) {
      setTheme(initialTheme);
      themeCache.set(botId, initialTheme);
      return;
    }

    const cached = themeCache.get(botId);
    if (cached) {
      setTheme(cached);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const raw = await fetchPlatformBotRaw(botId);
        if (cancelled) return;
        const parsed = parseBotTheme(raw) ?? defaultBotTheme();
        themeCache.set(botId, parsed.theme);
        setTheme(parsed.theme);
      } catch {
        if (!cancelled) {
          const fallback = defaultBotTheme().theme;
          setTheme(fallback);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [botId, initialTheme]);

  return theme;
}
