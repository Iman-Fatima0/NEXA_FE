import { bffAuthenticated, jsonNoStore } from "../../../../lib/api/bff-upstream-proxy";
import { normalizeWebsitesListResponse } from "../../../../lib/api/nestjs-normalize";
import { pathUserWebsitesList } from "../../../../lib/api/upstream-paths";
import type { UserWebsitesPayload } from "../../../../lib/user-websites-types";

export async function GET() {
  const empty = () =>
    jsonNoStore({ websites: [] } satisfies UserWebsitesPayload, { headers: { "x-nexa-data": "no-backend" } });

  const upstream = await bffAuthenticated("GET", pathUserWebsitesList(), { emptyResponse: empty });
  if (!upstream.ok) return upstream;
  try {
    const raw = await upstream.json();
    return jsonNoStore(normalizeWebsitesListResponse(raw));
  } catch {
    return jsonNoStore({ websites: [] } satisfies UserWebsitesPayload);
  }
}
