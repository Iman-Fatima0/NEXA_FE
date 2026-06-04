import { bffSuperadminGet } from "../../../../lib/api/bff-superadmin-proxy";
import { jsonNoStore } from "../../../../lib/api/bff-upstream-proxy";
import { normalizeUsersListResponse } from "../../../../lib/api/nestjs-normalize";
import { isSuperadminSession } from "../../../../lib/superadmin/server-auth";
import { pathSuperadminUsersList } from "../../../../lib/superadmin/upstream-paths";

/** NestJS: GET /users (ADMIN). List only — no create on this route. */
export async function GET() {
  if (!(await isSuperadminSession())) {
    return jsonNoStore({ error: "Forbidden" }, { status: 403 });
  }
  const upstream = await bffSuperadminGet(pathSuperadminUsersList());
  if (!upstream.ok) return upstream;
  try {
    const raw = await upstream.json();
    return jsonNoStore(normalizeUsersListResponse(raw));
  } catch {
    return jsonNoStore({ users: [] });
  }
}

export async function POST() {
  return jsonNoStore(
    { message: "User creation is not exposed on NestJS. Use POST /auth/register." },
    { status: 501 },
  );
}
