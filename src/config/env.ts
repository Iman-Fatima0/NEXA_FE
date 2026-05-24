/**
 * Central env for **data** calls. UI copy stays static; anything persisted or loaded from your
 * backend should flow through `NEXT_PUBLIC_*` bases + Next `/api/*` BFF routes — see
 * `src/lib/api/nexa-backend-contract.ts` for the full matrix.
 */
export const env = {
  appName: "NEXA",
  appEnv: process.env.NODE_ENV ?? "development",
  /** Primary API origin: dashboard + register BFF proxy use this when set. */
  backendApiBaseUrl: process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ?? "",
  /** Website generation (`website-builder-api`) and optional website CRUD if you point services here. */
  websiteApiBaseUrl: process.env.NEXT_PUBLIC_WEBSITE_API_BASE_URL ?? "",
  /** Chatbot create/train/test when UI uses `services/chatbot.service.ts`. */
  chatbotApiBaseUrl: process.env.NEXT_PUBLIC_CHATBOT_API_BASE_URL ?? "",
  /** Integration connect/list when UI uses `services/integration.service.ts`. */
  integrationApiBaseUrl: process.env.NEXT_PUBLIC_INTEGRATION_API_BASE_URL ?? "",
  /** Canonical live site base (Next app). Used when API omits `publicUrl`. */
  appPublicUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.AUTH_URL?.trim() || "",
};
