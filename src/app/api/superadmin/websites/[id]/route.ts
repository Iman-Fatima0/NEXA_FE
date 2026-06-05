import { bffSuperadminDelete, bffSuperadminGet, bffSuperadminPatch } from "../../../../../lib/api/bff-superadmin-proxy";
import { wrapWebsiteDetail } from "../../../../../lib/api/nestjs-normalize";
import { jsonNoStore } from "../../../../../lib/api/bff-upstream-proxy";
import { pathSuperadminWebsiteDetail } from "../../../../../lib/superadmin/upstream-paths";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const upstream = await bffSuperadminGet(pathSuperadminWebsiteDetail(id));
  if (!upstream.ok) return upstream;
  try {
    const raw = await upstream.json();
    const wrapped = wrapWebsiteDetail(raw);
    if (!wrapped) return jsonNoStore({ error: "not_found" }, { status: 404 });
    return jsonNoStore(wrapped);
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
          domain: (body as Record<string, unknown>).domain ?? (body as Record<string, unknown>).previewUrl ?? null,
        }
      : body;
  return bffSuperadminPatch(pathSuperadminWebsiteDetail(id), payload);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return bffSuperadminDelete(pathSuperadminWebsiteDetail(id));
}
