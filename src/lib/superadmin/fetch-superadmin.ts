import { BFF_PATHS } from "../api/bff-paths";
import { bffJson } from "../api/bff-json";
import type {
  SuperadminChatbotsPayload,
  SuperadminCheckPayload,
  SuperadminIntegrationsPayload,
  SuperadminUsersPayload,
  SuperadminWebsitesPayload,
} from "./types";

export async function fetchSuperadminCheck(): Promise<SuperadminCheckPayload> {
  return bffJson<SuperadminCheckPayload>(BFF_PATHS.superadminCheck);
}

export async function fetchSuperadminUsers(): Promise<SuperadminUsersPayload> {
  return bffJson<SuperadminUsersPayload>(BFF_PATHS.superadminUsers);
}

export async function fetchSuperadminWebsites(): Promise<SuperadminWebsitesPayload> {
  return bffJson<SuperadminWebsitesPayload>(BFF_PATHS.superadminWebsites);
}

export async function fetchSuperadminChatbots(): Promise<SuperadminChatbotsPayload> {
  return bffJson<SuperadminChatbotsPayload>(BFF_PATHS.superadminChatbots);
}

export async function fetchSuperadminIntegrations(): Promise<SuperadminIntegrationsPayload> {
  return bffJson<SuperadminIntegrationsPayload>(BFF_PATHS.superadminIntegrations);
}

export function redirectToLoginIfUnauthorized(err: unknown): boolean {
  if (err instanceof Error && err.message.toLowerCase().includes("unauthorized")) {
    const path = globalThis.location.pathname + globalThis.location.search;
    globalThis.location.replace(`/login?next=${encodeURIComponent(path)}`);
    return true;
  }
  return false;
}

export async function requireSuperadminAccess(): Promise<SuperadminCheckPayload> {
  const res = await fetch(BFF_PATHS.superadminCheck, { credentials: "same-origin", cache: "no-store" });
  if (res.status === 401) {
    const path = globalThis.location.pathname + globalThis.location.search;
    globalThis.location.replace(`/login?next=${encodeURIComponent(path)}`);
    throw new Error("Unauthorized");
  }
  const data = (await res.json()) as SuperadminCheckPayload;
  if (!data.isSuperAdmin) {
    globalThis.location.replace("/dashboard");
    throw new Error("Forbidden");
  }
  return data;
}
