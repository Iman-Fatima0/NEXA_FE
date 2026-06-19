import { sanitizeUserFacingMessage } from "./friendly-user-error";

/** Normalize Nest / BFF JSON error bodies into a single user-facing string. */
export function messageFromErrorBody(data: unknown, fallback: string): string {
  if (typeof data === "string" && data.trim()) {
    return sanitizeUserFacingMessage(data.trim(), "generic", fallback);
  }
  if (!data || typeof data !== "object") {
    return fallback;
  }
  const o = data as Record<string, unknown>;

  const message = o.message;
  if (typeof message === "string" && message.trim()) {
    return sanitizeUserFacingMessage(message.trim(), "generic", fallback);
  }
  if (Array.isArray(message)) {
    const parts = message
      .map((m) => (typeof m === "string" ? m.trim() : ""))
      .filter(Boolean);
    if (parts.length) {
      return sanitizeUserFacingMessage(parts.join(" "), "generic", fallback);
    }
  }

  const error = o.error;
  if (typeof error === "string" && error.trim()) {
    return sanitizeUserFacingMessage(error.trim(), "generic", fallback);
  }

  return fallback;
}

/** Parse raw upstream response text (JSON or plain). */
export function messageFromUpstreamText(text: string, status: number): string {
  const fallback = `Request failed (${status}).`;
  const trimmed = text.trim();
  if (!trimmed) return fallback;
  try {
    return messageFromErrorBody(JSON.parse(trimmed) as unknown, fallback);
  } catch {
    const clipped = trimmed.length > 280 ? `${trimmed.slice(0, 280)}…` : trimmed;
    return sanitizeUserFacingMessage(clipped, "generic", fallback);
  }
}
