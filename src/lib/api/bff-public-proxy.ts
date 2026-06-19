import { NextResponse } from "next/server";
import { env } from "../../config/env";
import { bffNetworkErrorMessage } from "./friendly-user-error";

function upstreamUrl(path: string): string | null {
  const base = env.backendApiBaseUrl.trim();
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Unauthenticated GET to NestJS (public embed, public chat). */
export async function bffPublicGet(upstreamPath: string): Promise<NextResponse> {
  const url = upstreamUrl(upstreamPath);
  if (!url) {
    return NextResponse.json(
      { error: "backend_not_configured", message: "NEXT_PUBLIC_BACKEND_API_BASE_URL is not set." },
      { status: 503 },
    );
  }
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
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

/** Unauthenticated POST to NestJS (public chat — slug resolved server-side on Nest). */
export async function bffPublicPost(upstreamPath: string, body: unknown): Promise<NextResponse> {
  const url = upstreamUrl(upstreamPath);
  if (!url) {
    return NextResponse.json(
      { error: "backend_not_configured", message: "NEXT_PUBLIC_BACKEND_API_BASE_URL is not set." },
      { status: 503 },
    );
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
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
