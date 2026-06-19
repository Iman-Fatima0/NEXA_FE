import { cache } from "react";
import {
  composeBotDetail,
  composeBotScreen,
  composeIntegrationScreen,
  composeWebsiteBuilderScreen,
  composeWebsitePreviewScreen,
  type BotScreenPayload,
  type IntegrationScreenPayload,
  type WebsiteBuilderScreenPayload,
} from "./compose-screens";
import type { PlatformBot } from "../chatbot/bot-types";
import type { UserGalleryItem } from "../user-gallery-item";
import { getServerAccessToken } from "./server-session";

export const fetchBotScreenServer = cache(async (botId: string): Promise<BotScreenPayload | null> => {
  const token = await getServerAccessToken();
  if (!token) return null;
  return composeBotScreen(token, botId);
});

export const fetchBotDetailServer = cache(async (botId: string): Promise<PlatformBot | null> => {
  const token = await getServerAccessToken();
  if (!token) return null;
  return composeBotDetail(token, botId);
});

export const fetchWebsiteBuilderScreenServer = cache(
  async (websiteId: string): Promise<WebsiteBuilderScreenPayload | null> => {
    const token = await getServerAccessToken();
    if (!token) return null;
    return composeWebsiteBuilderScreen(token, websiteId);
  },
);

export const fetchIntegrationPreviewServer = cache(
  async (websiteId: string): Promise<IntegrationScreenPayload | null> => {
    const token = await getServerAccessToken();
    if (!token) return null;
    return composeIntegrationScreen(token, websiteId);
  },
);

export const fetchWebsitePreviewServer = cache(
  async (websiteId: string): Promise<UserGalleryItem | null> => {
    const token = await getServerAccessToken();
    if (!token) return null;
    const screen = await composeWebsitePreviewScreen(token, websiteId);
    return screen?.item ?? null;
  },
);

export const fetchBotPreviewServer = cache(async (botId: string): Promise<UserGalleryItem | null> => {
  const token = await getServerAccessToken();
  if (!token) return null;
  const screen = await composeBotScreen(token, botId);
  if (!screen) return null;
  return {
    id: screen.bot.id,
    name: screen.bot.name,
    description: screen.bot.description ?? undefined,
    updatedAt: screen.bot.updatedAt,
    createdAt: screen.bot.createdAt,
    href: `/dashboard/bots/${screen.bot.id}`,
  };
});

export type { WebsiteBuilderScreenPayload };
