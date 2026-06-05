import { bffAuthenticated } from "../../../../../../lib/api/bff-upstream-proxy";
import { pathBotUnpublish } from "../../../../../../lib/api/upstream-paths";

type Params = { params: Promise<{ id: string }> };

/** NestJS: POST /bots/:id/unpublish */
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  return bffAuthenticated("POST", pathBotUnpublish(id));
}
