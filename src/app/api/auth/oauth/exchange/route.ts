import { NextResponse } from "next/server";
import { env } from "../../../../../config/env";
import {
  applySessionCookies,
  sanitizeLoginJsonForClient,
  sessionCookiesFromAuthResponse,
} from "../../../../../lib/api/bff-upstream-proxy";

export async function POST(request: Request) {
  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    return NextResponse.json(
      { error: "backend_not_configured", message: "Set NEXT_PUBLIC_BACKEND_API_BASE_URL." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const bodyRecord =
    typeof body === "object" && body !== null ? (body as Record<string, unknown>) : null;
  const code = typeof bodyRecord?.code === "string" ? bodyRecord.code : "";

  if (!code.trim()) {
    return NextResponse.json({ error: "validation_error", message: "code is required" }, { status: 400 });
  }

  const url = `${base.replace(/\/+$/, "")}/auth/oauth/exchange`;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ code: code.trim() }),
      cache: "no-store",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return NextResponse.json({ error: "upstream_unreachable", message: msg }, { status: 502 });
  }

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
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    });
  }

  const email =
    typeof parsed === "object" &&
    parsed !== null &&
    typeof (parsed as Record<string, unknown>).user === "object" &&
    (parsed as { user?: { email?: string } }).user?.email;

  const res = NextResponse.json(sanitizeLoginJsonForClient(parsed));
  applySessionCookies(
    res,
    sessionCookiesFromAuthResponse(parsed, typeof email === "string" ? email : undefined),
  );
  return res;
}
