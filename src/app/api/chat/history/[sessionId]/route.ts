import { bffAuthenticated } from "../../../../../lib/api/bff-upstream-proxy";
import { pathChatHistory } from "../../../../../lib/api/upstream-paths";

type Params = { params: Promise<{ sessionId: string }> };

/** NestJS: GET /chat/history/:sessionId */
export async function GET(_request: Request, { params }: Params) {
  const { sessionId } = await params;
  return bffAuthenticated("GET", pathChatHistory(sessionId));
}
