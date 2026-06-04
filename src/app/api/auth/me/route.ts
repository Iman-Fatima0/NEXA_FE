import { bffAuthenticated, jsonNoStore } from "../../../../lib/api/bff-upstream-proxy";
import { parseNexaUser } from "../../../../lib/api/nestjs-normalize";
import { pathAuthMe } from "../../../../lib/api/upstream-paths";

export async function GET() {
  const upstream = await bffAuthenticated("GET", pathAuthMe());
  if (!upstream.ok) return upstream;
  try {
    const raw = await upstream.json();
    const user = parseNexaUser(raw);
    if (!user) {
      return jsonNoStore({ error: "invalid_shape" }, { status: 502 });
    }
    return jsonNoStore({ user });
  } catch {
    return jsonNoStore({ error: "invalid_json" }, { status: 502 });
  }
}
