import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "../../../../config/env";
import {
  applySessionCookies,
  extractAccessTokenFromJson,
  extractRefreshTokenFromJson,
  sessionCookiesFromAuthResponse,
} from "../../../../lib/api/bff-upstream-proxy";
import { pathAuthRefresh } from "../../../../lib/api/upstream-paths";
import { REFRESH_COOKIE, SESSION_COOKIE } from "../../../../lib/auth/session-cookie-names";

export async function POST() {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base = env.backendApiBaseUrl.trim();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  if (!base || !refreshToken) {
    return NextResponse.json({ error: "refresh_unavailable" }, { status: 503 });
  }

  const url = `${base.replace(/\/+$/, "")}${pathAuthRefresh()}`;
  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    const text = await upstream.text();
    if (!upstream.ok) {
      return new NextResponse(text, {
        status: upstream.status,
        headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
      });
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 502 });
    }
    const res = NextResponse.json({
      ok: true,
      accessToken: extractAccessTokenFromJson(parsed),
      refreshToken: extractRefreshTokenFromJson(parsed),
    });
    applySessionCookies(res, sessionCookiesFromAuthResponse(parsed));
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return NextResponse.json({ message: msg }, { status: 502 });
  }
}
