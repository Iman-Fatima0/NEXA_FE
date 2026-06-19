import { cache } from "react";
import { cookies } from "next/headers";
import { env } from "../../config/env";
import { ACCESS_COOKIE, SESSION_COOKIE } from "../auth/session-cookie-names";

/** Bearer token for the current request (deduped per RSC render). */
export const getServerAccessToken = cache(async (): Promise<string | null> => {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) return null;
  return jar.get(ACCESS_COOKIE)?.value?.trim() || null;
});

export function isBackendConfigured(): boolean {
  return Boolean(env.backendApiBaseUrl.trim());
}

/** Authenticated GET to Nest — used from Server Components (skips the BFF hop). */
export async function upstreamGet(token: string, path: string): Promise<Response> {
  const base = env.backendApiBaseUrl.trim().replace(/\/+$/, "");
  if (!base) {
    return new Response(JSON.stringify({ error: "no_backend" }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return fetch(`${base}${normalized}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

/** Authenticated POST to Nest — used by screen compose helpers. */
export async function upstreamPost(
  token: string,
  path: string,
  body?: unknown,
): Promise<Response> {
  const base = env.backendApiBaseUrl.trim().replace(/\/+$/, "");
  if (!base) {
    return new Response(JSON.stringify({ error: "no_backend" }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return fetch(`${base}${normalized}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });
}
