import { notFound } from "next/navigation";
import { WebsiteSectionsView } from "../../../lib/website-sections";
import { fetchPublicWebsiteBySlugFromBackend } from "../../../lib/fetch-user-websites";

type PageProps = { params: Promise<{ slug: string }> };

export default async function PublicSitePage({ params }: PageProps) {
  const { slug } = await params;
  try {
    const site = await fetchPublicWebsiteBySlugFromBackend(slug);
    return (
      <main style={{ minHeight: "100vh", background: "#f9fafb" }}>
        <WebsiteSectionsView
          name={site.name}
          themeColor={site.themeColor}
          logo={site.logo}
          sections={site.sections}
        />
      </main>
    );
  } catch {
    notFound();
  }
}
