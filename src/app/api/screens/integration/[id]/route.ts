import { cookies } from "next/headers";
import { composeIntegrationScreen } from "../../../../../lib/api/compose-screens";
import { jsonNoStore } from "../../../../../lib/api/bff-upstream-proxy";
import { ACCESS_COOKIE, SESSION_COOKIE } from "../../../../../lib/auth/session-cookie-names";

type RouteContext = { params: Promise<{ id: string }> };

/** Integration preview screen (website + widget meta). */
export async function GET(_req: Request, context: RouteContext) {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    return jsonNoStore({ message: "Please sign in to continue." }, { status: 401 });
  }
  const token = jar.get(ACCESS_COOKIE)?.value?.trim();
  if (!token) {
    return jsonNoStore({ message: "Missing access token." }, { status: 401 });
  }

  const { id } = await context.params;
  const payload = await composeIntegrationScreen(token, id);
  if (!payload) {
    return jsonNoStore({ message: "Integration not found." }, { status: 404 });
  }
  return jsonNoStore(payload);
}
