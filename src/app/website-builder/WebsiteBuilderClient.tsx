"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { KnowledgeBasePanel } from "../../components/knowledge-base/KnowledgeBasePanel";
import { isIngestableFile } from "../../lib/chatbot/ingest-files";
import { fetchDocumentCount } from "../../lib/chatbot/chatbot-platform-api";
import { ingestKnowledgeToBot } from "../../lib/knowledge-base/ingest-knowledge";
import {
  isValidKnowledgeUrl,
  knowledgeFileKey,
} from "../../lib/knowledge-base/knowledge-base-utils";
import { friendlyUserError } from "../../lib/api/friendly-user-error";
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
  normalizeTemplateId,
  readStoredTemplateId,
  readTemplateIdFromSearch,
  storeTemplateId,
} from "../../lib/website-template-storage";
import type { WebsiteTemplate } from "../../lib/website-templates-types";
import {
  parseWebsiteSections,
  sectionsToRecord,
  WebsiteSectionsView,
  type WebsiteSectionBlock,
} from "../../lib/website-sections";
import { sectionAnchorId } from "../../lib/website-section-links";
import { SectionImageField } from "../../components/website-builder/SectionImageField";
import { WebsiteTemplatePicker } from "../../components/website-builder/WebsiteTemplatePicker";
import { WebsiteThemePicker } from "../../components/website-builder/WebsiteThemePicker";
import { PRESET_MAP } from "../../lib/theme/presets";
import {
  parseWebsiteTheme,
  websiteThemeSavePayload,
  type WebsiteThemeSettings,
} from "../../lib/theme/parse-website-theme";
import type { ThemePreset, ThemeTokens } from "../../lib/theme/types";
import type { WebsiteBuilderScreenPayload } from "../../lib/api/compose-screens";
import type { UserWebsite } from "../../lib/user-websites-types";
import wb from "./website-builder.module.css";

const PLACEHOLDER_NAME = "My Awesome Website";
const PLACEHOLDER_PROMPT =
  "Example: Create a modern landing page for my coffee shop with a menu section, about us page, and contact form. Use warm colors.";

const PREVIEW_WAIT_GIF = "/assets/images/redcirclesquare.gif";

type WebsiteBuilderClientProps = Readonly<{
  hubBackHref: string;
  initialBuilderScreen?: WebsiteBuilderScreenPayload | null;
}>;

export default function WebsiteBuilderClient({
  hubBackHref,
  initialBuilderScreen = null,
}: WebsiteBuilderClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("id")?.trim() || "";

  const [websiteName, setWebsiteName] = useState("");
  const [description, setDescription] = useState("");
  const [themePreset, setThemePreset] = useState<ThemePreset>("modern");
  const [themeTokens, setThemeTokens] = useState<ThemeTokens>(PRESET_MAP.modern);
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
  const [templates, setTemplates] = useState<WebsiteTemplate[]>(initialBuilderScreen?.templates ?? []);
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => readStoredTemplateId());
  const [templatesUnavailable, setTemplatesUnavailable] = useState(false);
  const [shareOrigin, setShareOrigin] = useState<string | null>(null);

  const [knowledgeMode, setKnowledgeMode] = useState<"files" | "text">("files");
  const [knowledgeFiles, setKnowledgeFiles] = useState<File[]>([]);
  const [knowledgeText, setKnowledgeText] = useState("");
  const [knowledgeUrls, setKnowledgeUrls] = useState<string[]>([""]);
  const [ingestingKnowledge, setIngestingKnowledge] = useState(false);
  const [knowledgeDocCount, setKnowledgeDocCount] = useState(0);

  const isEditMode = websiteId.length > 0;

  const refreshKnowledgeDocCount = useCallback(async (botId?: string | null) => {
    if (!botId) {
      setKnowledgeDocCount(0);
      return;
    }
    setKnowledgeDocCount(await fetchDocumentCount(botId));
  }, []);

  const addKnowledgeFiles = useCallback((list: FileList | File[]) => {
    setKnowledgeFiles((prev) => {
      const next = [...prev];
      const seen = new Set(next.map(knowledgeFileKey));
      for (const file of Array.from(list)) {
        if (!isIngestableFile(file)) continue;
        const key = knowledgeFileKey(file);
        if (!seen.has(key)) {
          seen.add(key);
          next.push(file);
        }
      }
      return next;
    });
  }, []);

  const removeKnowledgeFile = useCallback((key: string) => {
    setKnowledgeFiles((prev) => prev.filter((f) => knowledgeFileKey(f) !== key));
  }, []);

  const validKnowledgeUrls = useMemo(
    () => knowledgeUrls.map((u) => u.trim()).filter(isValidKnowledgeUrl),
    [knowledgeUrls],
  );

  const hasPendingKnowledge = useMemo(() => {
    const hasFiles = knowledgeFiles.length > 0;
    const hasText = knowledgeMode === "text" && knowledgeText.trim().length > 0;
    const hasUrls = validKnowledgeUrls.length > 0;
    return hasFiles || hasText || hasUrls;
  }, [knowledgeFiles.length, knowledgeMode, knowledgeText, validKnowledgeUrls.length]);

  const hasKnowledgeSource = useMemo(
    () => hasPendingKnowledge || knowledgeDocCount > 0,
    [hasPendingKnowledge, knowledgeDocCount],
  );

  const clearPendingKnowledge = useCallback(() => {
    setKnowledgeFiles([]);
    setKnowledgeText("");
    setKnowledgeUrls([""]);
    setKnowledgeMode("files");
  }, []);

  const uploadPendingKnowledge = useCallback(
    async (botId: string) => {
      if (!hasPendingKnowledge) return;
      setIngestingKnowledge(true);
      try {
        await ingestKnowledgeToBot(
          botId,
          {
            files: knowledgeFiles,
            text: knowledgeMode === "text" ? knowledgeText : undefined,
            urls: validKnowledgeUrls,
          },
          (msg) => setStatusMessage(msg),
        );
        clearPendingKnowledge();
        await refreshKnowledgeDocCount(botId);
      } finally {
        setIngestingKnowledge(false);
      }
    },
    [
      clearPendingKnowledge,
      hasPendingKnowledge,
      knowledgeFiles,
      knowledgeMode,
      knowledgeText,
      refreshKnowledgeDocCount,
      validKnowledgeUrls,
    ],
  );

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
    if (fromQuery) {
      storeTemplateId(fromQuery);
      setSelectedTemplateId(fromQuery);
    }
    if (initialBuilderScreen?.templates.length) {
      setTemplates(initialBuilderScreen.templates);
      setTemplatesUnavailable(false);
      return;
    }
    void fetchWebsiteTemplates()
      .then((list) => {
        setTemplates(list);
        setTemplatesUnavailable(list.length === 0);
      })
      .catch(() => setTemplatesUnavailable(true));
  }, [initialBuilderScreen]);

  useEffect(() => {
    if (!templates.length) return;
    setSelectedTemplateId((prev) => {
      if (templates.some((t) => t.templateId === prev)) return prev;
      return templates[0].templateId;
    });
  }, [templates]);

  const handleSelectTemplate = useCallback((templateId: string) => {
    const id = normalizeTemplateId(templateId);
    setSelectedTemplateId(id);
    storeTemplateId(id);
  }, []);

  const applySiteToEditor = useCallback(
    (site: UserWebsite) => {
      setSiteMeta(site);
      setWebsiteName(site.name);
      const themeParsed = parseWebsiteTheme(site.theme, site.themeColor);
      setThemePreset(themeParsed.preset);
      setThemeTokens(themeParsed.theme);
      setLogo(site.logo?.trim() || "");
      const sectionsParsed = parseWebsiteSections(site.sections);
      setSectionBlocks(sectionsParsed.blocks);
      setDescription(sectionsParsed.metaDescription || "");
      void refreshKnowledgeDocCount(site.knowledgeBotId);
    },
    [refreshKnowledgeDocCount],
  );

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
        setError(friendlyUserError(e, "Something went wrong with your website. Please try again.", "website"));
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
    if (initialBuilderScreen?.website.id === websiteId) {
      applySiteToEditor(initialBuilderScreen.website);
      return;
    }
    void loadSite(websiteId);
  }, [websiteId, loadSite, initialBuilderScreen, applySiteToEditor]);

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
    const templateId = templates.some((t) => t.templateId === selectedTemplateId)
      ? selectedTemplateId
      : readStoredTemplateId();
    setLoading(true);
    try {
      storeTemplateId(templateId);
      const created = await createUserWebsite({ name, templateId, description: desc || undefined });
      if (hasPendingKnowledge && created.knowledgeBotId) {
        setStatusMessage("Uploading knowledge base…");
        await uploadPendingKnowledge(created.knowledgeBotId);
        setStatusMessage("Generating sections from your knowledge base…");
        await generateUserWebsiteContent(created.id, {
          prompt: desc || name || "Create website content from the knowledge base.",
        });
      }
      router.replace(`/website-builder/create?id=${encodeURIComponent(created.id)}`);
    } catch (e) {
      setError(friendlyUserError(e, "Something went wrong with your website. Please try again.", "website"));
    } finally {
      setLoading(false);
    }
  };

  const persistBuilder = async () => {
    if (!websiteId) return null;
    const themePayload: WebsiteThemeSettings = websiteThemeSavePayload(themePreset, themeTokens);
    const payload: Parameters<typeof updateUserWebsiteBuilder>[1] = {
      title: websiteName.trim() || undefined,
      theme: themePayload,
      themeColor: themeTokens.primaryColor.trim() || null,
      logo: logo.trim() || null,
    };
    const hasBlockContent = sectionBlocks.some(
      (b) => b.headline.trim() || b.body.trim() || b.cta.trim() || b.imageUrl.trim(),
    );
    if (hasBlockContent) {
      payload.sections = sectionsToRecord(sectionBlocks, description.trim() || undefined);
    } else if (siteMeta?.sections && description.trim()) {
      const base = { ...(siteMeta.sections as Record<string, unknown>) };
      base._meta = { description: description.trim() };
      const firstKey = sectionBlocks[0]?.key;
      if (firstKey && base[firstKey] && typeof base[firstKey] === "object") {
        const block = { ...(base[firstKey] as Record<string, unknown>) };
        if (!String(block.body ?? "").trim()) {
          block.body = description.trim();
        }
        base[firstKey] = block;
      }
      payload.sections = base;
    }
    return updateUserWebsiteBuilder(websiteId, payload);
  };

  const enhanceFromKnowledge = async () => {
    const prompt =
      description.trim() ||
      websiteName.trim() ||
      "Create website content from the knowledge base.";
    setStatusMessage("Building website from your knowledge base…");
    const updated = await generateUserWebsiteContent(websiteId, { prompt });
    applySiteToEditor(updated);
    return updated;
  };

  const handleUpdateWebsite = async () => {
    if (!websiteId) return;
    if (!websiteName.trim()) {
      setError("Website name cannot be empty.");
      return;
    }
    setError(null);
    setStatusMessage(null);
    setSaving(true);
    const kbJustUploaded = hasPendingKnowledge;
    try {
      if (kbJustUploaded && siteMeta?.knowledgeBotId) {
        await uploadPendingKnowledge(siteMeta.knowledgeBotId);
      }
      await persistBuilder();
      if (kbJustUploaded && siteMeta?.knowledgeBotId) {
        setGenerating(true);
        const enhanced = await enhanceFromKnowledge();
        setStatusMessage(
          enhanced.contentSource === "template"
            ? "Knowledge uploaded. Basic section copy applied from your files (Gemini unavailable)."
            : "Saved and sections filled from your knowledge base.",
        );
      } else {
        const refreshed = await fetchUserWebsiteById(websiteId);
        applySiteToEditor(refreshed);
        setStatusMessage("Changes saved.");
      }
    } catch (e) {
      setError(friendlyUserError(e, "Something went wrong with your website. Please try again.", "website"));
    } finally {
      setSaving(false);
      setGenerating(false);
    }
  };

  const handleEnhanceWithAi = async () => {
    if (!websiteId || generating) return;
    if (!description.trim() && !hasKnowledgeSource) {
      setError("Add knowledge base files/text or enter a site description first.");
      return;
    }
    setError(null);
    setStatusMessage(null);
    setGenerating(true);
    try {
      if (hasPendingKnowledge && siteMeta?.knowledgeBotId) {
        await uploadPendingKnowledge(siteMeta.knowledgeBotId);
      }
      const updated = await enhanceFromKnowledge();
      setStatusMessage(
        updated.contentSource === "template"
          ? "Gemini rate limit reached — basic copy applied from your knowledge base instead."
          : "Sections enhanced from your knowledge base.",
      );
    } catch (e) {
      setError(friendlyUserError(e, "Something went wrong with your website. Please try again.", "website"));
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
      setStatusMessage("ZIP downloaded.");
    } catch (e) {
      setError(friendlyUserError(e, "Something went wrong with your website. Please try again.", "website"));
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
      applySiteToEditor(published);
      const live = resolveWebsitePublicUrl({
        publicUrl: published.publicUrl,
        slug: published.slug,
        status: published.status,
        originOverride: shareOrigin,
      });
      setStatusMessage(live ? `Published. Your site: ${live}` : "Published.");
    } catch (e) {
      setError(friendlyUserError(e, "Something went wrong with your website. Please try again.", "website"));
    } finally {
      setPublishing(false);
    }
  };

  const copyPublicUrl = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setStatusMessage("Site URL copied.");
    } catch {
      setStatusMessage(publicUrl);
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
        : ingestingKnowledge
          ? "Uploading knowledge…"
          : generating
          ? "Enhancing with AI…"
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
          <div>
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

            {!isEditMode && templates.length > 0 ? (
              <div className={wb.field}>
                <span className={wb.label} id="wb-template-label">
                  Website type
                </span>
                <WebsiteTemplatePicker
                  templates={templates}
                  selectedTemplateId={selectedTemplateId}
                  onSelect={handleSelectTemplate}
                  disabled={loading}
                />
              </div>
            ) : null}

            <div className={wb.field}>
              <label className={wb.label} htmlFor={isEditMode ? "wb-desc-edit" : "wb-desc"}>
                {isEditMode ? "Site description (for AI)" : "Describe your website (optional)"}
              </label>
              <textarea
                id={isEditMode ? "wb-desc-edit" : "wb-desc"}
                className={wb.textarea}
                placeholder={PLACEHOLDER_PROMPT}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={isEditMode ? 4 : 6}
              />
            </div>

            {!isEditMode ? (
              <p className={wb.hint}>
                Add knowledge base files below, then create your site. Use <strong>Enhance with AI</strong> after
                create to fill sections from your uploads.
              </p>
            ) : null}
          </article>

          <KnowledgeBasePanel
            idPrefix="wb"
            className={wb.panelGap}
            disabled={loading || saving || generating || loadingSite || ingestingKnowledge}
            knowledgeMode={knowledgeMode}
            onKnowledgeModeChange={setKnowledgeMode}
            files={knowledgeFiles}
            onAddFiles={addKnowledgeFiles}
            onRemoveFile={removeKnowledgeFile}
            knowledgeText={knowledgeText}
            onKnowledgeTextChange={setKnowledgeText}
            urls={knowledgeUrls}
            onUrlsChange={setKnowledgeUrls}
            textHint="parsed and used when you click Enhance with AI."
          />

          {!isEditMode ? (
            <div className={wb.panelGap}>
              {templatesUnavailable ? (
                <p className={wb.hint}>Templates could not be loaded. You can still create and edit sites.</p>
              ) : null}
              {error ? (
                <div className={wb.errorBlock}>
                  <p className={wb.error}>{error}</p>
                </div>
              ) : null}
              {statusMessage ? <p className={wb.hint}>{statusMessage}</p> : null}
              <button type="button" className={wb.btn} onClick={handleCreate} disabled={loading}>
                {loading ? "CREATING…" : "CREATE WEBSITE"}
              </button>
            </div>
          ) : (
            <div className={`${wb.panel} ${wb.panelGap}`}>
              <p className={wb.hint} style={{ marginTop: 0 }}>
                Changes are <strong>not</strong> saved automatically. Click <strong>Save changes</strong> after
                editing, or <strong>Enhance with AI</strong> to generate section copy (saved when complete).
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                <button
                  type="button"
                  className={wb.btn}
                  onClick={() => void handleEnhanceWithAi()}
                  disabled={generating || loadingSite || ingestingKnowledge}
                >
                  {generating ? "ENHANCING…" : "ENHANCE WITH AI"}
                </button>
                <button
                  type="button"
                  className={wb.btnBlack}
                  onClick={() => void handleUpdateWebsite()}
                  disabled={saving || loadingSite || ingestingKnowledge}
                >
                  {saving ? "SAVING…" : "SAVE CHANGES"}
                </button>
              </div>
            </div>
          )}

          {isEditMode ? (
            <article className={`${wb.panel} ${wb.panelGap}`}>
              <div className={wb.field}>
                <label className={wb.label}>Theme preset</label>
                <WebsiteThemePicker
                  preset={themePreset}
                  theme={themeTokens}
                  onPresetSelect={(id) => {
                    setThemePreset(id);
                    setThemeTokens(PRESET_MAP[id]);
                  }}
                  onThemeChange={(patch) => setThemeTokens((t) => ({ ...t, ...patch }))}
                />
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
            {publicUrl ? (
              <div
                style={{
                  padding: "1rem",
                  border: "1px solid rgba(255,140,0,0.55)",
                  borderRadius: 10,
                  marginBottom: "0.75rem",
                  background: "rgba(255,140,0,0.08)",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Your site URL</div>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ wordBreak: "break-all", color: "#ff8c00", fontSize: "1.05rem" }}
                >
                  {publicUrl}
                </a>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.65rem" }}>
                  <button type="button" className={wb.btnGhost} onClick={() => void copyPublicUrl()}>
                    Copy link
                  </button>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={wb.btnGhost}
                    style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                  >
                    Open site
                  </a>
                </div>
                <p className={wb.hint} style={{ margin: "0.65rem 0 0", opacity: 0.9 }}>
                  After you edit, click <strong>Save changes</strong> then <strong>Publish</strong> to update the live
                  site.
                </p>
              </div>
            ) : (
              <p className={wb.hint}>
                Click <strong>Publish</strong> when ready — you will get a shareable site link here.
              </p>
            )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="button" className={wb.btn} onClick={handlePublish} disabled={publishing || saving || loadingSite || exporting}>
                  {publishing ? "PUBLISHING…" : "PUBLISH"}
                </button>
                {siteMeta?.status === "PUBLISHED" ? (
                  <button
                    type="button"
                    className={wb.btnGhost}
                    onClick={() => void handleExportZip()}
                    disabled={exporting || saving || loadingSite}
                  >
                    {exporting ? "Exporting…" : "Download ZIP (optional)"}
                  </button>
                ) : null}
                {websiteId ? (
                  <Link href={`/dashboard/websites/${encodeURIComponent(websiteId)}/preview`} className={wb.btn} style={{ textAlign: "center", textDecoration: "none" }}>
                    FULL PREVIEW
                  </Link>
                ) : null}
              </div>
            </article>
          ) : null}
          </div>

          <article className={showPreview ? `${wb.previewPanel} ${wb.previewPanelLive}` : wb.previewShell}>
            {showPreview ? (
              <>
                <div className={wb.previewHeader}>
                  <span>Website preview</span>
                </div>
                <div className={wb.previewFrame} style={{ background: "#fff" }}>
                  <WebsiteSectionsView
                    name={websiteName.trim() || "Website"}
                    theme={websiteThemeSavePayload(themePreset, themeTokens)}
                    themeColor={themeTokens.primaryColor}
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
