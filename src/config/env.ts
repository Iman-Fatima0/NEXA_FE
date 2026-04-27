export const env = {
  appName: "NEXA",
  appEnv: process.env.NODE_ENV ?? "development",
  backendApiBaseUrl: process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ?? "",
  websiteApiBaseUrl: process.env.NEXT_PUBLIC_WEBSITE_API_BASE_URL ?? "",
  chatbotApiBaseUrl: process.env.NEXT_PUBLIC_CHATBOT_API_BASE_URL ?? "",
  integrationApiBaseUrl: process.env.NEXT_PUBLIC_INTEGRATION_API_BASE_URL ?? "",
};
