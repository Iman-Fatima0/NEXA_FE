import { bffUserResourceGet, jsonNoStore } from "../../../../lib/api/bff-upstream-proxy";
import { pathUserIntegrationsList } from "../../../../lib/api/upstream-paths";
import type { UserIntegrationsPayload } from "../../../../lib/user-integrations-types";

/** Live data: `GET {BACKEND}{BACKEND_USER_INTEGRATIONS_PATH||/users/me/integrations}`. */
export async function GET() {
  const empty = () =>
    jsonNoStore({ integrations: [] } satisfies UserIntegrationsPayload, {
      headers: { "x-nexa-data": "no-backend" },
    });
  return bffUserResourceGet(pathUserIntegrationsList(), empty);
}
