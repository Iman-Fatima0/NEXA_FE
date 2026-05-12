import { bffUserResourceGet, jsonNoStore } from "../../../../lib/api/bff-upstream-proxy";
import { pathUserWebsitesList } from "../../../../lib/api/upstream-paths";
import type { UserWebsitesPayload } from "../../../../lib/user-websites-types";

/** Live data: `GET {BACKEND}{BACKEND_USER_WEBSITES_PATH||/users/me/websites}`. No backend → empty list. */
export async function GET() {
  const empty = (): ReturnType<typeof jsonNoStore> =>
    jsonNoStore({ websites: [] } satisfies UserWebsitesPayload, { headers: { "x-nexa-data": "no-backend" } });
  return bffUserResourceGet(pathUserWebsitesList(), empty);
}
