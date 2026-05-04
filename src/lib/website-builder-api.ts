import { env } from "../config/env";
import { apiRequest } from "./api";

export type GenerateWebsitePayload = {
  websiteName: string;
  description: string;
};

/** Normalized API response — align your backend to this shape or extend as needed. */
export type GenerateWebsiteResponse = {
  previewUrl?: string;
  html?: string;
  message?: string;
};

const DEFAULT_GENERATE_PATH = "/website-builder/generate";

export function getWebsiteBuilderApiBaseUrl(): string {
  return env.websiteApiBaseUrl.trim() || env.backendApiBaseUrl.trim();
}

export async function generateWebsite(
  payload: GenerateWebsitePayload,
  path: string = DEFAULT_GENERATE_PATH
): Promise<GenerateWebsiteResponse> {
  const base = getWebsiteBuilderApiBaseUrl();
  if (!base) {
    throw new Error(
      "Set NEXT_PUBLIC_WEBSITE_API_BASE_URL or NEXT_PUBLIC_BACKEND_API_BASE_URL in your environment."
    );
  }
  return apiRequest<GenerateWebsiteResponse>(path, { method: "POST", body: payload }, base);
}
