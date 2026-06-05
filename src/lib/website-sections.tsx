/** Parse builder `sections` JSON and render a polished marketing layout. */

import { parseWebsiteTheme } from "./theme/parse-website-theme";
import type { WebsiteThemeStyle } from "./theme/website-theme-style";
import { SectionImage } from "../components/sites/SectionImage";
import { resolveSectionImageUrl } from "./website-section-images";
import {
  buildSectionNavLinks,
  resolveCtaHref,
  sectionAnchorId,
  type WebsiteLinkMode,
} from "./website-section-links";

export function displaySectionName(name: string, key: string): string {
  const n = name.trim();
  const k = key.toLowerCase();
  if (!n || n.toLowerCase() === "hero" || k === "hero" || k === "home") return "Home";
  return n;
}

function comparableSectionLabel(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Headline that only repeats the nav section name (e.g. "Home" / "About") — not real copy. */
export function isRedundantSectionHeadline(headline: string, name: string, key: string): boolean {
  const h = comparableSectionLabel(headline);
  if (!h) return true;
  const labels = new Set(
    [name, key, displaySectionName(name, key), "home", "hero"].map(comparableSectionLabel).filter(Boolean),
  );
  return labels.has(h);
}

/** Visible section title — never falls back to the nav section name. */
export function resolveSectionHeadline(headline: string, name: string, key: string): string {
  const trimmed = headline.trim();
  if (trimmed && !isRedundantSectionHeadline(trimmed, name, key)) return trimmed;
  return "";
}

export type WebsiteSectionBlock = {
  key: string;
  name: string;
  headline: string;
  body: string;
  cta: string;
  ctaLink: string;
  imageUrl: string;
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
      ctaLink:
        typeof block.ctaLink === "string"
          ? block.ctaLink
          : typeof block.cta_link === "string"
            ? block.cta_link
            : "",
      imageUrl:
        typeof block.imageUrl === "string"
          ? block.imageUrl
          : typeof block.image_url === "string"
            ? block.image_url
            : "",
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
      ctaLink: b.ctaLink,
      imageUrl: b.imageUrl,
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
  /** Legacy accent hex — used when theme preset is absent. */
  themeColor?: string | null;
  /** Widget-style preset theme (modern, discord, slack, whatsapp). */
  theme?: unknown;
  logo?: string | null;
  sections: unknown;
  className?: string;
  /** When set, only this section key is rendered (multi-page public view). */
  activePageKey?: string | null;
  /** Nav links for public multi-page sites. */
  pageLinks?: PublicSitePageLink[];
  /** Slug for resolving multi-page CTA targets on public sites. */
  siteSlug?: string | null;
}>;

const btnStyle = (accent: string, radius: string): React.CSSProperties => ({
  display: "inline-block",
  padding: "0.65rem 1.35rem",
  borderRadius: radius,
  background: accent,
  color: "#fff",
  fontWeight: 600,
  fontSize: "0.92rem",
  textDecoration: "none",
  boxShadow: `0 8px 24px ${accent}44`,
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
});

function CtaButton({
  href,
  label,
  accent,
  radius,
  external,
}: {
  href: string;
  label: string;
  accent: string;
  radius: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      className="nexa-ws-cta"
      style={btnStyle(accent, radius)}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {label}
    </a>
  );
}

export function WebsiteSectionsView({
  name,
  themeColor,
  theme,
  logo,
  sections,
  className,
  activePageKey,
  pageLinks,
  siteSlug,
}: WebsiteSectionsViewProps) {
  const resolved = parseWebsiteTheme(theme, themeColor);
  const style: WebsiteThemeStyle = resolved.style;
  const accent = style.accent;
  const parsed = parseWebsiteSections(sections);
  const allKeys = parsed.blocks.map((b) => b.key);
  const linkMode: WebsiteLinkMode = activePageKey ? "multi-page" : "single-page";
  const blocks = activePageKey
    ? parsed.blocks.filter((b) => b.key.toLowerCase() === activePageKey.toLowerCase())
    : parsed.blocks;
  const hero = blocks[0];
  const heroHeadline = hero
    ? resolveSectionHeadline(hero.headline, hero.name, hero.key)
    : "";
  const heroImage = hero
    ? resolveSectionImageUrl({
        sectionKey: hero.key,
        imageUrl: hero.imageUrl,
      })
    : null;

  const navItems = (pageLinks && pageLinks.length > 1
    ? pageLinks.filter((l) => l.key !== "_home")
    : buildSectionNavLinks(parsed.blocks, "single-page")
  ).map((item) => ({
    ...item,
    name: displaySectionName(
      parsed.blocks.find((b) => b.key === item.key)?.name ?? item.name,
      item.key,
    ),
  }));

  const sectionKeysForLinks = parsed.blocks.map((b) => b.key);

  return (
    <div
      id="top"
      className={className ? `nexa-site-page ${className}` : "nexa-site-page"}
      style={{
        fontFamily: `${style.fontFamily}, system-ui, -apple-system, sans-serif`,
        color: style.text,
        background: style.background,
        scrollBehavior: "smooth",
      }}
    >
      <style>{`
        .nexa-ws-cta:hover {
          transform: translateY(-1px);
        }
        @media (max-width: 720px) {
          .nexa-ws-grid { grid-template-columns: 1fr !important; }
          .nexa-ws-grid > div { order: unset !important; }
        }
      `}</style>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: "0.85rem",
          padding: "0.85rem 1.25rem",
          background: style.headerBackground,
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${style.headerBorder}`,
          boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
        }}
      >
        {logo?.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo.trim()} alt="" width={36} height={36} style={{ borderRadius: 8, objectFit: "cover" }} />
        ) : (
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
              display: "inline-block",
            }}
          />
        )}
        <strong style={{ fontSize: "1.05rem", letterSpacing: "-0.02em", color: style.text }}>{name}</strong>
        {navItems.length > 1 ? (
          <nav
            style={{
              marginLeft: "auto",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.35rem 0.75rem",
              fontSize: "0.84rem",
              fontWeight: 500,
            }}
          >
            {navItems.map((link) => (
              <a
                key={link.key}
                href={link.href}
                style={{
                  color: style.mutedText,
                  textDecoration: "none",
                  padding: "0.25rem 0.5rem",
                  borderRadius: 6,
                }}
              >
                {link.name}
              </a>
            ))}
          </nav>
        ) : null}
      </header>

      {hero ? (
        <section
          id={sectionAnchorId(hero.key)}
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "3.5rem 1.25rem 3rem",
            textAlign: "center",
            background: heroImage
              ? `linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.72) 100%), url(${heroImage}) center/cover no-repeat`
              : style.isDark
                ? `linear-gradient(135deg, ${accent}33 0%, ${style.background} 45%, ${accent}1a 100%)`
                : `linear-gradient(135deg, ${accent}18 0%, ${style.background} 45%, ${accent}0d 100%)`,
            color: heroImage ? "#fff" : undefined,
          }}
        >
          <div style={{ position: "relative", maxWidth: 680, margin: "0 auto" }}>
            {heroHeadline ? (
              <h1
                style={{
                  margin: "0 0 0.75rem",
                  fontSize: "clamp(2rem, 5vw, 3rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  color: heroImage ? "#fff" : accent,
                }}
              >
                {heroHeadline}
              </h1>
            ) : null}
            {hero.body.trim() ? (
              <p
                style={{
                  margin: "0 auto 1.35rem",
                  maxWidth: 540,
                  color: heroImage ? "#e2e8f0" : style.mutedText,
                  lineHeight: 1.65,
                  fontSize: "1.05rem",
                }}
              >
                {hero.body}
              </p>
            ) : null}
            {hero.cta.trim() ? (
              <CtaButton
                href={resolveCtaHref(hero.ctaLink, hero.key, sectionKeysForLinks, linkMode, {
                  slug: siteSlug ?? undefined,
                })}
                label={hero.cta}
                accent={accent}
                radius={style.ctaRadius}
                external={/^https?:\/\//i.test(hero.ctaLink.trim())}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {blocks.slice(1).map((block, index) => {
        const image = resolveSectionImageUrl({
          sectionKey: block.key,
          imageUrl: block.imageUrl,
        });
        const reverse = index % 2 === 1;
        const isContact =
          block.key.toLowerCase().includes("contact") || block.name.toLowerCase().includes("contact");
        const blockHeadline = resolveSectionHeadline(block.headline, block.name, block.key);

        return (
          <section
            key={block.key}
            id={sectionAnchorId(block.key)}
            style={{
              padding: "2.5rem 1.25rem",
              background: index % 2 === 0 ? style.background : style.sectionAlt,
              borderTop: `1px solid ${style.headerBorder}`,
            }}
          >
            <div
              className="nexa-ws-grid"
              style={{
                maxWidth: 980,
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: image ? "1fr 1fr" : "1fr",
                gap: "2rem",
                alignItems: "center",
              }}
            >
              <div style={{ order: reverse && image ? 2 : 1 }}>
                {blockHeadline ? (
                  <h2
                    style={{
                      margin: "0 0 0.65rem",
                      fontSize: "clamp(1.35rem, 3vw, 1.85rem)",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      color: style.text,
                    }}
                  >
                    {blockHeadline}
                  </h2>
                ) : null}
                {block.body.trim() ? (
                  <p style={{ margin: 0, color: style.mutedText, lineHeight: 1.65, fontSize: "1rem" }}>{block.body}</p>
                ) : null}
                {block.cta.trim() ? (
                  <p style={{ margin: "1rem 0 0" }}>
                    <CtaButton
                      href={resolveCtaHref(block.ctaLink, block.key, sectionKeysForLinks, linkMode, {
                        slug: siteSlug ?? undefined,
                      })}
                      label={block.cta}
                      accent={isContact ? accent : style.isDark ? style.secondary : style.text}
                      radius={style.ctaRadius}
                      external={/^https?:\/\//i.test(block.ctaLink.trim())}
                    />
                  </p>
                ) : null}
              </div>
              {image ? (
                <div
                  style={{
                    order: reverse ? 1 : 2,
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 16px 40px rgba(15,23,42,0.12)",
                    aspectRatio: "4 / 3",
                    background: "#e2e8f0",
                  }}
                >
                  <SectionImage src={image} alt={displaySectionName(block.name, block.key)} />
                </div>
              ) : null}
            </div>
          </section>
        );
      })}

      <footer
        style={{
          padding: "1.25rem",
          textAlign: "center",
          fontSize: "0.82rem",
          color: style.mutedText,
          borderTop: `1px solid ${style.headerBorder}`,
          background: style.footerBackground,
        }}
      >
        © {new Date().getFullYear()} {name}
      </footer>
    </div>
  );
}
