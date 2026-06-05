/**
 * Optional user-provided section images only (no stock or AI-generated images).
 */

export type ResolveSectionImageOpts = {
  sectionKey: string;
  imageUrl?: string | null;
};

export function isSafeImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (trimmed.startsWith("/uploads/website-assets/")) {
    return !trimmed.includes("..");
  }
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    if (u.username || u.password) return false;
    return u.pathname.startsWith("/uploads/website-assets/");
  } catch {
    return false;
  }
}

export function resolveSectionImageUrl(opts: ResolveSectionImageOpts): string | null {
  const explicit = opts.imageUrl?.trim();
  if (!explicit) return null;
  return isSafeImageUrl(explicit) ? explicit : null;
}

export function sanitizeSectionImageUrl(url?: string | null): string {
  const trimmed = url?.trim() ?? "";
  return trimmed && isSafeImageUrl(trimmed) ? trimmed : "";
}

/** @deprecated Positional API kept for export call sites. */
export function resolveSectionImageUrlLegacy(
  _sectionKey: string,
  _imageQuery?: string | null,
  imageUrl?: string | null,
): string | null {
  return resolveSectionImageUrl({ sectionKey: "", imageUrl });
}

export function assignSectionImageUrls(sections: Record<string, unknown>): Record<string, unknown> {
  const keys = Object.keys(sections).filter((k) => k !== "_meta");
  const out: Record<string, unknown> = { ...sections };
  for (const key of keys) {
    const raw = sections[key];
    if (!raw || typeof raw !== "object") continue;
    const block = { ...(raw as Record<string, unknown>) };
    const imageUrl =
      typeof block.imageUrl === "string"
        ? block.imageUrl
        : typeof block.image_url === "string"
          ? block.image_url
          : "";
    block.imageUrl = sanitizeSectionImageUrl(imageUrl);
    delete block.image_url;
    delete block.imageQuery;
    delete block.image_query;
    out[key] = block;
  }
  return out;
}
