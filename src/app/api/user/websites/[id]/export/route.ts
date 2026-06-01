import { bffUserResourceGet, jsonNoStore } from "../../../../../../lib/api/bff-upstream-proxy";
import { pathUserWebsiteExport } from "../../../../../../lib/api/upstream-paths";

type RouteContext = { params: Promise<{ id: string }> };

/** `GET {BACKEND}/websites/:id/export` — static file manifest JSON. */
export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const empty = () => jsonNoStore({ message: "Backend not configured." }, { status: 503 });
  return bffUserResourceGet(pathUserWebsiteExport(id), empty, (parsed) => parsed);
}
