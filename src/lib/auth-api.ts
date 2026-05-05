import { BFF_PATHS } from "./api/bff-paths";
import { clearProfileIconSeedEmail } from "./user-profile-icon";

/** Read a string field from FormData (ignores File entries). */
export function formString(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

/**
 * Login HTTP helper. Override with NEXT_PUBLIC_NEXA_LOGIN_URL when your auth API exists.
 * Default hits the local session cookie stub only.
 */

export type LoginCredentials = {
  email: string;
  password: string;
};

export function getLoginUrl(): string {
  return process.env.NEXT_PUBLIC_NEXA_LOGIN_URL?.trim() || BFF_PATHS.authSession;
}

export function getRegisterUrl(): string {
  return process.env.NEXT_PUBLIC_NEXA_REGISTER_URL?.trim() || BFF_PATHS.authRegister;
}

export type RegisterAccountPayload = {
  accountType: "personal" | "company";
  fullName: string;
  email: string;
  password: string;
  companyName?: string;
  industry?: string;
  companyWebsite?: string;
  companyDetails?: string;
};

export async function registerAccount(payload: RegisterAccountPayload): Promise<Response> {
  return fetch(getRegisterUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
}

export async function loginWithCredentials(credentials: LoginCredentials): Promise<Response> {
  return fetch(getLoginUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });
}

export async function readAuthErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    if (typeof data.error === "string" && data.error.trim()) return data.error.trim();
    if (typeof data.message === "string" && data.message.trim()) return data.message.trim();
  } catch {
    /* ignore */
  }
  return fallback;
}

/** Clears session cookies then sends the browser to the home page. */
export async function logoutAndRedirectHome(): Promise<void> {
  try {
    await fetch(BFF_PATHS.authSession, { method: "DELETE", credentials: "same-origin" });
  } catch {
    /* still leave the app */
  }
  try {
    clearProfileIconSeedEmail();
  } catch {
    /* ignore */
  }
  globalThis.location.assign("/");
}
