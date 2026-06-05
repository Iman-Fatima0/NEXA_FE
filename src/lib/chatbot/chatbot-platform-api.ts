import { BFF_PATHS } from "../api/bff-paths";
import { parseBotLiveLinks } from "./bot-live-links";
import {
  parseAnalyticsSummary,
  parsePlatformBot,
  parsePlatformBotsList,
  parsePublishResult,
  parseUnansweredList,
  pickBotId,
} from "./bot-parse";
import { parseFriendlyBffError } from "./bff-user-errors";
import { resolveBotDisplayName } from "./bot-display";
import type { ThemeSavePayload } from "../theme/types";
import type { BotLiveLinks } from "./bot-live-links";
import type {
  AnalyticsSummary,
  BotConfig,
  PlatformBot,
  PublishBotResult,
  UnansweredQuestion,
} from "./bot-types";

export type { ChatHistoryMessage, ChatMessageResponse, ChatStartResponse } from "./chatbot-builder-api";
export {
  fetchChatHistory,
  sendChatMessage,
  startChatSession,
} from "./chatbot-builder-api";

async function ensureOk(res: Response, fallback: string, context?: "upload" | "url" | "chat" | "train"): Promise<void> {
  if (!res.ok) {
    throw new Error(await parseFriendlyBffError(res, fallback, context));
  }
}

export async function listPlatformBots(): Promise<PlatformBot[]> {
  const res = await fetch(BFF_PATHS.userBots, { credentials: "same-origin", cache: "no-store" });
  await ensureOk(res, "Could not load your chatbots.");
  const data = await res.json();
  return parsePlatformBotsList(data);
}

export async function fetchPlatformBotRaw(botId: string): Promise<unknown> {
  const res = await fetch(BFF_PATHS.userBot(botId), { credentials: "same-origin", cache: "no-store" });
  await ensureOk(res, "Chatbot unavailable.");
  return res.json();
}

export async function fetchPlatformBot(botId: string): Promise<PlatformBot> {
  const data = await fetchPlatformBotRaw(botId);
  const bot = parsePlatformBot(data);
  if (!bot) throw new Error("Chatbot unavailable.");
  return bot;
}

export async function createPlatformBot(name: string): Promise<PlatformBot> {
  const res = await fetch(BFF_PATHS.userBots, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.trim() || "My Chatbot" }),
  });
  await ensureOk(res, "Could not create your chatbot.", "train");
  const data = await res.json();
  const requested = name.trim();
  const bot = parsePlatformBot(data);
  if (!bot) {
    const id = pickBotId(data);
    if (!id) throw new Error("Could not create your chatbot.");
    return { id, name: resolveBotDisplayName(requested), status: "draft" };
  }
  return { ...bot, name: resolveBotDisplayName(requested, bot.name) };
}

export async function updatePlatformBot(
  botId: string,
  patch: { name?: string; description?: string | null; config?: BotConfig },
): Promise<void> {
  /** NestJS PATCH /bots/:id — flat fields only (no nested `config`). */
  const body: Record<string, unknown> = {};
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.description !== undefined) body.description = patch.description;
  if (patch.config?.welcomeMessage !== undefined) body.welcomeMessage = patch.config.welcomeMessage;
  if (patch.config?.primaryColor !== undefined) body.primaryColor = patch.config.primaryColor;
  const res = await fetch(BFF_PATHS.userBot(botId), {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await ensureOk(res, "Could not save chatbot settings.", "train");
}

export async function deletePlatformBot(botId: string): Promise<void> {
  const res = await fetch(BFF_PATHS.userBot(botId), {
    method: "DELETE",
    credentials: "same-origin",
  });
  await ensureOk(res, "Could not delete this chatbot.");
}

export async function ingestPlatformDocument(botId: string, file: File): Promise<void> {
  const form = new FormData();
  form.append("file", file);
  form.append("botId", botId);
  const res = await fetch(BFF_PATHS.documentsIngest, {
    method: "POST",
    credentials: "same-origin",
    body: form,
  });
  await ensureOk(res, "Document upload failed.", "upload");
}

export async function ingestPlatformUrl(botId: string, url: string): Promise<void> {
  const res = await fetch(BFF_PATHS.documentsIngestUrl, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ botId, url: url.trim() }),
  });
  await ensureOk(res, "Knowledge processing failed for that website.", "url");
}

export async function savePlatformBotTheme(botId: string, payload: ThemeSavePayload): Promise<void> {
  const res = await fetch(BFF_PATHS.userBotTheme(botId), {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await ensureOk(res, "Could not save theme.");
}

export async function publishPlatformBot(botId: string): Promise<PublishBotResult> {
  const res = await fetch(BFF_PATHS.userBotPublish(botId), {
    method: "POST",
    credentials: "same-origin",
  });
  await ensureOk(res, "Could not publish your chatbot.");
  const data = await res.json();
  return parsePublishResult(data);
}

export async function fetchBotLiveLinks(botId: string): Promise<BotLiveLinks> {
  const res = await fetch(BFF_PATHS.userBotLiveLinks(botId), {
    credentials: "same-origin",
    cache: "no-store",
  });
  await ensureOk(res, "Could not load live links.");
  const data = await res.json();
  return parseBotLiveLinks(data);
}

export async function unpublishPlatformBot(botId: string): Promise<void> {
  const res = await fetch(BFF_PATHS.userBotUnpublish(botId), {
    method: "POST",
    credentials: "same-origin",
  });
  await ensureOk(res, "Could not unpublish your chatbot.");
}

export async function fetchBotAnalyticsSummary(botId: string): Promise<AnalyticsSummary> {
  const res = await fetch(BFF_PATHS.userBotAnalyticsSummary(botId), {
    credentials: "same-origin",
    cache: "no-store",
  });
  await ensureOk(res, "Analytics are not available right now.");
  const data = await res.json();
  return parseAnalyticsSummary(data);
}

export async function fetchBotUnansweredQuestions(botId: string): Promise<UnansweredQuestion[]> {
  const res = await fetch(BFF_PATHS.userBotAnalyticsUnanswered(botId), {
    credentials: "same-origin",
    cache: "no-store",
  });
  await ensureOk(res, "Could not load unanswered questions.");
  const data = await res.json();
  return parseUnansweredList(data);
}

export async function refreshWidgetConfig(botId: string): Promise<void> {
  const res = await fetch(BFF_PATHS.userBotRefreshConfig(botId), {
    method: "POST",
    credentials: "same-origin",
  });
  await ensureOk(res, "Could not refresh widget configuration.");
}

export async function regenerateBotApiKey(botId: string): Promise<{ apiKey?: string }> {
  const res = await fetch(BFF_PATHS.userBotRegenerateApiKey(botId), {
    method: "POST",
    credentials: "same-origin",
  });
  await ensureOk(res, "Could not regenerate access key.");
  const data = (await res.json()) as Record<string, unknown>;
  let key: string | undefined;
  if (typeof data.apiKey === "string") key = data.apiKey;
  else if (typeof data.key === "string") key = data.key;
  else if (data.data && typeof data.data === "object") {
    const inner = (data.data as Record<string, unknown>).apiKey;
    if (typeof inner === "string") key = inner;
  }
  return { apiKey: key };
}

export async function fetchDocumentCount(botId: string): Promise<number> {
  try {
    const res = await fetch(BFF_PATHS.documents(botId), { credentials: "same-origin", cache: "no-store" });
    if (!res.ok) return 0;
    const data = await res.json();
    if (Array.isArray(data)) return data.length;
    if (data && typeof data === "object") {
      const o = data as Record<string, unknown>;
      if (Array.isArray(o.documents)) return o.documents.length;
      if (Array.isArray(o.items)) return o.items.length;
    }
    return 0;
  } catch {
    return 0;
  }
}
