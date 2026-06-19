import type { ChatHistoryMessage } from "../chatbot/chatbot-builder-api";
import { parsePlatformBot } from "../chatbot/bot-parse";
import type { PlatformBot } from "../chatbot/bot-types";
import {
  normalizeWebsiteDetailPayload,
  type BackendWebsiteRow,
} from "./bff-website-normalize";
import { integrationDetailFromWebsite } from "./bff-integration-compose";
import type { UserGalleryItem } from "../user-gallery-item";
import type { UserWebsite } from "../user-websites-types";
import type { WebsiteTemplate } from "../website-templates-types";
import {
  pathChatHistory,
  pathChatStart,
  pathDocumentsList,
  pathUserBotDetail,
  pathUserWebsiteDetail,
  pathWebsiteTemplatesList,
} from "./upstream-paths";
import { upstreamGet, upstreamPost } from "./server-session";

export type BotScreenChatBootstrap = {
  sessionId: string;
  messages: ChatHistoryMessage[];
};

export type BotScreenPayload = {
  bot: PlatformBot;
  documentCount: number;
  chat: BotScreenChatBootstrap | null;
};

export type WebsiteScreenPayload = {
  website: UserWebsite;
};

export type WebsiteBuilderScreenPayload = {
  website: UserWebsite;
  templates: WebsiteTemplate[];
};

export type IntegrationScreenPayload = {
  integration: UserGalleryItem;
};

function countDocuments(raw: unknown): number {
  if (Array.isArray(raw)) return raw.length;
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.documents)) return o.documents.length;
    if (Array.isArray(o.items)) return o.items.length;
  }
  return 0;
}

function parseChatHistoryMessages(raw: unknown): ChatHistoryMessage[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  const list = o.messages;
  if (!Array.isArray(list)) return [];
  return list.filter(
    (m): m is ChatHistoryMessage =>
      Boolean(m) &&
      typeof m === "object" &&
      typeof (m as ChatHistoryMessage).id === "string" &&
      typeof (m as ChatHistoryMessage).role === "string" &&
      typeof (m as ChatHistoryMessage).content === "string",
  );
}

async function bootstrapBotChat(
  token: string,
  botId: string,
): Promise<BotScreenChatBootstrap | null> {
  try {
    const startRes = await upstreamPost(token, pathChatStart(), { botId });
    if (!startRes.ok) return null;
    const started = (await startRes.json().catch(() => null)) as { sessionId?: string } | null;
    const sessionId = typeof started?.sessionId === "string" ? started.sessionId.trim() : "";
    if (!sessionId) return null;
    const historyRes = await upstreamGet(token, pathChatHistory(sessionId));
    if (!historyRes.ok) {
      return { sessionId, messages: [] };
    }
    const messages = parseChatHistoryMessages(await historyRes.json().catch(() => null));
    return { sessionId, messages };
  } catch {
    return null;
  }
}

/** Bot metadata only — no documents list or chat bootstrap (edit / test entry). */
export async function composeBotDetail(token: string, botId: string): Promise<PlatformBot | null> {
  const trimmedId = botId.trim();
  if (!trimmedId) return null;

  const botRes = await upstreamGet(token, pathUserBotDetail(trimmedId));
  if (botRes.status === 401 || botRes.status === 403) return null;
  if (botRes.status === 404) return null;
  if (!botRes.ok) return null;

  return parsePlatformBot(await botRes.json().catch(() => null));
}

/** One round-trip compose: bot + document count + chat session/history. */
export async function composeBotScreen(token: string, botId: string): Promise<BotScreenPayload | null> {
  const trimmedId = botId.trim();
  if (!trimmedId) return null;

  const [botRes, docsRes] = await Promise.all([
    upstreamGet(token, pathUserBotDetail(trimmedId)),
    upstreamGet(token, pathDocumentsList(trimmedId)),
  ]);

  if (botRes.status === 401 || botRes.status === 403) return null;
  if (botRes.status === 404) return null;
  if (!botRes.ok) return null;

  const bot = parsePlatformBot(await botRes.json().catch(() => null));
  if (!bot) return null;

  const documentCount = docsRes.ok ? countDocuments(await docsRes.json().catch(() => null)) : 0;
  const chat = await bootstrapBotChat(token, trimmedId);

  return {
    bot: { ...bot, documentCount: bot.documentCount ?? documentCount },
    documentCount,
    chat,
  };
}

export async function composeWebsiteScreen(token: string, websiteId: string): Promise<WebsiteScreenPayload | null> {
  const trimmedId = websiteId.trim();
  if (!trimmedId) return null;

  const res = await upstreamGet(token, pathUserWebsiteDetail(trimmedId));
  if (res.status === 401 || res.status === 403 || res.status === 404) return null;
  if (!res.ok) return null;

  const detail = normalizeWebsiteDetailPayload(await res.json().catch(() => null));
  if (!detail?.website) return null;
  return { website: detail.website };
}

function normalizeTemplatesList(raw: unknown): WebsiteTemplate[] {
  if (Array.isArray(raw)) return raw as WebsiteTemplate[];
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.templates)) return o.templates as WebsiteTemplate[];
  }
  return [];
}

/** Website builder edit screen: site detail + templates in parallel. */
export async function composeWebsiteBuilderScreen(
  token: string,
  websiteId: string,
): Promise<WebsiteBuilderScreenPayload | null> {
  const trimmedId = websiteId.trim();
  if (!trimmedId) return null;

  const [siteRes, templatesRes] = await Promise.all([
    upstreamGet(token, pathUserWebsiteDetail(trimmedId)),
    upstreamGet(token, pathWebsiteTemplatesList()),
  ]);

  if (siteRes.status === 401 || siteRes.status === 403 || siteRes.status === 404) return null;
  if (!siteRes.ok) return null;

  const detail = normalizeWebsiteDetailPayload(await siteRes.json().catch(() => null));
  if (!detail?.website) return null;

  const templates = templatesRes.ok
    ? normalizeTemplatesList(await templatesRes.json().catch(() => []))
    : [];

  return { website: detail.website, templates };
}

export async function composeIntegrationScreen(
  token: string,
  websiteId: string,
): Promise<IntegrationScreenPayload | null> {
  const trimmedId = websiteId.trim();
  if (!trimmedId) return null;

  const res = await upstreamGet(token, pathUserWebsiteDetail(trimmedId));
  if (res.status === 401 || res.status === 403 || res.status === 404) return null;
  if (!res.ok) return null;

  const raw = await res.json().catch(() => null);
  const detail = integrationDetailFromWebsite(raw, trimmedId);
  if (!detail?.integration) return null;
  return { integration: detail.integration };
}

/** Preview screen for website entity (full builder fields). */
export async function composeWebsitePreviewScreen(
  token: string,
  websiteId: string,
): Promise<{ item: UserGalleryItem } | null> {
  const screen = await composeWebsiteScreen(token, websiteId);
  if (!screen) return null;
  const w = screen.website;
  return {
    item: {
      ...w,
      sections: w.sections,
      previewUrl: w.publicUrl ?? undefined,
    },
  };
}

export type { BackendWebsiteRow };
