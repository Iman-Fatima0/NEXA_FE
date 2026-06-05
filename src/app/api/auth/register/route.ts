import { NextResponse } from "next/server";
import { env } from "../../../../config/env";
import {
  applySessionCookies,
  sanitizeLoginJsonForClient,
  sessionCookiesFromAuthResponse,
} from "../../../../lib/api/bff-upstream-proxy";
import {
  toNestRegisterBody,
  validateNestRegisterBody,
} from "../../../../lib/api/register-upstream-body";

const DEFAULT_REGISTER_PATH = "/auth/register";

/**
 * Proxies signup to NestJS when `NEXT_PUBLIC_BACKEND_API_BASE_URL` is set.
 * On success, sets the same httpOnly cookies as login.
 */
export async function POST(request: Request) {
  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    return NextResponse.json(
      {
        error: "backend_not_configured",
        message: "Set NEXT_PUBLIC_BACKEND_API_BASE_URL (e.g. http://localhost:3000).",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "Expected JSON body." }, { status: 400 });
  }

  const record =
    typeof body === "object" && body !== null ? (body as Record<string, unknown>) : null;
  if (!record) {
    return NextResponse.json({ error: "invalid_json", message: "Expected JSON body." }, { status: 400 });
  }

  const nestBody = toNestRegisterBody(record);
  const validationError = validateNestRegisterBody(nestBody);
  if (validationError) {
    return NextResponse.json(
      { error: "validation_error", message: validationError },
      { status: 400 },
    );
  }

  const email = nestBody.email as string;

  const path = process.env.BACKEND_AUTH_REGISTER_PATH?.trim() || DEFAULT_REGISTER_PATH;
  const url = `${base.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(nestBody),
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

  const res = NextResponse.json(sanitizeLoginJsonForClient(parsed));
  const hasTokens =
    typeof parsed === "object" &&
    parsed !== null &&
    typeof (parsed as Record<string, unknown>).accessToken === "string";
  if (hasTokens) {
    applySessionCookies(
      res,
      sessionCookiesFromAuthResponse(parsed, typeof email === "string" ? email : undefined),
    );
  }
  return res;
}
