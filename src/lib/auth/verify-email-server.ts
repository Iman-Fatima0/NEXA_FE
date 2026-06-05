import { env } from "../../config/env";

export type VerifyEmailResult = {
  ok: boolean;
  message: string;
};

function pathVerifyEmailPost(): string {
  const p = process.env.BACKEND_AUTH_VERIFY_EMAIL_PATH?.trim();
  return p ? (p.startsWith("/") ? p : `/${p}`) : "/auth/verify-email";
}

function pathVerifyEmailConfirmGet(token: string): string {
  const t = process.env.BACKEND_AUTH_VERIFY_EMAIL_CONFIRM_PATH?.trim();
  const path = t || "/auth/verify-email/confirm";
  const base = path.startsWith("/") ? path : `/${path}`;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}token=${encodeURIComponent(token)}`;
}

/** Server-side: confirm email via NestJS (POST JSON, then GET confirm fallback). */
export async function confirmEmailWithToken(token: string): Promise<VerifyEmailResult> {
  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false, message: "This verification link is missing a token." };
  }

  const base = env.backendApiBaseUrl.trim();
  if (!base) {
    return {
      ok: false,
      message: "Backend API is not configured. Set NEXT_PUBLIC_BACKEND_API_BASE_URL and ensure NestJS is running.",
    };
  }

  const origin = base.replace(/\/+$/, "");

  try {
    const postRes = await fetch(`${origin}${pathVerifyEmailPost()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ token: trimmed }),
      cache: "no-store",
    });

    if (postRes.ok) {
      let detail = "Your email is verified. You can sign in now.";
      try {
        const j = (await postRes.json()) as { message?: string };
        if (typeof j.message === "string" && j.message.trim()) detail = j.message.trim();
      } catch {
        /* use default */
      }
      return { ok: true, message: detail };
    }

    const getRes = await fetch(`${origin}${pathVerifyEmailConfirmGet(trimmed)}`, {
      method: "GET",
      headers: { Accept: "application/json, text/html" },
      cache: "no-store",
    });

    if (getRes.ok) {
      const ct = getRes.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        try {
          const j = (await getRes.json()) as { message?: string; success?: boolean };
          const msg =
            typeof j.message === "string" && j.message.trim()
              ? j.message.trim()
              : "Your email is verified. You can sign in now.";
          return { ok: j.success !== false, message: msg };
        } catch {
          return { ok: true, message: "Your email is verified. You can sign in now." };
        }
      }
      return { ok: true, message: "Your email is verified. You can sign in now." };
    }

    const errText = await postRes.text().catch(() => "");
    const snippet = errText.slice(0, 200).trim();
    return {
      ok: false,
      message: snippet || `Verification failed (${postRes.status}). The link may be expired.`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return {
      ok: false,
      message: `Could not reach the API at ${origin}. Is NestJS running? (${msg})`,
    };
  }
}
