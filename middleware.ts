import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "nexa_session";

function appHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.AUTH_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isAppHost(host: string): boolean {
  const h = host.toLowerCase().split(":")[0]!;
  if (h === "localhost" || h === "127.0.0.1") return true;
  const configured = appHostname();
  if (configured && h === configured) return true;
  return false;
}

async function resolveCustomDomainSlug(host: string): Promise<string | null> {
  const base = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL?.trim();
  if (!base) return null;
  const url = `${base.replace(/\/+$/, "")}/public/sites/resolve-host?host=${encodeURIComponent(host)}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { slug?: string };
    return data.slug?.trim() || null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostHeader = request.headers.get("host") ?? "";
  const host = hostHeader.split(":")[0]?.toLowerCase() ?? "";

  if (host && !isAppHost(host)) {
    const slug = await resolveCustomDomainSlug(host);
    if (slug) {
      const segments = pathname.split("/").filter(Boolean);
      const pageKey = segments[0];
      const rewritePath =
        pageKey && pageKey !== "s"
          ? `/s/${encodeURIComponent(slug)}/${encodeURIComponent(pageKey)}`
          : `/s/${encodeURIComponent(slug)}`;
      return NextResponse.rewrite(new URL(rewritePath, request.url));
    }
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const session = request.cookies.get(SESSION_COOKIE)?.value;
    if (!session) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
};
