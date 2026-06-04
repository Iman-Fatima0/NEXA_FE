import { bffAuthenticated, jsonNoStore } from "../../../../../lib/api/bff-upstream-proxy";
import { wrapWebsiteDetail } from "../../../../../lib/api/nestjs-normalize";
import { pathUserWebsiteDetail } from "../../../../../lib/api/upstream-paths";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const upstream = await bffAuthenticated("GET", pathUserWebsiteDetail(id));
  if (!upstream.ok) return upstream;
  try {
    const raw = await upstream.json();
    const wrapped = wrapWebsiteDetail(raw);
    if (!wrapped) {
      return jsonNoStore({ error: "not_found" }, { status: 404 });
    }
    return jsonNoStore(wrapped);
  } catch {
    return jsonNoStore({ error: "invalid_json" }, { status: 502 });
  }
}
