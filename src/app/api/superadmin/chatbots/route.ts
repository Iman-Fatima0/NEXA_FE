import { bffSuperadminGet, bffSuperadminPost } from "../../../../lib/api/bff-superadmin-proxy";
import { jsonNoStore } from "../../../../lib/api/bff-upstream-proxy";
import { normalizeBotsListResponse } from "../../../../lib/api/nestjs-normalize";
import { isSuperadminSession } from "../../../../lib/superadmin/server-auth";
import { pathSuperadminBotsList } from "../../../../lib/superadmin/upstream-paths";

export async function GET() {
  if (!(await isSuperadminSession())) {
    return jsonNoStore({ error: "Forbidden" }, { status: 403 });
  }
  const upstream = await bffSuperadminGet(pathSuperadminBotsList());
  if (!upstream.ok) return upstream;
  try {
    const raw = await upstream.json();
    const { bots } = normalizeBotsListResponse(raw);
    return jsonNoStore({ chatbots: bots, bots });
  } catch {
    return jsonNoStore({ chatbots: [], bots: [] });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const payload =
    typeof body === "object" && body !== null
      ? {
          name: (body as Record<string, unknown>).name ?? "My First Bot",
          description: (body as Record<string, unknown>).description ?? null,
        }
      : body;
  return bffSuperadminPost(pathSuperadminBotsList(), payload);
}
