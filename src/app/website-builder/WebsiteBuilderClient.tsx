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
import { sectionAnchorId } from "../../lib/website-section-links";
import { SectionImageField } from "../../components/website-builder/SectionImageField";
import { ThemeColorSlider } from "../../components/website-builder/ThemeColorSlider";
import type { UserWebsite } from "../../lib/user-websites-types";
import wb from "./website-builder.module.css";

const PLACEHOLDER_NAME = "My Awesome Website";
const PLACEHOLDER_PROMPT =
  "Example: Create a modern landing page for my coffee shop with a menu section, about us page, and contact form. Use warm colors.";

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
  const [shareOrigin, setShareOrigin] = useState<string | null>(null);

  const isEditMode = websiteId.length > 0;

  useEffect(() => {
    void fetch("/api/config/site-public-base", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { origin?: string } | null) => {
        if (data?.origin) setShareOrigin(data.origin);
      })
      .catch(() => undefined);
  }, []);

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
        originOverride: shareOrigin,
      }),
    [siteMeta?.publicUrl, siteMeta?.slug, siteMeta?.status, shareOrigin],
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
      setStatusMessage(
        updated.contentSource === "template"
          ? "Gemini rate limit reached — basic template copy applied instead. Wait a few minutes or check quotas in Google AI Studio, then try again."
          : "AI content applied. Review and save.",
      );
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
      setStatusMessage(
        "ZIP downloaded. Unzip → open app.netlify.com/drop → drag folder in → copy your https://….netlify.app link (see DEPLOY.md in ZIP).",
      );
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

  const updateBlock = (
    key: string,
    field: keyof Pick<
      WebsiteSectionBlock,
      "headline" | "body" | "cta" | "ctaLink" | "imageUrl"
    >,
    value: string,
  ) => {
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
                  <ThemeColorSlider id="wb-theme" value={themeColor} onChange={setThemeColor} />
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
                    <input
                      className={wb.input}
                      placeholder="Button link (#contact or section key)"
                      value={block.ctaLink}
                      onChange={(e) => updateBlock(block.key, "ctaLink", e.target.value)}
                      style={{ marginTop: "0.5rem" }}
                    />
                    <SectionImageField
                      websiteId={websiteId}
                      sectionKey={block.key}
                      imageUrl={block.imageUrl}
                      onImageUrl={(url) => updateBlock(block.key, "imageUrl", url)}
                      disabled={saving || loadingSite || generating}
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
            {siteMeta?.status === "PUBLISHED" ? (
              <div
                className={wb.hint}
                style={{
                  padding: "0.75rem",
                  border: "1px solid rgba(255,140,0,0.45)",
                  borderRadius: 8,
                  marginBottom: "0.5rem",
                }}
              >
                <strong>Deploy for FYP (free public URL)</strong>
                <ol style={{ margin: "0.5rem 0 0", paddingLeft: "1.25rem" }}>
                  <li>Click <strong>EXPORT ZIP (FREE HOSTING)</strong> below.</li>
                  <li>Unzip the file on your PC.</li>
                  <li>
                    Open{" "}
                    <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer">
                      app.netlify.com/drop
                    </a>{" "}
                    and drag the unzipped folder in.
                  </li>
                  <li>Use the <code>https://….netlify.app</code> link anywhere (judges, report, phone data).</li>
                </ol>
                <p style={{ margin: "0.5rem 0 0", opacity: 0.9 }}>
                  Also works on{" "}
                  <a href="https://vercel.com/new" target="_blank" rel="noreferrer">
                    Vercel
                  </a>
                  . See <code>DEPLOY.md</code> inside the ZIP. Re-export after you edit the site.
                </p>
              </div>
            ) : null}
            {publicUrl ? (
              <p className={wb.hint} style={{ opacity: 0.85 }}>
                <strong>Local preview</strong> (this PC only):{" "}
                <a href={publicUrl} target="_blank" rel="noreferrer">
                  {publicUrl}
                </a>
                {" — "}
                for sharing outside your machine, use the ZIP export above.
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
                    {exporting ? "EXPORTING…" : "EXPORT ZIP (FREE HOSTING)"}
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

          <article className={showPreview ? `${wb.previewPanel} ${wb.previewPanelLive}` : wb.previewShell}>
            {showPreview ? (
              <>
                <div className={wb.previewHeader}>
                  <span>Website preview</span>
                </div>
                <div className={wb.previewFrame} style={{ background: "#fff" }}>
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
