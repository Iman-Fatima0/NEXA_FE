"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createUserWebsite } from "../../lib/create-user-website";
import {
  downloadWebsiteExportZip,
  fetchUserWebsiteById,
  generateUserWebsiteContent,
  publishUserWebsite,
  updateUserWebsiteBuilder,
} from "../../lib/fetch-user-websites";
import { resolveWebsitePublicUrl } from "../../lib/website-public-url";
import { fetchWebsiteTemplates } from "../../lib/fetch-website-templates";
import {
  readStoredTemplateId,
  readTemplateIdFromSearch,
  storeTemplateId,
} from "../../lib/website-template-storage";
import {
  parseWebsiteSections,
  sectionsToRecord,
  WebsiteSectionsView,
  type WebsiteSectionBlock,
} from "../../lib/website-sections";
import type { UserWebsite } from "../../lib/user-websites-types";
import wb from "./website-builder.module.css";

const PLACEHOLDER_NAME = "My Awesome Website";
const PLACEHOLDER_PROMPT =
  "Example: Create a modern landing page for my coffee shop with a menu section, about us page, and contact form. Use warm colors and include images of coffee.";

const PREVIEW_WAIT_GIF = "/assets/images/redcirclesquare.gif";

function formatErr(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

type WebsiteBuilderClientProps = Readonly<{
  hubBackHref: string;
}>;

export default function WebsiteBuilderClient({ hubBackHref }: WebsiteBuilderClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("id")?.trim() || "";

  const [websiteName, setWebsiteName] = useState("");
  const [description, setDescription] = useState("");
  const [themeColor, setThemeColor] = useState("#2563eb");
  const [logo, setLogo] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [sectionBlocks, setSectionBlocks] = useState<WebsiteSectionBlock[]>([]);
  const [siteMeta, setSiteMeta] = useState<UserWebsite | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingSite, setLoadingSite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [templatesUnavailable, setTemplatesUnavailable] = useState(false);

  const isEditMode = websiteId.length > 0;

  useEffect(() => {
    const fromQuery = readTemplateIdFromSearch(globalThis.window?.location.search ?? "");
    if (fromQuery) storeTemplateId(fromQuery);
    void fetchWebsiteTemplates()
      .then(() => setTemplatesUnavailable(false))
      .catch(() => setTemplatesUnavailable(true));
  }, []);

  const applySiteToEditor = useCallback((site: UserWebsite) => {
    setSiteMeta(site);
    setWebsiteName(site.name);
    setThemeColor(site.themeColor?.trim() || "#2563eb");
    setLogo(site.logo?.trim() || "");
    setCustomDomain(site.domain?.trim() || "");
    const parsed = parseWebsiteSections(site.sections);
    setSectionBlocks(parsed.blocks);
    setDescription(parsed.metaDescription || "");
  }, []);

  const loadSite = useCallback(
    async (id: string) => {
      setLoadingSite(true);
      setError(null);
      setLoadFailed(false);
      try {
        const site = await fetchUserWebsiteById(id);
        applySiteToEditor(site);
      } catch (e) {
        setLoadFailed(true);
        setError(formatErr(e));
      } finally {
        setLoadingSite(false);
      }
    },
    [applySiteToEditor],
  );

  useEffect(() => {
    if (!websiteId) {
      setSiteMeta(null);
      setSectionBlocks([]);
      return;
    }
    void loadSite(websiteId);
  }, [websiteId, loadSite]);

  const previewSections = useMemo(
    () => sectionsToRecord(sectionBlocks, description.trim() || undefined),
    [sectionBlocks, description],
  );

  const publicUrl = useMemo(
    () =>
      resolveWebsitePublicUrl({
        publicUrl: siteMeta?.publicUrl,
        slug: siteMeta?.slug,
        status: siteMeta?.status,
      }),
    [siteMeta?.publicUrl, siteMeta?.slug, siteMeta?.status],
  );

  const handleCreate = async () => {
    setError(null);
    setStatusMessage(null);
    const name = websiteName.trim();
    const desc = description.trim();
    if (!name) {
      setError("Please enter a website name.");
      return;
    }
    setLoading(true);
    try {
      const templateId = readStoredTemplateId();
      const created = await createUserWebsite({ name, templateId, description: desc || undefined });
      // AI runs only when user clicks GENERATE WITH AI (avoids 2× Gemini on create + generate).
      router.replace(`/website-builder/create?id=${encodeURIComponent(created.id)}`);
    } catch (e) {
      setError(formatErr(e));
    } finally {
      setLoading(false);
    }
  };

  const persistBuilder = async () => {
    if (!websiteId) return null;
    return updateUserWebsiteBuilder(websiteId, {
      title: websiteName.trim() || undefined,
      domain: customDomain.trim() || null,
      themeColor: themeColor.trim() || null,
      logo: logo.trim() || null,
      sections: sectionsToRecord(sectionBlocks, description.trim() || undefined),
    });
  };

  const handleSave = async () => {
    if (!websiteId) return;
    if (!websiteName.trim()) {
      setError("Website name cannot be empty.");
      return;
    }
    setError(null);
    setStatusMessage(null);
    setSaving(true);
    try {
      const updated = await persistBuilder();
      if (updated) {
        setSiteMeta(updated);
        setStatusMessage("Saved.");
      }
    } catch (e) {
      setError(formatErr(e));
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAi = async () => {
    if (!websiteId || generating) return;
    const prompt = description.trim();
    if (!prompt) {
      setError("Enter a description of what you want before generating.");
      return;
    }
    setError(null);
    setStatusMessage(null);
    setGenerating(true);
    try {
      const updated = await generateUserWebsiteContent(websiteId, { prompt });
      applySiteToEditor(updated);
      setStatusMessage("AI content applied. Review and save.");
    } catch (e) {
      setError(formatErr(e));
    } finally {
      setGenerating(false);
    }
  };

  const handleExportZip = async () => {
    if (!websiteId) return;
    setError(null);
    setExporting(true);
    try {
      await persistBuilder();
      await downloadWebsiteExportZip(websiteId);
      setStatusMessage("Export downloaded. Upload the ZIP to Vercel or S3 (see DEPLOY.md inside).");
    } catch (e) {
      setError(formatErr(e));
    } finally {
      setExporting(false);
    }
  };

  const handlePublish = async () => {
    if (!websiteId) return;
    setError(null);
    setStatusMessage(null);
    setPublishing(true);
    try {
      await persistBuilder();
      const published = await publishUserWebsite(websiteId);
      setSiteMeta(published);
      setStatusMessage("Published.");
    } catch (e) {
      setError(formatErr(e));
    } finally {
      setPublishing(false);
    }
  };

  const updateBlock = (key: string, field: keyof Pick<WebsiteSectionBlock, "headline" | "body" | "cta">, value: string) => {
    setSectionBlocks((prev) => prev.map((b) => (b.key === key ? { ...b, [field]: value } : b)));
  };

  const showPreview = isEditMode && sectionBlocks.length > 0;
  const busyLabel = exporting
    ? "Exporting…"
    : publishing
      ? "Publishing…"
      : saving
        ? "Saving…"
        : generating
          ? "Generating content…"
          : loading
            ? "Creating…"
            : loadingSite
              ? "Loading site…"
              : null;

  return (
    <div className={wb.page}>
      {busyLabel ? (
        <div className={wb.busyBar} role="status" aria-live="polite">
          {busyLabel}
        </div>
      ) : null}
      <Link href={hubBackHref} className={wb.backNav} aria-label="Back">
        <img src="/assets/images/redarrowithoutbg.png" alt="" width={24} height={24} className={wb.backNavImg} decoding="async" />
      </Link>
      <main className={wb.main}>
        <section className={wb.split}>
          <article className={wb.panel}>
            <h2 className={wb.panelTitle}>{isEditMode ? "Edit Your Website" : "Describe Your Website"}</h2>
            <div className={wb.field}>
              <label className={wb.label} htmlFor="wb-name">
                Website Name
              </label>
              <input
                id="wb-name"
                className={wb.input}
                placeholder={PLACEHOLDER_NAME}
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                autoComplete="off"
              />
            </div>

            {isEditMode ? (
              <>
                <div className={wb.field}>
                  <label className={wb.label} htmlFor="wb-desc-edit">
                    Site description (for AI)
                  </label>
                  <textarea
                    id="wb-desc-edit"
                    className={wb.textarea}
                    placeholder={PLACEHOLDER_PROMPT}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                  <button
                    type="button"
                    className={wb.btn}
                    style={{ marginTop: "0.5rem", width: "100%" }}
                    onClick={handleGenerateAi}
                    disabled={generating || loadingSite}
                  >
                    {generating ? "GENERATING…" : "GENERATE WITH AI"}
                  </button>
                </div>
                <div className={wb.field}>
                  <label className={wb.label} htmlFor="wb-theme">
                    Theme color
                  </label>
                  <input
                    id="wb-theme"
                    className={wb.input}
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                  />
                </div>
                <div className={wb.field}>
                  <label className={wb.label} htmlFor="wb-domain">
                    Custom domain
                  </label>
                  <input
                    id="wb-domain"
                    className={wb.input}
                    placeholder="shop.example.com"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                  />
                  <p className={wb.hint}>
                    Point your DNS A/CNAME to this app, then publish. Visitors can use https://your-domain (local dev:
                    add host to hosts file).
                  </p>
                </div>
                <div className={wb.field}>
                  <label className={wb.label} htmlFor="wb-logo">
                    Logo URL
                  </label>
                  <input
                    id="wb-logo"
                    className={wb.input}
                    placeholder="https://…"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                  />
                </div>
                {loadingSite ? <p className={wb.hint}>Loading site…</p> : null}
                {sectionBlocks.map((block) => (
                  <div key={block.key} className={wb.field}>
                    <label className={wb.label}>{block.name}</label>
                    <input
                      className={wb.input}
                      placeholder="Headline"
                      value={block.headline}
                      onChange={(e) => updateBlock(block.key, "headline", e.target.value)}
                    />
                    <textarea
                      className={wb.textarea}
                      placeholder="Body text"
                      rows={3}
                      value={block.body}
                      onChange={(e) => updateBlock(block.key, "body", e.target.value)}
                      style={{ marginTop: "0.5rem" }}
                    />
                    <input
                      className={wb.input}
                      placeholder="Call to action"
                      value={block.cta}
                      onChange={(e) => updateBlock(block.key, "cta", e.target.value)}
                      style={{ marginTop: "0.5rem" }}
                    />
                  </div>
                ))}
              </>
            ) : (
              <div className={wb.field}>
                <label className={wb.label} htmlFor="wb-desc">
                  What kind of website do you want?
                </label>
                <textarea
                  id="wb-desc"
                  className={wb.textarea}
                  placeholder={PLACEHOLDER_PROMPT}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                />
              </div>
            )}

            {!isEditMode ? (
              <>
                <p className={wb.hint}>Be as detailed as possible. Mention colors, sections, features, and style preferences.</p>
                <p className={wb.hint}>After create, AI will fill your sections when a description is provided.</p>
              </>
            ) : null}
            {templatesUnavailable ? (
              <p className={wb.hint}>Templates could not be loaded. You can still create and edit sites.</p>
            ) : null}
            {error ? (
              <div className={wb.errorBlock}>
                <p className={wb.error}>{error}</p>
                {loadFailed && websiteId ? (
                  <button type="button" className={wb.retryBtn} onClick={() => void loadSite(websiteId)}>
                    Retry load
                  </button>
                ) : null}
              </div>
            ) : null}
            {statusMessage ? <p className={wb.hint}>{statusMessage}</p> : null}
            {siteMeta?.customDomainUrl ? (
              <p className={wb.hint}>
                Custom domain:{" "}
                <a href={siteMeta.customDomainUrl} target="_blank" rel="noreferrer">
                  {siteMeta.customDomainUrl}
                </a>
              </p>
            ) : null}
            {publicUrl ? (
              <p className={wb.hint}>
                Live at{" "}
                <a href={publicUrl} target="_blank" rel="noreferrer">
                  {publicUrl}
                </a>
                {" · "}
                <button
                  type="button"
                  className={wb.btn}
                  style={{ display: "inline", padding: "0.15rem 0.5rem", fontSize: "0.75rem" }}
                  onClick={() => void navigator.clipboard?.writeText(publicUrl)}
                >
                  Copy link
                </button>
              </p>
            ) : null}

            {!isEditMode ? (
              <button type="button" className={wb.btn} onClick={handleCreate} disabled={loading}>
                {loading ? "CREATING…" : "CREATE WEBSITE"}
              </button>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                <button type="button" className={wb.btn} onClick={handleSave} disabled={saving || loadingSite}>
                  {saving ? "SAVING…" : "SAVE"}
                </button>
                <button type="button" className={wb.btn} onClick={handlePublish} disabled={publishing || saving || loadingSite || exporting}>
                  {publishing ? "PUBLISHING…" : "PUBLISH"}
                </button>
                {siteMeta?.status === "PUBLISHED" ? (
                  <button
                    type="button"
                    className={wb.btn}
                    onClick={() => void handleExportZip()}
                    disabled={exporting || saving || loadingSite}
                  >
                    {exporting ? "EXPORTING…" : "EXPORT ZIP (VERCEL/S3)"}
                  </button>
                ) : null}
                {websiteId ? (
                  <Link href={`/dashboard/websites/${encodeURIComponent(websiteId)}/preview`} className={wb.btn} style={{ textAlign: "center", textDecoration: "none" }}>
                    FULL PREVIEW
                  </Link>
                ) : null}
              </div>
            )}
          </article>

          <article className={showPreview ? wb.previewPanel : wb.previewShell}>
            {showPreview ? (
              <>
                <div className={wb.previewHeader}>
                  <span>Website preview</span>
                </div>
                <div className={wb.previewFrame} style={{ background: "#fff", overflow: "auto" }}>
                  <WebsiteSectionsView
                    name={websiteName.trim() || "Website"}
                    themeColor={themeColor}
                    logo={logo}
                    sections={previewSections}
                  />
                </div>
              </>
            ) : (
              <>
                <img
                  className={wb.previewGif}
                  src={PREVIEW_WAIT_GIF}
                  alt=""
                  width={800}
                  height={600}
                  decoding="async"
                />
                <div className={wb.previewScrim} aria-hidden />
                <div className={wb.previewMessage}>
                  <h3 className={wb.previewHeading}>
                    {isEditMode ? "Add content in the editor" : "Your website will appear here"}
                  </h3>
                </div>
              </>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
