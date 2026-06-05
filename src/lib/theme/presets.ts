import type { ThemePreset, ThemePresetMeta, ThemeTokens } from "./types";

export const PRESET_META: ThemePresetMeta[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "Green, friendly messaging",
    swatch: "#25D366",
    previewBg: "linear-gradient(160deg, #075E54 0%, #128C7E 50%, #25D366 100%)",
  },
  {
    id: "discord",
    label: "Discord",
    description: "Dark community chat",
    swatch: "#5865F2",
    previewBg: "linear-gradient(160deg, #1e1f22 0%, #2b2d31 55%, #5865F2 100%)",
  },
  {
    id: "slack",
    label: "Slack",
    description: "Enterprise workspace",
    swatch: "#611F69",
    previewBg: "linear-gradient(160deg, #350d36 0%, #4A154B 45%, #1264A3 100%)",
  },
  {
    id: "modern",
    label: "Modern",
    description: "Clean default look",
    swatch: "#6366f1",
    previewBg: "linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #6366f1 100%)",
  },
];

const BASE: ThemeTokens = {
  primaryColor: "#6366f1",
  secondaryColor: "#818cf8",
  textColor: "#f8fafc",
  bubbleShape: "rounded",
  headerStyle: "gradient",
  launcherStyle: "circle",
  chatPosition: "bottom-right",
  fontFamily: "Inter",
  animation: "smooth",
  showBranding: true,
};

export const PRESET_MAP: Record<ThemePreset, ThemeTokens> = {
  whatsapp: {
    ...BASE,
    primaryColor: "#25D366",
    secondaryColor: "#128C7E",
    textColor: "#ffffff",
    bubbleShape: "rounded",
    headerStyle: "solid",
    launcherStyle: "circle",
    chatPosition: "bottom-right",
    fontFamily: "Inter",
    animation: "smooth",
    showBranding: false,
  },
  discord: {
    ...BASE,
    primaryColor: "#5865F2",
    secondaryColor: "#4752C4",
    textColor: "#f2f3f5",
    bubbleShape: "rounded",
    headerStyle: "solid",
    launcherStyle: "circle",
    chatPosition: "bottom-right",
    fontFamily: "Roboto",
    animation: "smooth",
    showBranding: true,
  },
  slack: {
    ...BASE,
    primaryColor: "#611F69",
    secondaryColor: "#1264A3",
    textColor: "#ffffff",
    bubbleShape: "pill",
    headerStyle: "gradient",
    launcherStyle: "square",
    chatPosition: "bottom-right",
    fontFamily: "Poppins",
    animation: "bounce",
    showBranding: true,
  },
  modern: {
    ...BASE,
    primaryColor: "#6366f1",
    secondaryColor: "#818cf8",
    textColor: "#f8fafc",
    bubbleShape: "rounded",
    headerStyle: "gradient",
    launcherStyle: "circle",
    chatPosition: "bottom-right",
    fontFamily: "Inter",
    animation: "smooth",
    showBranding: true,
  },
};

export function presetTokens(preset: ThemePreset): ThemeTokens {
  return { ...PRESET_MAP[preset] };
}

/** Overrides = fields that differ from the active preset defaults. */
export function themeToOverrides(theme: ThemeTokens, preset: ThemePreset): Partial<ThemeTokens> {
  const base = PRESET_MAP[preset];
  const overrides: Partial<ThemeTokens> = {};
  (Object.keys(base) as (keyof ThemeTokens)[]).forEach((key) => {
    if (theme[key] !== base[key]) {
      (overrides as Record<string, unknown>)[key] = theme[key];
    }
  });
  return overrides;
}

export function mergeThemeWithOverrides(preset: ThemePreset, overrides?: Partial<ThemeTokens> | null): ThemeTokens {
  return { ...PRESET_MAP[preset], ...overrides };
}
