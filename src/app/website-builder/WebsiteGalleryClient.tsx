"use client";

import { useCallback, useState } from "react";
import KeycapTilesGalleryClient from "../../components/gallery/KeycapTilesGalleryClient";
import { innovateWebsiteEntry } from "../../lib/dashboard-app-hubs";
import { fetchUserWebsites } from "../../lib/fetch-user-websites";

export default function WebsiteGalleryClient() {
  const [configHint, setConfigHint] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    const payload = await fetchUserWebsites();
    setConfigHint(payload.hint ?? null);
    return payload.websites;
  }, []);

  const emptyMessage = configHint
    ? configHint
    : "No websites yet. Create one below to get started.";

  return (
    <KeycapTilesGalleryClient
      entity="website"
      title="Your websites"
      subtitle=""
      topRightCornerLabel="WEB VERSE"
      emptyMessage={emptyMessage}
      errorLoadMessage="Could not load websites. Check that you are signed in and the API is running."
      fetchItems={fetchItems}
      dashboardBackHref="/dashboard"
      previewHref={(id) => `/dashboard/websites/${encodeURIComponent(id)}/preview`}
      ctaHref={innovateWebsiteEntry}
      ctaButtonText="Create your website"
      ctaSectionAriaLabel="Create website"
    />
  );
}
