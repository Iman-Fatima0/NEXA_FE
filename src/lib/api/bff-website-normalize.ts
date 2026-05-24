import type { UserGalleryItem } from "../user-gallery-item";
import type { UserWebsite } from "../user-websites-types";
import type { UserWebsitesPayload } from "../user-websites-types";

/** Raw website row from Nest `GET /websites` or `GET /websites/:id`. */
export type BackendWebsiteRow = {
  id: string;
  name: string;
  domain?: string | null;
  templateId?: string | null;
  themeColor?: string | null;
  logo?: string | null;
  sections?: unknown;
  status?: "DRAFT" | "PUBLISHED";
  slug?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export function mapBackendWebsiteToGalleryItem(row: BackendWebsiteRow, opts?: { includeBuilder?: boolean }): UserWebsite {
  const createdAt =
    typeof row.createdAt === "string" ? row.createdAt : row.createdAt != null ? String(row.createdAt) : undefined;
  const updatedAt =
    typeof row.updatedAt === "string" ? row.updatedAt : row.updatedAt != null ? String(row.updatedAt) : createdAt;
  let description: string | undefined;
  if (row.templateId) {
    description = `Template: ${row.templateId}`;
  }
  if (row.domain?.trim()) {
    description = description ? `${description} · ${row.domain.trim()}` : row.domain.trim();
  }
  if (row.status === "PUBLISHED" && row.slug) {
    description = description ? `${description} · /s/${row.slug}` : `/s/${row.slug}`;
  }
  const item: UserWebsite = {
    id: row.id,
    name: row.name,
    description,
    createdAt,
    updatedAt,
    templateId: row.templateId,
    status: row.status,
    slug: row.slug,
    publishedAt:
      typeof row.publishedAt === "string" ? row.publishedAt : row.publishedAt != null ? String(row.publishedAt) : null,
  };
  if (opts?.includeBuilder) {
    item.themeColor = row.themeColor;
    item.logo = row.logo;
    item.sections = row.sections;
  }
  return item;
}

export function normalizeWebsitesListPayload(raw: unknown): UserWebsitesPayload {
  if (Array.isArray(raw)) {
    return { websites: raw.map((row) => mapBackendWebsiteToGalleryItem(row as BackendWebsiteRow)) };
  }
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const list = o.websites ?? o.data ?? o.items;
    if (Array.isArray(list)) {
      return { websites: list.map((row) => mapBackendWebsiteToGalleryItem(row as BackendWebsiteRow)) };
    }
  }
  return { websites: [] };
}

export function normalizeWebsiteDetailPayload(raw: unknown): { website: UserWebsite } | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const nested = o.website;
  if (nested && typeof nested === "object") {
    return { website: mapBackendWebsiteToGalleryItem(nested as BackendWebsiteRow, { includeBuilder: true }) };
  }
  if (typeof o.id === "string" && typeof o.name === "string") {
    return { website: mapBackendWebsiteToGalleryItem(o as BackendWebsiteRow, { includeBuilder: true }) };
  }
  return null;
}
