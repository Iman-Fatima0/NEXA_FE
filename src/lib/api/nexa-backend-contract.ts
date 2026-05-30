/**
 * # NEXA — backend API surface (for your BE team)
 *
 * The Next.js app is a **BFF**: the browser calls `/api/*` (see `bff-paths.ts`). User galleries and
 * login **proxy to `NEXT_PUBLIC_BACKEND_API_BASE_URL`** when set (no demo fixtures). If the base URL
 * is unset, list endpoints return **empty arrays** and detail endpoints return **404** after session check.
 *
 * ---
 *
 * ## 1) Auth — sign-in / sign-up / session
 *
 * | Flow | BFF (browser) | Suggested upstream | Body / notes |
 * |------|---------------|-------------------|--------------|
 * | Login | `POST /api/auth/session` | `POST /auth/login` or OAuth token exchange | `{ email, password }` → set `httpOnly` cookies: session + optional `access_token` |
 * | Logout | `DELETE /api/auth/session` | Revoke refresh / clear server session | Clear cookies in BFF |
 * | Register | `POST /api/auth/register` | `POST /auth/register` | See `RegisterAccountPayload` in `auth-api.ts` |
 *
 * **Cookies (names in `session-cookie-names.ts`):** `nexa_session`, optional `nexa_access_token` for BE calls.
 *
 * ---
 *
 * ## 2) Dashboard aggregate
 *
 * | BFF | Suggested upstream | Response |
 * |-----|-------------------|----------|
 * | `GET /api/dashboard` | `GET /dashboard` or `/users/me/dashboard` | JSON matching `DashboardPayload` (`dashboard-types.ts`) — projects, activity, optional `user` |
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
 * - `NEXT_PUBLIC_BACKEND_API_BASE_URL` — Nest API; required for website gallery and builder.
 * - `NEXT_PUBLIC_APP_URL` — Next app URL for live `/s/{slug}` links (matches Nest `FRONTEND_PUBLIC_URL`).
 * - `NEXT_PUBLIC_CHATBOT_API_BASE_URL` — chatbot train/create when UI is wired to `chatbotService`.
 * - `NEXT_PUBLIC_INTEGRATION_API_BASE_URL` — integration connect when UI uses `integrationService`.
 * - `NEXT_PUBLIC_NEXA_LOGIN_URL` — override login POST target (default `/api/auth/session`).
 * - `NEXT_PUBLIC_NEXA_REGISTER_URL` — override register POST (default `/api/auth/register`).
 * - Server-only: `BACKEND_AUTH_REGISTER_PATH` — register proxy path (default `/auth/register`).
 * - Server-only: `BACKEND_AUTH_LOGIN_PATH` — login proxy path (default `/auth/login`).
 * - Server-only: `BACKEND_USER_WEBSITES_PATH`, `BACKEND_USER_WEBSITE_DETAIL_PATH` (use `:id` token), same pattern for `BACKEND_USER_BOTS_PATH`, `BACKEND_USER_BOT_DETAIL_PATH`, `BACKEND_USER_INTEGRATIONS_PATH`, `BACKEND_USER_INTEGRATION_DETAIL_PATH`.
 */

/** Marker export so tooling keeps this module; documentation lives in the JSDoc above. */
export const NEXA_BACKEND_CONTRACT_VERSION = "1.0.0" as const;
