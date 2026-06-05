import { WebsiteSectionsView, displaySectionName } from "../../lib/website-sections";
import { sectionAnchorId } from "../../lib/website-section-links";
import type { PublicWebsitePayload } from "../../lib/fetch-user-websites";

type PublicSiteViewProps = Readonly<{
  site: PublicWebsitePayload;
  activePageKey?: string | null;
}>;

export function PublicSiteView({ site, activePageKey }: PublicSiteViewProps) {
  const pageLinks =
    activePageKey && site.pages && site.pages.length > 0
      ? site.pages.map((p) => ({
          key: p.key,
          name: displaySectionName(p.name, p.key, p.key === site.pages![0]?.key),
          href: `/s/${encodeURIComponent(site.slug)}#${sectionAnchorId(p.key)}`,
        }))
      : undefined;

  return (
    <main className="nexa-site-page-root" style={{ margin: 0, padding: 0 }}>
      <WebsiteSectionsView
        name={site.name}
        themeColor={site.themeColor}
        logo={site.logo}
        sections={site.sections}
        activePageKey={activePageKey ?? undefined}
        pageLinks={pageLinks}
        siteSlug={site.slug}
      />
    </main>
  );
}
