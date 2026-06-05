const PREFIX = "nexa_public_chat_";

export function publicChatSessionKey(publicSlug: string): string {
  return `${PREFIX}${publicSlug.trim()}`;
}

export function getPublicChatSessionId(publicSlug: string): string | null {
  try {
    return globalThis.sessionStorage?.getItem(publicChatSessionKey(publicSlug))?.trim() || null;
  } catch {
    return null;
  }
}

export function setPublicChatSessionId(publicSlug: string, sessionId: string): void {
  try {
    globalThis.sessionStorage?.setItem(publicChatSessionKey(publicSlug), sessionId);
  } catch {
    /* ignore */
  }
}

export function clearPublicChatSessionId(publicSlug: string): void {
  try {
    globalThis.sessionStorage?.removeItem(publicChatSessionKey(publicSlug));
  } catch {
    /* ignore */
  }
}
