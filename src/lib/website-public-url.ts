import { env } from "../config/env";

/** Live URL for `/s/{slug}` — same-origin in the browser so localhost dev always works. */
export function resolveWebsitePublicUrl(opts: {
  publicUrl?: string | null;
  slug?: string | null;
  status?: string | null;
}): string | null {
  const slug = opts.slug?.trim();
  if (opts.status !== "PUBLISHED" || !slug) {
    return null;
  }
  const slugPath = `/s/${encodeURIComponent(slug)}`;
  if (typeof globalThis.window !== "undefined") {
    return `${globalThis.window.location.origin.replace(/\/+$/, "")}${slugPath}`;
  }
  const fromApi = opts.publicUrl?.trim();
  if (fromApi) return fromApi;
  const base = env.appPublicUrl.trim();
  if (base) return `${base.replace(/\/+$/, "")}${slugPath}`;
  return null;
}

/** Shareable URL from the API (may use LAN IP from Nest `FRONTEND_PUBLIC_URL`). */
export function resolveWebsiteShareUrl(opts: {
  publicUrl?: string | null;
  slug?: string | null;
  status?: string | null;
}): string | null {
  const fromApi = opts.publicUrl?.trim();
  if (fromApi) return fromApi;
  return resolveWebsitePublicUrl(opts);
}
