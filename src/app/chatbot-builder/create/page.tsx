import { cookies } from "next/headers";
import { hubBackHrefForSession } from "../../../lib/auth/hub-nav-for-session";
import ChatbotBuilderClient from "../ChatbotBuilderClient";

export default async function ChatbotBuilderCreatePage() {
  const jar = await cookies();
  return <ChatbotBuilderClient hubBackHref={hubBackHrefForSession(jar, "bot")} />;
}
