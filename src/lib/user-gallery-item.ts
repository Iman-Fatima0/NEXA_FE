/** Shared card shape for website / bot / integration galleries (`GET /api/user/...`). */

export type UserGalleryItem = {
  id: string;
  name: string;
  description?: string;
  highlight?: boolean;
  previewUrl?: string;
  previewHtml?: string;
  updatedAt?: string;
  /** ISO 8601 — shown as “created” when set; otherwise `updatedAt` is used. */
  createdAt?: string;
  href?: string;
  templateId?: string | null;
  themeColor?: string | null;
  theme?: { preset: string; overrides?: Record<string, unknown> } | null;
  themePreset?: string | null;
  logo?: string | null;
  sections?: unknown;
  status?: "DRAFT" | "PUBLISHED";
  slug?: string | null;
  publishedAt?: string | null;
  /** Canonical live URL from API when published (Phase 5). */
  publicUrl?: string | null;
  /** Custom hostname when set (e.g. shop.example.com). */
  domain?: string | null;
  /** https://{domain} when published with a custom domain. */
  customDomainUrl?: string | null;
  /** Present after generate-content: gemini vs template fallback. */
  contentSource?: "gemini" | "template";
  /** Internal bot used for document/URL knowledge (website builder). */
  knowledgeBotId?: string | null;
};
