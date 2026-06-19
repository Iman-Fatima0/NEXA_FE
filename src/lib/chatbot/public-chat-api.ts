import { BFF_PATHS } from "../api/bff-paths";
import { parseFriendlyBffError } from "./bff-user-errors";
import type { ChatHistoryMessage, ChatMessageResponse, ChatStartResponse } from "./chatbot-builder-api";

async function ensureOk(res: Response, fallback: string): Promise<void> {
  if (!res.ok) {
    throw new Error(await parseFriendlyBffError(res, fallback, "chat"));
  }
}

function pickSessionId(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = o.sessionId ?? o.session_id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

export async function fetchPublicEmbedConfig(publicSlug: string) {
  const res = await fetch(BFF_PATHS.publicEmbedConfig(publicSlug), { cache: "no-store" });
  await ensureOk(res, "This chatbot is not available.");
  return res.json();
}

export async function startPublicChatSession(publicSlug: string): Promise<ChatStartResponse> {
  const res = await fetch(BFF_PATHS.publicChatStart, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicSlug }),
  });
  await ensureOk(res, "Could not start chat session.");
  const data = (await res.json()) as unknown;
  const sessionId = pickSessionId(data);
  if (!sessionId) throw new Error("Could not start chat. Please try again.");
  return { sessionId, botId: publicSlug };
}

export async function sendPublicChatMessage(
  publicSlug: string,
  sessionId: string,
  content: string,
  includeRag = true,
): Promise<ChatMessageResponse> {
  const res = await fetch(BFF_PATHS.publicChatMessage, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicSlug, sessionId, content, includeRag }),
  });
  await ensureOk(res, "Could not send message.");
  return (await res.json()) as ChatMessageResponse;
}

export async function fetchPublicChatHistory(
  publicSlug: string,
  sessionId: string,
): Promise<ChatHistoryMessage[]> {
  const res = await fetch(BFF_PATHS.publicChatHistory(sessionId, publicSlug), { cache: "no-store" });
  await ensureOk(res, "Could not load chat history.");
  const data = (await res.json()) as { messages?: ChatHistoryMessage[] };
  return Array.isArray(data.messages) ? data.messages : [];
}
