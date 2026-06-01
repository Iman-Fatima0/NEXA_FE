import { notFound } from "next/navigation";
import { PublicSiteView } from "../../../../components/sites/PublicSiteView";
import { fetchPublicWebsitePageFromBackend } from "../../../../lib/fetch-user-websites";

type PageProps = { params: Promise<{ slug: string; pageKey: string }> };

export default async function PublicSitePageRoute({ params }: PageProps) {
  const { slug, pageKey } = await params;
  try {
    const site = await fetchPublicWebsitePageFromBackend(slug, pageKey);
    return <PublicSiteView site={site} activePageKey={pageKey} />;
  } catch {
    notFound();
  }
}
