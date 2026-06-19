import { cache } from "react";
import type { UserGalleryItem } from "../user-gallery-item";
import type { UserWebsite } from "../user-websites-types";
import { integrationsFromWebsitesList } from "./bff-integration-compose";
import { normalizeWebsitesListPayload } from "./bff-website-normalize";
import { normalizeBotsListResponse } from "./nestjs-normalize";
import { pathUserBotsList, pathUserWebsitesList } from "./upstream-paths";
import { getServerAccessToken, isBackendConfigured, upstreamGet } from "./server-session";

const BACKEND_HINT = "This feature is temporarily unavailable. Please try again later.";

export type ServerGalleryResult<T> = {
  items: T[];
  hint?: string;
  error?: string;
};

async function loadWebsitesRaw(token: string): Promise<Response> {
  return upstreamGet(token, pathUserWebsitesList());
}

/** Websites list for gallery — fetched on the server before first paint. */
export const fetchUserWebsitesServer = cache(async (): Promise<ServerGalleryResult<UserWebsite>> => {
  const token = await getServerAccessToken();
  if (!token) {
    return { items: [], error: "Unauthorized" };
  }
  if (!isBackendConfigured()) {
    return { items: [], hint: BACKEND_HINT };
  }
  try {
    const res = await loadWebsitesRaw(token);
    if (res.status === 401 || res.status === 403) {
      return { items: [], error: "Unauthorized" };
    }
    if (!res.ok) {
      return { items: [], error: "Could not load websites. Check that you are signed in and the API is running." };
    }
    const payload = normalizeWebsitesListPayload(await res.json().catch(() => []));
    return { items: payload.websites, hint: payload.hint };
  } catch {
    return { items: [], error: "Could not load websites. Check that you are signed in and the API is running." };
  }
});

/** Bots list for gallery — fetched on the server before first paint. */
export const fetchUserBotsServer = cache(async (): Promise<ServerGalleryResult<UserGalleryItem>> => {
  const token = await getServerAccessToken();
  if (!token) {
    return { items: [], error: "Unauthorized" };
  }
  if (!isBackendConfigured()) {
    return { items: [], hint: BACKEND_HINT };
  }
  try {
    const res = await upstreamGet(token, pathUserBotsList());
    if (res.status === 401 || res.status === 403) {
      return { items: [], error: "Unauthorized" };
    }
    if (!res.ok) {
      return { items: [], error: "Could not load bots." };
    }
    const { bots } = normalizeBotsListResponse(await res.json().catch(() => []));
    return { items: bots };
  } catch {
    return { items: [], error: "Could not load bots." };
  }
});

/** Integrations derived from websites — fetched on the server before first paint. */
export const fetchUserIntegrationsServer = cache(async (): Promise<ServerGalleryResult<UserGalleryItem>> => {
  const token = await getServerAccessToken();
  if (!token) {
    return { items: [], error: "Unauthorized" };
  }
  if (!isBackendConfigured()) {
    return { items: [], hint: BACKEND_HINT };
  }
  try {
    const res = await loadWebsitesRaw(token);
    if (res.status === 401 || res.status === 403) {
      return { items: [], error: "Unauthorized" };
    }
    if (!res.ok) {
      return { items: [], error: "Could not load integrations." };
    }
    const raw = await res.json().catch(() => []);
    return { items: integrationsFromWebsitesList(raw) };
  } catch {
    return { items: [], error: "Could not load integrations." };
  }
});
