import type {
  DashboardActivity,
  DashboardActivityChip,
  DashboardActivityLine,
  DashboardPayload,
  DashboardProject,
  DashboardProjectType,
  DashboardUser,
} from "./dashboard-types";

function str(v: unknown, fallback = ""): string {
  if (v == null) {
    return fallback;
  }
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
    return String(v);
  }
  if (typeof v === "object") {
    try {
      return JSON.stringify(v);
    } catch {
      return fallback;
    }
  }
  return String(v);
}

function unwrapPayload(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  if (o.data && typeof o.data === "object") {
    return o.data as Record<string, unknown>;
  }
  if (o.payload && typeof o.payload === "object") {
    return o.payload as Record<string, unknown>;
  }
  if (o.result && typeof o.result === "object") {
    return o.result as Record<string, unknown>;
  }
  return o;
}

function normProjectType(v: unknown): DashboardProjectType | null {
  const s = str(v).toLowerCase().split(/\s+/).join("_");
  if (s === "website" || s === "site" || s === "web") {
    return "website";
  }
  if (s === "chatbot" || s === "bot" || s === "chat_bot") {
    return "chatbot";
  }
  if (s === "integration" || s === "integrate" || s === "connector") {
    return "integration";
  }
  return null;
}

function pickProjects(root: Record<string, unknown>): unknown[] {
  const v = root.projects ?? root.project_list ?? root.user_projects ?? root.items;
  return Array.isArray(v) ? v : [];
}

function pickActivity(root: Record<string, unknown>): unknown[] {
  const v =
    root.activity ??
    root.activities ??
    root.tasks ??
    root.task_history ??
    root.recent_activity ??
    root.events ??
    root.timeline ??
    root.history ??
    root.user_history;
  return Array.isArray(v) ? v : [];
}

function pickActivityLines(a: Record<string, unknown>): DashboardActivityLine[] | undefined {
  const raw = a.items ?? a.steps ?? a.lines;
  if (!Array.isArray(raw)) {
    return undefined;
  }
  const out: DashboardActivityLine[] = [];
  for (const el of raw) {
    if (!el || typeof el !== "object") {
      continue;
    }
    const o = el as Record<string, unknown>;
    const label = str(o.label ?? o.name ?? o.title ?? o.text, "").trim();
    if (!label) {
      continue;
    }
    const valueRaw = o.value ?? o.total ?? o.count ?? o.right ?? o.reps;
    const value = valueRaw == null || valueRaw === "" ? undefined : str(valueRaw).trim() || undefined;
    out.push({ label, value });
  }
  return out.length ? out : undefined;
}

function normChipTone(v: unknown): DashboardActivityChip["tone"] | undefined {
  const s = str(v).toLowerCase();
  if (s === "blue" || s === "green" || s === "amber" || s === "violet" || s === "slate") {
    return s;
  }
  return undefined;
}

function pickActivityChips(a: Record<string, unknown>): DashboardActivityChip[] | undefined {
  const raw = a.chips ?? a.badges ?? a.tags;
  if (!Array.isArray(raw)) {
    return undefined;
  }
  const out: DashboardActivityChip[] = [];
  for (const el of raw) {
    if (typeof el === "string") {
      const t = el.trim();
      if (t) {
        out.push({ label: t });
      }
      continue;
    }
    if (!el || typeof el !== "object") {
      continue;
    }
    const o = el as Record<string, unknown>;
    const label = str(o.label ?? o.text ?? o.name, "").trim();
    if (!label) {
      continue;
    }
    out.push({ label, tone: normChipTone(o.tone ?? o.variant ?? o.color) });
  }
  return out.length ? out : undefined;
}

function pickUser(root: Record<string, unknown>): DashboardUser | undefined {
  const u = root.user ?? root.me ?? root.profile ?? root.account;
  if (!u || typeof u !== "object") {
    return undefined;
  }
  const o = u as Record<string, unknown>;
  const displayName = str(o.displayName ?? o.display_name ?? o.name ?? o.fullName ?? o.full_name ?? o.username).trim() || undefined;
  const email = str(o.email).trim() || undefined;
  if (!displayName && !email) {
    return undefined;
  }
  return { displayName, email };
}

/**
 * Maps common backend JSON (including snake_case) into `DashboardPayload`.
 */
export function normalizeDashboardPayload(raw: unknown): DashboardPayload | null {
  const root = unwrapPayload(raw);
  if (!root) {
    return null;
  }

  const projectsIn = pickProjects(root);
  const activityIn = pickActivity(root);

  const projects: DashboardProject[] = [];
  for (let i = 0; i < projectsIn.length; i++) {
    const item = projectsIn[i];
    if (!item || typeof item !== "object") {
      continue;
    }
    const p = item as Record<string, unknown>;
    const type = normProjectType(p.type ?? p.project_type ?? p.category);
    if (!type) {
      continue;
    }
    const id = str(p.id ?? p._id ?? p.uuid) || `project-${i}`;
    const name = str(p.name ?? p.title ?? p.label, "Untitled");
    const status = str(p.status ?? p.state ?? p.phase, "—");
    const updatedAt = str(p.updatedAt ?? p.updated_at ?? p.modified_at ?? p.last_updated, new Date().toISOString());
    const hrefRaw = p.href ?? p.url ?? p.link;
    const href = hrefRaw == null || hrefRaw === "" ? undefined : str(hrefRaw);
    projects.push({ id, type, name, status, updatedAt, href });
  }

  const activity: DashboardActivity[] = [];
  for (let i = 0; i < activityIn.length; i++) {
    const item = activityIn[i];
    if (!item || typeof item !== "object") {
      continue;
    }
    const a = item as Record<string, unknown>;
    const id = str(a.id ?? a._id ?? a.uuid) || `activity-${i}`;
    const kind = str(a.kind ?? a.type ?? a.event_type ?? a.action, "event");
    const title = str(a.title ?? a.message ?? a.summary ?? a.name, "Activity");
    const detailRaw = a.detail ?? a.description ?? a.body ?? a.meta;
    let detail: string | undefined;
    if (detailRaw == null || detailRaw === "") {
      detail = undefined;
    } else if (typeof detailRaw === "object") {
      detail = JSON.stringify(detailRaw);
    } else {
      detail = str(detailRaw);
    }
    const createdAt = str(a.createdAt ?? a.created_at ?? a.timestamp ?? a.occurred_at, new Date().toISOString());
    const subtitle = str(a.subtitle ?? a.sub_title ?? a.duration_label ?? a.duration, "").trim() || undefined;
    const items = pickActivityLines(a);
    const footer = str(a.footer ?? a.summary_line, "").trim() || undefined;
    const chips = pickActivityChips(a);
    const row: DashboardActivity = { id, kind, title, detail, createdAt };
    if (subtitle) {
      row.subtitle = subtitle;
    }
    if (items) {
      row.items = items;
    }
    if (footer) {
      row.footer = footer;
    }
    if (chips) {
      row.chips = chips;
    }
    activity.push(row);
  }

  const user = pickUser(root);
  return user ? { projects, activity, user } : { projects, activity };
}
