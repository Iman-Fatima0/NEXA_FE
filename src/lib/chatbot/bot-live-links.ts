/** Live / embed URLs returned by NestJS publish and GET /bots/:id/live-links */

export type BotLiveLinks = {
  publicSlug?: string;
  previewUrl?: string;
  embedUrl?: string;
  widgetUrl?: string;
  publicChatUrl?: string;
  widgetScript?: string;
  embedScript?: string;
  apiKey?: string;
  widgetStatus?: string;
  widgetVersion?: string;
  embedMode?: string;
  allowedDomains?: string[];
};

function str(v: unknown): string {
  if (v == null) return "";
  return typeof v === "string" ? v : String(v);
}

/** Parse publish / live-links / bot payload for embed & preview URLs. */
export function parseBotLiveLinks(raw: unknown): BotLiveLinks {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const inner = o.bot && typeof o.bot === "object" ? (o.bot as Record<string, unknown>) : o;
  const nested =
    inner.liveLinks && typeof inner.liveLinks === "object"
      ? (inner.liveLinks as Record<string, unknown>)
      : o.liveLinks && typeof o.liveLinks === "object"
        ? (o.liveLinks as Record<string, unknown>)
        : {};

  const m = { ...nested, ...inner };

  const previewUrl = str(m.previewUrl) || str(m.embedUrl) || undefined;
  const embedUrl = str(m.embedUrl) || str(m.previewUrl) || undefined;
  const widgetScript = str(m.widgetScript) || str(m.embedScript) || undefined;

  return {
    publicSlug: str(m.publicSlug) || undefined,
    previewUrl,
    embedUrl,
    widgetUrl: str(m.widgetUrl) || undefined,
    publicChatUrl:
      str(m.publicChatUrl) || str(m.chatUrl) || str(m.directChatUrl) || previewUrl || undefined,
    widgetScript,
    embedScript: widgetScript,
    apiKey: str(m.apiKey) || undefined,
    widgetStatus: str(m.widgetStatus) || undefined,
    widgetVersion: str(m.widgetVersion) || undefined,
    embedMode: str(m.embedMode) || undefined,
    allowedDomains: Array.isArray(m.allowedDomains)
      ? m.allowedDomains.map((d) => str(d)).filter(Boolean)
      : undefined,
  };
}

const SENSITIVE_QUERY_KEYS = ["botKey", "apiKey", "key"] as const;

/** Remove API keys from a URL — never copy/share links that contain them. */
export function stripSensitiveQueryParams(url: string): string {
  try {
    const parsed = new URL(url);
    for (const key of SENSITIVE_QUERY_KEYS) parsed.searchParams.delete(key);
    return parsed.toString();
  } catch {
    return url
      .replace(/([?&])(botKey|apiKey|key)=[^&]*/gi, "")
      .replace(/\?&/, "?")
      .replace(/[?&]$/, "");
  }
}

export function urlHasEmbeddedApiKey(url: string): boolean {
  return /[?&](botKey|apiKey|key)=/i.test(url);
}

/** URLs safe to copy, open, and share publicly. */
export function toShareableLiveLinks(links: BotLiveLinks): BotLiveLinks {
  const shareable: BotLiveLinks = { ...links };
  delete shareable.apiKey;

  for (const field of ["previewUrl", "embedUrl", "publicChatUrl"] as const) {
    const value = shareable[field];
    if (value) shareable[field] = stripSensitiveQueryParams(value);
  }

  return shareable;
}

function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/** Pull slug from Nest or Next embed paths, e.g. /public/embed/my-bot-7d49ac */
export function extractPublicSlugFromUrl(url?: string): string | undefined {
  if (!url?.trim()) return undefined;
  try {
    const match = new URL(url).pathname.match(/\/public\/embed\/([^/]+)/i);
    return match?.[1] ? decodeURIComponent(match[1]) : undefined;
  } catch {
    const match = url.match(/\/public\/embed\/([^/?#]+)/i);
    return match?.[1] ? decodeURIComponent(match[1]) : undefined;
  }
}

/**
 * Next.js app origin for shareable live preview (e.g. http://localhost:3001).
 * Never use the Nest API port when env mistakenly matches BACKEND_API_BASE_URL.
 */
export function getAppPublicBaseUrl(): string {
  const fromEnv = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL ?? "");
  const backend = normalizeOrigin(process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ?? "");

  if (typeof window !== "undefined") {
    const origin = normalizeOrigin(window.location.origin);
    if (!fromEnv || fromEnv === backend) return origin;
    return fromEnv;
  }

  if (fromEnv && fromEnv !== backend) return fromEnv;

  // Dev default when .env points both URLs at the API server (common misconfiguration)
  if (backend === "http://localhost:3000" || fromEnv === "http://localhost:3000") {
    return "http://localhost:3001";
  }

  return fromEnv;
}

/** Live preview on this Next app — matches dashboard ChatPanel + theme. */
export function buildFrontendEmbedUrl(publicSlug: string, version?: string): string {
  const base = getAppPublicBaseUrl();
  if (!base || !publicSlug.trim()) return "";
  const path = `/public/embed/${encodeURIComponent(publicSlug.trim())}`;
  if (version?.trim()) {
    return `${base}${path}?v=${encodeURIComponent(version.trim())}`;
  }
  return `${base}${path}`;
}

export function resolvePublicSlug(links: BotLiveLinks): string | undefined {
  const shareable = toShareableLiveLinks(links);
  return (
    shareable.publicSlug ||
    extractPublicSlugFromUrl(shareable.embedUrl) ||
    extractPublicSlugFromUrl(shareable.previewUrl) ||
    extractPublicSlugFromUrl(shareable.publicChatUrl)
  );
}

export function resolveShareablePreviewUrl(links: BotLiveLinks): string {
  const shareable = toShareableLiveLinks(links);
  const slug = resolvePublicSlug(shareable);
  if (slug) {
    const fe = buildFrontendEmbedUrl(slug, shareable.widgetVersion);
    if (fe) return fe;
  }
  return shareable.embedUrl || shareable.previewUrl || shareable.publicChatUrl || "";
}

/** Merge sources; prefer URLs without embedded API keys over publish-time test URLs. */
export function resolveBotLiveLinks(
  base?: BotLiveLinks | null,
  fresh?: BotLiveLinks | null,
): BotLiveLinks {
  const merged: BotLiveLinks = { ...base, ...fresh };

  for (const field of ["previewUrl", "embedUrl", "publicChatUrl"] as const) {
    const baseVal = base?.[field];
    const freshVal = fresh?.[field];
    if (baseVal && !urlHasEmbeddedApiKey(baseVal)) {
      merged[field] = baseVal;
    } else if (freshVal && !urlHasEmbeddedApiKey(freshVal)) {
      merged[field] = freshVal;
    } else {
      merged[field] = baseVal || freshVal;
    }
  }

  if (fresh?.apiKey) merged.apiKey = fresh.apiKey;
  else if (base?.apiKey) merged.apiKey = base.apiKey;

  return merged;
}
