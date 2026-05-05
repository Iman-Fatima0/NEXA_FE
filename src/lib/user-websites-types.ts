/** Response shape for `GET /api/user/websites` (BFF) — upstream contract: `lib/api/nexa-backend-contract.ts`. */

import type { UserGalleryItem } from "./user-gallery-item";

export type UserWebsite = UserGalleryItem;

export type UserWebsitesPayload = {
  websites: UserWebsite[];
};
