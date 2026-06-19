import { dashboardWebsiteHub } from "./dashboard-app-hubs";

/** Query value: full preview opened from website builder edit screen. */
export const WEBSITE_PREVIEW_FROM_BUILDER = "builder";

export function websiteFullPreviewHref(websiteId: string, from?: typeof WEBSITE_PREVIEW_FROM_BUILDER): string {
  const base = `/dashboard/websites/${encodeURIComponent(websiteId)}/preview`;
  return from === WEBSITE_PREVIEW_FROM_BUILDER ? `${base}?from=${WEBSITE_PREVIEW_FROM_BUILDER}` : base;
}

export function resolveWebsitePreviewBackNav(
  websiteId: string,
  from: string | undefined,
): { backHref: string; backAriaLabel: string } {
  if (from?.trim().toLowerCase() === WEBSITE_PREVIEW_FROM_BUILDER) {
    return {
      backHref: `/website-builder/create?id=${encodeURIComponent(websiteId)}`,
      backAriaLabel: "Back to editor",
    };
  }
  return {
    backHref: dashboardWebsiteHub,
    backAriaLabel: "Back to sites",
  };
}
