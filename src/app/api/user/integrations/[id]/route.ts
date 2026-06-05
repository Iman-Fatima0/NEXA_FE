import { cookies } from "next/headers";
import type { BackendWebsiteRow } from "../../../../../lib/api/bff-website-normalize";
import { integrationDetailFromWebsite } from "../../../../../lib/api/bff-integration-compose";
import { bffUserResourceGet, jsonNoStore } from "../../../../../lib/api/bff-upstream-proxy";
import { env } from "../../../../../config/env";
import { pathUserWebsiteBuilder, pathUserWebsiteDetail } from "../../../../../lib/api/upstream-paths";
import {
  clearChatIntegrationFromSections,
  readChatIntegrationFromSections,
} from "../../../../../lib/integration/chat-integration";
import { ACCESS_COOKIE, SESSION_COOKIE } from "../../../../../lib/auth/session-cookie-names";

type RouteContext = { params: Promise<{ id: string }> };

/** Integration id = website id (one widget link per site). */
export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const empty = () => jsonNoStore({ message: "Integration not found." }, { status: 404 });
  return bffUserResourceGet(pathUserWebsiteDetail(id), empty, (parsed) => {
    const detail = integrationDetailFromWebsite(parsed, id);
    if (!detail) {
      return { message: "Integration not found." };
    }
    return detail;
  });
}

/** Remove `sections._meta.chatIntegration` — website and bots are kept. */
export async function DELETE(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    return jsonNoStore({ message: "Unauthorized." }, { status: 401 });
  }
  const token = jar.get(ACCESS_COOKIE)?.value;
  if (!token?.trim()) {
    return jsonNoStore({ message: "Missing access token." }, { status: 401 });
  }
  if (!env.backendApiBaseUrl.trim()) {
    return jsonNoStore({ message: "Backend not configured." }, { status: 503 });
  }

  const base = env.backendApiBaseUrl.trim().replace(/\/+$/, "");
  const headers = { Accept: "application/json", Authorization: `Bearer ${token}` };

  const siteRes = await fetch(`${base}${pathUserWebsiteDetail(id)}`, {
    headers,
    cache: "no-store",
  });
  const siteText = await siteRes.text();
  if (!siteRes.ok) {
    return jsonNoStore(
      { message: "Website not found." },
      { status: siteRes.status === 404 ? 404 : siteRes.status },
    );
  }

  let siteParsed: unknown;
  try {
    siteParsed = siteText ? JSON.parse(siteText) : null;
  } catch {
    return jsonNoStore({ message: "Invalid upstream response." }, { status: 502 });
  }

  const siteRaw = siteParsed as Record<string, unknown>;
  const websiteRow = (
    siteRaw.website && typeof siteRaw.website === "object" ? siteRaw.website : siteParsed
  ) as BackendWebsiteRow;

  if (!readChatIntegrationFromSections(websiteRow.sections)) {
    return jsonNoStore({ message: "Integration not found." }, { status: 404 });
  }

  const sections = clearChatIntegrationFromSections(websiteRow.sections);
  const putRes = await fetch(`${base}${pathUserWebsiteBuilder(id)}`, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ sections }),
    cache: "no-store",
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    let message = "Could not remove connection.";
    try {
      const errJson = JSON.parse(errText) as { message?: string };
      if (typeof errJson.message === "string") message = errJson.message;
    } catch {
      /* ignore */
    }
    return jsonNoStore({ message }, { status: putRes.status });
  }

  return jsonNoStore({ ok: true, websiteId: id });
}
