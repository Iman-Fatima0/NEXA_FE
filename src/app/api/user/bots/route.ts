import { bffAuthenticated, jsonNoStore } from "../../../../lib/api/bff-upstream-proxy";
import { normalizeBotsListResponse } from "../../../../lib/api/nestjs-normalize";
import { pathUserBotsList } from "../../../../lib/api/upstream-paths";
import type { UserBotsPayload } from "../../../../lib/user-bots-types";

export async function GET() {
  const empty = () =>
    jsonNoStore({ bots: [] } satisfies UserBotsPayload, { headers: { "x-nexa-data": "no-backend" } });

  const upstream = await bffAuthenticated("GET", pathUserBotsList(), { emptyResponse: empty });
  if (!upstream.ok) return upstream;
  try {
    const raw = await upstream.json();
    return jsonNoStore(normalizeBotsListResponse(raw));
  } catch {
    return jsonNoStore({ bots: [] } satisfies UserBotsPayload);
  }
}

/** NestJS: POST /bots — create bot for current user. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return bffAuthenticated("POST", pathUserBotsList(), { body });
}
