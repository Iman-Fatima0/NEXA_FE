import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "../../config/env";
import { messageFromUpstreamText } from "./bff-error-message";
import { bffNetworkErrorMessage } from "./friendly-user-error";
import {
  ACCESS_COOKIE,
  AUTH_COOKIE_MAX_AGE_SEC,
  REFRESH_COOKIE,
  REFRESH_COOKIE_MAX_AGE_SEC,
  SESSION_COOKIE,
  USER_EMAIL_COOKIE,
  USER_ROLE_COOKIE,
} from "../auth/session-cookie-names";
import { parseNexaUser } from "./nestjs-normalize";

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

const refreshCookieBase = {
  ...cookieBase,
  maxAge: REFRESH_COOKIE_MAX_AGE_SEC,
};

export async function getBearerToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(ACCESS_COOKIE)?.value;
}

export async function hasSession(): Promise<boolean> {
  const jar = await cookies();
  return Boolean(jar.get(SESSION_COOKIE)?.value);
}

/**
 * Authenticated request to NestJS. If base URL unset, returns `emptyResponse()`.
 */
export async function bffAuthenticated(
  method: string,
  upstreamPath: string,
  opts?: { body?: unknown; emptyResponse?: () => NextResponse },
): Promise<NextResponse> {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    return opts?.emptyResponse?.() ?? NextResponse.json({ error: "pending" }, { status: 503 });
  }
  const token = jar.get(ACCESS_COOKIE)?.value;
  const url = `${base.replace(/\/+$/, "")}${upstreamPath.startsWith("/") ? upstreamPath : `/${upstreamPath}`}`;
  try {
    const res = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(opts?.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(opts?.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
      cache: "no-store",
    });
    const text = await res.text();
    return new NextResponse(text || "{}", {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const msg = bffNetworkErrorMessage(e);
    return NextResponse.json({ message: msg }, { status: 502 });
  }
}

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
    const msg = bffNetworkErrorMessage(e);
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
    const msg = bffNetworkErrorMessage(e);
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
    const msg = bffNetworkErrorMessage(e);
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

export type SessionCookieOpts = {
  accessToken?: string;
  refreshToken?: string;
  sessionValue?: string;
  userEmail?: string;
  userRole?: string;
};

export function applySessionCookies(res: NextResponse, opts: SessionCookieOpts): void {
  res.cookies.set(SESSION_COOKIE, opts.sessionValue?.trim() || "1", cookieBase);
  const access = opts.accessToken?.trim();
  if (access) {
    res.cookies.set(ACCESS_COOKIE, access, cookieBase);
  }
  const refresh = opts.refreshToken?.trim();
  if (refresh) {
    res.cookies.set(REFRESH_COOKIE, refresh, refreshCookieBase);
  }
  const email = opts.userEmail?.trim().toLowerCase();
  if (email && email.includes("@")) {
    res.cookies.set(USER_EMAIL_COOKIE, email, cookieBase);
  }
  const role = opts.userRole?.trim().toUpperCase();
  if (role === "USER" || role === "ADMIN") {
    res.cookies.set(USER_ROLE_COOKIE, role, cookieBase);
  }
}

export function clearAuthCookies(res: NextResponse): void {
  for (const name of [SESSION_COOKIE, ACCESS_COOKIE, REFRESH_COOKIE, USER_EMAIL_COOKIE, USER_ROLE_COOKIE]) {
    res.cookies.set(name, "", { httpOnly: true, path: "/", maxAge: 0 });
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

export function extractRefreshTokenFromJson(parsed: unknown): string | undefined {
  if (typeof parsed !== "object" || parsed === null) return undefined;
  const r = parsed as Record<string, unknown>;
  for (const k of ["refreshToken", "refresh_token"]) {
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

export function extractUserFromAuthJson(parsed: unknown): ReturnType<typeof parseNexaUser> {
  if (typeof parsed !== "object" || parsed === null) return null;
  const r = parsed as Record<string, unknown>;
  if (r.user && typeof r.user === "object") {
    return parseNexaUser(r.user);
  }
  return parseNexaUser(parsed);
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

export function sessionCookiesFromAuthResponse(parsed: unknown, fallbackEmail?: string): SessionCookieOpts {
  const user = extractUserFromAuthJson(parsed);
  return {
    accessToken: extractAccessTokenFromJson(parsed),
    refreshToken: extractRefreshTokenFromJson(parsed),
    sessionValue: extractSessionIdFromJson(parsed) ?? "1",
    userEmail: user?.email ?? fallbackEmail,
    userRole: user?.role,
  };
}

/** Forward multipart/form-data to NestJS (e.g. document ingest). */
export async function bffAuthenticatedMultipart(
  upstreamPath: string,
  formData: FormData,
): Promise<NextResponse> {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    return NextResponse.json(
      { error: "pending", message: "This feature is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
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
    return new NextResponse(text || "{}", {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const msg = bffNetworkErrorMessage(e);
    return NextResponse.json({ message: msg }, { status: 502 });
  }
}
