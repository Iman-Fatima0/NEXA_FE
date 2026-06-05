import PublicEmbedClient from "./PublicEmbedClient";

type PageProps = { params: Promise<{ slug: string }> };

export default async function PublicEmbedPage({ params }: PageProps) {
  const { slug } = await params;
  return <PublicEmbedClient slug={slug} />;
}
