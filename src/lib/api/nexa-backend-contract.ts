/**
 * # NEXA — NestJS backend ↔ Next.js BFF contract
 *
 * Backend base: `http://localhost:3000` (set `NEXT_PUBLIC_BACKEND_API_BASE_URL`).
 * Swagger: `GET http://localhost:3000/api`
 * Auth header: `Authorization: Bearer <accessToken>` (15 min TTL by default).
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
 * | `GET /api/user/integrations` | — | Not on NestJS; empty list |
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
 * **Chatbot builder BFF (wired in UI):**
 * - `POST /api/user/bots` → create bot
 * - `PATCH /api/user/bots/:id` → personality as `description`
 * - `POST /api/documents/ingest` → multipart `file` + `botId` (PDF/TXT)
 * - `POST /api/chat/start`, `POST /api/chat/message`, `GET /api/chat/history/:sessionId`
 *
 * **Internal AI (port 8000):** not called from this frontend.
 *
 * ---
 *
 * ## Environment
 *
 * - `NEXT_PUBLIC_BACKEND_API_BASE_URL=http://localhost:3000`
 * - Optional path overrides: `BACKEND_AUTH_*`, `BACKEND_USER_*`, `BACKEND_USERS_PATH`
 *
 * Login/register response shape: `{ accessToken, refreshToken, user: { id, email, role, … } }`
 * After login, `role: "ADMIN"` → redirect to `/superadmin`.
 */

export const NEXA_BACKEND_CONTRACT_VERSION = "2.0.0" as const;
