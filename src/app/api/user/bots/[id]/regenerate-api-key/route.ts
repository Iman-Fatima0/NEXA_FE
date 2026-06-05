import { bffAuthenticated } from "../../../../../../lib/api/bff-upstream-proxy";
import { pathBotRegenerateApiKey } from "../../../../../../lib/api/upstream-paths";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  return bffAuthenticated("POST", pathBotRegenerateApiKey(id));
}
