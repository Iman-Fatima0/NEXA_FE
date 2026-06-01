import { WebsiteSectionsView } from "../../lib/website-sections";
import type { PublicWebsitePayload } from "../../lib/fetch-user-websites";

type PublicSiteViewProps = Readonly<{
  site: PublicWebsitePayload;
  activePageKey?: string | null;
}>;

export function PublicSiteView({ site, activePageKey }: PublicSiteViewProps) {
  const pageLinks =
    site.pages && site.pages.length > 0
      ? [
          { key: "_home", name: "Home", href: `/s/${encodeURIComponent(site.slug)}` },
          ...site.pages.map((p) => ({
            key: p.key,
            name: p.name,
            href: `/s/${encodeURIComponent(site.slug)}/${encodeURIComponent(p.path || p.key)}`,
          })),
        ]
      : undefined;

  return (
    <main style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <WebsiteSectionsView
        name={site.name}
        themeColor={site.themeColor}
        logo={site.logo}
        sections={site.sections}
        activePageKey={activePageKey ?? undefined}
        pageLinks={pageLinks}
      />
    </main>
  );
}
