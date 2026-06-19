import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { composeBotScreen } from "../../../../../lib/api/compose-screens";
import { ACCESS_COOKIE, SESSION_COOKIE } from "../../../../../lib/auth/session-cookie-names";
import { jsonNoStore } from "../../../../../lib/api/bff-upstream-proxy";

type RouteContext = { params: Promise<{ id: string }> };

/** Aggregated bot detail screen: bot + document count + chat bootstrap. */
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
  try {
    const payload = await composeBotScreen(token, id);
    if (!payload) {
      return jsonNoStore({ message: "Chatbot unavailable." }, { status: 404 });
    }
    return jsonNoStore(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return NextResponse.json({ message: msg }, { status: 502 });
  }
}
