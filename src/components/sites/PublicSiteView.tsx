import { WebsiteSectionsView, displaySectionName } from "../../lib/website-sections";
import { sectionAnchorId } from "../../lib/website-section-links";
import type { PublicWebsitePayload } from "../../lib/fetch-user-websites";
import { readChatIntegrationFromSections } from "../../lib/integration/chat-integration";
import { SiteChatWidget } from "./SiteChatWidget";

type PublicSiteViewProps = Readonly<{
  site: PublicWebsitePayload;
  activePageKey?: string | null;
}>;

export function PublicSiteView({ site, activePageKey }: PublicSiteViewProps) {
  const pageLinks =
    activePageKey && site.pages && site.pages.length > 0
      ? site.pages.map((p) => ({
          key: p.key,
          name: displaySectionName(p.name, p.key),
          href: `/s/${encodeURIComponent(site.slug)}#${sectionAnchorId(p.key)}`,
        }))
      : undefined;

  const chatIntegration = readChatIntegrationFromSections(site.sections);

  return (
    <main className="nexa-site-page-root" style={{ margin: 0, padding: 0 }}>
      <WebsiteSectionsView
        name={site.name}
        theme={site.theme}
        themeColor={site.themeColor}
        logo={site.logo}
        sections={site.sections}
        activePageKey={activePageKey ?? undefined}
        pageLinks={pageLinks}
        siteSlug={site.slug}
      />
      {chatIntegration ? <SiteChatWidget integration={chatIntegration} /> : null}
    </main>
  );
}
