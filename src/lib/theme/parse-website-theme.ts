import { mergeThemeWithOverrides, presetTokens } from "./presets";
import { websiteThemeStyleFromTokens } from "./website-theme-style";
import type { ThemePreset, ThemeTokens } from "./types";

const PRESET_IDS: ThemePreset[] = ["whatsapp", "discord", "slack", "modern"];

function isPreset(v: unknown): v is ThemePreset {
  return typeof v === "string" && PRESET_IDS.includes(v as ThemePreset);
}

export type WebsiteThemeSettings = {
  preset: ThemePreset;
  overrides?: Partial<ThemeTokens>;
};

export type ParsedWebsiteTheme = {
  preset: ThemePreset;
  theme: ThemeTokens;
  style: ReturnType<typeof websiteThemeStyleFromTokens>;
};

export function parseWebsiteTheme(raw: unknown, legacyColor?: string | null): ParsedWebsiteTheme {
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const preset = isPreset(o.preset) ? o.preset : "modern";
    const overrides =
      o.overrides && typeof o.overrides === "object"
        ? (o.overrides as Partial<ThemeTokens>)
        : undefined;
    const theme = mergeThemeWithOverrides(preset, overrides);
    return {
      preset,
      theme,
      style: websiteThemeStyleFromTokens(preset, theme),
    };
  }
  const preset: ThemePreset = "modern";
  const color = legacyColor?.trim();
  const theme = mergeThemeWithOverrides(preset, color ? { primaryColor: color } : undefined);
  return {
    preset,
    theme,
    style: websiteThemeStyleFromTokens(preset, theme),
  };
}

export function defaultWebsiteTheme(): ParsedWebsiteTheme {
  const preset: ThemePreset = "modern";
  const theme = presetTokens(preset);
  return { preset, theme, style: websiteThemeStyleFromTokens(preset, theme) };
}

export function websiteThemeSavePayload(preset: ThemePreset, theme: ThemeTokens): WebsiteThemeSettings {
  const base = presetTokens(preset);
  const overrides: Partial<ThemeTokens> = {};
  (Object.keys(base) as (keyof ThemeTokens)[]).forEach((key) => {
    if (theme[key] !== base[key]) {
      (overrides as Record<string, unknown>)[key] = theme[key];
    }
  });
  return { preset, overrides };
}
