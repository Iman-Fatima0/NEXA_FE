import { bffAuthenticated } from "../../../../../../lib/api/bff-upstream-proxy";
import { pathBotLiveLinks } from "../../../../../../lib/api/upstream-paths";

type Params = { params: Promise<{ id: string }> };

/** NestJS: GET /bots/:id/live-links */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  return bffAuthenticated("GET", pathBotLiveLinks(id));
}
