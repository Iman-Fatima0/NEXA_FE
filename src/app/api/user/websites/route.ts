import {
  normalizeWebsiteDetailPayload,
  normalizeWebsitesListPayload,
} from "../../../../lib/api/bff-website-normalize";
import { bffUserResourceGet, bffUserResourcePost, jsonNoStore } from "../../../../lib/api/bff-upstream-proxy";
import { pathUserWebsitesList } from "../../../../lib/api/upstream-paths";
import type { UserWebsitesPayload } from "../../../../lib/user-websites-types";

/** Live data: `GET {BACKEND}{BACKEND_USER_WEBSITES_PATH||/websites}`. No backend → empty list. */
export async function GET() {
  const empty = (): ReturnType<typeof jsonNoStore> =>
    jsonNoStore(
      {
        websites: [],
        hint: "This feature is temporarily unavailable. Please try again later.",
      } satisfies UserWebsitesPayload,
      { headers: { "x-nexa-data": "no-backend" } },
    );
  return bffUserResourceGet(pathUserWebsitesList(), empty, (parsed) => normalizeWebsitesListPayload(parsed));
}

type CreateWebsiteBody = {
  name?: string;
  templateId?: string;
  description?: string;
  domain?: string | null;
};

/** `POST {BACKEND}/websites` — create site with template bootstrap. */
export async function POST(request: Request) {
  const empty = () =>
    jsonNoStore({ message: "This feature is temporarily unavailable. Please try again later." }, { status: 503 });
  let body: CreateWebsiteBody;
  try {
    body = (await request.json()) as CreateWebsiteBody;
  } catch {
    return jsonNoStore({ message: "Invalid JSON body." }, { status: 400 });
  }
  const name = body.name?.trim();
  if (!name) {
    return jsonNoStore({ message: "name is required." }, { status: 400 });
  }
  return bffUserResourcePost(
    pathUserWebsitesList(),
    {
      name,
      templateId: body.templateId?.trim() || "business",
      description: body.description?.trim() || undefined,
      domain: body.domain ?? undefined,
    },
    empty,
    (parsed) => {
      const detail = normalizeWebsiteDetailPayload(parsed);
      return detail?.website ?? parsed;
    },
  );
}
