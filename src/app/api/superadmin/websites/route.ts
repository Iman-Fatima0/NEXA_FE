import { bffSuperadminGet, bffSuperadminPost } from "../../../../lib/api/bff-superadmin-proxy";
import { jsonNoStore } from "../../../../lib/api/bff-upstream-proxy";
import { normalizeWebsitesListResponse } from "../../../../lib/api/nestjs-normalize";
import { isSuperadminSession } from "../../../../lib/superadmin/server-auth";
import { pathSuperadminWebsitesList } from "../../../../lib/superadmin/upstream-paths";

/** ADMIN sees their own websites via GET /websites until a global admin list exists. */
export async function GET() {
  if (!(await isSuperadminSession())) {
    return jsonNoStore({ error: "Forbidden" }, { status: 403 });
  }
  const upstream = await bffSuperadminGet(pathSuperadminWebsitesList());
  if (!upstream.ok) return upstream;
  try {
    const raw = await upstream.json();
    return jsonNoStore(normalizeWebsitesListResponse(raw));
  } catch {
    return jsonNoStore({ websites: [] });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const payload =
    typeof body === "object" && body !== null
      ? {
          name: (body as Record<string, unknown>).name ?? (body as Record<string, unknown>).title,
          domain: (body as Record<string, unknown>).domain ?? (body as Record<string, unknown>).previewUrl ?? null,
        }
      : body;
  return bffSuperadminPost(pathSuperadminWebsitesList(), payload);
}
