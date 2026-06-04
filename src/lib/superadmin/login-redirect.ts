import { BFF_PATHS } from "../api/bff-paths";
import { isAdminRole } from "../api/nestjs-normalize";

function roleFromLoginJson(parsed: unknown): string | null {
  if (!parsed || typeof parsed !== "object") return null;
  const user = (parsed as Record<string, unknown>).user;
  if (user && typeof user === "object") {
    const role = (user as Record<string, unknown>).role;
    if (typeof role === "string") return role;
  }
  return null;
}

/** Prefer superadmin hub when the session has NestJS role ADMIN. */
export async function resolvePostLoginPath(
  fallbackNext: string,
  loginJson?: unknown,
): Promise<string> {
  const role = roleFromLoginJson(loginJson);
  if (isAdminRole(role)) return "/superadmin";

  try {
    const res = await fetch(BFF_PATHS.superadminCheck, { credentials: "same-origin", cache: "no-store" });
    if (!res.ok) return fallbackNext;
    const data = (await res.json()) as { isSuperAdmin?: boolean };
    if (data.isSuperAdmin) return "/superadmin";
  } catch {
    /* use fallback */
  }
  return fallbackNext;
}
