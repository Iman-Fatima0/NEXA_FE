import { bffJson } from "./api/bff-json";
import { BFF_PATHS } from "./api/bff-paths";
import type { UserWebsite, UserWebsitesPayload } from "./user-websites-types";

export async function fetchUserWebsites(): Promise<UserWebsitesPayload> {
  return bffJson<UserWebsitesPayload>(BFF_PATHS.userWebsites);
}

export type UserWebsiteByIdPayload = { website: UserWebsite };

export async function fetchUserWebsiteById(id: string): Promise<UserWebsite> {
  const body = await bffJson<UserWebsiteByIdPayload>(BFF_PATHS.userWebsite(id));
  return body.website;
}
