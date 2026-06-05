/** Backend default names — prefer the user-submitted name when the API echoes these. */
const GENERIC_BOT_NAMES = new Set(
  ["my first bot", "my chatbot", "my bot", "untitled", "new bot"].map((s) => s.toLowerCase()),
);

export function isGenericBotName(name: string | undefined | null): boolean {
  const n = name?.trim().toLowerCase();
  return !n || GENERIC_BOT_NAMES.has(n);
}

/** Use the name the user typed when the API returns a placeholder. */
export function resolveBotDisplayName(requestedName: string, apiName?: string | null): string {
  const requested = requestedName.trim();
  const fromApi = apiName?.trim();
  if (requested && isGenericBotName(fromApi)) return requested;
  if (fromApi) return fromApi;
  return requested || "Chatbot";
}

export function parseDescriptionFields(description?: string | null): {
  purpose?: string;
  personalityLabel?: string;
} {
  if (!description?.trim()) return {};
  const purposeMatch = description.match(/Purpose:\s*([\s\S]+?)(?:\n\n|$)/i);
  const personalityMatch = description.match(/Personality:\s*([^\n.]+)/i);
  return {
    purpose: purposeMatch?.[1]?.trim(),
    personalityLabel: personalityMatch?.[1]?.trim(),
  };
}
