import type { UserWebsite } from "./user-websites-types";
import { generateUserWebsiteContent } from "./fetch-user-websites";

/** AI website content — proxied to Nest `POST /websites/:id/generate-content`. */

export type GenerateWebsitePayload = {
  websiteName: string;
  description: string;
};

export type GenerateWebsiteResponse = {
  website?: UserWebsite;
  message?: string;
};

/** @deprecated Create a site first; use `generateWebsiteContent`. */
export async function generateWebsite(_payload: GenerateWebsitePayload): Promise<GenerateWebsiteResponse> {
  return {
    message: "Create a site first, then use generateWebsiteContent(websiteId, { prompt }).",
  };
}

export async function generateWebsiteContent(
  websiteId: string,
  payload: { prompt: string },
): Promise<UserWebsite> {
  return generateUserWebsiteContent(websiteId, payload);
}
