/**
 * # NEXA — backend API surface (for your BE team)
 *
 * The Next.js app is a **BFF**: the browser calls `/api/*` (see `bff-paths.ts`). Each route handler
 * should forward to your API with the user’s bearer cookie / session, or you can expose the same
 * JSON from a monolith. Below is the **recommended upstream** contract so the FE and BE stay aligned.
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
 * ## 3) User websites (gallery + detail)
 *
 * | BFF | Suggested upstream | Response |
 * |-----|-------------------|----------|
 * | `GET /api/user/websites` | `GET /users/me/websites` | `{ websites: UserWebsite[] }` (`user-websites-types.ts`) |
 * | `GET /api/user/websites/:id` | `GET /users/me/websites/:id` | `{ website: UserWebsite }` |
 *
 * **Website generation (builder):** browser calls **direct BE** via `website-builder-api.ts` when
 * `NEXT_PUBLIC_WEBSITE_API_BASE_URL` (or `NEXT_PUBLIC_BACKEND_API_BASE_URL`) is set:
 * - `POST /website-builder/generate` — body `{ websiteName, description }` → `GenerateWebsiteResponse`
 *
 * **Alternate upstream** (already sketched in `services/website.service.ts`): `POST /websites`, `GET /websites`, `GET /websites/:id`, `POST /websites/:id/save` — pick one style and align `website-builder-api` + BFF list routes.
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
 * - `NEXT_PUBLIC_BACKEND_API_BASE_URL` — primary API; dashboard BFF proxies here today.
 * - `NEXT_PUBLIC_WEBSITE_API_BASE_URL` — website generation + optional list if you split services.
 * - `NEXT_PUBLIC_CHATBOT_API_BASE_URL` — chatbot train/create when UI is wired to `chatbotService`.
 * - `NEXT_PUBLIC_INTEGRATION_API_BASE_URL` — integration connect when UI uses `integrationService`.
 * - `NEXT_PUBLIC_NEXA_LOGIN_URL` — override login POST target (default `/api/auth/session`).
 * - `NEXT_PUBLIC_NEXA_REGISTER_URL` — override register POST (default `/api/auth/register`).
 * - Server-only: `BACKEND_AUTH_REGISTER_PATH` — path appended to backend base for register proxy (default `/auth/register`).
 */

/** Marker export so tooling keeps this module; documentation lives in the JSDoc above. */
export const NEXA_BACKEND_CONTRACT_VERSION = "1.0.0" as const;
