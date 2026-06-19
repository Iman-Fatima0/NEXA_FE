/**
 * Composes dashboard data from NestJS: GET /auth/me, GET /bots, GET /websites.
 * There is no dedicated /dashboard endpoint on the backend.
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "../../../config/env";
import { composeDashboardFromNest, withDashboardMeta } from "../../../lib/api/compose-dashboard";
import { ACCESS_COOKIE, SESSION_COOKIE } from "../../../lib/auth/session-cookie-names";

export async function GET() {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseConfigured = Boolean(env.backendApiBaseUrl.trim());

  if (baseConfigured) {
    const token = jar.get(ACCESS_COOKIE)?.value;
    if (!token) {
      return NextResponse.json(
        { error: "dashboard_upstream_failed", message: "Missing access token." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }
    try {
      const payload = await composeDashboardFromNest(token);
      if (!payload) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json(withDashboardMeta(payload, "api"), {
        headers: { "Cache-Control": "no-store, must-revalidate" },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      return NextResponse.json(
        { error: "dashboard_upstream_failed", message: msg },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }
  }

  return NextResponse.json(withDashboardMeta({ projects: [], activity: [] }, "pending"), {
    headers: { "Cache-Control": "no-store, must-revalidate" },
  });
}
