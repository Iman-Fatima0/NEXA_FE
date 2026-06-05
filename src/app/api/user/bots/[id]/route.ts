import { bffAuthenticated, jsonNoStore } from "../../../../../lib/api/bff-upstream-proxy";
import { pathUserBotDetail } from "../../../../../lib/api/upstream-paths";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const upstream = await bffAuthenticated("GET", pathUserBotDetail(id));
  if (!upstream.ok) return upstream;
  try {
    const raw = await upstream.json();
    if (!raw || typeof raw !== "object") {
      return jsonNoStore({ error: "not_found" }, { status: 404 });
    }
    const o = raw as Record<string, unknown>;
    const bot = o.bot && typeof o.bot === "object" ? o.bot : raw;
    if (!bot || typeof bot !== "object" || !(bot as Record<string, unknown>).id) {
      return jsonNoStore({ error: "not_found" }, { status: 404 });
    }
    return jsonNoStore({ bot });
  } catch {
    return jsonNoStore({ error: "invalid_json" }, { status: 502 });
  }
}

/** NestJS: PATCH /bots/:id */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  return bffAuthenticated("PATCH", pathUserBotDetail(id), { body });
}

/** NestJS: DELETE /bots/:id */
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return bffAuthenticated("DELETE", pathUserBotDetail(id));
}
