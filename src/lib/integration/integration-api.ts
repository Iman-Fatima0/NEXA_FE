import { bffJson } from "../api/bff-json";
import { BFF_PATHS } from "../api/bff-paths";
import { fetchUserWebsites } from "../fetch-user-websites";
import { listPlatformBots } from "../chatbot/chatbot-platform-api";
import type { PlatformBot } from "../chatbot/bot-types";
import type { UserWebsite } from "../user-websites-types";
import type { UserIntegration } from "../user-integrations-types";
import type { ConnectIntegrationPayload, WidgetPosition } from "./chat-integration";

export type IntegrationOptions = {
  websites: UserWebsite[];
  bots: PlatformBot[];
  hint?: string;
};

export async function fetchIntegrationOptions(): Promise<IntegrationOptions> {
  const [sitesPayload, bots] = await Promise.all([fetchUserWebsites(), listPlatformBots()]);
  return {
    websites: sitesPayload.websites,
    bots,
    hint: sitesPayload.hint,
  };
}

export type ConnectIntegrationResponse = {
  integration: UserIntegration;
};

export async function connectWebsiteChatbot(
  payload: ConnectIntegrationPayload,
): Promise<ConnectIntegrationResponse> {
  return bffJson<ConnectIntegrationResponse>(BFF_PATHS.userIntegrations, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      websiteId: payload.websiteId,
      chatbotId: payload.chatbotId,
      position: payload.position ?? "bottom-right",
      showBubble: payload.showBubble ?? true,
      widgetSize: payload.widgetSize ?? 60,
    }),
  });
}

/** Re-open Integration Manager with site + bot pre-selected (change a mistaken connection). */
/** Remove chatbot widget from a site (does not delete the website or bot). */
export async function disconnectIntegration(websiteId: string): Promise<void> {
  await bffJson<{ ok?: boolean }>(BFF_PATHS.userIntegration(websiteId), {
    method: "DELETE",
  });
}

export function integrationEditHref(websiteId: string, chatbotId?: string): string {
  const q = new URLSearchParams({ websiteId });
  if (chatbotId?.trim()) q.set("chatbotId", chatbotId.trim());
  return `/integration-manager/create?${q.toString()}`;
}

export type { ConnectIntegrationPayload, WidgetPosition };
