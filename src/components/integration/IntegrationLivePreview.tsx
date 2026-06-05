"use client";

import { SiteChatWidget } from "../sites/SiteChatWidget";
import { WebsiteSectionsView } from "../../lib/website-sections";
import {
  readChatIntegrationFromSections,
  type ChatIntegrationMeta,
} from "../../lib/integration/chat-integration";
import { resolveWebsitePublicUrl } from "../../lib/website-public-url";
import type { UserGalleryItem } from "../../lib/user-gallery-item";

type IntegrationLivePreviewProps = Readonly<{
  site: Pick<
    UserGalleryItem,
    "name" | "theme" | "themeColor" | "logo" | "sections" | "slug" | "status" | "publicUrl"
  >;
  /** When omitted, read from `site.sections._meta.chatIntegration`. */
  integration?: ChatIntegrationMeta | null;
  className?: string;
  minHeight?: number;
}>;

export function readIntegrationFromSite(
  site: Pick<UserGalleryItem, "sections">,
): ChatIntegrationMeta | null {
  return readChatIntegrationFromSections(site.sections);
}

export default function IntegrationLivePreview({
  site,
  integration: integrationProp,
  className,
  minHeight = 420,
}: IntegrationLivePreviewProps) {
  const integration = integrationProp ?? readIntegrationFromSite(site);
  const liveUrl = resolveWebsitePublicUrl({
    publicUrl: site.publicUrl,
    slug: site.slug,
    status: site.status,
  });

  if (liveUrl) {
    return (
      <iframe
        title={`${site.name} with chatbot`}
        src={liveUrl}
        className={className}
        style={{
          border: 0,
          width: "100%",
          height: "100%",
          minHeight,
          borderRadius: 12,
          background: "#0f172a",
        }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        position: "relative",
        minHeight,
        maxHeight: "min(72vh, 640px)",
        overflow: "auto",
        borderRadius: 12,
        background: "#0b0f1a",
      }}
    >
      <WebsiteSectionsView
        name={site.name}
        theme={site.theme}
        themeColor={site.themeColor}
        logo={site.logo}
        sections={site.sections}
        siteSlug={site.slug ?? undefined}
      />
      {integration ? <SiteChatWidget integration={integration} /> : null}
    </div>
  );
}
