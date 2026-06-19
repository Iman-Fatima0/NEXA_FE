"use client";

import { useCallback } from "react";
import KeycapTilesGalleryClient from "../../components/gallery/KeycapTilesGalleryClient";
import { innovateIntegrationEntry } from "../../lib/dashboard-app-hubs";
import { fetchUserIntegrations } from "../../lib/fetch-user-integrations";
import type { UserGalleryItem } from "../../lib/user-gallery-item";

type IntegrationGalleryClientProps = Readonly<{
  initialIntegrations?: UserGalleryItem[];
  initialError?: string | null;
}>;

export default function IntegrationGalleryClient({
  initialIntegrations,
  initialError = null,
}: IntegrationGalleryClientProps) {
  const fetchItems = useCallback(async () => (await fetchUserIntegrations()).integrations, []);

  return (
    <KeycapTilesGalleryClient
      entity="integration"
      title="Your integrations"
      subtitle=""
      topRightCornerLabel="INTEGRATION VAULT"
      emptyMessage="No integrations yet. Create one below to get started."
      errorLoadMessage="Could not load integrations."
      fetchItems={fetchItems}
      initialItems={initialIntegrations}
      initialError={initialError}
      dashboardBackHref="/dashboard"
      previewHref={(id) => `/dashboard/integrations/${encodeURIComponent(id)}/preview`}
      ctaHref={innovateIntegrationEntry}
      ctaButtonText="Create integration"
      ctaSectionAriaLabel="Create integration"
    />
  );
}
