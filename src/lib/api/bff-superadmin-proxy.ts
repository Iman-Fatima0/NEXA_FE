import { NextResponse } from "next/server";
import { env } from "../../config/env";
import { bffNetworkErrorMessage } from "./friendly-user-error";
import { isSuperadminSession } from "../superadmin/server-auth";
import { ACCESS_COOKIE } from "../auth/session-cookie-names";
import { cookies } from "next/headers";

async function upstreamFetch(method: string, upstreamPath: string, body?: unknown): Promise<NextResponse> {
  const allowed = await isSuperadminSession();
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden", message: "Superadmin access required." }, { status: 403 });
  }

  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    return NextResponse.json(
      { error: "pending", message: "NEXT_PUBLIC_BACKEND_API_BASE_URL is not set. Superadmin data will load once the API is connected." },
      { status: 503 },
    );
  }

  const jar = await cookies();
  const token = jar.get(ACCESS_COOKIE)?.value;
  const url = `${base.replace(/\/+$/, "")}${upstreamPath.startsWith("/") ? upstreamPath : `/${upstreamPath}`}`;

  try {
    const res = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
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

export function bffSuperadminGet(upstreamPath: string): Promise<NextResponse> {
  return upstreamFetch("GET", upstreamPath);
}

export function bffSuperadminPost(upstreamPath: string, body: unknown): Promise<NextResponse> {
  return upstreamFetch("POST", upstreamPath, body);
}

export function bffSuperadminPut(upstreamPath: string, body: unknown): Promise<NextResponse> {
  return upstreamFetch("PUT", upstreamPath, body);
}

export function bffSuperadminPatch(upstreamPath: string, body: unknown): Promise<NextResponse> {
  return upstreamFetch("PATCH", upstreamPath, body);
}

export function bffSuperadminDelete(upstreamPath: string): Promise<NextResponse> {
  return upstreamFetch("DELETE", upstreamPath);
}
