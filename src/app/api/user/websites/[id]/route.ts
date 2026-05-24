import { normalizeWebsiteDetailPayload } from "../../../../../lib/api/bff-website-normalize";
import { bffUserResourceGet, jsonNoStore } from "../../../../../lib/api/bff-upstream-proxy";
import { pathUserWebsiteDetail } from "../../../../../lib/api/upstream-paths";

type RouteContext = { params: Promise<{ id: string }> };

/** Live data: `GET {BACKEND}/websites/:id` (path overridable via env). */
export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const empty = () => jsonNoStore({ message: "Website not found." }, { status: 404 });
  return bffUserResourceGet(pathUserWebsiteDetail(id), empty, (parsed) => {
    const detail = normalizeWebsiteDetailPayload(parsed);
    if (detail) {
      return detail;
    }
    return { message: "Website not found." };
  });
}
