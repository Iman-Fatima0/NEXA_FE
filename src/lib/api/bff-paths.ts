/**
 * Browser-facing Next.js route handlers (“BFF”). The FE calls these with `credentials: "same-origin"`;
 * each handler should validate the session and proxy to your real backend.
 * Upstream BE matrix: `nexa-backend-contract.ts`.
 */
export const BFF_PATHS = {
  dashboard: "/api/dashboard",
  authSession: "/api/auth/session",
  authRegister: "/api/auth/register",
  userWebsites: "/api/user/websites",
  userWebsite: (id: string) => `/api/user/websites/${encodeURIComponent(id)}`,
  userWebsitePublish: (id: string) => `/api/user/websites/${encodeURIComponent(id)}/publish`,
  userWebsiteGenerateContent: (id: string) => `/api/user/websites/${encodeURIComponent(id)}/generate-content`,
  userWebsiteExport: (id: string) => `/api/user/websites/${encodeURIComponent(id)}/export`,
  userWebsiteExportZip: (id: string) => `/api/user/websites/${encodeURIComponent(id)}/export-zip`,
  publicSite: (slug: string) => `/api/public/sites/${encodeURIComponent(slug)}`,
  publicSiteResolveHost: (host: string) =>
    `/api/public/sites/resolve-host?host=${encodeURIComponent(host)}`,
  userWebsiteTemplates: "/api/user/websites/templates",
  userBots: "/api/user/bots",
  userBot: (id: string) => `/api/user/bots/${encodeURIComponent(id)}`,
  userIntegrations: "/api/user/integrations",
  userIntegration: (id: string) => `/api/user/integrations/${encodeURIComponent(id)}`,
} as const;
