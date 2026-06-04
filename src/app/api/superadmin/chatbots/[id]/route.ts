import { bffSuperadminDelete, bffSuperadminGet, bffSuperadminPatch } from "../../../../../lib/api/bff-superadmin-proxy";
import { wrapBotDetail } from "../../../../../lib/api/nestjs-normalize";
import { jsonNoStore } from "../../../../../lib/api/bff-upstream-proxy";
import { pathSuperadminBotDetail } from "../../../../../lib/superadmin/upstream-paths";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const upstream = await bffSuperadminGet(pathSuperadminBotDetail(id));
  if (!upstream.ok) return upstream;
  try {
    const raw = await upstream.json();
    const wrapped = wrapBotDetail(raw);
    if (!wrapped) return jsonNoStore({ error: "not_found" }, { status: 404 });
    return jsonNoStore({ chatbot: wrapped.bot, bot: wrapped.bot });
  } catch {
    return jsonNoStore({ error: "invalid_json" }, { status: 502 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const payload =
    typeof body === "object" && body !== null
      ? {
          name: (body as Record<string, unknown>).name,
          description: (body as Record<string, unknown>).description ?? null,
        }
      : body;
  return bffSuperadminPatch(pathSuperadminBotDetail(id), payload);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return bffSuperadminDelete(pathSuperadminBotDetail(id));
}
