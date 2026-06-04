import { jsonNoStore } from "../../../../lib/api/bff-upstream-proxy";
import { isSuperadminSession } from "../../../../lib/superadmin/server-auth";

/** Website ↔ chatbot integrations are not in NestJS yet. */
export async function GET() {
  if (!(await isSuperadminSession())) {
    return jsonNoStore({ error: "Forbidden" }, { status: 403 });
  }
  return jsonNoStore(
    { integrations: [] },
    { headers: { "x-nexa-data": "integrations-not-in-api", "Cache-Control": "no-store" } },
  );
}

export async function POST() {
  return jsonNoStore({ message: "Integrations API is not implemented on NestJS yet." }, { status: 501 });
}
