"use client";

import { useCallback } from "react";
import KeycapTilesGalleryClient from "../../components/gallery/KeycapTilesGalleryClient";
import { innovateChatbotEntry } from "../../lib/dashboard-app-hubs";
import { fetchUserBots } from "../../lib/fetch-user-bots";
import type { UserGalleryItem } from "../../lib/user-gallery-item";

type ChatbotGalleryClientProps = Readonly<{
  initialBots?: UserGalleryItem[];
  initialError?: string | null;
}>;

export default function ChatbotGalleryClient({
  initialBots,
  initialError = null,
}: ChatbotGalleryClientProps) {
  const fetchItems = useCallback(async () => (await fetchUserBots()).bots, []);

  return (
    <KeycapTilesGalleryClient
      entity="bot"
      title="Your bots"
      subtitle=""
      topRightCornerLabel="BOT VAULT"
      emptyMessage="No bots yet. Create one below to get started."
      errorLoadMessage="Could not load bots."
      fetchItems={fetchItems}
      initialItems={initialBots}
      initialError={initialError}
      dashboardBackHref="/dashboard"
      previewHref={(id) => `/dashboard/bots/${encodeURIComponent(id)}`}
      ctaHref={innovateChatbotEntry}
      ctaButtonText="Create your bot"
      ctaSectionAriaLabel="Create bot"
    />
  );
}
