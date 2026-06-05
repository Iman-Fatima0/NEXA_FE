import { bffAuthenticated } from "../../../../../../lib/api/bff-upstream-proxy";
import { pathBotTheme } from "../../../../../../lib/api/upstream-paths";

type Params = { params: Promise<{ id: string }> };

/** NestJS: PATCH /bots/:id/theme — { preset, overrides } */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  return bffAuthenticated("PATCH", pathBotTheme(id), { body });
}
