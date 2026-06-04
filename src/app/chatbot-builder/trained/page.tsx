import { cookies } from "next/headers";
import { Suspense } from "react";
import { dashboardPathOrLogin, hubBackHrefForSession } from "../../../lib/auth/hub-nav-for-session";
import ChatbotTrainedClient from "../ChatbotTrainedClient";

export default async function TrainedChatbotPage() {
  const jar = await cookies();
  const backHref = hubBackHrefForSession(jar, "bot");
  const saveHref = dashboardPathOrLogin(jar, "/dashboard/bots");
  return (
    <Suspense fallback={null}>
      <ChatbotTrainedClient backHref={backHref} saveHref={saveHref} />
    </Suspense>
  );
}
