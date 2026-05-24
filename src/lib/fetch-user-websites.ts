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
  themeColor?: string | null;
  logo?: string | null;
  sections?: Record<string, unknown> | null;
};

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

export type PublicWebsitePayload = {
  slug: string;
  name: string;
  themeColor: string | null;
  logo: string | null;
  sections: unknown;
  publishedAt: string | null;
  publicUrl: string;
};

export async function generateUserWebsiteContent(
  id: string,
  payload: { prompt: string },
): Promise<UserWebsite> {
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
