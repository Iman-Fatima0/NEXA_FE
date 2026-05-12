/** Auth BFF: proxies login to backend when `NEXT_PUBLIC_BACKEND_API_BASE_URL` is set. */
import { NextResponse } from "next/server";
import { env } from "../../../../config/env";
import {
  applySessionCookies,
  extractAccessTokenFromJson,
  extractSessionIdFromJson,
  sanitizeLoginJsonForClient,
} from "../../../../lib/api/bff-upstream-proxy";
import { ACCESS_COOKIE, SESSION_COOKIE } from "../../../../lib/auth/session-cookie-names";

type SessionBody = {
  email?: string;
  password?: string;
  accessToken?: string;
};

function loginPath(): string {
  const p = process.env.BACKEND_AUTH_LOGIN_PATH?.trim();
  if (p) return p.startsWith("/") ? p : `/${p}`;
  return "/auth/login";
}

export async function POST(request: Request) {
  let body: SessionBody | null = null;
  try {
    body = (await request.json()) as SessionBody;
  } catch {
    body = null;
  }

  const base = env.backendApiBaseUrl.trim();

  if (base) {
    const url = `${base.replace(/\/+$/, "")}${loginPath()}`;
    try {
      const upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: body?.email,
          password: body?.password,
        }),
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
        const res = NextResponse.json({ ok: true });
        applySessionCookies(res, { accessToken: body?.accessToken, sessionValue: "1" });
        return res;
      }
      const access = extractAccessTokenFromJson(parsed) ?? body?.accessToken?.trim();
      const sessionVal = extractSessionIdFromJson(parsed);
      const res = NextResponse.json(sanitizeLoginJsonForClient(parsed));
      applySessionCookies(res, { accessToken: access, sessionValue: sessionVal ?? "1" });
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      return NextResponse.json({ message: msg }, { status: 502 });
    }
  }

  const res = NextResponse.json({ ok: true });
  applySessionCookies(res, { accessToken: body?.accessToken?.trim(), sessionValue: "1" });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set(ACCESS_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
