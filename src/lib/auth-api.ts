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
  return process.env.NEXT_PUBLIC_NEXA_LOGIN_URL?.trim() || "/api/auth/session";
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
