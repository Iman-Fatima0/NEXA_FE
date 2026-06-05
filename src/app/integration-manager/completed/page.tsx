import { cookies } from "next/headers";
import { Suspense } from "react";
import { hubBackHrefForSession } from "../../../lib/auth/hub-nav-for-session";
import IntegrationCompletedClient from "./IntegrationCompletedClient";

export default async function IntegrationCompletedPage() {
  const jar = await cookies();
  const backHref = hubBackHrefForSession(jar, "integration");
  return (
    <Suspense fallback={null}>
      <IntegrationCompletedClient hubBackHref={backHref} />
    </Suspense>
  );
}
