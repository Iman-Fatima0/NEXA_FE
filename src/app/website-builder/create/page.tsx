import { cookies } from "next/headers";
import { Suspense } from "react";
import { fetchWebsiteBuilderScreenServer } from "../../../lib/api/server-screen-fetch";
import { hubBackHrefForSession } from "../../../lib/auth/hub-nav-for-session";
import WebsiteBuilderClient from "../WebsiteBuilderClient";

type PageProps = Readonly<{
  searchParams: Promise<{ id?: string }>;
}>;

export default async function WebsiteBuilderCreatePage({ searchParams }: PageProps) {
  const jar = await cookies();
  const { id } = await searchParams;
  const websiteId = id?.trim() ?? "";
  const initialBuilderScreen = websiteId ? await fetchWebsiteBuilderScreenServer(websiteId) : null;

  return (
    <Suspense fallback={null}>
      <WebsiteBuilderClient
        hubBackHref={hubBackHrefForSession(jar, "website")}
        initialBuilderScreen={initialBuilderScreen}
      />
    </Suspense>
  );
}
