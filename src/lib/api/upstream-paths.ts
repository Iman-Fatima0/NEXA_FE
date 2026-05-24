/**
 * Upstream path templates (appended to `NEXT_PUBLIC_BACKEND_API_BASE_URL`).
 * Override with server env vars if your API uses different routes.
 */
export function pathUserWebsitesList(): string {
  return process.env.BACKEND_USER_WEBSITES_PATH?.trim() || "/websites";
}

export function pathUserWebsiteDetail(id: string): string {
  const t = process.env.BACKEND_USER_WEBSITE_DETAIL_PATH?.trim();
  if (t) return t.replace(":id", encodeURIComponent(id));
  return `/websites/${encodeURIComponent(id)}`;
}

export function pathWebsiteTemplatesList(): string {
  return process.env.BACKEND_WEBSITE_TEMPLATES_PATH?.trim() || "/websites/templates";
}

export function pathUserWebsiteBuilder(id: string): string {
  return `/websites/${encodeURIComponent(id)}/builder`;
}

export function pathUserWebsitePublish(id: string): string {
  return `/websites/${encodeURIComponent(id)}/publish`;
}

export function pathUserWebsiteGenerateContent(id: string): string {
  return `/websites/${encodeURIComponent(id)}/generate-content`;
}

export function pathPublicSite(slug: string): string {
  return `/public/sites/${encodeURIComponent(slug)}`;
}

export function pathUserBotsList(): string {
  return process.env.BACKEND_USER_BOTS_PATH?.trim() || "/users/me/chatbots";
}

export function pathUserBotDetail(id: string): string {
  const t = process.env.BACKEND_USER_BOT_DETAIL_PATH?.trim();
  if (t) return t.replace(":id", encodeURIComponent(id));
  return `/users/me/chatbots/${encodeURIComponent(id)}`;
}

export function pathUserIntegrationsList(): string {
  return process.env.BACKEND_USER_INTEGRATIONS_PATH?.trim() || "/users/me/integrations";
}

export function pathUserIntegrationDetail(id: string): string {
  const t = process.env.BACKEND_USER_INTEGRATION_DETAIL_PATH?.trim();
  if (t) return t.replace(":id", encodeURIComponent(id));
  return `/users/me/integrations/${encodeURIComponent(id)}`;
}
