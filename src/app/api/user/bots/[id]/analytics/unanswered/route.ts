import { bffAuthenticated } from "../../../../../../../lib/api/bff-upstream-proxy";
import { pathBotAnalyticsUnanswered } from "../../../../../../../lib/api/upstream-paths";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  return bffAuthenticated("GET", pathBotAnalyticsUnanswered(id));
}
