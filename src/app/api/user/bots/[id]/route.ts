import { bffUserResourceGet, jsonNoStore } from "../../../../../lib/api/bff-upstream-proxy";
import { pathUserBotDetail } from "../../../../../lib/api/upstream-paths";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const empty = () => jsonNoStore({ message: "Bot not found." }, { status: 404 });
  return bffUserResourceGet(pathUserBotDetail(id), empty);
}
