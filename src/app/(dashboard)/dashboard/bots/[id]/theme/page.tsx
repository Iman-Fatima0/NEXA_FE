import BotThemeBuilderClient from "./BotThemeBuilderClient";

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default async function BotThemePage({ params }: PageProps) {
  const { id } = await params;
  return <BotThemeBuilderClient botId={id} />;
}
