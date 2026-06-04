import { BFF_PATHS } from "../api/bff-paths";
import { readAuthErrorMessage } from "../auth-api";

export async function requestForgotPasswordEmail(email: string): Promise<Response> {
  return fetch(BFF_PATHS.authForgotPassword, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<Response> {
  return fetch(BFF_PATHS.authResetPassword, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function readForgotPasswordError(res: Response, fallback: string): Promise<string> {
  return readAuthErrorMessage(res, fallback);
}

/** URL for NestJS to embed in reset emails (set FRONTEND_URL / AUTH_URL on BE). */
export function frontendResetPasswordUrl(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_AUTH_URL?.trim() ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const origin = base.replace(/\/+$/, "");
  return `${origin}/forgot-password/reset?token=${encodeURIComponent(token)}`;
}
