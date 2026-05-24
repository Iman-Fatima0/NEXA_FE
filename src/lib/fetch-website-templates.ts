import { bffJson } from "./api/bff-json";
import { BFF_PATHS } from "./api/bff-paths";
import type { WebsiteTemplate, WebsiteTemplatesPayload } from "./website-templates-types";

function normalizeTemplatesPayload(raw: WebsiteTemplatesPayload | WebsiteTemplate[]): WebsiteTemplate[] {
  if (Array.isArray(raw)) {
    return raw;
  }
  return raw.templates ?? [];
}

/** Lists built-in website templates via BFF → `GET /websites/templates`. */
export async function fetchWebsiteTemplates(): Promise<WebsiteTemplate[]> {
  const body = await bffJson<WebsiteTemplatesPayload | WebsiteTemplate[]>(BFF_PATHS.userWebsiteTemplates);
  return normalizeTemplatesPayload(body);
}
