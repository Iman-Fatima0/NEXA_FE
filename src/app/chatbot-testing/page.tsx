import { cookies } from "next/headers";
import { hubBackHrefForSession } from "../../lib/auth/hub-nav-for-session";
import ChatbotTestingClient from "./ChatbotTestingClient";

export default async function ChatbotTestingPage() {
  const jar = await cookies();
  const backHref = hubBackHrefForSession(jar, "bot");
  const editHref = "/chatbot-builder/trained";
  return <ChatbotTestingClient hubBackHref={backHref} editHref={editHref} />;
}
