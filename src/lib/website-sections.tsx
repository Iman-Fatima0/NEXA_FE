/** Parse builder `sections` JSON and render a simple marketing layout. */

export type WebsiteSectionBlock = {
  key: string;
  name: string;
  headline: string;
  body: string;
  cta: string;
};

export type WebsiteSectionsModel = {
  blocks: WebsiteSectionBlock[];
  metaDescription?: string;
};

export function parseWebsiteSections(sections: unknown): WebsiteSectionsModel {
  const blocks: WebsiteSectionBlock[] = [];
  let metaDescription: string | undefined;
  if (!sections || typeof sections !== "object" || Array.isArray(sections)) {
    return { blocks };
  }
  const o = sections as Record<string, unknown>;
  const meta = o._meta;
  if (meta && typeof meta === "object" && meta !== null) {
    const desc = (meta as Record<string, unknown>).description;
    if (typeof desc === "string" && desc.trim()) {
      metaDescription = desc.trim();
    }
  }
  for (const [key, value] of Object.entries(o)) {
    if (key === "_meta" || typeof value !== "object" || value === null) continue;
    const block = value as Record<string, unknown>;
    blocks.push({
      key,
      name: typeof block.name === "string" ? block.name : key,
      headline: typeof block.headline === "string" ? block.headline : "",
      body: typeof block.body === "string" ? block.body : "",
      cta: typeof block.cta === "string" ? block.cta : "",
    });
  }
  return { blocks, metaDescription };
}

export function sectionsToRecord(blocks: WebsiteSectionBlock[], metaDescription?: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const b of blocks) {
    out[b.key] = {
      name: b.name,
      headline: b.headline,
      body: b.body,
      cta: b.cta,
    };
  }
  if (metaDescription?.trim()) {
    out._meta = { description: metaDescription.trim() };
  }
  return out;
}

export type PublicSitePageLink = {
  key: string;
  name: string;
  href: string;
};

export type WebsiteSectionsViewProps = Readonly<{
  name: string;
  themeColor?: string | null;
  logo?: string | null;
  sections: unknown;
  className?: string;
  /** When set, only this section key is rendered (multi-page public view). */
  activePageKey?: string | null;
  /** Nav links for public multi-page sites. */
  pageLinks?: PublicSitePageLink[];
}>;

export function WebsiteSectionsView({
  name,
  themeColor,
  logo,
  sections,
  className,
  activePageKey,
  pageLinks,
}: WebsiteSectionsViewProps) {
  const accent = themeColor?.trim() || "#2563eb";
  const parsed = parseWebsiteSections(sections);
  const blocks = activePageKey
    ? parsed.blocks.filter((b) => b.key.toLowerCase() === activePageKey.toLowerCase())
    : parsed.blocks;
  const hero = blocks[0];

  return (
    <div className={className} style={{ fontFamily: "system-ui, sans-serif", color: "#111", background: "#fff", minHeight: "100%" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.75rem 1rem",
          borderBottom: "1px solid #e5e7eb",
          background: accent,
          color: "#fff",
        }}
      >
        {logo?.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo.trim()} alt="" width={32} height={32} style={{ borderRadius: 6, objectFit: "cover" }} />
        ) : null}
        <strong style={{ fontSize: "1.1rem" }}>{name}</strong>
        {pageLinks && pageLinks.length > 1 ? (
          <nav style={{ marginLeft: "auto", display: "flex", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.85rem" }}>
            {pageLinks.map((link) => (
              <a key={link.key} href={link.href} style={{ color: "#fff", textDecoration: "underline" }}>
                {link.name}
              </a>
            ))}
          </nav>
        ) : null}
      </header>

      {hero ? (
        <section style={{ padding: "2.5rem 1.25rem", textAlign: "center", background: `linear-gradient(180deg, ${accent}22, #fff)` }}>
          <h1 style={{ margin: "0 0 0.5rem", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: accent }}>
            {hero.headline.trim() || hero.name}
          </h1>
          {hero.body.trim() ? <p style={{ margin: "0 auto 1rem", maxWidth: 520, color: "#4b5563", lineHeight: 1.5 }}>{hero.body}</p> : null}
          {hero.cta.trim() ? (
            <span style={{ display: "inline-block", padding: "0.5rem 1.25rem", borderRadius: 8, background: accent, color: "#fff", fontWeight: 600 }}>
              {hero.cta}
            </span>
          ) : null}
        </section>
      ) : null}

      {blocks.slice(1).map((block) => (
        <section key={block.key} style={{ padding: "1.75rem 1.25rem", borderTop: "1px solid #f3f4f6" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.35rem", color: accent }}>{block.headline.trim() || block.name}</h2>
          {block.body.trim() ? <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.55, maxWidth: 640 }}>{block.body}</p> : null}
          {block.cta.trim() ? (
            <p style={{ margin: "0.75rem 0 0" }}>
              <span style={{ color: accent, fontWeight: 600 }}>{block.cta}</span>
            </p>
          ) : null}
        </section>
      ))}
    </div>
  );
}
