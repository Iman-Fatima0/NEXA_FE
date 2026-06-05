import { bffPublicPost } from "../../../../../lib/api/bff-public-proxy";
import { pathPublicChatStart } from "../../../../../lib/api/upstream-paths";

/**
 * NestJS contract: POST /v1/public/chat/start
 * Body: { publicSlug: string }
 * Response: { sessionId: string }
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return bffPublicPost(pathPublicChatStart(), body);
}
