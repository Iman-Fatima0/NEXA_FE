import { bffAuthenticated } from "../../../../lib/api/bff-upstream-proxy";
import { pathChatMessage } from "../../../../lib/api/upstream-paths";

/** NestJS: POST /chat/message */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return bffAuthenticated("POST", pathChatMessage(), { body });
}
