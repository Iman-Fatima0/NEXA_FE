import type { UserGalleryItem } from "../user-gallery-item";
import type { DashboardUser } from "../dashboard-types";
import type { NexaBot, NexaRole, NexaUser, NexaWebsite } from "./nestjs-types";
import type { SuperadminUser } from "../superadmin/types";

function str(v: unknown): string {
  if (v == null) return "";
  return typeof v === "string" ? v : String(v);
}

export function unwrapArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    for (const k of ["data", "items", "results"]) {
      if (Array.isArray(o[k])) return o[k];
    }
  }
  return [];
}

export function parseNexaUser(raw: unknown): NexaUser | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = str(o.id);
  const email = str(o.email);
  const role = str(o.role).toUpperCase() as NexaRole;
  if (!id || !email) return null;
  if (role !== "USER" && role !== "ADMIN") return null;
  return {
    id,
    email,
    role,
    emailVerified: typeof o.emailVerified === "boolean" ? o.emailVerified : undefined,
    createdAt: str(o.createdAt) || undefined,
    updatedAt: str(o.updatedAt) || undefined,
  };
}

export function isAdminRole(role: string | undefined | null): boolean {
  return str(role).toUpperCase() === "ADMIN";
}

export function mapUserToDashboardUser(u: NexaUser): DashboardUser {
  const local = u.email.split("@")[0]?.trim();
  return {
    id: u.id,
    email: u.email,
    displayName: local || u.email,
  };
}

export function mapBotToGalleryItem(bot: NexaBot): UserGalleryItem {
  return {
    id: bot.id,
    name: bot.name,
    description: bot.description ?? undefined,
    updatedAt: bot.updatedAt,
    createdAt: bot.createdAt,
    href: `/dashboard/bots/${bot.id}/preview`,
  };
}

export function mapWebsiteToGalleryItem(site: NexaWebsite): UserGalleryItem {
  return {
    id: site.id,
    name: site.name,
    description: site.domain ?? undefined,
    updatedAt: site.updatedAt,
    createdAt: site.createdAt,
    href: `/dashboard/websites/${site.id}/preview`,
  };
}

export function mapNexaUserToSuperadminUser(u: NexaUser): SuperadminUser {
  return {
    id: u.id,
    email: u.email,
    displayName: u.email.split("@")[0],
    status: u.role,
    createdAt: u.createdAt,
    lastLoginAt: u.updatedAt,
  };
}

export function normalizeBotsListResponse(raw: unknown): { bots: UserGalleryItem[] } {
  const arr = unwrapArray(raw);
  const bots = arr
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const id = str(o.id);
      const name = str(o.name);
      if (!id || !name) return null;
      return mapBotToGalleryItem({
        id,
        name,
        description: typeof o.description === "string" || o.description === null ? o.description : undefined,
        userId: str(o.userId),
        createdAt: str(o.createdAt) || undefined,
        updatedAt: str(o.updatedAt) || undefined,
      });
    })
    .filter((b): b is UserGalleryItem => b !== null);
  return { bots };
}

export function normalizeWebsitesListResponse(raw: unknown): { websites: UserGalleryItem[] } {
  const arr = unwrapArray(raw);
  const websites = arr
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const id = str(o.id);
      const name = str(o.name);
      if (!id || !name) return null;
      return mapWebsiteToGalleryItem({
        id,
        name,
        domain: typeof o.domain === "string" || o.domain === null ? o.domain : undefined,
        userId: str(o.userId) || undefined,
        createdAt: str(o.createdAt) || undefined,
        updatedAt: str(o.updatedAt) || undefined,
      });
    })
    .filter((w): w is UserGalleryItem => w !== null);
  return { websites };
}

export function normalizeUsersListResponse(raw: unknown): { users: SuperadminUser[] } {
  const arr = unwrapArray(raw);
  const users = arr
    .map((item) => {
      const u = parseNexaUser(item);
      return u ? mapNexaUserToSuperadminUser(u) : null;
    })
    .filter((u): u is SuperadminUser => u !== null);
  return { users };
}

export function wrapBotDetail(raw: unknown): { bot: UserGalleryItem } | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const inner = (o.bot && typeof o.bot === "object" ? o.bot : raw) as Record<string, unknown>;
  const id = str(inner.id);
  const name = str(inner.name);
  if (!id || !name) return null;
  return {
    bot: mapBotToGalleryItem({
      id,
      name,
      description: typeof inner.description === "string" || inner.description === null ? inner.description : undefined,
      userId: str(inner.userId),
      createdAt: str(inner.createdAt) || undefined,
      updatedAt: str(inner.updatedAt) || undefined,
    }),
  };
}

export function wrapWebsiteDetail(raw: unknown): { website: UserGalleryItem } | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const inner = (o.website && typeof o.website === "object" ? o.website : raw) as Record<string, unknown>;
  const id = str(inner.id);
  const name = str(inner.name);
  if (!id || !name) return null;
  return {
    website: mapWebsiteToGalleryItem({
      id,
      name,
      domain: typeof inner.domain === "string" || inner.domain === null ? inner.domain : undefined,
      userId: str(inner.userId) || undefined,
      createdAt: str(inner.createdAt) || undefined,
      updatedAt: str(inner.updatedAt) || undefined,
    }),
  };
}
