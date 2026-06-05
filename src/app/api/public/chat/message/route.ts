import { bffPublicPost } from "../../../../../lib/api/bff-public-proxy";
import { pathPublicChatMessage } from "../../../../../lib/api/upstream-paths";

/**
 * NestJS contract: POST /v1/public/chat/message
 * Body: { publicSlug, sessionId, content, includeRag?: boolean }
 * Response: { sessionId, userMessage, assistantMessage }
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return bffPublicPost(pathPublicChatMessage(), body);
}
