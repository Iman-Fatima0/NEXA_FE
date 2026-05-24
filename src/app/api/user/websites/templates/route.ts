import { bffUserResourceGet, jsonNoStore } from "../../../../../lib/api/bff-upstream-proxy";
import { pathWebsiteTemplatesList } from "../../../../../lib/api/upstream-paths";

/** Live data: `GET {BACKEND}/websites/templates`. No backend → empty list. */
export async function GET() {
  const empty = () => jsonNoStore({ templates: [] }, { headers: { "x-nexa-data": "no-backend" } });
  return bffUserResourceGet(pathWebsiteTemplatesList(), empty, (parsed) => {
    if (Array.isArray(parsed)) {
      return { templates: parsed };
    }
    if (parsed && typeof parsed === "object" && Array.isArray((parsed as { templates?: unknown }).templates)) {
      return parsed;
    }
    return { templates: [] };
  });
}
