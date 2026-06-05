import { NextResponse } from "next/server";
import { env } from "../../../../config/env";

export async function POST(request: Request) {
  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const url = `${base.replace(/\/+$/, "")}/auth/resend-verification`;
  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return NextResponse.json({ error: "upstream_unreachable", message: msg }, { status: 502 });
  }
}
