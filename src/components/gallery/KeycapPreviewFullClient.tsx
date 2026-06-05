"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConfirmModal } from "../chatbot/ConfirmModal";
import DashboardStyleBackNav from "./DashboardStyleBackNav";
import IntegrationLivePreview from "../integration/IntegrationLivePreview";
import { fetchUserBotById } from "../../lib/fetch-user-bots";
import { fetchUserIntegrationById } from "../../lib/fetch-user-integrations";
import { fetchUserWebsiteById } from "../../lib/fetch-user-websites";
import { deleteConfirmCopy, deleteGalleryItem } from "../../lib/gallery/gallery-delete";
import { readChatIntegrationFromSections } from "../../lib/integration/chat-integration";
import { integrationEditHref } from "../../lib/integration/integration-api";
import type { UserGalleryItem } from "../../lib/user-gallery-item";
import { WebsiteSectionsView } from "../../lib/website-sections";
import { resolveWebsitePublicUrl } from "../../lib/website-public-url";
import full from "./keycap-preview-full.module.css";

export type KeycapPreviewEntity = "website" | "bot" | "integration";

export type KeycapPreviewFullClientProps = Readonly<{
  itemId: string;
  entity: KeycapPreviewEntity;
  backHref: string;
  backAriaLabel?: string;
  entityNoun: string;
}>;

async function fetchGalleryItem(entity: KeycapPreviewEntity, id: string): Promise<UserGalleryItem> {
  if (entity === "bot") return fetchUserBotById(id);
  if (entity === "integration") return fetchUserIntegrationById(id);
  return fetchUserWebsiteById(id);
}

function deleteButtonLabel(entity: KeycapPreviewEntity): string {
  if (entity === "integration") return "Remove";
  return "Delete";
}

export default function KeycapPreviewFullClient({
  itemId,
  entity,
  backHref,
  backAriaLabel = "Back",
  entityNoun,
}: KeycapPreviewFullClientProps) {
  const router = useRouter();
  const [item, setItem] = useState<UserGalleryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
  const hasSections = item?.sections != null;
  const integrationLink =
    entity === "integration" && item ? readChatIntegrationFromSections(item.sections) : null;

  const editHref =
    entity === "website" && item?.id
      ? `/website-builder/create?id=${encodeURIComponent(item.id)}`
      : entity === "integration" && item?.id
        ? integrationEditHref(item.id, integrationLink?.botId)
        : entity === "bot" && item?.id
          ? `/chatbot-builder/create`
          : null;
  const publicHref =
    item && (entity === "website" || entity === "integration")
      ? resolveWebsitePublicUrl({
          publicUrl: item.publicUrl,
          slug: item.slug,
          status: item.status,
        })
      : null;
  const showIntegrationPreview = entity === "integration" && item && hasSections;

  const confirmCopy = item ? deleteConfirmCopy(entity, item.name) : null;

  const onConfirmDelete = async () => {
    if (!item) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteGalleryItem(entity, item.id);
      setConfirmOpen(false);
      router.push(backHref);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Could not complete that action.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={full.root}>
      <DashboardStyleBackNav href={backHref} ariaLabel={backAriaLabel} />
      <ConfirmModal
        open={confirmOpen}
        title={confirmCopy?.title ?? "Delete?"}
        message={confirmCopy?.message ?? ""}
        confirmLabel={confirmCopy?.confirmLabel ?? "Delete"}
        danger
        busy={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void onConfirmDelete()}
      />
      <header className={full.bar}>
        <span className={full.spacer} aria-hidden />
        <h1 className={full.title}>{item?.name ?? "Preview"}</h1>
        <div className={full.barActions}>
          {editHref ? (
            <Link href={editHref} className={full.barBtn} prefetch={false}>
              {entity === "integration" ? "Change" : "Edit"}
            </Link>
          ) : null}
          {item ? (
            <button
              type="button"
              className={`${full.barBtn} ${full.barBtnDanger}`}
              onClick={() => setConfirmOpen(true)}
            >
              {deleteButtonLabel(entity)}
            </button>
          ) : null}
        </div>
      </header>
      <div className={full.frame}>
        {deleteError ? (
          <p style={{ padding: "0.5rem 1rem", margin: 0, fontSize: "0.85rem", color: "#fecaca" }}>{deleteError}</p>
        ) : null}
        {error ? (
          <div className={full.error}>
            {error}
            {entity === "website" ? (
              <button
                type="button"
                style={{ display: "block", marginTop: "0.5rem", fontSize: "0.85rem" }}
                onClick={() => {
                  setError(null);
                  setItem(null);
                  void (async () => {
                    try {
                      const w = await fetchGalleryItem(entity, itemId);
                      setItem(w);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Could not load preview.");
                    }
                  })();
                }}
              >
                Retry
              </button>
            ) : null}
          </div>
        ) : null}
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
        {!error && showIntegrationPreview ? (
          <div className={full.frameScroll}>
            <IntegrationLivePreview site={item} />
          </div>
        ) : null}
        {!error && entity === "website" && item && !previewUrl && !previewHtml && hasSections ? (
          <div className={full.frameScroll}>
            <div className={full.sitePreview}>
              <WebsiteSectionsView
                name={item.name}
                theme={item.theme}
                themeColor={item.themeColor}
                logo={item.logo}
                sections={item.sections}
              />
            </div>
          </div>
        ) : null}
        {!error && item && !previewUrl && !previewHtml && !showIntegrationPreview && !(entity === "website" && hasSections) ? (
          <div className={full.fallback}>
            No preview content for this {entityNoun} yet.
            {entity === "integration" && editHref ? (
              <>
                {" "}
                <Link href={editHref}>Change connection</Link>
              </>
            ) : null}
          </div>
        ) : null}
        {publicHref ? (
          <p style={{ padding: "0.5rem 1rem", margin: 0, fontSize: "0.85rem" }}>
            <a href={publicHref} target="_blank" rel="noreferrer">
              {entity === "integration" ? "Open live site with chat widget" : "View public site"}
            </a>
          </p>
        ) : entity === "integration" && item && !publicHref ? (
          <p style={{ padding: "0.5rem 1rem", margin: 0, fontSize: "0.85rem", opacity: 0.85 }}>
            Publish the website in Website Builder to get a shareable live URL with the widget.
          </p>
        ) : null}
      </div>
    </div>
  );
}
