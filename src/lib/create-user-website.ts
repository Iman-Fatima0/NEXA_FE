import { bffJson } from "./api/bff-json";
import { BFF_PATHS } from "./api/bff-paths";
import type { BackendWebsiteRow } from "./api/bff-website-normalize";
import { mapBackendWebsiteToGalleryItem } from "./api/bff-website-normalize";
import type { UserWebsite } from "./user-websites-types";

export type CreateUserWebsitePayload = {
  name: string;
  templateId?: string;
  description?: string;
  domain?: string | null;
};

export async function createUserWebsite(payload: CreateUserWebsitePayload): Promise<UserWebsite> {
  const row = await bffJson<BackendWebsiteRow>(BFF_PATHS.userWebsites, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      templateId: payload.templateId,
      description: payload.description,
      domain: payload.domain ?? undefined,
    }),
  });
  return mapBackendWebsiteToGalleryItem(row);
}
