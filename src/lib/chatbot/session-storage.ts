/** Browser session keys for the active chatbot builder / test flow. */

export const NEXA_ACTIVE_BOT_ID_KEY = "nexa_active_bot_id";
export const NEXA_ACTIVE_BOT_NAME_KEY = "nexa_active_bot_name";
export const NEXA_CHAT_SESSION_ID_KEY = "nexa_chat_session_id";

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

export function setChatSessionId(sessionId: string): void {
  try {
    globalThis.sessionStorage?.setItem(NEXA_CHAT_SESSION_ID_KEY, sessionId);
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

export function clearChatSessionId(): void {
  try {
    globalThis.sessionStorage?.removeItem(NEXA_CHAT_SESSION_ID_KEY);
  } catch {
    /* ignore */
  }
}
