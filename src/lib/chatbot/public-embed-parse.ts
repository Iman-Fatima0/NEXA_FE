import { defaultBotTheme, parseBotTheme } from "../theme/parse-theme";
import type { ThemePreset, ThemeTokens } from "../theme/types";

export type PublicEmbedConfig = {
  publicSlug: string;
  name: string;
  welcomeMessage: string;
  status: string;
  theme: ThemeTokens;
  themePreset: ThemePreset;
};

function str(v: unknown): string {
  if (v == null) return "";
  return typeof v === "string" ? v : String(v);
}

export function parsePublicEmbedConfig(raw: unknown, fallbackSlug: string): PublicEmbedConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const inner = o.bot && typeof o.bot === "object" ? (o.bot as Record<string, unknown>) : o;
  const config =
    inner.config && typeof inner.config === "object" ? (inner.config as Record<string, unknown>) : inner;

  const publicSlug = str(inner.publicSlug) || str(config.publicSlug) || fallbackSlug;
  if (!publicSlug.trim()) return null;

  const parsedTheme = parseBotTheme(inner) ?? parseBotTheme(config) ?? defaultBotTheme();
  const welcomeMessage =
    str(config.welcomeMessage) ||
    str(inner.welcomeMessage) ||
    "Hi! How can I help you today?";

  return {
    publicSlug: publicSlug.trim(),
    name: str(inner.name) || str(config.name) || "Chatbot",
    welcomeMessage,
    status: str(inner.status) || str(config.status) || "published",
    theme: parsedTheme.theme,
    themePreset: parsedTheme.preset,
  };
}
