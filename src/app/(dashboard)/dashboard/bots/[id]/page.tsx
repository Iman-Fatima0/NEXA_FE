import BotDetailClient from "./BotDetailClient";

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default async function BotDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <BotDetailClient botId={id} />;
}
