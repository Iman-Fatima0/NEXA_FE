import { env } from "../config/env";

/** Prefer API `publicUrl`; fallback to same-origin /s/{slug}. */
export function resolveWebsitePublicUrl(opts: {
  publicUrl?: string | null;
  slug?: string | null;
  status?: string | null;
}): string | null {
  const fromApi = opts.publicUrl?.trim();
  if (fromApi) return fromApi;
  const slug = opts.slug?.trim();
  if (opts.status === "PUBLISHED" && slug) {
    const base = env.appPublicUrl.trim() || (typeof globalThis.window !== "undefined" ? globalThis.window.location.origin : "");
    if (base) return `${base.replace(/\/+$/, "")}/s/${encodeURIComponent(slug)}`;
  }
  return null;
}
