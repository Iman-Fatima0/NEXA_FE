import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchUserIntegrationsServer } from "../../../../lib/api/server-gallery-fetch";
import { SESSION_COOKIE } from "../../../../lib/auth/session-cookie-names";
import IntegrationGalleryClient from "../../../integration-manager/IntegrationGalleryClient";

export default async function DashboardIntegrationsHubPage() {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/integrations")}`);
  }

  const { items, error } = await fetchUserIntegrationsServer();
  if (error === "Unauthorized") {
    redirect(`/login?next=${encodeURIComponent("/dashboard/integrations")}`);
  }

  return <IntegrationGalleryClient initialIntegrations={items} initialError={error ?? null} />;
}
