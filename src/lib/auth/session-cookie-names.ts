/** Cookie names shared by middleware and route handlers (Edge-safe, no Node APIs). */
export const SESSION_COOKIE = "nexa_session";
export const ACCESS_COOKIE = "nexa_access_token";
export const REFRESH_COOKIE = "nexa_refresh_token";
/** USER | ADMIN — from login/register or GET /auth/me */
export const USER_ROLE_COOKIE = "nexa_user_role";
/** Set on login when /auth/me is unavailable. */
export const USER_EMAIL_COOKIE = "nexa_user_email";
export const AUTH_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7;
/** Refresh tokens are long-lived; keep separate max age. */
export const REFRESH_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30;
