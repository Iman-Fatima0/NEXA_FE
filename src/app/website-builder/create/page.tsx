import { cookies } from "next/headers";
import { Suspense } from "react";
import { hubBackHrefForSession } from "../../../lib/auth/hub-nav-for-session";
import WebsiteBuilderClient from "../WebsiteBuilderClient";

export default async function WebsiteBuilderCreatePage() {
  const jar = await cookies();
  return (
    <Suspense fallback={null}>
      <WebsiteBuilderClient hubBackHref={hubBackHrefForSession(jar, "website")} />
    </Suspense>
  );
}
