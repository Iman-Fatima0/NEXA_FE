/**
 * Browser-facing Next.js route handlers (“BFF”). The FE calls these with `credentials: "same-origin"`;
 * each handler should validate the session and proxy to your real backend.
 * Upstream BE matrix: `nexa-backend-contract.ts`.
 */
export const BFF_PATHS = {
  dashboard: "/api/dashboard",
  authSession: "/api/auth/session",
  authMe: "/api/auth/me",
  authRefresh: "/api/auth/refresh",
  authRegister: "/api/auth/register",
  authOAuthExchange: "/api/auth/oauth/exchange",
  authResendVerification: "/api/auth/resend-verification",
  authForgotPassword: "/api/auth/forgot-password",
  authResetPassword: "/api/auth/reset-password",
  authVerifyEmail: "/api/auth/verify-email",
  userWebsites: "/api/user/websites",
  userWebsite: (id: string) => `/api/user/websites/${encodeURIComponent(id)}`,
  userBots: "/api/user/bots",
  userBot: (id: string) => `/api/user/bots/${encodeURIComponent(id)}`,
  documents: (botId: string) => `/api/documents?botId=${encodeURIComponent(botId)}`,
  documentsIngest: "/api/documents/ingest",
  documentsIngestUrl: "/api/documents/ingest-url",
  userBotPublish: (id: string) => `/api/user/bots/${encodeURIComponent(id)}/publish`,
  userBotLiveLinks: (id: string) => `/api/user/bots/${encodeURIComponent(id)}/live-links`,
  userBotUnpublish: (id: string) => `/api/user/bots/${encodeURIComponent(id)}/unpublish`,
  userBotTheme: (id: string) => `/api/user/bots/${encodeURIComponent(id)}/theme`,
  userBotAnalyticsSummary: (id: string) =>
    `/api/user/bots/${encodeURIComponent(id)}/analytics/summary`,
  userBotAnalyticsUnanswered: (id: string) =>
    `/api/user/bots/${encodeURIComponent(id)}/analytics/unanswered`,
  userBotRefreshConfig: (id: string) =>
    `/api/user/bots/${encodeURIComponent(id)}/refresh-config-snapshot`,
  userBotRegenerateApiKey: (id: string) =>
    `/api/user/bots/${encodeURIComponent(id)}/regenerate-api-key`,
  chatStart: "/api/chat/start",
  chatMessage: "/api/chat/message",
  chatHistory: (sessionId: string) => `/api/chat/history/${encodeURIComponent(sessionId)}`,
  publicEmbedConfig: (slug: string) => `/api/public/embed/${encodeURIComponent(slug)}/config`,
  publicChatStart: "/api/public/chat/start",
  publicChatMessage: "/api/public/chat/message",
  publicChatHistory: (sessionId: string, publicSlug: string) =>
    `/api/public/chat/history/${encodeURIComponent(sessionId)}?publicSlug=${encodeURIComponent(publicSlug)}`,
  userIntegrations: "/api/user/integrations",
  userIntegration: (id: string) => `/api/user/integrations/${encodeURIComponent(id)}`,
  superadminCheck: "/api/superadmin/check",
  superadminConfig: "/api/superadmin/config",
  superadminUsers: "/api/superadmin/users",
  superadminUser: (id: string) => `/api/superadmin/users/${encodeURIComponent(id)}`,
  superadminWebsites: "/api/superadmin/websites",
  superadminWebsite: (id: string) => `/api/superadmin/websites/${encodeURIComponent(id)}`,
  superadminChatbots: "/api/superadmin/chatbots",
  superadminChatbot: (id: string) => `/api/superadmin/chatbots/${encodeURIComponent(id)}`,
  superadminIntegrations: "/api/superadmin/integrations",
  superadminIntegration: (id: string) => `/api/superadmin/integrations/${encodeURIComponent(id)}`,
} as const;
