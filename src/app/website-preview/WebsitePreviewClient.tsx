"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchUserWebsiteById } from "../../lib/fetch-user-websites";
import { WebsiteSectionsView } from "../../lib/website-sections";
import { resolveWebsitePublicUrl } from "../../lib/website-public-url";
import type { UserWebsite } from "../../lib/user-websites-types";
import styles from "../nexa-ss.module.css";

type WebsitePreviewClientProps = Readonly<{
  backHref: string;
}>;

export default function WebsitePreviewClient({ backHref }: WebsitePreviewClientProps) {
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("id")?.trim() || "";
  const [site, setSite] = useState<UserWebsite | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!websiteId) return;
    let cancelled = false;
    (async () => {
      try {
        const w = await fetchUserWebsiteById(websiteId);
        if (!cancelled) {
          setSite(w);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setSite(null);
          setError(e instanceof Error ? e.message : "Could not load site.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [websiteId]);

  const editHref = websiteId ? `/website-builder/create?id=${encodeURIComponent(websiteId)}` : "/website-builder/create";
  const publicHref = site
    ? resolveWebsitePublicUrl({ publicUrl: site.publicUrl, slug: site.slug, status: site.status })
    : null;

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href={backHref} className={styles.btnLight}>
            ← Back
          </Link>
          <div className={styles.brand}>
            <span>🌐</span>
            <span>Website Preview</span>
          </div>
          <div className={styles.topActions}>
            {publicHref ? (
              <a href={publicHref} className={styles.btnLight} target="_blank" rel="noreferrer">
                Share
              </a>
            ) : (
              <button type="button" className={styles.btnLight} disabled>
                Share
              </button>
            )}
            {publicHref ? (
              <a href={publicHref} className={styles.btnLight} target="_blank" rel="noreferrer">
                Export
              </a>
            ) : (
              <button type="button" className={styles.btnLight} disabled>
                Export
              </button>
            )}
            <Link href={editHref} className={styles.btnPrimary}>
              Edit Website
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.container}>
        <article className={styles.browserMock}>
          <div className={styles.browserBar} style={{ height: 34 }} />
          {error ? <p style={{ padding: "1rem" }}>{error}</p> : null}
          {!error && !websiteId ? (
            <p style={{ padding: "1rem" }}>Add ?id=your-website-id to preview a saved site.</p>
          ) : null}
          {!error && websiteId && !site ? <p style={{ padding: "1rem" }}>Loading…</p> : null}
          {!error && site ? (
            <WebsiteSectionsView name={site.name} themeColor={site.themeColor} logo={site.logo} sections={site.sections} />
          ) : null}
        </article>
      </main>
    </div>
  );
}
