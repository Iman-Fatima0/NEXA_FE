import type { UserWebsite } from "./user-websites-types";

function miniPreview(label: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 30% 20%,rgba(120,80,200,.2),transparent 50%),radial-gradient(circle at 80% 80%,rgba(220,100,80,.15),transparent 45%),#0e0e12;color:rgba(226,232,240,.75);font:13px system-ui,sans-serif}</style></head><body>${label}</body></html>`;
}

/** Replace with your backend: list endpoint should return the same shape. */
export function getDemoWebsites(): UserWebsite[] {
  return [
    {
      id: "demo-1",
      name: "Promo Code",
      description: "Campaign landing, discount tiers, and partner tracking in one view.",
      createdAt: "2026-03-18T09:00:00.000Z",
      updatedAt: "2026-04-02T10:00:00.000Z",
      previewHtml: miniPreview("Promo"),
      href: "/website-builder/generated",
    },
    {
      id: "demo-2",
      name: "Affiliate Network",
      description: "Dashboard for referrals, payouts, and network health — featured layout.",
      highlight: true,
      createdAt: "2026-02-22T14:00:00.000Z",
      updatedAt: "2026-04-10T08:00:00.000Z",
      previewHtml: miniPreview("Affiliate"),
      href: "/website-builder/generated",
    },
    {
      id: "demo-3",
      name: "Referral Program",
      description: "Invite flows, rewards, and conversion funnels ready for your branding.",
      createdAt: "2026-01-08T11:20:00.000Z",
      updatedAt: "2026-03-22T14:30:00.000Z",
      previewHtml: miniPreview("Referral"),
      href: "/website-builder/generated",
    },
  ];
}

export function getDemoWebsiteById(id: string): UserWebsite | undefined {
  return getDemoWebsites().find((w) => w.id === id);
}
