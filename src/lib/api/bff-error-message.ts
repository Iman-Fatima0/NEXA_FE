/** Normalize Nest / BFF JSON error bodies into a single user-facing string. */
export function messageFromErrorBody(data: unknown, fallback: string): string {
  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }
  if (!data || typeof data !== "object") {
    return fallback;
  }
  const o = data as Record<string, unknown>;

  const message = o.message;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }
  if (Array.isArray(message)) {
    const parts = message
      .map((m) => (typeof m === "string" ? m.trim() : ""))
      .filter(Boolean);
    if (parts.length) return parts.join(" ");
  }

  const error = o.error;
  if (typeof error === "string" && error.trim()) {
    return error.trim();
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
    return trimmed.length > 280 ? `${trimmed.slice(0, 280)}…` : trimmed;
  }
}
