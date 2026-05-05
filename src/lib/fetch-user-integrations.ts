import { bffJson } from "./api/bff-json";
import { BFF_PATHS } from "./api/bff-paths";
import type { UserIntegration, UserIntegrationsPayload } from "./user-integrations-types";

export async function fetchUserIntegrations(): Promise<UserIntegrationsPayload> {
  return bffJson<UserIntegrationsPayload>(BFF_PATHS.userIntegrations);
}

export type UserIntegrationByIdPayload = { integration: UserIntegration };

export async function fetchUserIntegrationById(id: string): Promise<UserIntegration> {
  const body = await bffJson<UserIntegrationByIdPayload>(BFF_PATHS.userIntegration(id));
  return body.integration;
}
