import { SESSION_COOKIE } from "./session-cookie-names";
import { dashboardBotHub, dashboardIntegrationHub, dashboardWebsiteHub } from "../dashboard-app-hubs";

/** Minimal cookie jar shape (works with `cookies()` from `next/headers`). */
export type SessionCookieJar = {
  get(name: string): { value: string } | undefined;
};

function hasSessionCookie(jar: SessionCookieJar): boolean {
  return Boolean(jar.get(SESSION_COOKIE)?.value);
}

export type BuilderHubKind = "website" | "bot" | "integration";

/** Guest “back” must not hit `/website-builder`, `/chatbot-builder`, or `/integration-manager` roots — they redirect to `/…/create` and feel like a no-op. */
const GUEST_BUILDER_BACK_HREF = "/innovate";

/**
 * Back target for “your X” hub: dashboard hub when signed in, otherwise Innovate (not builder roots, which redirect into create).
 */
export function hubBackHrefForSession(jar: SessionCookieJar, hub: BuilderHubKind): string {
  if (!hasSessionCookie(jar)) {
    return GUEST_BUILDER_BACK_HREF;
  }
  if (hub === "website") return dashboardWebsiteHub;
  if (hub === "bot") return dashboardBotHub;
  return dashboardIntegrationHub;
}

/**
 * Primary CTA that should persist to the account: dashboard path when signed in, otherwise sign-in with `next`.
 */
export function dashboardPathOrLogin(jar: SessionCookieJar, nextPath: string): string {
  if (hasSessionCookie(jar)) return nextPath;
  return `/login?next=${encodeURIComponent(nextPath)}`;
}
