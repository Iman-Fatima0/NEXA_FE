"use client";

import { useCallback } from "react";
import KeycapTilesGalleryClient from "../../components/gallery/KeycapTilesGalleryClient";
import { innovateIntegrationEntry } from "../../lib/dashboard-app-hubs";
import { fetchUserIntegrations } from "../../lib/fetch-user-integrations";

export default function IntegrationGalleryClient() {
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
      dashboardBackHref="/dashboard"
      previewHref={(id) => `/dashboard/integrations/${encodeURIComponent(id)}/preview`}
      ctaHref={innovateIntegrationEntry}
      ctaButtonText="Create integration"
      ctaSectionAriaLabel="Create integration"
    />
  );
}
