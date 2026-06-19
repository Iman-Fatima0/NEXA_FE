import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchUserBotsServer } from "../../../../lib/api/server-gallery-fetch";
import { SESSION_COOKIE } from "../../../../lib/auth/session-cookie-names";
import ChatbotGalleryClient from "../../../chatbot-builder/ChatbotGalleryClient";

export default async function DashboardBotsHubPage() {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/bots")}`);
  }

  const { items, error } = await fetchUserBotsServer();
  if (error === "Unauthorized") {
    redirect(`/login?next=${encodeURIComponent("/dashboard/bots")}`);
  }

  return <ChatbotGalleryClient initialBots={items} initialError={error ?? null} />;
}
