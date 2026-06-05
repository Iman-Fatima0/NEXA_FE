/**
 * Composes dashboard data from NestJS: GET /auth/me, GET /bots, GET /websites.
 * There is no dedicated /dashboard endpoint on the backend.
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "../../../config/env";
import {
  mapUserToDashboardUser,
  normalizeBotsListResponse,
  normalizeWebsitesListResponse,
  parseNexaUser,
} from "../../../lib/api/nestjs-normalize";
import { pathAuthMe, pathUserBotsList, pathUserWebsitesList } from "../../../lib/api/upstream-paths";
import type { DashboardActivity, DashboardPayload, DashboardProject } from "../../../lib/dashboard-types";
import { ACCESS_COOKIE, SESSION_COOKIE } from "../../../lib/auth/session-cookie-names";

function withMeta(payload: DashboardPayload, source: "api" | "pending"): DashboardPayload {
  return {
    ...payload,
    meta: { source, fetchedAt: new Date().toISOString() },
  };
}

function projectsFromLists(
  bots: ReturnType<typeof normalizeBotsListResponse>["bots"],
  websites: ReturnType<typeof normalizeWebsitesListResponse>["websites"],
): DashboardProject[] {
  const botProjects: DashboardProject[] = bots.map((b) => ({
    id: b.id,
    type: "chatbot" as const,
    name: b.name,
    status: "active",
    updatedAt: b.updatedAt ?? b.createdAt ?? new Date().toISOString(),
    href: b.href,
  }));
  const siteProjects: DashboardProject[] = websites.map((w) => ({
    id: w.id,
    type: "website" as const,
    name: w.name,
    status: "active",
    updatedAt: w.updatedAt ?? w.createdAt ?? new Date().toISOString(),
    href: w.href,
  }));
  return [...siteProjects, ...botProjects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function activityFromLists(
  bots: ReturnType<typeof normalizeBotsListResponse>["bots"],
  websites: ReturnType<typeof normalizeWebsitesListResponse>["websites"],
): DashboardActivity[] {
  const rows: DashboardActivity[] = [];
  for (const w of websites.slice(0, 8)) {
    rows.push({
      id: `website-${w.id}`,
      kind: "website.updated",
      title: w.name,
      detail: w.description,
      createdAt: w.updatedAt ?? w.createdAt ?? new Date().toISOString(),
    });
  }
  for (const b of bots.slice(0, 8)) {
    rows.push({
      id: `bot-${b.id}`,
      kind: "chatbot.updated",
      title: b.name,
      detail: b.description,
      createdAt: b.updatedAt ?? b.createdAt ?? new Date().toISOString(),
    });
  }
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12);
}

async function composeFromNestJs(token: string): Promise<DashboardPayload | null> {
  const base = env.backendApiBaseUrl.trim().replace(/\/+$/, "");
  const headers = { Accept: "application/json", Authorization: `Bearer ${token}` };

  const [meRes, botsRes, sitesRes] = await Promise.all([
    fetch(`${base}${pathAuthMe()}`, { headers, cache: "no-store" }),
    fetch(`${base}${pathUserBotsList()}`, { headers, cache: "no-store" }),
    fetch(`${base}${pathUserWebsitesList()}`, { headers, cache: "no-store" }),
  ]);

  if (meRes.status === 401 || meRes.status === 403) {
    return null;
  }

  const user = meRes.ok ? parseNexaUser(await meRes.json().catch(() => null)) : null;
  const botsRaw = botsRes.ok ? await botsRes.json().catch(() => []) : [];
  const sitesRaw = sitesRes.ok ? await sitesRes.json().catch(() => []) : [];

  const { bots } = normalizeBotsListResponse(botsRaw);
  const { websites } = normalizeWebsitesListResponse(sitesRaw);

  return {
    projects: projectsFromLists(bots, websites),
    activity: activityFromLists(bots, websites),
    ...(user ? { user: mapUserToDashboardUser(user) } : {}),
  };
}

export async function GET() {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseConfigured = Boolean(env.backendApiBaseUrl.trim());

  if (baseConfigured) {
    const token = jar.get(ACCESS_COOKIE)?.value;
    if (!token) {
      return NextResponse.json(
        { error: "dashboard_upstream_failed", message: "Missing access token." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }
    try {
      const payload = await composeFromNestJs(token);
      if (!payload) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json(withMeta(payload, "api"), {
        headers: { "Cache-Control": "no-store, must-revalidate" },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      return NextResponse.json(
        { error: "dashboard_upstream_failed", message: msg },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }
  }

  return NextResponse.json(withMeta({ projects: [], activity: [] }, "pending"), {
    headers: { "Cache-Control": "no-store, must-revalidate" },
  });
}
