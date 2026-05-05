import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "../../lib/auth/session-cookie-names";

export default async function StartedPage() {
  const jar = await cookies();
  if (jar.get(SESSION_COOKIE)?.value) {
    redirect("/dashboard");
  }
  redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
}
