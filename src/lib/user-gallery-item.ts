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
};
