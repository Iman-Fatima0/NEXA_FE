import { env } from "../config/env";
import { apiRequest } from "../lib/api";
import type { Integration } from "../types/api.types";

type CreateIntegrationPayload = {
  websiteId: string;
  chatbotId: string;
  position: "bottom-right" | "bottom-left";
  showBubble: boolean;
  widgetSize: number;
};

export const integrationService = {
  connect(payload: CreateIntegrationPayload) {
    return apiRequest<Integration>("/integrations", { method: "POST", body: payload }, env.integrationApiBaseUrl);
  },

  getIntegrationById(integrationId: string) {
    return apiRequest<Integration>(`/integrations/${integrationId}`, { method: "GET" }, env.integrationApiBaseUrl);
  },

  listIntegrations() {
    return apiRequest<Integration[]>("/integrations", { method: "GET" }, env.integrationApiBaseUrl);
  },
};
