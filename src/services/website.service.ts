/**
 * @deprecated Use BFF helpers in `lib/fetch-user-websites.ts` (same-origin cookies + normalized errors).
 * Kept for optional direct Nest calls during development.
 */
import { env } from "../config/env";
import { apiRequest } from "../lib/api";
import type { GeneratedWebsite } from "../types/api.types";

type CreateWebsitePayload = {
  name: string;
  templateId?: string;
  description?: string;
  domain?: string | null;
};

function websiteApiBase(): string {
  return env.websiteApiBaseUrl.trim() || env.backendApiBaseUrl.trim();
}

export const websiteService = {
  createWebsite(payload: CreateWebsitePayload) {
    return apiRequest<GeneratedWebsite>(
      "/websites",
      {
        method: "POST",
        body: {
          name: payload.name,
          templateId: payload.templateId ?? "business",
          description: payload.description,
          domain: payload.domain,
        },
      },
      websiteApiBase(),
    );
  },

  listWebsites() {
    return apiRequest<GeneratedWebsite[]>("/websites", { method: "GET" }, websiteApiBase());
  },

  getWebsiteById(websiteId: string) {
    return apiRequest<GeneratedWebsite>(`/websites/${websiteId}`, { method: "GET" }, websiteApiBase());
  },

  listTemplates() {
    return apiRequest<unknown>("/websites/templates", { method: "GET" }, websiteApiBase());
  },
};
