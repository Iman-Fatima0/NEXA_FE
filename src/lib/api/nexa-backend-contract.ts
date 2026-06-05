/**
 * # NEXA — NestJS backend ↔ Next.js BFF contract
 *
 * Backend base: `http://localhost:3000` (set `NEXT_PUBLIC_BACKEND_API_BASE_URL`).
 * Swagger: `GET http://localhost:3000/api`
 * Auth header: `Authorization: Bearer <accessToken>` (6 hr TTL minimum by default).
 * Roles: `USER` (default), `ADMIN` (`GET /users` requires ADMIN).
 *
 * The browser calls Next `/api/*` routes (`bff-paths.ts`); handlers proxy to NestJS with
 * cookies `nexa_session`, `nexa_access_token`, `nexa_refresh_token`, `nexa_user_role`.
 *
 * ---
 *
 * ## BFF → NestJS map
 *
 * | BFF | NestJS | Notes |
 * |-----|--------|--------|
 * | `POST /api/auth/session` | `POST /auth/login` | Sets httpOnly cookies from tokens + user |
 * | `DELETE /api/auth/session` | `POST /auth/logout` | Sends refreshToken, clears cookies |
 * | `POST /api/auth/register` | `POST /auth/register` | Same cookie behavior as login |
 * | `GET /api/auth/me` | `GET /auth/me` | `{ user }` |
 * | `POST /api/auth/refresh` | `POST /auth/refresh` | `{ refreshToken }` from cookie |
 * | `GET /api/dashboard` | `GET /auth/me` + `GET /bots` + `GET /websites` | Composed payload |
 * | `GET /api/user/bots` | `GET /bots` | Normalized to `{ bots: [] }` |
 * | `GET /api/user/bots/:id` | `GET /bots/:id` | `{ bot }` |
 * | `GET /api/user/websites` | `GET /websites` | Normalized to `{ websites: [] }` |
 * | `GET /api/user/websites/:id` | `GET /websites/:id` | `{ website }` |
 * | `GET /api/user/integrations` | `GET /websites` | Composed from sites with `sections._meta.chatIntegration` |
 * | `POST /api/user/integrations` | `GET/POST /bots/:id` + `PUT /websites/:id/builder` | Connect widget to site |
 * | `GET /api/superadmin/check` | — | `{ isSuperAdmin }` from role ADMIN |
 * | `GET /api/superadmin/users` | `GET /users` | ADMIN; read-only list |
 * | `GET /api/superadmin/websites` | `GET /websites` | ADMIN’s own sites until global admin API |
 * | `POST/PATCH/DELETE …/websites` | `POST/PATCH/DELETE /websites` | Owner-scoped |
 * | `GET /api/superadmin/chatbots` | `GET /bots` | `{ chatbots, bots }` |
 * | `POST/PATCH/DELETE …/chatbots` | `POST/PATCH/DELETE /bots` | Owner-scoped |
 * | `GET /api/superadmin/integrations` | — | Empty until API exists |
 * | `POST /api/auth/forgot-password` | `POST /auth/forgot-password` | `{ email }` → reset email |
 * | `POST /api/auth/reset-password` | `POST /auth/reset-password` | `{ token, newPassword }` |
 *
 * **Forgot password (email link only):** User requests reset at `/forgot-password`. NestJS emails a link
 * pointing at `{NEXT_PUBLIC_APP_URL or AUTH_URL}/forgot-password/reset?token=...` (not the OTP screen).
 *
 * **Email verification:** Link in register email should use the **frontend** (e.g. port 3001), not the API port alone:
 * `{NEXT_PUBLIC_APP_URL}/auth/verify-email/confirm?token=...` → page calls NestJS `POST /auth/verify-email`.
 *
 * ---
 *
 * ## NestJS routes (frontend-relevant)
 *
 * **Auth:** `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`,
 * `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`, `GET /auth/me`
 *
 * **Users (ADMIN):** `GET /users`
 *
 * **Bots:** `GET/POST /bots`, `GET/PATCH/DELETE /bots/:id`
 *
 * **Websites:** `GET/POST /websites`, `GET/PATCH/DELETE /websites/:id`
 *
 * **Documents:** `GET /documents?botId=`, ingest, query, delete (RAG)
 *
 * **Chat:** `POST /chat/start`, `POST /chat/message`, `GET /chat/history/:sessionId`
 *
 * **Chatbot platform BFF (wired in UI):**
 * - `POST /api/user/bots`, `PATCH/DELETE /api/user/bots/:id`, `POST …/publish`
 * - `POST /api/documents/ingest`, `POST /api/documents/ingest-url`
 * - `GET /api/documents?botId=`
 * - `POST /api/chat/start`, `POST /api/chat/message`, `GET /api/chat/history/:sessionId`
 * - `GET …/analytics/summary`, `GET …/analytics/unanswered`
 * - `POST …/refresh-config-snapshot`, `POST …/regenerate-api-key`
 *
 * **Internal AI (port 8000):** not called from this frontend.
 *
 * **Public live embed (Next.js, no login):**
 * - Page: `GET {NEXT_PUBLIC_APP_URL}/public/embed/:slug` (e.g. port 3001)
 * - `GET /api/public/embed/:slug/config` → Nest `GET /public/embed/:slug/config`
 * - `POST /api/public/chat/start` → Nest `POST /v1/public/chat/start` body `{ publicSlug }`
 * - `POST /api/public/chat/message` → Nest `POST /v1/public/chat/message` body `{ publicSlug, sessionId, content, includeRag? }`
 * - `GET /api/public/chat/history/:sessionId?publicSlug=` → Nest `GET /v1/public/chat/history/:sessionId?publicSlug=`
 *
 * Nest **must implement** the routes above. Resolve bot by `publicSlug` server-side; never return
 * `apiKey` from the config endpoint. Shareable preview URLs are built on the Next app, not Nest
 * `APP_PUBLIC_URL`.
 *
 * ---
 *
 * ## 3) User websites (gallery, builder, publish)
 *
 * | BFF | Upstream | Response |
 * |-----|----------|----------|
 * | `GET /api/user/websites` | `GET /websites` | `{ websites[], hint? }` — `hint` when backend env unset |
 * | `POST /api/user/websites` | `POST /websites` | site row (template bootstrap) |
 * | `GET /api/user/websites/:id` | `GET /websites/:id` | `{ website }` incl. `sections`, `publicUrl?` |
 * | `PUT /api/user/websites/:id` | `PUT /websites/:id/builder` | updated site |
 * | `POST /api/user/websites/:id/publish` | `POST /websites/:id/publish` | published site + `publicUrl` |
 * | `POST /api/user/websites/:id/generate-content` | `POST /websites/:id/generate-content` | AI-filled sections |
 * | `GET /api/user/websites/templates` | `GET /websites/templates` | `{ templates[] }` |
 * | `GET /api/public/sites/:slug` | `GET /public/sites/:slug` | public site (no auth) |
 *
 * UI uses `fetch-user-websites.ts` + `website-builder-api.ts` (BFF only). Nest returns `{ message }` on 4xx.
 *
 * ---
 *
 * ## 4) User chatbots
 *
 * | BFF | Suggested upstream | Response |
 * |-----|-------------------|----------|
 * | `GET /api/user/bots` | `GET /users/me/chatbots` | `{ bots: UserBot[] }` |
 * | `GET /api/user/bots/:id` | `GET /users/me/chatbots/:id` | `{ bot: UserBot }` |
 *
 * **Direct BE** (`services/chatbot.service.ts` pattern): `POST /chatbots`, `GET /chatbots`, `POST /chatbots/:id/train`, `POST /chatbots/:id/test` with base `NEXT_PUBLIC_CHATBOT_API_BASE_URL`.
 *
 * ---
 *
 * ## 5) Integrations
 *
 * | BFF | Suggested upstream | Response |
 * |-----|-------------------|----------|
 * | `GET /api/user/integrations` | `GET /users/me/integrations` | `{ integrations: UserIntegration[] }` |
 * | `GET /api/user/integrations/:id` | `GET /users/me/integrations/:id` | `{ integration: UserIntegration }` |
 *
 * **Direct BE** (`services/integration.service.ts`): `POST /integrations`, `GET /integrations`, `GET /integrations/:id` with base `NEXT_PUBLIC_INTEGRATION_API_BASE_URL`.
 *
 * ---
 *
 * ## Environment variables (FE)
 *
 * - `NEXT_PUBLIC_BACKEND_API_BASE_URL=http://localhost:3000` — Nest API; required for website gallery and builder.
 * - `NEXT_PUBLIC_APP_URL=http://localhost:3001` — Next app URL for live `/s/{slug}` links, OAuth, and email links (not the API port).
 * - `NEXT_PUBLIC_CHATBOT_API_BASE_URL` — chatbot train/create when UI is wired to `chatbotService`.
 * - `NEXT_PUBLIC_INTEGRATION_API_BASE_URL` — integration connect when UI uses `integrationService`.
 * - `NEXT_PUBLIC_NEXA_LOGIN_URL` — override login POST target (default `/api/auth/session`).
 * - `NEXT_PUBLIC_NEXA_REGISTER_URL` — override register POST (default `/api/auth/register`).
 * - Optional path overrides: `BACKEND_AUTH_*`, `BACKEND_USER_*`, `BACKEND_PUBLIC_*`
 * - Server-only: `BACKEND_AUTH_REGISTER_PATH` — register proxy path (default `/auth/register`).
 * - Server-only: `BACKEND_AUTH_LOGIN_PATH` — login proxy path (default `/auth/login`).
 * - Server-only: `BACKEND_USER_WEBSITES_PATH`, `BACKEND_USER_WEBSITE_DETAIL_PATH` (use `:id` token), same pattern for `BACKEND_USER_BOTS_PATH`, `BACKEND_USER_BOT_DETAIL_PATH`, `BACKEND_USER_INTEGRATIONS_PATH`, `BACKEND_USER_INTEGRATION_DETAIL_PATH`.
 *
 * Login/register response shape: `{ accessToken, refreshToken, user: { id, email, role, … } }`
 * After login, `role: "ADMIN"` → redirect to `/superadmin`.
 */

export const NEXA_BACKEND_CONTRACT_VERSION = "2.0.0" as const;
