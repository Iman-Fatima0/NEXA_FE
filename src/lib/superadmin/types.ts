/** Superadmin API shapes — align your backend responses to these when wiring BE. */

export type SuperadminUser = {
  id: string;
  email: string;
  displayName?: string;
  lastLoginAt?: string;
  createdAt?: string;
  status?: string;
};

export type SuperadminWebsite = {
  id: string;
  name: string;
  description?: string;
  ownerEmail?: string;
  status?: string;
  previewUrl?: string;
  updatedAt?: string;
  createdAt?: string;
};

export type SuperadminChatbot = {
  id: string;
  name: string;
  description?: string;
  ownerEmail?: string;
  status?: string;
  updatedAt?: string;
  createdAt?: string;
};

export type SuperadminIntegration = {
  id: string;
  name: string;
  websiteId?: string;
  chatbotId?: string;
  ownerEmail?: string;
  status?: string;
  updatedAt?: string;
  createdAt?: string;
};

export type SuperadminCheckPayload = {
  isSuperAdmin: boolean;
  email?: string;
  role?: string;
};

export type SuperadminUsersPayload = { users: SuperadminUser[] };
export type SuperadminWebsitesPayload = { websites: SuperadminWebsite[] };
export type SuperadminChatbotsPayload = { chatbots: SuperadminChatbot[] };
export type SuperadminIntegrationsPayload = { integrations: SuperadminIntegration[] };

export type SuperadminResourceKind = "users" | "websites" | "chatbots" | "integrations";
