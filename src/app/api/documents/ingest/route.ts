import { bffAuthenticatedMultipart } from "../../../../lib/api/bff-upstream-proxy";
import { pathDocumentsIngest } from "../../../../lib/api/upstream-paths";

/** NestJS: POST /documents/ingest — multipart file + botId */
export async function POST(request: Request) {
  const form = await request.formData();
  const botId = form.get("botId");
  const file = form.get("file");
  if (typeof botId !== "string" || !botId.trim()) {
    return Response.json({ error: "botId required" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return Response.json({ error: "file required" }, { status: 400 });
  }
  const upstream = new FormData();
  upstream.append("botId", botId.trim());
  upstream.append("file", file);
  return bffAuthenticatedMultipart(pathDocumentsIngest(), upstream);
}
