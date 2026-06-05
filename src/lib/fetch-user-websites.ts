import { bffJson } from "./api/bff-json";
import { BFF_PATHS } from "./api/bff-paths";
import type { BackendWebsiteRow } from "./api/bff-website-normalize";
import { mapBackendWebsiteToGalleryItem } from "./api/bff-website-normalize";
import { env } from "../config/env";
import { pathPublicSite } from "./api/upstream-paths";
import type { UserWebsite, UserWebsitesPayload } from "./user-websites-types";

export async function fetchUserWebsites(): Promise<UserWebsitesPayload> {
  return bffJson<UserWebsitesPayload>(BFF_PATHS.userWebsites);
}

export type UserWebsiteByIdPayload = { website: UserWebsite };

export async function fetchUserWebsiteById(id: string): Promise<UserWebsite> {
  const body = await bffJson<UserWebsiteByIdPayload>(BFF_PATHS.userWebsite(id));
  return body.website;
}

export type UpdateWebsiteBuilderPayload = {
  title?: string;
  domain?: string | null;
  themeColor?: string | null;
  logo?: string | null;
  sections?: Record<string, unknown> | null;
};

export async function uploadWebsiteSectionImage(
  websiteId: string,
  file: File,
): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append("file", file);
  return bffJson<{ url: string }>(
    `/api/user/websites/${encodeURIComponent(websiteId)}/section-image`,
    { method: "POST", body: fd },
  );
}

export async function updateUserWebsiteBuilder(id: string, payload: UpdateWebsiteBuilderPayload): Promise<UserWebsite> {
  const row = await bffJson<BackendWebsiteRow>(BFF_PATHS.userWebsite(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return mapBackendWebsiteToGalleryItem(row, { includeBuilder: true });
}

export async function publishUserWebsite(id: string): Promise<UserWebsite> {
  const row = await bffJson<BackendWebsiteRow>(BFF_PATHS.userWebsitePublish(id), {
    method: "POST",
  });
  return mapBackendWebsiteToGalleryItem(row, { includeBuilder: true });
}

export type PublicWebsitePageRef = {
  key: string;
  name: string;
  path: string;
};

export type PublicWebsitePayload = {
  slug: string;
  name: string;
  domain?: string | null;
  themeColor: string | null;
  logo: string | null;
  sections: unknown;
  pages?: PublicWebsitePageRef[];
  publishedAt: string | null;
  publicUrl: string;
  customDomainUrl?: string | null;
};

export type WebsiteStaticExportPayload = {
  slug: string;
  name: string;
  files: Array<{ path: string; content: string }>;
  deploy: { vercel: string; s3: string; note: string };
};

export async function generateUserWebsiteContent(
  id: string,
  payload: { prompt: string },
): Promise<UserWebsite> {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console -- dev RPM debugging (1 BFF → 1 Nest → 1 Gemini)
    console.log(
      `[NEXA] generateUserWebsiteContent: 1 fetch to /api/.../generate-content (not per-page; Strict Mode does not double onClick)`,
      { websiteId: id },
    );
  }
  const row = await bffJson<BackendWebsiteRow>(BFF_PATHS.userWebsiteGenerateContent(id), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return mapBackendWebsiteToGalleryItem(row, { includeBuilder: true });
}

export async function fetchPublicWebsiteBySlug(slug: string): Promise<PublicWebsitePayload> {
  return bffJson<PublicWebsitePayload>(BFF_PATHS.publicSite(slug));
}

/** Server components: read published site directly from Nest (no session). */
export async function fetchPublicWebsiteBySlugFromBackend(slug: string): Promise<PublicWebsitePayload> {
  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    throw new Error("Backend not configured.");
  }
  const res = await fetch(`${base.replace(/\/+$/, "")}${pathPublicSite(slug)}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Site not found.");
  }
  return (await res.json()) as PublicWebsitePayload;
}

export async function fetchPublicWebsitePageFromBackend(
  slug: string,
  pageKey: string,
): Promise<PublicWebsitePayload> {
  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    throw new Error("Backend not configured.");
  }
  const path = `/public/sites/${encodeURIComponent(slug)}/pages/${encodeURIComponent(pageKey)}`;
  const res = await fetch(`${base.replace(/\/+$/, "")}${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Page not found.");
  }
  return (await res.json()) as PublicWebsitePayload;
}

/** Download static ZIP for Vercel/S3 (requires session cookies in browser). */
export async function downloadWebsiteExportZip(websiteId: string): Promise<void> {
  const res = await fetch(BFF_PATHS.userWebsiteExportZip(websiteId), {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Export failed");
  }
  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition");
  const match = disposition?.match(/filename="?([^";]+)"?/);
  const filename = match?.[1] ?? "nexa-site.zip";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
