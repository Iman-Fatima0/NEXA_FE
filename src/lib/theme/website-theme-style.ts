import type { ThemePreset, ThemeTokens } from "./types";

export type WebsiteThemeStyle = {
  accent: string;
  secondary: string;
  text: string;
  mutedText: string;
  background: string;
  sectionAlt: string;
  headerBackground: string;
  headerBorder: string;
  footerBackground: string;
  fontFamily: string;
  ctaRadius: string;
  isDark: boolean;
};

const PAGE_BY_PRESET: Record<
  ThemePreset,
  Pick<WebsiteThemeStyle, "background" | "sectionAlt" | "headerBackground" | "headerBorder" | "footerBackground" | "isDark" | "mutedText">
> = {
  modern: {
    background: "#f8fafc",
    sectionAlt: "#f1f5f9",
    headerBackground: "rgba(255,255,255,0.92)",
    headerBorder: "#e2e8f0",
    footerBackground: "#fff",
    isDark: false,
    mutedText: "#64748b",
  },
  whatsapp: {
    background: "#ece5dd",
    sectionAlt: "#f5f0ea",
    headerBackground: "rgba(255,255,255,0.92)",
    headerBorder: "#d4ccc4",
    footerBackground: "#fff",
    isDark: false,
    mutedText: "#5c534a",
  },
  discord: {
    background: "#313338",
    sectionAlt: "#2b2d31",
    headerBackground: "rgba(43,45,49,0.95)",
    headerBorder: "#1e1f22",
    footerBackground: "#2b2d31",
    isDark: true,
    mutedText: "#b5bac1",
  },
  slack: {
    background: "#f8f8f8",
    sectionAlt: "#ffffff",
    headerBackground: "rgba(255,255,255,0.95)",
    headerBorder: "#e8e8e8",
    footerBackground: "#fff",
    isDark: false,
    mutedText: "#616061",
  },
};

const CTA_RADIUS: Record<ThemeTokens["bubbleShape"], string> = {
  rounded: "12px",
  square: "4px",
  pill: "999px",
};

const CHAT_BG_BY_PRESET: Record<ThemePreset, string> = {
  modern: "#f8fafc",
  whatsapp: "#ece5dd",
  discord: "#313338",
  slack: "#f8f8f8",
};

export function websiteThemeStyleFromTokens(preset: ThemePreset, tokens: ThemeTokens): WebsiteThemeStyle {
  const page = PAGE_BY_PRESET[preset];
  const chatBg = CHAT_BG_BY_PRESET[preset];
  return {
    accent: tokens.primaryColor,
    secondary: tokens.secondaryColor,
    text: tokens.textColor,
    mutedText: page.mutedText,
    background: preset === "discord" ? chatBg : page.background,
    sectionAlt: page.sectionAlt,
    headerBackground:
      tokens.headerStyle === "gradient"
        ? `linear-gradient(135deg, ${tokens.primaryColor}, ${tokens.secondaryColor})`
        : page.headerBackground,
    headerBorder: page.headerBorder,
    footerBackground: page.footerBackground,
    fontFamily: tokens.fontFamily,
    ctaRadius: CTA_RADIUS[tokens.bubbleShape] ?? "999px",
    isDark: page.isDark,
  };
}
