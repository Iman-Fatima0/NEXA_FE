import type { BotConfig, BotStatus, PlatformBot, PublishBotResult, AnalyticsSummary, UnansweredQuestion } from "./bot-types";
import type { PersonalityPresetId } from "./personality-presets";

function str(v: unknown): string {
  if (v == null) return "";
  return typeof v === "string" ? v : String(v);
}

function num(v: unknown): number | undefined {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

export function parseBotStatus(raw: unknown): BotStatus {
  const s = str(raw).toLowerCase();
  if (s === "published" || s === "live" || s === "active") return "published";
  if (raw === true) return "published";
  return "draft";
}

export function parseBotConfig(raw: unknown): BotConfig | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const cfg: BotConfig = {};
  if (typeof o.welcomeMessage === "string") cfg.welcomeMessage = o.welcomeMessage;
  if (typeof o.primaryColor === "string") cfg.primaryColor = o.primaryColor;
  if (typeof o.personalityPreset === "string") cfg.personalityPreset = o.personalityPreset as PersonalityPresetId;
  return Object.keys(cfg).length ? cfg : undefined;
}

function mergeBotConfig(inner: Record<string, unknown>): BotConfig | undefined {
  const fromNested = parseBotConfig(inner.config);
  const fromRoot = parseBotConfig({
    welcomeMessage: inner.welcomeMessage,
    primaryColor: inner.primaryColor,
    personalityPreset: inner.personalityPreset,
  });
  const fromSnapshot =
    inner.configSnapshot && typeof inner.configSnapshot === "object"
      ? parseBotConfig((inner.configSnapshot as Record<string, unknown>).theme)
      : undefined;
  return { ...fromSnapshot, ...fromRoot, ...fromNested };
}

export function parsePlatformBot(raw: unknown): PlatformBot | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const inner = o.bot && typeof o.bot === "object" ? (o.bot as Record<string, unknown>) : o;
  const id = str(inner.id);
  const name = str(inner.name);
  if (!id || !name) return null;

  const status =
    parseBotStatus(inner.status) ||
    parseBotStatus(inner.publishStatus) ||
    (inner.isPublished === true ? "published" : "draft");

  let documentCount = num(inner.documentCount) ?? num(inner.documentsCount);
  if (documentCount == null && inner._count && typeof inner._count === "object") {
    const c = inner._count as Record<string, unknown>;
    documentCount = num(c.documents);
  }

  const config = mergeBotConfig(inner);

  return {
    id,
    name,
    description: typeof inner.description === "string" || inner.description === null ? inner.description : undefined,
    status,
    createdAt: str(inner.createdAt) || undefined,
    updatedAt: str(inner.updatedAt) || undefined,
    documentCount,
    config,
    publicChatUrl: str(inner.publicChatUrl) || str(inner.chatUrl) || undefined,
    widgetScript: str(inner.widgetScript) || str(inner.embedScript) || undefined,
    widgetStatus: str(inner.widgetStatus) || undefined,
    widgetVersion: str(inner.widgetVersion) || undefined,
    embedMode: str(inner.embedMode) || undefined,
    allowedDomains: Array.isArray(inner.allowedDomains)
      ? inner.allowedDomains.map((d) => str(d)).filter(Boolean)
      : undefined,
  };
}

export function parsePlatformBotsList(raw: unknown): PlatformBot[] {
  const arr = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
      ? ((raw as Record<string, unknown>).bots ??
          (raw as Record<string, unknown>).data ??
          (raw as Record<string, unknown>).items)
      : [];
  if (!Array.isArray(arr)) return [];
  return arr.map(parsePlatformBot).filter((b): b is PlatformBot => b !== null);
}

export function parsePublishResult(raw: unknown): PublishBotResult {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const inner = o.data && typeof o.data === "object" ? (o.data as Record<string, unknown>) : o;
  const widget = inner.widget && typeof inner.widget === "object" ? (inner.widget as Record<string, unknown>) : inner;
  return {
    publicChatUrl:
      str(inner.publicChatUrl) ||
      str(inner.chatUrl) ||
      str(inner.directChatUrl) ||
      undefined,
    widgetScript:
      str(inner.widgetScript) ||
      str(inner.embedScript) ||
      str(widget.script) ||
      undefined,
    widgetUrl: str(inner.widgetUrl) || str(widget.url) || undefined,
    widgetStatus: str(inner.widgetStatus) || str(widget.status) || "Published",
    widgetVersion: str(inner.widgetVersion) || str(widget.version) || undefined,
    embedMode: str(inner.embedMode) || str(widget.embedMode) || undefined,
    allowedDomains: Array.isArray(inner.allowedDomains)
      ? inner.allowedDomains.map((d) => str(d)).filter(Boolean)
      : undefined,
  };
}

export function parseAnalyticsSummary(raw: unknown): AnalyticsSummary {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const inner = o.summary && typeof o.summary === "object" ? (o.summary as Record<string, unknown>) : o;

  const daily = (key: string) => {
    const series = inner[key];
    if (!Array.isArray(series)) return undefined;
    return series
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const r = row as Record<string, unknown>;
        const date = str(r.date) || str(r.day);
        const count = num(r.count) ?? num(r.value) ?? 0;
        if (!date) return null;
        return { date, count: count ?? 0 };
      })
      .filter((x): x is { date: string; count: number } => x !== null);
  };

  return {
    totalConversations: num(inner.totalConversations) ?? num(inner.conversations),
    totalMessages: num(inner.totalMessages) ?? num(inner.messages),
    successRate: num(inner.successRate),
    averageConfidence: num(inner.averageConfidence) ?? num(inner.avgConfidence),
    unansweredCount: num(inner.unansweredCount),
    dailyConversations: daily("dailyConversations") ?? daily("conversationsByDay"),
    dailyMessages: daily("dailyMessages") ?? daily("messagesByDay"),
  };
}

export function parseUnansweredList(raw: unknown): UnansweredQuestion[] {
  const arr = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
      ? ((raw as Record<string, unknown>).questions ??
          (raw as Record<string, unknown>).items ??
          (raw as Record<string, unknown>).unanswered)
      : [];
  if (!Array.isArray(arr)) return [];
  const mapped: UnansweredQuestion[] = [];
  for (const row of arr) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const question = str(r.question) || str(r.content) || str(r.text);
    if (!question) continue;
    mapped.push({
      id: str(r.id) || undefined,
      question,
      date: str(r.date) || str(r.createdAt) || undefined,
      confidence: num(r.confidence),
    });
  }
  return mapped;
}

export function pickBotId(raw: unknown): string | null {
  const bot = parsePlatformBot(raw);
  return bot?.id ?? null;
}
