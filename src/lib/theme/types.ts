export type ThemePreset = "whatsapp" | "discord" | "slack" | "modern";

export type BubbleShape = "rounded" | "square" | "pill";
export type HeaderStyle = "solid" | "gradient" | "glass";
export type LauncherStyle = "circle" | "square" | "pill";
export type ChatPosition = "bottom-right" | "bottom-left";
export type ThemeFontFamily = "Inter" | "Poppins" | "Roboto";
export type AnimationStyle = "none" | "smooth" | "bounce";

export type ThemeTokens = {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  bubbleShape: BubbleShape;
  headerStyle: HeaderStyle;
  launcherStyle: LauncherStyle;
  chatPosition: ChatPosition;
  fontFamily: ThemeFontFamily;
  animation: AnimationStyle;
  showBranding: boolean;
};

export type ThemeSavePayload = {
  preset: ThemePreset;
  overrides: Partial<ThemeTokens>;
};

export type ThemePresetMeta = {
  id: ThemePreset;
  label: string;
  description: string;
  swatch: string;
  previewBg: string;
};
