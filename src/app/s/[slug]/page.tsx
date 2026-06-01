import { notFound } from "next/navigation";
import { PublicSiteView } from "../../../components/sites/PublicSiteView";
import { fetchPublicWebsiteBySlugFromBackend } from "../../../lib/fetch-user-websites";

type PageProps = { params: Promise<{ slug: string }> };

export default async function PublicSitePage({ params }: PageProps) {
  const { slug } = await params;
  try {
    const site = await fetchPublicWebsiteBySlugFromBackend(slug);
    return <PublicSiteView site={site} />;
  } catch {
    notFound();
  }
}
