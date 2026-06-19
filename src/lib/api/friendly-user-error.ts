/** Layman-friendly error copy for a no-code platform (strips infra/dev jargon). */

export type UserErrorContext =
  | "upload"
  | "url"
  | "chat"
  | "train"
  | "website"
  | "integration"
  | "auth"
  | "gallery"
  | "generic";

const BY_STATUS: Record<number, string> = {
  401: "Please sign in to continue.",
  403: "You do not have access to this.",
  404: "This item is not available.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our side. Please try again.",
  503: "This feature is temporarily unavailable. Please try again shortly.",
};

const AUTH_ERROR_CODES: Record<string, string> = {
  backend_not_configured: "Service is temporarily unavailable. Please try again later.",
  upstream_unreachable: "Could not reach the server. Please check your connection and try again.",
  invalid_json: "Something went wrong. Please try again.",
  unauthorized: "Please sign in to continue.",
  refresh_unavailable: "Your session expired. Please sign in again.",
  validation_error: "Please check your details and try again.",
};

const CONTEXT_FALLBACK: Record<UserErrorContext, string> = {
  upload: "Document upload failed. Check the file type and size, then try again.",
  url: "We could not read that website. Check the link and try again.",
  chat: "Message could not be sent. Please try again.",
  train: "Training could not be completed. Please try again.",
  website: "Something went wrong with your website. Please try again.",
  integration: "Could not update the connection. Please try again.",
  auth: "Something went wrong. Please try again.",
  gallery: "Could not complete that action. Please try again.",
  generic: "Something went wrong. Please try again.",
};

/** Technical substrings — if present, replace with friendly copy instead of showing raw text. */
const TECHNICAL_MARKERS =
  /\b(redis|qdrant|ollama|gemini_api|fastapi|nestjs|upstream|multipart|form field|botid|sessionid|econnrefused|npm run|port 8000|x-goog|invalid upstream|backend not configured|backend api|network error|internal server|request failed \(\d{3}\)|missing (sessionid|id)|response missing)\b/i;

function contextFallback(context?: UserErrorContext): string {
  return CONTEXT_FALLBACK[context ?? "generic"];
}

function mapTechnicalMessage(raw: string, context?: UserErrorContext): string | null {
  const lower = raw.toLowerCase();

  if (lower.includes("rate limit") || lower.includes("429")) return BY_STATUS[429]!;
  if (lower.includes("access denied")) return BY_STATUS[403]!;
  if (lower.includes("not verified") || lower.includes("invalid credentials")) return raw;
  if (lower.includes("email already")) return raw;
  if (lower.includes("social sign-in")) return raw;
  if (lower.includes("publish the website")) return raw;
  if (lower.includes("verification")) return raw;
  if (lower.includes("password")) return raw;

  if (TECHNICAL_MARKERS.test(raw)) {
    if (context === "upload" || lower.includes("document") || lower.includes("upload")) {
      return CONTEXT_FALLBACK.upload;
    }
    if (context === "url" || lower.includes("ingest") || lower.includes("url")) {
      return CONTEXT_FALLBACK.url;
    }
    if (context === "chat" || lower.includes("chat")) return CONTEXT_FALLBACK.chat;
    if (context === "website" || lower.includes("website") || lower.includes("prompt")) {
      return CONTEXT_FALLBACK.website;
    }
    if (
      lower.includes("unavailable") ||
      lower.includes("503") ||
      lower.includes("gemini") ||
      lower.includes("redis") ||
      lower.includes("qdrant") ||
      lower.includes("ollama")
    ) {
      return BY_STATUS[503]!;
    }
    if (lower.includes("unauthorized")) return BY_STATUS[401]!;
    return contextFallback(context);
  }

  if (lower === "unauthorized" || lower === "forbidden") {
    return lower === "unauthorized" ? BY_STATUS[401]! : BY_STATUS[403]!;
  }

  if (AUTH_ERROR_CODES[lower]) return AUTH_ERROR_CODES[lower]!;

  return null;
}

/** Normalize a raw API/error string for display in the UI. */
export function sanitizeUserFacingMessage(
  raw: string,
  context?: UserErrorContext,
  fallback?: string,
): string {
  const trimmed = raw.trim();
  const fb = fallback ?? contextFallback(context);
  if (!trimmed) return fb;

  const mapped = mapTechnicalMessage(trimmed, context);
  if (mapped) return mapped;

  return trimmed;
}

/** Extract a user-safe message from a thrown value. */
export function friendlyUserError(
  err: unknown,
  fallback: string,
  context?: UserErrorContext,
): string {
  if (!(err instanceof Error)) return fallback;
  return sanitizeUserFacingMessage(err.message, context, fallback);
}

export function friendlyErrorForStatus(
  status: number,
  context?: UserErrorContext,
): string {
  if (status === 404) {
    if (context === "chat" || context === "train") return "Chatbot unavailable.";
    if (context === "website") return "Website not found.";
    if (context === "integration") return "Connection not found.";
    return BY_STATUS[404]!;
  }
  if (status === 429) return BY_STATUS[429]!;
  if (status === 503) return BY_STATUS[503]!;
  if (status >= 500) return BY_STATUS[500]!;
  if (status === 401) return BY_STATUS[401]!;
  if (status === 403) return BY_STATUS[403]!;
  return contextFallback(context);
}

export async function parseFriendlyBffError(
  res: Response,
  fallback: string,
  context?: UserErrorContext,
): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string; error?: string };
    const raw =
      (typeof data.message === "string" && data.message.trim()) ||
      (typeof data.error === "string" && data.error.trim());
    if (raw) {
      return sanitizeUserFacingMessage(raw, context, fallback);
    }
  } catch {
    /* ignore */
  }
  return friendlyErrorForStatus(res.status, context) || fallback;
}

/** BFF route handlers: network/upstream failures. */
export function bffNetworkErrorMessage(err: unknown): string {
  return friendlyUserError(err, "Could not reach the server. Please try again.", "generic");
}

/** Auth forms: prefer human `message`, map machine `error` codes. */
export function authErrorMessage(data: {
  error?: string;
  message?: string | string[];
}): string | null {
  if (typeof data.message === "string" && data.message.trim()) {
    return sanitizeUserFacingMessage(data.message.trim(), "auth");
  }
  if (Array.isArray(data.message) && data.message.length) {
    const parts = data.message
      .map((m) => (typeof m === "string" ? m.trim() : ""))
      .filter(Boolean);
    if (parts.length) return sanitizeUserFacingMessage(parts.join(" "), "auth");
  }
  if (typeof data.error === "string" && data.error.trim()) {
    const code = data.error.trim();
    const mapped = AUTH_ERROR_CODES[code.toLowerCase()];
    if (mapped) return mapped;
    return sanitizeUserFacingMessage(code, "auth");
  }
  return null;
}
