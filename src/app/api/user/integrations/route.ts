import { cookies } from "next/headers";
import { env } from "../../../../config/env";
import {
  buildConnectIntegrationBody,
  integrationsFromWebsitesList,
  isBotPublished,
  type ConnectIntegrationResult,
} from "../../../../lib/api/bff-integration-compose";
import { mapBackendWebsiteToGalleryItem, type BackendWebsiteRow } from "../../../../lib/api/bff-website-normalize";
import { bffUserResourceGet, jsonNoStore } from "../../../../lib/api/bff-upstream-proxy";
import {
  pathBotPublish,
  pathUserBotDetail,
  pathUserWebsiteBuilder,
  pathUserWebsiteDetail,
  pathUserWebsitesList,
} from "../../../../lib/api/upstream-paths";
import type { ConnectIntegrationPayload } from "../../../../lib/integration/chat-integration";
import type { UserIntegration, UserIntegrationsPayload } from "../../../../lib/user-integrations-types";
import { ACCESS_COOKIE, SESSION_COOKIE } from "../../../../lib/auth/session-cookie-names";

/** Composed from `GET /websites` rows with `sections._meta.chatIntegration`. */
export async function GET() {
  const empty = () =>
    jsonNoStore({ integrations: [] } satisfies UserIntegrationsPayload, {
      headers: { "x-nexa-data": "no-backend" },
    });
  return bffUserResourceGet(pathUserWebsitesList(), empty, (parsed) => ({
    integrations: integrationsFromWebsitesList(parsed),
  }));
}

type ConnectBody = {
  websiteId?: string;
  chatbotId?: string;
  position?: ConnectIntegrationPayload["position"];
  showBubble?: boolean;
  widgetSize?: number;
};

async function upstreamJson(
  token: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ ok: boolean; status: number; parsed: unknown; text: string }> {
  const base = env.backendApiBaseUrl.trim().replace(/\/+$/, "");
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });
  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }
  return { ok: res.ok, status: res.status, parsed, text };
}

/** Link a published bot to a website via `PUT /websites/:id/builder` (`sections._meta.chatIntegration`). */
export async function POST(request: Request) {
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

  let body: ConnectBody;
  try {
    body = (await request.json()) as ConnectBody;
  } catch {
    return jsonNoStore({ message: "Invalid JSON body." }, { status: 400 });
  }

  const websiteId = body.websiteId?.trim();
  const chatbotId = body.chatbotId?.trim();
  if (!websiteId || !chatbotId) {
    return jsonNoStore({ message: "websiteId and chatbotId are required." }, { status: 400 });
  }

  const siteRes = await upstreamJson(token, "GET", pathUserWebsiteDetail(websiteId));
  if (!siteRes.ok) {
    return jsonNoStore(
      { message: typeof (siteRes.parsed as Record<string, unknown>)?.message === "string" ? (siteRes.parsed as Record<string, string>).message : "Website not found." },
      { status: siteRes.status },
    );
  }

  const siteRaw = siteRes.parsed as Record<string, unknown>;
  const websiteRow = (
    siteRaw.website && typeof siteRaw.website === "object" ? siteRaw.website : siteRes.parsed
  ) as BackendWebsiteRow;

  let botRes = await upstreamJson(token, "GET", pathUserBotDetail(chatbotId));
  if (!botRes.ok) {
    return jsonNoStore(
      { message: typeof (botRes.parsed as Record<string, unknown>)?.message === "string" ? (botRes.parsed as Record<string, string>).message : "Chatbot not found." },
      { status: botRes.status },
    );
  }

  if (!isBotPublished(botRes.parsed)) {
    const pubRes = await upstreamJson(token, "POST", pathBotPublish(chatbotId), {});
    if (!pubRes.ok) {
      return jsonNoStore(
        {
          message:
            typeof (pubRes.parsed as Record<string, unknown>)?.message === "string"
              ? (pubRes.parsed as Record<string, string>).message
              : "Could not publish chatbot.",
        },
        { status: pubRes.status },
      );
    }
    botRes = { ...pubRes, parsed: pubRes.parsed };
  }

  let builderBody: Record<string, unknown>;
  try {
    builderBody = buildConnectIntegrationBody(websiteRow, botRes.parsed, {
      websiteId,
      chatbotId,
      position: body.position,
      showBubble: body.showBubble,
      widgetSize: body.widgetSize,
    }).builderBody;
  } catch (e) {
    return jsonNoStore(
      { message: e instanceof Error ? e.message : "Could not connect chatbot." },
      { status: 400 },
    );
  }

  const putRes = await upstreamJson(token, "PUT", pathUserWebsiteBuilder(websiteId), builderBody);
  if (!putRes.ok) {
    return jsonNoStore(
      {
        message:
          typeof (putRes.parsed as Record<string, unknown>)?.message === "string"
            ? (putRes.parsed as Record<string, string>).message
            : "Could not save integration.",
      },
      { status: putRes.status },
    );
  }

  const updatedRow = putRes.parsed as BackendWebsiteRow;
  const site = mapBackendWebsiteToGalleryItem(updatedRow, { includeBuilder: true });
  const integrations = integrationsFromWebsitesList([updatedRow]);
  const integration: UserIntegration = integrations[0] ?? {
    id: site.id,
    name: site.name,
    updatedAt: new Date().toISOString(),
  };

  return jsonNoStore({ integration, website: updatedRow } satisfies ConnectIntegrationResult & { website: BackendWebsiteRow });
}
