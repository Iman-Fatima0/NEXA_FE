import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "../../../../../../config/env";
import { ACCESS_COOKIE, SESSION_COOKIE } from "../../../../../../lib/auth/session-cookie-names";
import { pathUserWebsiteExportZip } from "../../../../../../lib/api/upstream-paths";

type RouteContext = { params: Promise<{ id: string }> };

/** `GET {BACKEND}/websites/:id/export-zip` — binary ZIP for Vercel/S3. */
export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    return NextResponse.json(
      { message: "This feature is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }
  const token = jar.get(ACCESS_COOKIE)?.value;
  const url = `${base.replace(/\/+$/, "")}${pathUserWebsiteExportZip(id)}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ message: text || "Export failed" }, { status: res.status });
    }
    const buffer = await res.arrayBuffer();
    const disposition = res.headers.get("content-disposition") ?? `attachment; filename="${id}-nexa-site.zip"`;
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "content-type": "application/zip",
        "content-disposition": disposition,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return NextResponse.json({ message: msg }, { status: 502 });
  }
}
