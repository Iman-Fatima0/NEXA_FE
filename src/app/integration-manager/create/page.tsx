import { cookies } from "next/headers";
import { hubBackHrefForSession } from "../../../lib/auth/hub-nav-for-session";
import IntegrationManagerClient from "../IntegrationManagerClient";

export default async function IntegrationManagerCreatePage() {
  const jar = await cookies();
  return <IntegrationManagerClient hubBackHref={hubBackHrefForSession(jar, "integration")} />;
}
