import { BFF_PATHS } from "../api/bff-paths";
import type { SuperadminResourceKind } from "./types";

const ITEM_PATH: Record<SuperadminResourceKind, (id: string) => string> = {
  users: BFF_PATHS.superadminUser,
  websites: BFF_PATHS.superadminWebsite,
  chatbots: BFF_PATHS.superadminChatbot,
  integrations: BFF_PATHS.superadminIntegration,
};

/** Client-safe item URL — do not pass path functions from Server Components. */
export function superadminItemApiPath(kind: SuperadminResourceKind, id: string): string {
  return ITEM_PATH[kind](id);
}
