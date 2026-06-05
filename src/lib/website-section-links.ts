/** Resolve CTA and nav links for single-page anchors vs multi-page routes. */

export type WebsiteLinkMode = "single-page" | "multi-page";

export function sectionAnchorId(key: string): string {
  return key.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
}

function findSectionKey(keys: string[], target: string): string | null {
  const t = target.trim().toLowerCase().replace(/^#/, "");
  return keys.find((k) => k.toLowerCase() === t || sectionAnchorId(k) === t) ?? null;
}

function defaultCtaTarget(sectionKey: string, sectionKeys: string[]): string {
  const k = sectionKey.toLowerCase();
  const contact = sectionKeys.find((s) => s.toLowerCase().includes("contact"));
  if (k.includes("contact")) return "#top";
  if (contact) return `#${sectionAnchorId(contact)}`;
  const pricing = sectionKeys.find((s) => s.toLowerCase().includes("pricing"));
  if (pricing && (k.includes("hero") || k.includes("feature") || k.includes("cta"))) {
    return `#${sectionAnchorId(pricing)}`;
  }
  const services = sectionKeys.find((s) => s.toLowerCase().includes("service"));
  if (services) return `#${sectionAnchorId(services)}`;
  const about = sectionKeys.find((s) => s.toLowerCase().includes("about"));
  if (about) return `#${sectionAnchorId(about)}`;
  const next = sectionKeys[1];
  return next ? `#${sectionAnchorId(next)}` : "#top";
}

export function resolveSectionHref(
  raw: string | undefined | null,
  sectionKeys: string[],
  mode: WebsiteLinkMode,
  opts?: { slug?: string; pageBasePath?: string },
): string {
  const trimmed = raw?.trim();
  if (trimmed) {
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith("#")) {
      const key = findSectionKey(sectionKeys, trimmed);
      if (key) {
        if (mode === "multi-page" && opts?.slug) {
          return `/s/${encodeURIComponent(opts.slug)}#${sectionAnchorId(key)}`;
        }
        return `#${sectionAnchorId(key)}`;
      }
      return trimmed;
    }
    const key = findSectionKey(sectionKeys, trimmed);
    if (key) {
      if (mode === "multi-page" && opts?.slug) {
        return `/s/${encodeURIComponent(opts.slug)}#${sectionAnchorId(key)}`;
      }
      return `#${sectionAnchorId(key)}`;
    }
  }
  return defaultCtaTarget(sectionKeys[0] ?? "", sectionKeys);
}

export function resolveCtaHref(
  ctaLink: string | undefined | null,
  sectionKey: string,
  sectionKeys: string[],
  mode: WebsiteLinkMode,
  opts?: { slug?: string },
): string {
  if (ctaLink?.trim()) {
    return resolveSectionHref(ctaLink, sectionKeys, mode, opts);
  }
  const anchor = defaultCtaTarget(sectionKey, sectionKeys);
  if (mode === "multi-page" && opts?.slug && anchor.startsWith("#")) {
    return `/s/${encodeURIComponent(opts.slug)}${anchor}`;
  }
  return anchor;
}

export function buildSectionNavLinks(
  blocks: { key: string; name: string }[],
  mode: WebsiteLinkMode,
  opts?: { slug?: string },
): { key: string; name: string; href: string }[] {
  return blocks.map((b) => ({
    key: b.key,
    name: b.name,
    href:
      mode === "multi-page" && opts?.slug
        ? `/s/${encodeURIComponent(opts.slug)}#${sectionAnchorId(b.key)}`
        : `#${sectionAnchorId(b.key)}`,
  }));
}
