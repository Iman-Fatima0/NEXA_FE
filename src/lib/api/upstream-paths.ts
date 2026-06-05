/**
 * Upstream path templates (appended to `NEXT_PUBLIC_BACKEND_API_BASE_URL`).
 * Defaults match the NestJS API (no global prefix).
 */

export function pathAuthMe(): string {
  return process.env.BACKEND_AUTH_ME_PATH?.trim() || "/auth/me";
}

export function pathAuthRefresh(): string {
  return process.env.BACKEND_AUTH_REFRESH_PATH?.trim() || "/auth/refresh";
}

export function pathAuthLogout(): string {
  return process.env.BACKEND_AUTH_LOGOUT_PATH?.trim() || "/auth/logout";
}

export function pathAuthForgotPassword(): string {
  return process.env.BACKEND_AUTH_FORGOT_PASSWORD_PATH?.trim() || "/auth/forgot-password";
}

export function pathAuthResetPassword(): string {
  return process.env.BACKEND_AUTH_RESET_PASSWORD_PATH?.trim() || "/auth/reset-password";
}

export function pathUsersList(): string {
  return process.env.BACKEND_USERS_PATH?.trim() || "/users";
}

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

export function pathPublicSitePage(slug: string, pageKey: string): string {
  return `/public/sites/${encodeURIComponent(slug)}/pages/${encodeURIComponent(pageKey)}`;
}

export function pathPublicSiteResolveHost(host: string): string {
  return `/public/sites/resolve-host?host=${encodeURIComponent(host)}`;
}

export function pathUserWebsiteExport(id: string): string {
  return `/websites/${encodeURIComponent(id)}/export`;
}

export function pathUserWebsiteExportZip(id: string): string {
  return `/websites/${encodeURIComponent(id)}/export-zip`;
}

export function pathUserWebsiteSectionImage(id: string): string {
  return `/websites/${encodeURIComponent(id)}/section-image`;
}

export function pathUserBotsList(): string {
  return process.env.BACKEND_USER_BOTS_PATH?.trim() || "/bots";
}

export function pathUserBotDetail(id: string): string {
  const t = process.env.BACKEND_USER_BOT_DETAIL_PATH?.trim();
  if (t) return t.replace(":id", encodeURIComponent(id));
  return `/bots/${encodeURIComponent(id)}`;
}

export function pathDocumentsList(botId: string): string {
  const base = process.env.BACKEND_DOCUMENTS_PATH?.trim() || "/documents";
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}botId=${encodeURIComponent(botId)}`;
}

export function pathDocumentsIngest(): string {
  return process.env.BACKEND_DOCUMENTS_INGEST_PATH?.trim() || "/documents/ingest";
}

export function pathDocumentsIngestUrl(): string {
  return process.env.BACKEND_DOCUMENTS_INGEST_URL_PATH?.trim() || "/documents/ingest-url";
}

export function pathBotPublish(id: string): string {
  const t = process.env.BACKEND_BOT_PUBLISH_PATH?.trim();
  if (t) return t.replace(":id", encodeURIComponent(id));
  return `/bots/${encodeURIComponent(id)}/publish`;
}

export function pathBotLiveLinks(id: string): string {
  const t = process.env.BACKEND_BOT_LIVE_LINKS_PATH?.trim();
  if (t) return t.replace(":id", encodeURIComponent(id));
  return `/bots/${encodeURIComponent(id)}/live-links`;
}

export function pathBotUnpublish(id: string): string {
  const t = process.env.BACKEND_BOT_UNPUBLISH_PATH?.trim();
  if (t) return t.replace(":id", encodeURIComponent(id));
  return `/bots/${encodeURIComponent(id)}/unpublish`;
}

export function pathBotTheme(id: string): string {
  const t = process.env.BACKEND_BOT_THEME_PATH?.trim();
  if (t) return t.replace(":id", encodeURIComponent(id));
  return `/bots/${encodeURIComponent(id)}/theme`;
}

export function pathBotAnalyticsSummary(id: string): string {
  const t = process.env.BACKEND_BOT_ANALYTICS_SUMMARY_PATH?.trim();
  if (t) return t.replace(":id", encodeURIComponent(id));
  return `/bots/${encodeURIComponent(id)}/analytics/summary`;
}

export function pathBotAnalyticsUnanswered(id: string): string {
  const t = process.env.BACKEND_BOT_ANALYTICS_UNANSWERED_PATH?.trim();
  if (t) return t.replace(":id", encodeURIComponent(id));
  return `/bots/${encodeURIComponent(id)}/analytics/unanswered`;
}

export function pathBotRefreshConfigSnapshot(id: string): string {
  const t = process.env.BACKEND_BOT_REFRESH_CONFIG_PATH?.trim();
  if (t) return t.replace(":id", encodeURIComponent(id));
  return `/bots/${encodeURIComponent(id)}/refresh-config-snapshot`;
}

export function pathBotRegenerateApiKey(id: string): string {
  const t = process.env.BACKEND_BOT_REGENERATE_API_KEY_PATH?.trim();
  if (t) return t.replace(":id", encodeURIComponent(id));
  return `/bots/${encodeURIComponent(id)}/regenerate-api-key`;
}

export function pathChatStart(): string {
  return process.env.BACKEND_CHAT_START_PATH?.trim() || "/chat/start";
}

export function pathChatMessage(): string {
  return process.env.BACKEND_CHAT_MESSAGE_PATH?.trim() || "/chat/message";
}

export function pathChatHistory(sessionId: string): string {
  const t = process.env.BACKEND_CHAT_HISTORY_PATH?.trim();
  if (t) return t.replace(":sessionId", encodeURIComponent(sessionId));
  return `/chat/history/${encodeURIComponent(sessionId)}`;
}

/** Public embed config by slug — no auth, no apiKey in response. */
export function pathPublicEmbedConfig(slug: string): string {
  const t = process.env.BACKEND_PUBLIC_EMBED_CONFIG_PATH?.trim();
  if (t) return t.replace(":slug", encodeURIComponent(slug));
  return `/public/embed/${encodeURIComponent(slug)}/config`;
}

export function pathPublicChatStart(): string {
  return process.env.BACKEND_PUBLIC_CHAT_START_PATH?.trim() || "/v1/public/chat/start";
}

export function pathPublicChatMessage(): string {
  return process.env.BACKEND_PUBLIC_CHAT_MESSAGE_PATH?.trim() || "/v1/public/chat/message";
}

export function pathPublicChatHistory(sessionId: string, publicSlug: string): string {
  const t = process.env.BACKEND_PUBLIC_CHAT_HISTORY_PATH?.trim();
  if (t) {
    return t
      .replace(":sessionId", encodeURIComponent(sessionId))
      .replace(":slug", encodeURIComponent(publicSlug));
  }
  const base = `/v1/public/chat/history/${encodeURIComponent(sessionId)}`;
  return `${base}?publicSlug=${encodeURIComponent(publicSlug)}`;
}

/** Integrations are not implemented on NestJS yet; kept for BFF stubs. */
export function pathUserIntegrationsList(): string {
  return process.env.BACKEND_USER_INTEGRATIONS_PATH?.trim() || "/integrations";
}

export function pathUserIntegrationDetail(id: string): string {
  const t = process.env.BACKEND_USER_INTEGRATION_DETAIL_PATH?.trim();
  if (t) return t.replace(":id", encodeURIComponent(id));
  return `/integrations/${encodeURIComponent(id)}`;
}
