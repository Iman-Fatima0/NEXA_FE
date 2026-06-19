import { notFound } from "next/navigation";
import KeycapPreviewFullClient from "../../../../../../components/gallery/KeycapPreviewFullClient";
import { fetchWebsitePreviewServer } from "../../../../../../lib/api/server-screen-fetch";
import { resolveWebsitePreviewBackNav } from "../../../../../../lib/website-preview-nav";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function WebsiteFullPreviewPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  const item = await fetchWebsitePreviewServer(id);
  if (!item) {
    notFound();
  }
  const { backHref, backAriaLabel } = resolveWebsitePreviewBackNav(id, from);
  return (
    <KeycapPreviewFullClient
      itemId={id}
      entity="website"
      backHref={backHref}
      backAriaLabel={backAriaLabel}
      entityNoun="site"
      initialItem={item}
    />
  );
}
