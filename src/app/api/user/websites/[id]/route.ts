import { normalizeWebsiteDetailPayload } from "../../../../../lib/api/bff-website-normalize";
import {
  bffAuthenticated,
  bffUserResourceGet,
  bffUserResourcePut,
  jsonNoStore,
} from "../../../../../lib/api/bff-upstream-proxy";
import { pathUserWebsiteBuilder, pathUserWebsiteDetail } from "../../../../../lib/api/upstream-paths";

type RouteContext = { params: Promise<{ id: string }> };

/** Live data: `GET {BACKEND}/websites/:id` (path overridable via env). */
export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const empty = () => jsonNoStore({ message: "Website not found." }, { status: 404 });
  return bffUserResourceGet(pathUserWebsiteDetail(id), empty, (parsed) => {
    const detail = normalizeWebsiteDetailPayload(parsed);
    if (detail) {
      return detail;
    }
    return { message: "Website not found." };
  });
}

/** `PUT {BACKEND}/websites/:id/builder` — title, theme, logo, sections. */
export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const empty = () =>
    jsonNoStore({ message: "This feature is temporarily unavailable. Please try again later." }, { status: 503 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonNoStore({ message: "Invalid JSON body." }, { status: 400 });
  }
  return bffUserResourcePut(pathUserWebsiteBuilder(id), body, empty, (parsed) => {
    const detail = normalizeWebsiteDetailPayload(parsed);
    return detail?.website ?? parsed;
  });
}

/** NestJS: `DELETE /websites/:id` */
export async function DELETE(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  return bffAuthenticated("DELETE", pathUserWebsiteDetail(id));
}
