import { env } from "../config/env";

const LOCALHOST_ORIGIN = "http://localhost:3001";

function parseOrigin(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed.includes("://") ? trimmed : `http://${trimmed}`);
    const h = u.hostname.toLowerCase();
    if (h !== "localhost" && h !== "127.0.0.1" && h !== "::1") {
      return null;
    }
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

/** Shareable frontend origin — localhost only for now. */
export function resolvePublicSiteOrigin(_opts?: {
  publicUrl?: string | null;
  originOverride?: string | null;
}): string {
  const override = _opts?.originOverride?.trim();
  if (override) {
    const o = parseOrigin(override);
    if (o) return o;
  }

  const fromApi = _opts?.publicUrl?.trim();
  if (fromApi) {
    const origin = parseOrigin(fromApi);
    if (origin) return origin;
  }

  const configured = parseOrigin(env.appPublicUrl);
  if (configured) return configured;

  if (typeof globalThis.window !== "undefined") {
    const origin = parseOrigin(globalThis.window.location.origin);
    if (origin) return origin;
  }

  return LOCALHOST_ORIGIN;
}

export function resolveWebsitePublicUrl(opts: {
  publicUrl?: string | null;
  slug?: string | null;
  status?: string | null;
  originOverride?: string | null;
}): string | null {
  const slug = opts.slug?.trim();
  if (opts.status !== "PUBLISHED" || !slug) {
    return null;
  }
  const base = resolvePublicSiteOrigin({
    publicUrl: opts.publicUrl,
    originOverride: opts.originOverride,
  });
  return `${base}/s/${encodeURIComponent(slug)}`;
}

/** Custom domains disabled — localhost URLs only. */
export function resolveWebsiteCustomDomainUrl(_opts: {
  customDomainUrl?: string | null;
  domain?: string | null;
  status?: string | null;
  originOverride?: string | null;
}): string | null {
  return null;
}

export function resolveWebsiteShareUrl(opts: {
  publicUrl?: string | null;
  slug?: string | null;
  status?: string | null;
  originOverride?: string | null;
}): string | null {
  return resolveWebsitePublicUrl(opts);
}
