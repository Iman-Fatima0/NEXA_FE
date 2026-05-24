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
  logo?: string | null;
  sections?: unknown;
  status?: "DRAFT" | "PUBLISHED";
  slug?: string | null;
  publishedAt?: string | null;
  /** Canonical live URL from API when published (Phase 5). */
  publicUrl?: string | null;
};
