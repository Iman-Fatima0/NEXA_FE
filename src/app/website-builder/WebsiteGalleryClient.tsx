"use client";

import { useCallback, useState } from "react";
import KeycapTilesGalleryClient from "../../components/gallery/KeycapTilesGalleryClient";
import { innovateWebsiteEntry } from "../../lib/dashboard-app-hubs";
import { fetchUserWebsites } from "../../lib/fetch-user-websites";
import type { UserWebsite } from "../../lib/user-websites-types";

type WebsiteGalleryClientProps = Readonly<{
  initialWebsites?: UserWebsite[];
  initialHint?: string | null;
  initialError?: string | null;
}>;

export default function WebsiteGalleryClient({
  initialWebsites,
  initialHint = null,
  initialError = null,
}: WebsiteGalleryClientProps) {
  const [configHint, setConfigHint] = useState(initialHint);

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
      initialItems={initialWebsites}
      initialError={initialError}
      dashboardBackHref="/dashboard"
      previewHref={(id) => `/dashboard/websites/${encodeURIComponent(id)}/preview`}
      ctaHref={innovateWebsiteEntry}
      ctaButtonText="Create your website"
      ctaSectionAriaLabel="Create website"
    />
  );
}
