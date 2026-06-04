import { BFF_PATHS } from "../api/bff-paths";
import { parseFriendlyBffError } from "./bff-user-errors";

export type NexaBotRecord = {
  id: string;
  name: string;
  description?: string | null;
};

export type ChatStartResponse = {
  sessionId: string;
  botId: string;
};

export type ChatMessageResponse = {
  sessionId: string;
  userMessage: { content: string };
  assistantMessage: { content: string };
};

export type ChatHistoryMessage = {
  id: string;
  role: string;
  content: string;
  createdAt?: string;
};

function pickBotId(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const inner = o.bot && typeof o.bot === "object" ? (o.bot as Record<string, unknown>) : o;
  const id = inner.id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

async function ensureOk(
  res: Response,
  fallback: string,
  context?: "upload" | "url" | "chat" | "train",
): Promise<void> {
  if (!res.ok) {
    throw new Error(await parseFriendlyBffError(res, fallback, context ?? "chat"));
  }
}

export async function createBot(name: string): Promise<NexaBotRecord> {
  const res = await fetch(BFF_PATHS.userBots, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.trim() || "My First Bot" }),
  });
  await ensureOk(res, "Could not create chatbot.", "train");
  const data = (await res.json()) as unknown;
  const id = pickBotId(data);
  if (!id) throw new Error("Create bot response missing id.");
  const o = data as Record<string, unknown>;
  const inner = (o.bot && typeof o.bot === "object" ? o.bot : o) as Record<string, unknown>;
  return {
    id,
    name: typeof inner.name === "string" ? inner.name : name,
    description: typeof inner.description === "string" || inner.description === null ? inner.description : undefined,
  };
}

export async function updateBot(
  botId: string,
  patch: { name?: string; description?: string | null; config?: { welcomeMessage?: string; primaryColor?: string } },
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.description !== undefined) body.description = patch.description;
  if (patch.config?.welcomeMessage !== undefined) {
    body.welcomeMessage = patch.config.welcomeMessage;
  }
  if (patch.config?.primaryColor !== undefined) {
    body.primaryColor = patch.config.primaryColor;
  }
  const res = await fetch(BFF_PATHS.userBot(botId), {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await ensureOk(res, "Could not update chatbot.", "train");
}

export async function ingestDocument(botId: string, file: File): Promise<void> {
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

export async function startChatSession(botId: string): Promise<ChatStartResponse> {
  const res = await fetch(BFF_PATHS.chatStart, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ botId }),
  });
  await ensureOk(res, "Could not start chat session.");
  const data = (await res.json()) as ChatStartResponse;
  if (!data.sessionId) throw new Error("Chat start response missing sessionId.");
  return data;
}

export async function sendChatMessage(
  sessionId: string,
  content: string,
  includeRag = true,
): Promise<ChatMessageResponse> {
  const res = await fetch(BFF_PATHS.chatMessage, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, content, includeRag }),
  });
  await ensureOk(res, "Could not send message.");
  return (await res.json()) as ChatMessageResponse;
}

export async function fetchChatHistory(sessionId: string): Promise<ChatHistoryMessage[]> {
  const res = await fetch(BFF_PATHS.chatHistory(sessionId), {
    credentials: "same-origin",
    cache: "no-store",
  });
  await ensureOk(res, "Could not load chat history.");
  const data = (await res.json()) as { messages?: ChatHistoryMessage[] };
  return Array.isArray(data.messages) ? data.messages : [];
}
