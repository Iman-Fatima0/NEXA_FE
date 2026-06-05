import type { CSSProperties } from "react";
import type { AnimationStyle, BubbleShape, HeaderStyle, LauncherStyle, ThemeTokens } from "./types";

const BUBBLE_RADIUS: Record<BubbleShape, string> = {
  rounded: "12px",
  square: "4px",
  pill: "20px",
};

const LAUNCHER_RADIUS: Record<LauncherStyle, string> = {
  circle: "50%",
  square: "12px",
  pill: "999px",
};

const ANIMATION_DURATION: Record<AnimationStyle, string> = {
  none: "0ms",
  smooth: "220ms",
  bounce: "380ms",
};

/** Map theme tokens to CSS custom properties for widget preview. */
export function themeToCssVars(theme: ThemeTokens): CSSProperties {
  return {
    "--nexa-primary": theme.primaryColor,
    "--nexa-secondary": theme.secondaryColor,
    "--nexa-text": theme.textColor,
    "--nexa-bubble-radius": BUBBLE_RADIUS[theme.bubbleShape],
    "--nexa-launcher-radius": LAUNCHER_RADIUS[theme.launcherStyle],
    "--nexa-font": theme.fontFamily,
    "--nexa-anim-duration": ANIMATION_DURATION[theme.animation],
    "--nexa-header-style": theme.headerStyle,
  } as CSSProperties;
}

export function applyThemeToDocument(theme: ThemeTokens): void {
  if (typeof document === "undefined") return;
  const vars = themeToCssVars(theme);
  Object.entries(vars).forEach(([key, value]) => {
    if (typeof value === "string") {
      document.documentElement.style.setProperty(key, value);
    }
  });
}
