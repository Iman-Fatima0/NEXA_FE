import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchUserWebsitesServer } from "../../../../lib/api/server-gallery-fetch";
import { SESSION_COOKIE } from "../../../../lib/auth/session-cookie-names";
import WebsiteGalleryClient from "../../../website-builder/WebsiteGalleryClient";

export default async function DashboardWebsitesHubPage() {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/websites")}`);
  }

  const { items, hint, error } = await fetchUserWebsitesServer();
  if (error === "Unauthorized") {
    redirect(`/login?next=${encodeURIComponent("/dashboard/websites")}`);
  }

  return (
    <WebsiteGalleryClient
      initialWebsites={items}
      initialHint={hint ?? null}
      initialError={error ?? null}
    />
  );
}
