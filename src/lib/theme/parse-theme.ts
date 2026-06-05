import { mergeThemeWithOverrides, presetTokens } from "./presets";
import type { ThemePreset, ThemeTokens } from "./types";

const PRESET_IDS: ThemePreset[] = ["whatsapp", "discord", "slack", "modern"];

function isPreset(v: unknown): v is ThemePreset {
  return typeof v === "string" && PRESET_IDS.includes(v as ThemePreset);
}

export type ParsedBotTheme = {
  preset: ThemePreset;
  theme: ThemeTokens;
};

/** Parse saved theme from bot API shape (configSnapshot.theme or theme field). */
export function parseBotTheme(raw: unknown): ParsedBotTheme | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const themeBlock =
    o.theme && typeof o.theme === "object"
      ? (o.theme as Record<string, unknown>)
      : o.configSnapshot && typeof o.configSnapshot === "object"
        ? ((o.configSnapshot as Record<string, unknown>).theme as Record<string, unknown> | undefined)
        : undefined;

  const source = themeBlock ?? o;
  const preset = isPreset(source.preset) ? source.preset : isPreset(o.preset) ? o.preset : "modern";
  const overrides =
    source.overrides && typeof source.overrides === "object"
      ? (source.overrides as Partial<ThemeTokens>)
      : parseFlatThemeFields(source);

  return {
    preset,
    theme: mergeThemeWithOverrides(preset, { ...overrides, ...pickRootColors(o) }),
  };
}

function pickRootColors(o: Record<string, unknown>): Partial<ThemeTokens> {
  const out: Partial<ThemeTokens> = {};
  if (typeof o.primaryColor === "string") out.primaryColor = o.primaryColor;
  return out;
}

function parseFlatThemeFields(source: Record<string, unknown>): Partial<ThemeTokens> {
  const out: Partial<ThemeTokens> = {};
  const keys: (keyof ThemeTokens)[] = [
    "primaryColor",
    "secondaryColor",
    "textColor",
    "bubbleShape",
    "headerStyle",
    "launcherStyle",
    "chatPosition",
    "fontFamily",
    "animation",
    "showBranding",
  ];
  for (const k of keys) {
    if (source[k] !== undefined) {
      (out as Record<string, unknown>)[k] = source[k];
    }
  }
  return out;
}

export function defaultBotTheme(): ParsedBotTheme {
  const preset: ThemePreset = "modern";
  return { preset, theme: presetTokens(preset) };
}
