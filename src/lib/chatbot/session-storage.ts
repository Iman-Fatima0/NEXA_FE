/** Browser session keys for the active chatbot builder / test flow. */

import type { BotTrainSummary } from "./bot-types";

export const NEXA_ACTIVE_BOT_ID_KEY = "nexa_active_bot_id";
export const NEXA_ACTIVE_BOT_NAME_KEY = "nexa_active_bot_name";
export const NEXA_CHAT_SESSION_ID_KEY = "nexa_chat_session_id";
export const NEXA_CHAT_SESSION_BOT_ID_KEY = "nexa_chat_session_bot_id";
export const NEXA_BOT_TRAIN_SUMMARY_KEY = "nexa_bot_train_summary";

export function setActiveBot(botId: string, name?: string): void {
  try {
    globalThis.sessionStorage?.setItem(NEXA_ACTIVE_BOT_ID_KEY, botId);
    if (name) globalThis.sessionStorage?.setItem(NEXA_ACTIVE_BOT_NAME_KEY, name);
  } catch {
    /* ignore */
  }
}

export function getActiveBotId(): string | null {
  try {
    return globalThis.sessionStorage?.getItem(NEXA_ACTIVE_BOT_ID_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

export function getActiveBotName(): string | null {
  try {
    return globalThis.sessionStorage?.getItem(NEXA_ACTIVE_BOT_NAME_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

export function setChatSessionId(sessionId: string, botId?: string): void {
  try {
    globalThis.sessionStorage?.setItem(NEXA_CHAT_SESSION_ID_KEY, sessionId);
    if (botId) globalThis.sessionStorage?.setItem(NEXA_CHAT_SESSION_BOT_ID_KEY, botId);
  } catch {
    /* ignore */
  }
}

export function getChatSessionId(): string | null {
  try {
    return globalThis.sessionStorage?.getItem(NEXA_CHAT_SESSION_ID_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

export function getChatSessionBotId(): string | null {
  try {
    return globalThis.sessionStorage?.getItem(NEXA_CHAT_SESSION_BOT_ID_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

export function clearChatSessionId(): void {
  try {
    globalThis.sessionStorage?.removeItem(NEXA_CHAT_SESSION_ID_KEY);
    globalThis.sessionStorage?.removeItem(NEXA_CHAT_SESSION_BOT_ID_KEY);
  } catch {
    /* ignore */
  }
}

export function setBotTrainSummary(summary: BotTrainSummary): void {
  try {
    globalThis.sessionStorage?.setItem(NEXA_BOT_TRAIN_SUMMARY_KEY, JSON.stringify(summary));
  } catch {
    /* ignore */
  }
}

export function getBotTrainSummary(): BotTrainSummary | null {
  try {
    const raw = globalThis.sessionStorage?.getItem(NEXA_BOT_TRAIN_SUMMARY_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BotTrainSummary;
  } catch {
    return null;
  }
}
