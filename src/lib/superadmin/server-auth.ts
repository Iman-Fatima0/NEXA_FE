import { cookies } from "next/headers";
import { env } from "../../config/env";
import {
  ACCESS_COOKIE,
  SESSION_COOKIE,
  USER_EMAIL_COOKIE,
  USER_ROLE_COOKIE,
} from "../auth/session-cookie-names";
import { isAdminRole, parseNexaUser } from "../api/nestjs-normalize";
import { pathAuthMe } from "../api/upstream-paths";

async function fetchMeFromBackend(token: string | undefined): Promise<ReturnType<typeof parseNexaUser>> {
  const base = env.backendApiBaseUrl.trim();
  if (!base || !token) return null;
  const url = `${base.replace(/\/+$/, "")}${pathAuthMe()}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return parseNexaUser(await res.json());
  } catch {
    return null;
  }
}

export async function resolveSessionUserRole(): Promise<string | null> {
  const jar = await cookies();
  const fromCookie = jar.get(USER_ROLE_COOKIE)?.value?.trim().toUpperCase();
  if (fromCookie === "USER" || fromCookie === "ADMIN") return fromCookie;

  const token = jar.get(ACCESS_COOKIE)?.value;
  const me = await fetchMeFromBackend(token);
  return me?.role ?? null;
}

export async function resolveSessionUserEmail(): Promise<string | null> {
  const jar = await cookies();
  const fromCookie = jar.get(USER_EMAIL_COOKIE)?.value?.trim().toLowerCase();
  if (fromCookie && fromCookie.includes("@")) return fromCookie;

  const token = jar.get(ACCESS_COOKIE)?.value;
  const me = await fetchMeFromBackend(token);
  return me?.email?.toLowerCase() ?? null;
}

export async function isSuperadminSession(): Promise<boolean> {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) return false;
  const role = await resolveSessionUserRole();
  return isAdminRole(role);
}

export async function getSuperadminCheckPayload(): Promise<{
  isSuperAdmin: boolean;
  email?: string;
  role?: string;
}> {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    return { isSuperAdmin: false };
  }
  const [role, email] = await Promise.all([resolveSessionUserRole(), resolveSessionUserEmail()]);
  return {
    isSuperAdmin: isAdminRole(role),
    ...(email ? { email } : {}),
    ...(role ? { role } : {}),
  };
}
