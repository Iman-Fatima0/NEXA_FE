import { NextResponse } from "next/server";
import { env } from "../../config/env";

/** Public auth calls (no session cookie). */
export async function bffPublicAuthPost(upstreamPath: string, body: unknown): Promise<NextResponse> {
  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    return NextResponse.json(
      { error: "pending", message: "NEXT_PUBLIC_BACKEND_API_BASE_URL is not set." },
      { status: 503 },
    );
  }
  const url = `${base.replace(/\/+$/, "")}${upstreamPath.startsWith("/") ? upstreamPath : `/${upstreamPath}`}`;
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
    const msg = e instanceof Error ? e.message : "Network error";
    return NextResponse.json({ message: msg }, { status: 502 });
  }
}
