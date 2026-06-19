import { cache } from "react";
import type { DashboardPayload } from "../dashboard-types";
import { composeDashboardFromNest } from "./compose-dashboard";
import { getServerAccessToken } from "./server-session";

/** Dashboard payload for server-rendered hub — avoids client `/api/dashboard` waterfall. */
export const fetchDashboardPayloadServer = cache(async (): Promise<DashboardPayload | null> => {
  const token = await getServerAccessToken();
  if (!token) return null;
  return composeDashboardFromNest(token);
});
