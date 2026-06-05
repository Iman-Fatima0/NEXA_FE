import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "../../config/env";
import { messageFromUpstreamText } from "./bff-error-message";
import { ACCESS_COOKIE, AUTH_COOKIE_MAX_AGE_SEC, SESSION_COOKIE } from "../auth/session-cookie-names";

function jsonErrorFromUpstream(text: string, status: number): NextResponse {
  const message = messageFromUpstreamText(text, status);
  return NextResponse.json({ message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: AUTH_COOKIE_MAX_AGE_SEC,
  secure: process.env.NODE_ENV === "production",
};

/**
 * Authenticated GET to the real backend. If `NEXT_PUBLIC_BACKEND_API_BASE_URL` is unset,
 * returns `emptyResponse()` (no demo fixtures).
 */
export async function bffUserResourceGet(
  upstreamPath: string,
  emptyResponse: () => NextResponse,
  transform?: (parsed: unknown) => unknown,
): Promise<NextResponse> {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    return emptyResponse();
  }
  const token = jar.get(ACCESS_COOKIE)?.value;
  const url = `${base.replace(/\/+$/, "")}${upstreamPath.startsWith("/") ? upstreamPath : `/${upstreamPath}`}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });
    const text = await res.text();
    if (res.status < 200 || res.status >= 300) {
      return jsonErrorFromUpstream(text, res.status);
    }
    if (!transform) {
      return new NextResponse(text, {
        status: res.status,
        headers: {
          "content-type": res.headers.get("content-type") || "application/json",
          "Cache-Control": "no-store",
        },
      });
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return jsonErrorFromUpstream(text, res.status);
    }
    return jsonNoStore(transform(parsed), { status: res.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return NextResponse.json({ message: msg }, { status: 502 });
  }
}

async function bffUserResourceWrite(
  method: "POST" | "PUT" | "PATCH",
  upstreamPath: string,
  body: unknown | undefined,
  emptyResponse: () => NextResponse,
  transform?: (parsed: unknown) => unknown,
): Promise<NextResponse> {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    return emptyResponse();
  }
  const token = jar.get(ACCESS_COOKIE)?.value;
  const url = `${base.replace(/\/+$/, "")}${upstreamPath.startsWith("/") ? upstreamPath : `/${upstreamPath}`}`;
  try {
    const res = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });
    const text = await res.text();
    if (res.status < 200 || res.status >= 300) {
      return jsonErrorFromUpstream(text, res.status);
    }
    if (!transform) {
      return new NextResponse(text, {
        status: res.status,
        headers: {
          "content-type": res.headers.get("content-type") || "application/json",
          "Cache-Control": "no-store",
        },
      });
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return jsonErrorFromUpstream(text, res.status);
    }
    return jsonNoStore(transform(parsed), { status: res.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return NextResponse.json({ message: msg }, { status: 502 });
  }
}

export async function bffUserResourcePost(
  upstreamPath: string,
  body: unknown,
  emptyResponse: () => NextResponse,
  transform?: (parsed: unknown) => unknown,
): Promise<NextResponse> {
  return bffUserResourceWrite("POST", upstreamPath, body, emptyResponse, transform);
}

/** Forward multipart FormData to the Nest API (e.g. section image upload). */
export async function bffUserResourceMultipartPost(
  upstreamPath: string,
  formData: FormData,
  emptyResponse: () => NextResponse,
  transform?: (parsed: unknown) => unknown,
): Promise<NextResponse> {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    return emptyResponse();
  }
  const token = jar.get(ACCESS_COOKIE)?.value;
  const url = `${base.replace(/\/+$/, "")}${upstreamPath.startsWith("/") ? upstreamPath : `/${upstreamPath}`}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      cache: "no-store",
    });
    const text = await res.text();
    if (res.status < 200 || res.status >= 300) {
      return jsonErrorFromUpstream(text, res.status);
    }
    if (!transform) {
      return new NextResponse(text, {
        status: res.status,
        headers: {
          "content-type": res.headers.get("content-type") || "application/json",
          "Cache-Control": "no-store",
        },
      });
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return jsonErrorFromUpstream(text, res.status);
    }
    return jsonNoStore(transform(parsed), { status: res.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return NextResponse.json({ message: msg }, { status: 502 });
  }
}

export async function bffUserResourcePut(
  upstreamPath: string,
  body: unknown,
  emptyResponse: () => NextResponse,
  transform?: (parsed: unknown) => unknown,
): Promise<NextResponse> {
  return bffUserResourceWrite("PUT", upstreamPath, body, emptyResponse, transform);
}

export function jsonNoStore(data: unknown, init?: { status?: number; headers?: Record<string, string> }): NextResponse {
  return NextResponse.json(data, {
    status: init?.status ?? 200,
    headers: { "Cache-Control": "no-store", ...init?.headers },
  });
}

export function applySessionCookies(res: NextResponse, opts: { accessToken?: string; sessionValue?: string }): void {
  res.cookies.set(SESSION_COOKIE, opts.sessionValue?.trim() || "1", cookieBase);
  const t = opts.accessToken?.trim();
  if (t) {
    res.cookies.set(ACCESS_COOKIE, t, cookieBase);
  }
}

export function extractAccessTokenFromJson(parsed: unknown): string | undefined {
  if (typeof parsed !== "object" || parsed === null) return undefined;
  const r = parsed as Record<string, unknown>;
  for (const k of ["accessToken", "access_token", "token"]) {
    const v = r[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

export function extractSessionIdFromJson(parsed: unknown): string | undefined {
  if (typeof parsed !== "object" || parsed === null) return undefined;
  const r = parsed as Record<string, unknown>;
  for (const k of ["sessionId", "session_id", "session"]) {
    const v = r[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

/** Strip secrets from JSON returned to the browser after login. */
export function sanitizeLoginJsonForClient(parsed: unknown): unknown {
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { ok: true };
  }
  const o = { ...(parsed as Record<string, unknown>) };
  for (const k of ["accessToken", "access_token", "token", "refreshToken", "refresh_token", "password"]) {
    delete o[k];
  }
  return Object.keys(o).length > 0 ? o : { ok: true };
}
