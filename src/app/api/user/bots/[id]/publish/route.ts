import { bffAuthenticated } from "../../../../../../lib/api/bff-upstream-proxy";
import { pathBotPublish } from "../../../../../../lib/api/upstream-paths";

type Params = { params: Promise<{ id: string }> };

/** NestJS: POST /bots/:id/publish */
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  return bffAuthenticated("POST", pathBotPublish(id));
}
