import type { PersonalityPresetId } from "./personality-presets";
import type { ThemePreset, ThemeTokens } from "../theme/types";
import type { BotLiveLinks } from "./bot-live-links";

export type BotConfig = {
  welcomeMessage?: string;
  primaryColor?: string;
  personalityPreset?: PersonalityPresetId;
};

export type BotStatus = "draft" | "published";

export type PlatformBot = {
  id: string;
  name: string;
  description?: string | null;
  status: BotStatus;
  createdAt?: string;
  updatedAt?: string;
  documentCount?: number;
  config?: BotConfig;
  /** Set after publish — unique slug e.g. my-bot-a3f2c1 */
  publicSlug?: string;
  previewUrl?: string;
  embedUrl?: string;
  publicChatUrl?: string;
  widgetScript?: string;
  widgetUrl?: string;
  widgetStatus?: string;
  widgetVersion?: string;
  embedMode?: string;
  allowedDomains?: string[];
  liveLinks?: BotLiveLinks;
  themePreset?: ThemePreset;
  theme?: ThemeTokens;
};

export type BotTrainSummary = {
  name: string;
  personalityLabel: string;
  purpose: string;
  fileCount: number;
  urlCount: number;
  createdAt: string;
};

export type PublishBotResult = BotLiveLinks;

export type AnalyticsSummary = {
  totalConversations?: number;
  totalMessages?: number;
  successRate?: number;
  averageConfidence?: number;
  unansweredCount?: number;
  dailyConversations?: { date: string; count: number }[];
  dailyMessages?: { date: string; count: number }[];
};

export type UnansweredQuestion = {
  id?: string;
  question: string;
  date?: string;
  confidence?: number;
};
