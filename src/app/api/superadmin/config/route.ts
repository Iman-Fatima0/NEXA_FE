import { jsonNoStore } from "../../../../lib/api/bff-upstream-proxy";
import { getSuperadminCheckPayload, isSuperadminSession } from "../../../../lib/superadmin/server-auth";

export async function GET() {
  if (!(await isSuperadminSession())) {
    return jsonNoStore({ error: "Forbidden" }, { status: 403 });
  }
  const check = await getSuperadminCheckPayload();
  return jsonNoStore({
    role: check.role ?? "ADMIN",
    email: check.email,
    note: "Superadmin access uses NestJS role ADMIN (GET /auth/me).",
  });
}
