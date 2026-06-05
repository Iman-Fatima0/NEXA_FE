import { bffAuthenticated } from "../../../../lib/api/bff-upstream-proxy";
import { pathChatStart } from "../../../../lib/api/upstream-paths";

/** NestJS: POST /chat/start — body { botId } */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return bffAuthenticated("POST", pathChatStart(), { body });
}
