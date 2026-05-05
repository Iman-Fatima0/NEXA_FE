import type { UserIntegration } from "./user-integrations-types";

function miniPreview(label: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 20% 25%,rgba(34,180,120,.16),transparent 48%),radial-gradient(circle at 85% 75%,rgba(220,140,60,.14),transparent 46%),#0c1012;color:rgba(226,232,240,.78);font:13px system-ui,sans-serif}</style></head><body>${label}</body></html>`;
}

export function getDemoIntegrations(): UserIntegration[] {
  return [
    {
      id: "i-1",
      name: "Site + Support bot",
      description: "Widget on marketing site, bubble bottom-right, synced knowledge base.",
      createdAt: "2026-03-12T09:00:00.000Z",
      updatedAt: "2026-04-08T12:00:00.000Z",
      previewHtml: miniPreview("Widget"),
      href: "/integration-manager/completed",
    },
    {
      id: "i-2",
      name: "Checkout assistant",
      description: "Embedded on storefront pages with cart-aware responses.",
      highlight: true,
      createdAt: "2026-02-28T16:00:00.000Z",
      updatedAt: "2026-04-12T10:15:00.000Z",
      previewHtml: miniPreview("Checkout"),
      href: "/integration-manager/completed",
    },
    {
      id: "i-3",
      name: "Docs portal",
      description: "In-page help on your documentation hub with search grounding.",
      createdAt: "2026-01-30T12:00:00.000Z",
      updatedAt: "2026-03-28T08:45:00.000Z",
      previewHtml: miniPreview("Docs"),
      href: "/integration-manager/completed",
    },
  ];
}

export function getDemoIntegrationById(id: string): UserIntegration | undefined {
  return getDemoIntegrations().find((i) => i.id === id);
}
