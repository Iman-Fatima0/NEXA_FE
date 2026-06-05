import { bffPublicGet } from "../../../../../../lib/api/bff-public-proxy";
import { pathPublicChatHistory } from "../../../../../../lib/api/upstream-paths";

type Params = { params: Promise<{ sessionId: string }> };

/**
 * NestJS contract: GET /v1/public/chat/history/:sessionId?publicSlug=
 * Response: { messages: [{ id, role, content, createdAt? }] }
 */
export async function GET(request: Request, { params }: Params) {
  const { sessionId } = await params;
  const publicSlug = new URL(request.url).searchParams.get("publicSlug")?.trim() ?? "";
  if (!sessionId?.trim() || !publicSlug) {
    return Response.json(
      { error: "validation_error", message: "sessionId and publicSlug are required" },
      { status: 400 },
    );
  }
  return bffPublicGet(pathPublicChatHistory(sessionId.trim(), publicSlug));
}
