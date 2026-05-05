/** Direct-to-backend chatbot APIs; see `lib/api/nexa-backend-contract.ts`. */
import { env } from "../config/env";
import { apiRequest } from "../lib/api";
import type { Chatbot } from "../types/api.types";

type CreateChatbotPayload = {
  name: string;
  personality: string;
};

type TrainChatbotPayload = {
  knowledgeBaseText?: string;
};

export const chatbotService = {
  createChatbot(payload: CreateChatbotPayload) {
    return apiRequest<Chatbot>("/chatbots", { method: "POST", body: payload }, env.chatbotApiBaseUrl);
  },

  listChatbots() {
    return apiRequest<Chatbot[]>("/chatbots", { method: "GET" }, env.chatbotApiBaseUrl);
  },

  trainChatbot(chatbotId: string, payload: TrainChatbotPayload) {
    return apiRequest<Chatbot>(`/chatbots/${chatbotId}/train`, { method: "POST", body: payload }, env.chatbotApiBaseUrl);
  },

  testChatbot(chatbotId: string, message: string) {
    return apiRequest<{ response: string }>(
      `/chatbots/${chatbotId}/test`,
      { method: "POST", body: { message } },
      env.chatbotApiBaseUrl
    );
  },
};
