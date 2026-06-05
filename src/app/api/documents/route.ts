import { bffAuthenticated } from "../../../lib/api/bff-upstream-proxy";
import { pathDocumentsList } from "../../../lib/api/upstream-paths";

/** NestJS: GET /documents?botId= */
export async function GET(request: Request) {
  const botId = new URL(request.url).searchParams.get("botId")?.trim();
  if (!botId) {
    return Response.json({ error: "botId required" }, { status: 400 });
  }
  return bffAuthenticated("GET", pathDocumentsList(botId));
}
