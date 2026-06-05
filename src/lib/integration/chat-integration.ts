/** Website ↔ chatbot link stored on `sections._meta.chatIntegration` (Nest `PUT /websites/:id/builder`). */

export type WidgetPosition = "bottom-right" | "bottom-left" | "top-right";

export type ChatIntegrationMeta = {
  botId: string;
  botName?: string;
  publicSlug: string;
  position: WidgetPosition;
  showBubble: boolean;
  widgetSize: number;
  connectedAt?: string;
};

export type ConnectIntegrationPayload = {
  websiteId: string;
  chatbotId: string;
  position?: WidgetPosition;
  showBubble?: boolean;
  widgetSize?: number;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

export function readChatIntegrationFromSections(sections: unknown): ChatIntegrationMeta | null {
  const root = asRecord(sections);
  if (!root) return null;
  const meta = asRecord(root._meta);
  if (!meta) return null;
  const raw = asRecord(meta.chatIntegration);
  if (!raw) return null;
  const botId = typeof raw.botId === "string" ? raw.botId.trim() : "";
  const publicSlug = typeof raw.publicSlug === "string" ? raw.publicSlug.trim() : "";
  if (!botId || !publicSlug) return null;
  const position = raw.position;
  const pos: WidgetPosition =
    position === "bottom-left" || position === "top-right" ? position : "bottom-right";
  return {
    botId,
    botName: typeof raw.botName === "string" ? raw.botName : undefined,
    publicSlug,
    position: pos,
    showBubble: raw.showBubble !== false,
    widgetSize: typeof raw.widgetSize === "number" && raw.widgetSize > 0 ? raw.widgetSize : 60,
    connectedAt: typeof raw.connectedAt === "string" ? raw.connectedAt : undefined,
  };
}

export function mergeChatIntegrationIntoSections(
  sections: unknown,
  integration: ChatIntegrationMeta,
): Record<string, unknown> {
  const base = asRecord(sections) ? { ...(sections as Record<string, unknown>) } : {};
  const meta = asRecord(base._meta) ? { ...(base._meta as Record<string, unknown>) } : {};
  meta.chatIntegration = {
    ...integration,
    connectedAt: integration.connectedAt ?? new Date().toISOString(),
  };
  base._meta = meta;
  return base;
}

/** Remove widget link from website sections (site and bots are kept). */
export function clearChatIntegrationFromSections(sections: unknown): Record<string, unknown> {
  const base = asRecord(sections) ? { ...(sections as Record<string, unknown>) } : {};
  const meta = asRecord(base._meta);
  if (!meta) return base;
  const nextMeta = { ...meta };
  delete nextMeta.chatIntegration;
  if (Object.keys(nextMeta).length === 0) {
    delete base._meta;
  } else {
    base._meta = nextMeta;
  }
  return base;
}
