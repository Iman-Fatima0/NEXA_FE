import { deletePlatformBot } from "../chatbot/chatbot-platform-api";
import { deleteUserWebsite } from "../fetch-user-websites";
import { disconnectIntegration } from "../integration/integration-api";
import type { KeycapGalleryEntity } from "../../components/gallery/KeycapTilesGalleryClient";

export type DeleteConfirmCopy = {
  title: string;
  message: string;
  confirmLabel: string;
};

export function deleteConfirmCopy(entity: KeycapGalleryEntity, name: string): DeleteConfirmCopy {
  const quoted = `"${name}"`;
  if (entity === "website") {
    return {
      title: "Delete website?",
      message: `${quoted} and its content will be permanently removed. This cannot be undone.`,
      confirmLabel: "Delete website",
    };
  }
  if (entity === "bot") {
    return {
      title: "Delete chatbot?",
      message: `${quoted} and its documents and chat history will be permanently removed.`,
      confirmLabel: "Delete chatbot",
    };
  }
  return {
    title: "Remove connection?",
    message: `The chat widget will be removed from ${quoted}. The website and chatbot will not be deleted.`,
    confirmLabel: "Remove connection",
  };
}

export async function deleteGalleryItem(entity: KeycapGalleryEntity, id: string): Promise<void> {
  if (entity === "website") {
    await deleteUserWebsite(id);
    return;
  }
  if (entity === "bot") {
    await deletePlatformBot(id);
    return;
  }
  await disconnectIntegration(id);
}
