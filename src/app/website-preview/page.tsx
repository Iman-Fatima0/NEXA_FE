import { cookies } from "next/headers";
import { Suspense } from "react";
import { hubBackHrefForSession } from "../../lib/auth/hub-nav-for-session";
import WebsitePreviewClient from "./WebsitePreviewClient";

export default async function WebsitePreviewPage() {
  const jar = await cookies();
  return (
    <Suspense fallback={null}>
      <WebsitePreviewClient backHref={hubBackHrefForSession(jar, "website")} />
    </Suspense>
  );
}
