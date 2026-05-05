"use client";

import { useCallback } from "react";
import KeycapTilesGalleryClient from "../../components/gallery/KeycapTilesGalleryClient";
import { innovateWebsiteEntry } from "../../lib/dashboard-app-hubs";
import { fetchUserWebsites } from "../../lib/fetch-user-websites";

export default function WebsiteGalleryClient() {
  const fetchItems = useCallback(async () => (await fetchUserWebsites()).websites, []);

  return (
    <KeycapTilesGalleryClient
      entity="website"
      title="Your websites"
      subtitle=""
      topRightCornerLabel="WEB VERSE"
      emptyMessage="No websites yet. Create one below to get started."
      errorLoadMessage="Could not load websites."
      fetchItems={fetchItems}
      dashboardBackHref="/dashboard"
      previewHref={(id) => `/dashboard/websites/${encodeURIComponent(id)}/preview`}
      ctaHref={innovateWebsiteEntry}
      ctaButtonText="Create your website"
      ctaSectionAriaLabel="Create website"
    />
  );
}
