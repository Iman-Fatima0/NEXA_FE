import { NextResponse } from "next/server";
import { env } from "../../../../../config/env";
import { pathPublicSiteResolveHost } from "../../../../../lib/api/upstream-paths";

/** Proxy `GET {BACKEND}/public/sites/resolve-host?host=` for custom-domain middleware. */
export async function GET(request: Request) {
  const host = new URL(request.url).searchParams.get("host")?.trim();
  if (!host) {
    return NextResponse.json({ message: "host query is required" }, { status: 400 });
  }
  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    return NextResponse.json({ message: "Backend not configured." }, { status: 503 });
  }
  const url = `${base.replace(/\/+$/, "")}${pathPublicSiteResolveHost(host)}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const text = await res.text();
    return new NextResponse(text, {
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
