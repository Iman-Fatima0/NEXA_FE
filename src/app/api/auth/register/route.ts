import { NextResponse } from "next/server";
import { env } from "../../../../config/env";

const DEFAULT_REGISTER_PATH = "/auth/register";

/**
 * Proxies signup to the real backend when `NEXT_PUBLIC_BACKEND_API_BASE_URL` is set.
 * Otherwise returns 503 so the UI can show a clear “configure backend” message.
 */
export async function POST(request: Request) {
  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    return NextResponse.json(
      {
        error: "backend_not_configured",
        message:
          "Set NEXT_PUBLIC_BACKEND_API_BASE_URL and implement upstream registration, or set NEXT_PUBLIC_NEXA_REGISTER_URL to point the app at your auth API directly.",
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

  const path = process.env.BACKEND_AUTH_REGISTER_PATH?.trim() || DEFAULT_REGISTER_PATH;
  const normalizedBase = base.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${normalizedBase}${normalizedPath}`;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return NextResponse.json({ error: "upstream_unreachable", message: msg }, { status: 502 });
  }

  const text = await upstream.text();
  const contentType = upstream.headers.get("content-type") || "application/json";
  return new NextResponse(text, { status: upstream.status, headers: { "content-type": contentType } });
}
