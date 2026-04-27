import { env } from "../config/env";
import { apiRequest } from "../lib/api";
import type { GeneratedWebsite } from "../types/api.types";

type CreateWebsitePayload = {
  name: string;
  prompt: string;
};

export const websiteService = {
  createWebsite(payload: CreateWebsitePayload) {
    return apiRequest<GeneratedWebsite>("/websites", { method: "POST", body: payload }, env.websiteApiBaseUrl);
  },

  listWebsites() {
    return apiRequest<GeneratedWebsite[]>("/websites", { method: "GET" }, env.websiteApiBaseUrl);
  },

  getWebsiteById(websiteId: string) {
    return apiRequest<GeneratedWebsite>(`/websites/${websiteId}`, { method: "GET" }, env.websiteApiBaseUrl);
  },

  saveWebsite(websiteId: string) {
    return apiRequest<GeneratedWebsite>(`/websites/${websiteId}/save`, { method: "POST" }, env.websiteApiBaseUrl);
  },
};
