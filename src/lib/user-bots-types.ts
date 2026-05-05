import type { UserGalleryItem } from "./user-gallery-item";

export type UserBot = UserGalleryItem;

export type UserBotsPayload = {
  bots: UserBot[];
};
