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
  userWebsiteTemplates: "/api/user/websites/templates",
  userBots: "/api/user/bots",
  userBot: (id: string) => `/api/user/bots/${encodeURIComponent(id)}`,
  userIntegrations: "/api/user/integrations",
  userIntegration: (id: string) => `/api/user/integrations/${encodeURIComponent(id)}`,
} as const;
