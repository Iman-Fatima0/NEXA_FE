import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchDashboardPayloadServer } from "../../../lib/api/server-dashboard-fetch";
import { SESSION_COOKIE } from "../../../lib/auth/session-cookie-names";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  const payload = await fetchDashboardPayloadServer();
  if (!payload) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  return <DashboardClient initialUser={payload.user ?? null} />;
}
