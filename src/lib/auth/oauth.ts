import { env } from "../../config/env";

export type OAuthProvider = "google" | "github" | "facebook";

export function getOAuthStartUrl(provider: OAuthProvider): string {
  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    throw new Error("NEXT_PUBLIC_BACKEND_API_BASE_URL is not set");
  }
  return `${base.replace(/\/+$/, "")}/auth/${provider}`;
}

/** Redirect browser to NestJS OAuth (Google / GitHub / Facebook). */
export function startOAuthSignIn(provider: OAuthProvider): void {
  globalThis.location.assign(getOAuthStartUrl(provider));
}

export type OAuthProvidersStatus = {
  google: boolean;
  github: boolean;
  facebook: boolean;
};

export async function fetchOAuthProviders(): Promise<OAuthProvidersStatus | null> {
  const base = env.backendApiBaseUrl.trim();
  if (!base) return null;
  try {
    const res = await fetch(`${base.replace(/\/+$/, "")}/auth/oauth/providers`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as OAuthProvidersStatus;
  } catch {
    return null;
  }
}
