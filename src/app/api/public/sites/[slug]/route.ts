import { NextResponse } from "next/server";
import { env } from "../../../../../config/env";
import { pathPublicSite } from "../../../../../lib/api/upstream-paths";

type RouteContext = { params: Promise<{ slug: string }> };

/** Unauthenticated proxy: `GET {BACKEND}/public/sites/:slug` */
export async function GET(_req: Request, context: RouteContext) {
  const { slug } = await context.params;
  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    return NextResponse.json(
      { message: "This feature is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }
  const url = `${base.replace(/\/+$/, "")}${pathPublicSite(slug)}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return NextResponse.json({ message: msg }, { status: 502 });
  }
}
