"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import DashboardStyleBackNav from "../../components/gallery/DashboardStyleBackNav";
import { ApiError } from "../../lib/api";
import {
  generateWebsite,
  getWebsiteBuilderApiBaseUrl,
  type GenerateWebsiteResponse,
} from "../../lib/website-builder-api";
import wb from "./website-builder.module.css";

const PLACEHOLDER_NAME = "My Awesome Website";
const PLACEHOLDER_PROMPT =
  "Example: Create a modern landing page for my coffee shop with a menu section, about us page, and contact form. Use warm colors and include images of coffee.";

const PREVIEW_WAIT_GIF = "/assets/images/redcirclesquare.gif";

function resolvePreviewUrl(previewUrl: string, apiBase: string): string {
  const trimmed = previewUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  try {
    return new URL(trimmed.startsWith("/") ? trimmed : `/${trimmed}`, apiBase.replace(/\/+$/, "") + "/").href;
  } catch {
    return trimmed;
  }
}

function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    const p = err.payload;
    if (typeof p === "object" && p !== null && "message" in p && typeof (p as { message: unknown }).message === "string") {
      return (p as { message: string }).message;
    }
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Something went wrong.";
}

type WebsiteBuilderClientProps = Readonly<{
  /** From server: dashboard websites hub when signed in, otherwise public builder entry. */
  hubBackHref: string;
}>;

export default function WebsiteBuilderClient({ hubBackHref }: WebsiteBuilderClientProps) {
  const [websiteName, setWebsiteName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<
    | { mode: "iframe-url"; src: string }
    | { mode: "srcdoc"; html: string }
    | { mode: "empty-message"; text: string }
    | null
  >(null);

  const apiBaseConfigured = useMemo(() => getWebsiteBuilderApiBaseUrl().length > 0, []);

  const applyResponse = useCallback((res: GenerateWebsiteResponse) => {
    setApiMessage(res.message ?? null);
    const base = getWebsiteBuilderApiBaseUrl();
    const rawUrl = res.previewUrl?.trim();
    if (rawUrl) {
      if (/^https?:\/\//i.test(rawUrl)) {
        setPreview({ mode: "iframe-url", src: rawUrl });
        return;
      }
      const origin = base || globalThis.window?.location.origin || "";
      setPreview({ mode: "iframe-url", src: resolvePreviewUrl(rawUrl, origin) });
      return;
    }
    if (res.html && res.html.trim().length > 0) {
      setPreview({ mode: "srcdoc", html: res.html });
      return;
    }
    setPreview({
      mode: "empty-message",
      text: res.message?.trim() || "The server responded but did not include preview HTML or a preview URL.",
    });
  }, []);

  const handleGenerate = async () => {
    setError(null);
    setApiMessage(null);
    const name = websiteName.trim();
    const desc = description.trim();
    if (!name || !desc) {
      setError("Please enter a website name and a description of what you want.");
      return;
    }
    if (!apiBaseConfigured) {
      setError(
        "API base URL is not set. Add NEXT_PUBLIC_WEBSITE_API_BASE_URL (or NEXT_PUBLIC_BACKEND_API_BASE_URL) to your .env file, then restart the dev server."
      );
      return;
    }
    setLoading(true);
    try {
      const res = await generateWebsite({ websiteName: name, description: desc });
      applyResponse(res);
    } catch (e) {
      setPreview(null);
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={wb.page}>
      <DashboardStyleBackNav href={hubBackHref} ariaLabel="Back" />
      <main className={wb.main}>
        <section className={wb.split}>
          <article className={wb.panel}>
            <h2 className={wb.panelTitle}>Describe Your Website</h2>
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
            <p className={wb.hint}>Be as detailed as possible. Mention colors, sections, features, and style preferences.</p>
            {error ? <p className={wb.error}>{error}</p> : null}
            <button type="button" className={wb.btn} onClick={handleGenerate} disabled={loading}>
              {loading ? "GENERATING…" : "GENERATE WEBSITE"}
            </button>
          </article>

          <article className={preview ? wb.previewPanel : wb.previewShell}>
            {preview ? (
              <>
                <div className={wb.previewHeader}>
                  <span>Website preview</span>
                  {apiMessage ? <span className={wb.previewMeta}>{apiMessage}</span> : null}
                </div>
                {preview.mode === "iframe-url" ? (
                  <iframe
                    title="Generated website preview"
                    className={wb.previewFrame}
                    src={preview.src}
                    sandbox="allow-scripts allow-forms allow-popups allow-modals"
                  />
                ) : null}
                {preview.mode === "srcdoc" ? (
                  <iframe
                    title="Generated website preview"
                    className={wb.previewFrame}
                    srcDoc={preview.html}
                    sandbox="allow-scripts allow-forms allow-popups allow-modals"
                  />
                ) : null}
                {preview.mode === "empty-message" ? <div className={wb.emptyMessage}>{preview.text}</div> : null}
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
                  <h3 className={wb.previewHeading}>Your website will appear here</h3>
                </div>
              </>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
