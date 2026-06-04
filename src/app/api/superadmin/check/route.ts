import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "../../../../lib/auth/session-cookie-names";
import { getSuperadminCheckPayload } from "../../../../lib/superadmin/server-auth";

export async function GET() {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    return NextResponse.json({ isSuperAdmin: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const payload = await getSuperadminCheckPayload();
  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}
