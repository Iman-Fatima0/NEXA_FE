import { bffUserResourceGet, jsonNoStore } from "../../../../../lib/api/bff-upstream-proxy";
import { pathUserWebsiteDetail } from "../../../../../lib/api/upstream-paths";

type RouteContext = { params: Promise<{ id: string }> };

/** Live data: `GET {BACKEND}/users/me/websites/:id` (path overridable via env). */
export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const empty = () => jsonNoStore({ message: "Website not found." }, { status: 404 });
  return bffUserResourceGet(pathUserWebsiteDetail(id), empty);
}
