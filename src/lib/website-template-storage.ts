export const NEXA_WEBSITE_TEMPLATE_ID_KEY = "nexa_website_template_id";

export const DEFAULT_WEBSITE_TEMPLATE_ID = "business";

const ALLOWED_TEMPLATE_IDS = new Set(["business", "portfolio", "blog", "landing"]);

export function normalizeTemplateId(value: string | null | undefined): string {
  const id = value?.trim().toLowerCase() ?? "";
  if (ALLOWED_TEMPLATE_IDS.has(id)) {
    return id;
  }
  return DEFAULT_WEBSITE_TEMPLATE_ID;
}

export function readStoredTemplateId(): string {
  if (typeof globalThis.sessionStorage === "undefined") {
    return DEFAULT_WEBSITE_TEMPLATE_ID;
  }
  try {
    return normalizeTemplateId(globalThis.sessionStorage.getItem(NEXA_WEBSITE_TEMPLATE_ID_KEY));
  } catch {
    return DEFAULT_WEBSITE_TEMPLATE_ID;
  }
}

export function storeTemplateId(templateId: string): void {
  if (typeof globalThis.sessionStorage === "undefined") {
    return;
  }
  try {
    globalThis.sessionStorage.setItem(NEXA_WEBSITE_TEMPLATE_ID_KEY, normalizeTemplateId(templateId));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readTemplateIdFromSearch(search: string): string | null {
  try {
    const q = new URLSearchParams(search).get("template");
    return q?.trim() ? normalizeTemplateId(q) : null;
  } catch {
    return null;
  }
}
