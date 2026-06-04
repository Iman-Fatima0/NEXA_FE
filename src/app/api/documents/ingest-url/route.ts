import { bffAuthenticated } from "../../../../lib/api/bff-upstream-proxy";
import { pathDocumentsIngestUrl } from "../../../../lib/api/upstream-paths";

/** NestJS: POST /documents/ingest-url — body { botId, url } */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return bffAuthenticated("POST", pathDocumentsIngestUrl(), { body });
}
