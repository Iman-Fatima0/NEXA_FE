import type { UserGalleryItem } from "./user-gallery-item";

export type UserIntegration = UserGalleryItem;

export type UserIntegrationsPayload = {
  integrations: UserIntegration[];
};
