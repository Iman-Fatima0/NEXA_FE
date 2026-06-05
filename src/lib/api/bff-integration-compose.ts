import {
  mapBackendWebsiteToGalleryItem,
  type BackendWebsiteRow,
} from "./bff-website-normalize";
import {
  mergeChatIntegrationIntoSections,
  readChatIntegrationFromSections,
  type ChatIntegrationMeta,
  type ConnectIntegrationPayload,
  type WidgetPosition,
} from "../integration/chat-integration";
import type { UserIntegration } from "../user-integrations-types";

function websiteRowsFromList(raw: unknown): BackendWebsiteRow[] {
  if (Array.isArray(raw)) return raw as BackendWebsiteRow[];
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.websites)) return o.websites as BackendWebsiteRow[];
  }
  return [];
}

export function integrationsFromWebsitesList(raw: unknown): UserIntegration[] {
  const rows = websiteRowsFromList(raw);
  const out: UserIntegration[] = [];
  for (const row of rows) {
    const link = readChatIntegrationFromSections(row.sections);
    if (!link) continue;
    const site = mapBackendWebsiteToGalleryItem(row);
    const name = `${site.name} + ${link.botName?.trim() || "Chatbot"}`;
    out.push({
      id: site.id,
      name,
      description: link.publicSlug ? `Widget: ${link.publicSlug}` : "Connected",
      createdAt: link.connectedAt ?? site.updatedAt ?? site.createdAt,
      updatedAt: link.connectedAt ?? site.updatedAt ?? site.createdAt,
      publicUrl: site.publicUrl,
      slug: site.slug,
      status: site.status,
      theme: site.theme,
      themeColor: site.themeColor,
      logo: site.logo,
      sections: row.sections,
      href: site.publicUrl ?? undefined,
      previewUrl: site.publicUrl ?? undefined,
    });
  }
  return out.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
}

export function integrationDetailFromWebsite(raw: unknown, websiteId: string): { integration: UserIntegration } | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const row = (o.website && typeof o.website === "object" ? o.website : raw) as BackendWebsiteRow;
  if (!row?.id || row.id !== websiteId) return null;
  const link = readChatIntegrationFromSections(row.sections);
  if (!link) return null;
  const site = mapBackendWebsiteToGalleryItem(row, { includeBuilder: true });
  return {
    integration: {
      id: site.id,
      name: `${site.name} + ${link.botName?.trim() || "Chatbot"}`,
      description: `Position: ${link.position.replace("-", " ")} · Bot: ${link.botName ?? link.publicSlug}`,
      createdAt: link.connectedAt ?? site.updatedAt ?? site.createdAt,
      updatedAt: link.connectedAt ?? site.updatedAt ?? site.createdAt,
      publicUrl: site.publicUrl,
      slug: site.slug,
      status: site.status,
      theme: site.theme,
      themeColor: site.themeColor,
      logo: site.logo,
      sections: site.sections,
      href: site.publicUrl ?? undefined,
      previewUrl: site.publicUrl ?? undefined,
    },
  };
}

function pickBotSlug(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const inner = o.bot && typeof o.bot === "object" ? (o.bot as Record<string, unknown>) : o;
  const slug = inner.publicSlug;
  return typeof slug === "string" && slug.trim() ? slug.trim() : null;
}

function pickBotName(raw: unknown, fallback: string): string {
  if (!raw || typeof raw !== "object") return fallback;
  const o = raw as Record<string, unknown>;
  const inner = o.bot && typeof o.bot === "object" ? (o.bot as Record<string, unknown>) : o;
  const name = inner.name;
  return typeof name === "string" && name.trim() ? name.trim() : fallback;
}

function isBotPublished(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as Record<string, unknown>;
  const inner = o.bot && typeof o.bot === "object" ? (o.bot as Record<string, unknown>) : o;
  return inner.isPublished === true || inner.status === "published" || Boolean(pickBotSlug(raw));
}

export type ConnectIntegrationResult = {
  integration: UserIntegration;
  website: BackendWebsiteRow;
};

export function buildConnectIntegrationBody(
  websiteRow: BackendWebsiteRow,
  botRaw: unknown,
  body: ConnectIntegrationPayload,
): { builderBody: Record<string, unknown>; meta: ChatIntegrationMeta } {
  const position: WidgetPosition =
    body.position === "bottom-left" || body.position === "top-right" ? body.position : "bottom-right";
  const publicSlug = pickBotSlug(botRaw);
  if (!publicSlug) {
    throw new Error("Chatbot must be published before connecting to a website.");
  }
  const meta: ChatIntegrationMeta = {
    botId: body.chatbotId.trim(),
    botName: pickBotName(botRaw, "Chatbot"),
    publicSlug,
    position,
    showBubble: body.showBubble !== false,
    widgetSize: typeof body.widgetSize === "number" && body.widgetSize > 0 ? body.widgetSize : 60,
    connectedAt: new Date().toISOString(),
  };
  const sections = mergeChatIntegrationIntoSections(websiteRow.sections, meta);
  return {
    builderBody: { sections },
    meta,
  };
}

export { isBotPublished, pickBotSlug, pickBotName };
