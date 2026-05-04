/**
 * Browser calls `GET /api/dashboard` (credentials). Requires `nexa_session`.
 * When `NEXT_PUBLIC_BACKEND_API_BASE_URL` is set, proxies to your BE with `Authorization: Bearer` from `nexa_access_token` if present.
 * Response JSON is normalized in `lib/dashboard-normalize.ts` (projects, activity, optional user).
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "../../../config/env";
import { normalizeDashboardPayload } from "../../../lib/dashboard-normalize";
import type { DashboardPayload } from "../../../lib/dashboard-types";

const SESSION_COOKIE = "nexa_session";

function dashboardPath(): string {
  const p = process.env.BACKEND_DASHBOARD_PATH?.trim();
  if (p) {
    return p.startsWith("/") ? p : `/${p}`;
  }
  return "/dashboard";
}

async function fetchFromBackend(): Promise<{ ok: true; payload: DashboardPayload } | { ok: false; status: number; detail: string }> {
  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    return { ok: false, status: 503, detail: "NEXT_PUBLIC_BACKEND_API_BASE_URL is not set." };
  }
  const jar = await cookies();
  const token = jar.get("nexa_access_token")?.value;
  const path = dashboardPath();
  const url = `${base.replace(/\/+$/, "")}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return { ok: false, status: 502, detail: msg };
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const detail = text ? `${res.status} ${text.slice(0, 200)}` : `Upstream returned ${res.status}`;
    const status = res.status === 401 || res.status === 403 ? res.status : 502;
    return { ok: false, status, detail };
  }
  let raw: unknown;
  try {
    raw = await res.json();
  } catch {
    return { ok: false, status: 502, detail: "Upstream response was not JSON." };
  }
  const normalized = normalizeDashboardPayload(raw);
  if (!normalized) {
    return { ok: false, status: 502, detail: "Dashboard response shape was not recognized (need projects + activity arrays)." };
  }
  return { ok: true, payload: normalized };
}

function withMeta(payload: DashboardPayload, source: "api" | "pending"): DashboardPayload {
  return {
    ...payload,
    meta: { source, fetchedAt: new Date().toISOString() },
  };
}

export async function GET() {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseConfigured = Boolean(env.backendApiBaseUrl.trim());

  if (baseConfigured) {
    const remote = await fetchFromBackend();
    if (remote.ok) {
      return NextResponse.json(withMeta(remote.payload, "api"), {
        headers: { "Cache-Control": "no-store, must-revalidate" },
      });
    }
    return NextResponse.json(
      {
        error: "dashboard_upstream_failed",
        message: remote.detail,
      },
      { status: remote.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  const empty: DashboardPayload = { projects: [], activity: [] };
  return NextResponse.json(withMeta(empty, "pending"), {
    headers: { "Cache-Control": "no-store, must-revalidate" },
  });
}
