/**
 * @deprecated Use `lib/integration/integration-api.ts` (BFF `/api/user/integrations`).
 */
import { bffJson } from "../lib/api/bff-json";
import { BFF_PATHS } from "../lib/api/bff-paths";
import type { ConnectIntegrationPayload } from "../lib/integration/chat-integration";
import type { UserIntegration } from "../lib/user-integrations-types";

type CreateIntegrationPayload = {
  websiteId: string;
  chatbotId: string;
  position: "bottom-right" | "bottom-left" | "top-right";
  showBubble: boolean;
  widgetSize: number;
};

export const integrationService = {
  connect(payload: CreateIntegrationPayload) {
    const body: ConnectIntegrationPayload = {
      websiteId: payload.websiteId,
      chatbotId: payload.chatbotId,
      position: payload.position,
      showBubble: payload.showBubble,
      widgetSize: payload.widgetSize,
    };
    return bffJson<{ integration: UserIntegration }>(BFF_PATHS.userIntegrations, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },

  getIntegrationById(integrationId: string) {
    return bffJson<{ integration: UserIntegration }>(BFF_PATHS.userIntegration(integrationId));
  },

  listIntegrations() {
    return bffJson<{ integrations: UserIntegration[] }>(BFF_PATHS.userIntegrations);
  },
};
