import { env } from "../../config/env";
import type { DashboardActivity, DashboardPayload, DashboardProject } from "../dashboard-types";
import {
  mapUserToDashboardUser,
  normalizeBotsListResponse,
  normalizeWebsitesListResponse,
  parseNexaUser,
} from "./nestjs-normalize";
import { pathAuthMe, pathUserBotsList, pathUserWebsitesList } from "./upstream-paths";

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

/** Parallel Nest compose used by the BFF route and dashboard server pages. */
export async function composeDashboardFromNest(token: string): Promise<DashboardPayload | null> {
  const base = env.backendApiBaseUrl.trim().replace(/\/+$/, "");
  if (!base) {
    return { projects: [], activity: [] };
  }
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

export function withDashboardMeta(payload: DashboardPayload, source: "api" | "pending"): DashboardPayload {
  return {
    ...payload,
    meta: { source, fetchedAt: new Date().toISOString() },
  };
}
