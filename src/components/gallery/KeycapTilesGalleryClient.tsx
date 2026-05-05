"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { UserGalleryItem } from "../../lib/user-gallery-item";
import DashboardStyleBackNav from "./DashboardStyleBackNav";
import tiles from "./keycap-tiles.module.css";

export type KeycapGalleryEntity = "website" | "bot" | "integration";

type KeyVariant = "cream" | "amber" | "orange" | "glassOrange";

const KEY_VARIANTS: KeyVariant[] = ["cream", "amber", "orange", "glassOrange"];

function randomKeyVariant(): KeyVariant {
  return KEY_VARIANTS[Math.floor(Math.random() * KEY_VARIANTS.length)]!;
}

function keycapClass(variant: KeyVariant): string {
  if (variant === "amber") return `${tiles.keycap} ${tiles.keycapAmber}`;
  if (variant === "orange") return `${tiles.keycap} ${tiles.keycapOrange}`;
  if (variant === "glassOrange") return `${tiles.keycap} ${tiles.keycapGlassOrange}`;
  return `${tiles.keycap} ${tiles.keycapCream}`;
}

function KeyWebsiteIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" width={13} height={13} aria-hidden>
      <rect x="1.5" y="2.5" width="13" height="10" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.15" />
      <path d="M1.5 5.25h13" fill="none" stroke="currentColor" strokeWidth="1.05" opacity="0.85" />
      <circle cx="8" cy="9.25" r="2.35" fill="none" stroke="currentColor" strokeWidth="1.05" />
      <path d="M5.65 9.25h4.7M8 6.9v4.7" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.75" />
    </svg>
  );
}

function KeyBotIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" width={13} height={13} aria-hidden>
      <path
        d="M3.25 6.75c0-1.8 1.35-3.25 3.75-3.25S10.75 4.95 10.75 6.75v1.1h.6c.55 0 1 .45 1 1v3.9c0 .55-.45 1-1 1H2.65c-.55 0-1-.45-1-1V8.85c0-.55.45-1 1-1h.6v-1.1z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <circle cx="6.1" cy="8.35" r="0.65" fill="currentColor" />
      <circle cx="9.9" cy="8.35" r="0.65" fill="currentColor" />
      <path d="M6.4 10.6c.6.45 1.35.7 2.1.45" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

function KeyIntegrationIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" width={13} height={13} aria-hidden>
      <circle cx="4.5" cy="5" r="2" fill="none" stroke="currentColor" strokeWidth="1.05" />
      <circle cx="11.5" cy="11" r="2" fill="none" stroke="currentColor" strokeWidth="1.05" />
      <path d="M6.1 6.35l3.8 3.3" fill="none" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
      <path d="M4.2 11.2l7.6-6.4" fill="none" stroke="currentColor" strokeWidth="0.85" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

function KeyEntityIcon({ entity, className }: { entity: KeycapGalleryEntity; className: string }) {
  if (entity === "bot") return <KeyBotIcon className={className} />;
  if (entity === "integration") return <KeyIntegrationIcon className={className} />;
  return <KeyWebsiteIcon className={className} />;
}

export type KeycapTilesGalleryClientProps = Readonly<{
  entity: KeycapGalleryEntity;
  title: string;
  subtitle: string;
  /** When set, shows this label fixed top-right instead of the visible title + subtitle block. */
  topRightCornerLabel?: string;
  emptyMessage: string;
  errorLoadMessage: string;
  fetchItems: () => Promise<UserGalleryItem[]>;
  /** e.g. `/dashboard/websites` — back arrow target */
  dashboardBackHref: string;
  previewHref: (id: string) => string;
  ctaHref: string;
  ctaButtonText: string;
  ctaSectionAriaLabel?: string;
}>;

export default function KeycapTilesGalleryClient({
  entity,
  title,
  subtitle,
  topRightCornerLabel,
  emptyMessage,
  errorLoadMessage,
  fetchItems,
  dashboardBackHref,
  previewHref,
  ctaHref,
  ctaButtonText,
  ctaSectionAriaLabel,
}: KeycapTilesGalleryClientProps) {
  const [items, setItems] = useState<UserGalleryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await fetchItems();
      setItems(list ?? []);
      setError(null);
    } catch (e) {
      setItems([]);
      setError(e instanceof Error ? e.message : errorLoadMessage);
    }
  }, [fetchItems, errorLoadMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const tilesWithVariants = useMemo(() => {
    if (!items?.length) return [];
    const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
    return sorted.map((site) => ({ site, variant: randomKeyVariant() }));
  }, [items]);

  return (
    <div className={tiles.page}>
      <DashboardStyleBackNav href={dashboardBackHref} />
      {topRightCornerLabel ? <div className={tiles.topRightCornerLabel}>{topRightCornerLabel}</div> : null}
      <main className={topRightCornerLabel ? `${tiles.main} ${tiles.mainTightTop}` : tiles.main}>
        {topRightCornerLabel ? (
          <h1 className={tiles.srOnly}>{title}</h1>
        ) : (
          <>
            <h1 className={tiles.title}>{title}</h1>
            {subtitle.trim() ? <p className={tiles.sub}>{subtitle}</p> : null}
          </>
        )}
        {error ? <p className={tiles.error}>{error}</p> : null}
        {items === null ? (
          <p className={tiles.sub}>Loading…</p>
        ) : tilesWithVariants.length === 0 ? (
          <p className={tiles.empty}>{emptyMessage}</p>
        ) : (
          <div className={tiles.grid}>
            {tilesWithVariants.map(({ site: w, variant }) => (
              <Link
                key={w.id}
                href={previewHref(w.id)}
                className={tiles.tile}
                prefetch={false}
                aria-label={`Open preview: ${w.name}`}
              >
                <div className={keycapClass(variant)}>
                  <div className={tiles.keycapTop}>
                    <KeyEntityIcon entity={entity} className={tiles.keycapIcon} />
                    <p className={tiles.keycapLabel}>{w.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        <section className={tiles.ctaSection} aria-label={ctaSectionAriaLabel ?? ctaButtonText}>
          <p className={tiles.ctaLabel}>Ready for something new?</p>
          <Link href={ctaHref} className={tiles.ctaButton} prefetch={false}>
            {ctaButtonText}
          </Link>
        </section>
      </main>
    </div>
  );
}
