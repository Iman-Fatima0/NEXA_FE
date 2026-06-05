/** Auth BFF: proxies login/logout to NestJS when `NEXT_PUBLIC_BACKEND_API_BASE_URL` is set. */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "../../../../config/env";
import {
  applySessionCookies,
  clearAuthCookies,
  sanitizeLoginJsonForClient,
  sessionCookiesFromAuthResponse,
} from "../../../../lib/api/bff-upstream-proxy";
import { pathAuthLogout } from "../../../../lib/api/upstream-paths";
import { REFRESH_COOKIE } from "../../../../lib/auth/session-cookie-names";

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
        applySessionCookies(res, { accessToken: body?.accessToken, sessionValue: "1", userEmail: body?.email });
        return res;
      }
      const res = NextResponse.json(sanitizeLoginJsonForClient(parsed));
      applySessionCookies(res, sessionCookiesFromAuthResponse(parsed, body?.email));
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      return NextResponse.json({ message: msg }, { status: 502 });
    }
  }

  const res = NextResponse.json({ ok: true });
  applySessionCookies(res, { accessToken: body?.accessToken?.trim(), sessionValue: "1", userEmail: body?.email });
  return res;
}

export async function DELETE() {
  const base = env.backendApiBaseUrl.trim();
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;

  if (base && refreshToken) {
    const url = `${base.replace(/\/+$/, "")}${pathAuthLogout()}`;
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
    } catch {
      /* still clear local session */
    }
  }

  const res = NextResponse.json({ ok: true });
  clearAuthCookies(res);
  return res;
}
