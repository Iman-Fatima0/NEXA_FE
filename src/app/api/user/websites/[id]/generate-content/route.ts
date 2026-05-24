import { normalizeWebsiteDetailPayload } from "../../../../../../lib/api/bff-website-normalize";
import { bffUserResourcePost, jsonNoStore } from "../../../../../../lib/api/bff-upstream-proxy";
import { pathUserWebsiteGenerateContent } from "../../../../../../lib/api/upstream-paths";

type RouteContext = { params: Promise<{ id: string }> };

/** `POST {BACKEND}/websites/:id/generate-content` */
export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const empty = () => jsonNoStore({ message: "Backend not configured." }, { status: 503 });
  let body: { prompt?: string };
  try {
    body = (await request.json()) as { prompt?: string };
  } catch {
    return jsonNoStore({ message: "Invalid JSON body." }, { status: 400 });
  }
  return bffUserResourcePost(pathUserWebsiteGenerateContent(id), body, empty, (parsed) => {
    const detail = normalizeWebsiteDetailPayload(parsed);
    return detail?.website ?? parsed;
  });
}
