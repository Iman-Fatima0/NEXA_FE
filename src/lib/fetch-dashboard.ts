import { BFF_PATHS } from "./api/bff-paths";
import type { DashboardPayload } from "./dashboard-types";

export async function fetchDashboardPayload(): Promise<DashboardPayload> {
  const res = await fetch(BFF_PATHS.dashboard, {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (res.status === 401) {
    const path = globalThis.location.pathname + globalThis.location.search;
    globalThis.location.replace(`/login?next=${encodeURIComponent(path)}`);
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    let msg = `Could not load data (${res.status}).`;
    try {
      const j = (await res.json()) as { message?: string };
      if (typeof j.message === "string" && j.message.trim()) {
        msg = j.message.trim();
      }
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return (await res.json()) as DashboardPayload;
}
