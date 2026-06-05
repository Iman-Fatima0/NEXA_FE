import { cookies } from "next/headers";
import { Suspense } from "react";
import { hubBackHrefForSession } from "../../../lib/auth/hub-nav-for-session";
import IntegrationManagerClient from "../IntegrationManagerClient";

export default async function IntegrationManagerCreatePage() {
  const jar = await cookies();
  return (
    <Suspense fallback={null}>
      <IntegrationManagerClient hubBackHref={hubBackHrefForSession(jar, "integration")} />
    </Suspense>
  );
}
