import { normalizeWebsiteDetailPayload } from "../../../../../../lib/api/bff-website-normalize";
import { bffUserResourcePost, jsonNoStore } from "../../../../../../lib/api/bff-upstream-proxy";
import { pathUserWebsitePublish } from "../../../../../../lib/api/upstream-paths";

type RouteContext = { params: Promise<{ id: string }> };

/** `POST {BACKEND}/websites/:id/publish` */
export async function POST(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const empty = () => jsonNoStore({ message: "Backend not configured." }, { status: 503 });
  return bffUserResourcePost(pathUserWebsitePublish(id), {}, empty, (parsed) => {
    const detail = normalizeWebsiteDetailPayload(parsed);
    return detail?.website ?? parsed;
  });
}
