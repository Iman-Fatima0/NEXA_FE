/** Shapes your backend should return from `GET /dashboard` (path override: `BACKEND_DASHBOARD_PATH`). */

export type DashboardProjectType = "website" | "chatbot" | "integration";

/** Optional signed-in user block from the dashboard API (any subset). */
export type DashboardUser = {
  displayName?: string;
  email?: string;
};

export type DashboardProject = {
  id: string;
  type: DashboardProjectType;
  name: string;
  status: string;
  /** ISO 8601 */
  updatedAt: string;
  /** Optional link target in the app */
  href?: string;
};

/** Optional row chips (e.g. metrics); API may send `badges` / `tags`. */
export type DashboardActivityChip = {
  label: string;
  tone?: "blue" | "green" | "amber" | "violet" | "slate";
};

/** Optional structured lines (e.g. training steps); API may send `items` / `steps` / `lines`. */
export type DashboardActivityLine = {
  label: string;
  value?: string;
};

export type DashboardActivity = {
  id: string;
  /** Short machine kind, e.g. `website.generated`, `chatbot.trained`, `integration.connected` */
  kind: string;
  title: string;
  detail?: string;
  /** ISO 8601 */
  createdAt: string;
  /** Second line under title, e.g. duration (`subtitle`, `sub_label`, `duration_label`, `duration`) */
  subtitle?: string;
  /** Two-column rows (`items`, `steps`, `lines` — each `label` + optional `value` / `total` / `count`) */
  items?: DashboardActivityLine[];
  /** Line after items (`footer`, `summary_line`) */
  footer?: string;
  /** Small labels (`chips`, `badges`, `tags` — string or `{ label, tone? }`) */
  chips?: DashboardActivityChip[];
};

/** Added by `GET /api/dashboard`: live upstream data, or empty payload until the API base URL is set. */
export type DashboardMeta = {
  source: "api" | "pending";
  /** ISO time this payload was assembled (always set by the BFF route). */
  fetchedAt: string;
};

export type DashboardPayload = {
  projects: DashboardProject[];
  activity: DashboardActivity[];
  user?: DashboardUser;
  meta?: DashboardMeta;
};
