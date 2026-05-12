import { bffUserResourceGet, jsonNoStore } from "../../../../lib/api/bff-upstream-proxy";
import { pathUserBotsList } from "../../../../lib/api/upstream-paths";
import type { UserBotsPayload } from "../../../../lib/user-bots-types";

/** Live data: `GET {BACKEND}{BACKEND_USER_BOTS_PATH||/users/me/chatbots}`. */
export async function GET() {
  const empty = () =>
    jsonNoStore({ bots: [] } satisfies UserBotsPayload, { headers: { "x-nexa-data": "no-backend" } });
  return bffUserResourceGet(pathUserBotsList(), empty);
}
