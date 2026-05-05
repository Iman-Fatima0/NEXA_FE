import { cookies } from "next/headers";
import { hubBackHrefForSession } from "../../../lib/auth/hub-nav-for-session";
import WebsiteBuilderClient from "../WebsiteBuilderClient";

export default async function WebsiteBuilderCreatePage() {
  const jar = await cookies();
  return <WebsiteBuilderClient hubBackHref={hubBackHrefForSession(jar, "website")} />;
}
