"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchUserBotById } from "../../lib/fetch-user-bots";
import { fetchUserIntegrationById } from "../../lib/fetch-user-integrations";
import { fetchUserWebsiteById } from "../../lib/fetch-user-websites";
import type { UserGalleryItem } from "../../lib/user-gallery-item";
import full from "./keycap-preview-full.module.css";

export type KeycapPreviewEntity = "website" | "bot" | "integration";

export type KeycapPreviewFullClientProps = Readonly<{
  itemId: string;
  entity: KeycapPreviewEntity;
  backHref: string;
  backLabel: string;
  entityNoun: string;
}>;

async function fetchGalleryItem(entity: KeycapPreviewEntity, id: string): Promise<UserGalleryItem> {
  if (entity === "bot") return fetchUserBotById(id);
  if (entity === "integration") return fetchUserIntegrationById(id);
  return fetchUserWebsiteById(id);
}

export default function KeycapPreviewFullClient({ itemId, entity, backHref, backLabel, entityNoun }: KeycapPreviewFullClientProps) {
  const [item, setItem] = useState<UserGalleryItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const w = await fetchGalleryItem(entity, itemId);
        if (!cancelled) {
          setItem(w);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setItem(null);
          setError(e instanceof Error ? e.message : "Could not load preview.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [itemId, entity]);

  const previewUrl = item?.previewUrl?.trim();
  const previewHtml = item?.previewHtml?.trim();

  return (
    <div className={full.root}>
      <header className={full.bar}>
        <Link href={backHref} className={full.back} prefetch={false}>
          {backLabel}
        </Link>
        <h1 className={full.title}>{item?.name ?? "Preview"}</h1>
        <span className={full.spacer} aria-hidden />
      </header>
      <div className={full.frame}>
        {error ? <div className={full.error}>{error}</div> : null}
        {!error && item === null ? <div className={full.fallback}>Loading preview…</div> : null}
        {!error && item && previewUrl ? (
          <iframe title={item.name} className={full.iframe} src={previewUrl} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
        ) : null}
        {!error && item && !previewUrl && previewHtml ? (
          <iframe
            title={item.name}
            className={full.iframe}
            srcDoc={previewHtml}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : null}
        {!error && item && !previewUrl && !previewHtml ? (
          <div className={full.fallback}>
            No preview URL or HTML from the API yet. When your backend returns <code>previewUrl</code> or <code>previewHtml</code>, this {entityNoun}{" "}
            will render here full screen.
          </div>
        ) : null}
      </div>
    </div>
  );
}
