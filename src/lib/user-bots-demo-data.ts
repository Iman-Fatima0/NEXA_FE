import type { UserBot } from "./user-bots-types";

function miniPreview(label: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 25% 30%,rgba(80,120,220,.18),transparent 50%),radial-gradient(circle at 75% 70%,rgba(180,100,200,.14),transparent 48%),#0e1018;color:rgba(226,232,240,.8);font:13px system-ui,sans-serif}</style></head><body>${label}</body></html>`;
}

export function getDemoBots(): UserBot[] {
  return [
    {
      id: "b-1",
      name: "Support Concierge",
      description: "Answers FAQs, routes tickets, and hands off to humans when needed.",
      createdAt: "2026-03-01T10:00:00.000Z",
      updatedAt: "2026-04-05T11:00:00.000Z",
      previewHtml: miniPreview("Support"),
      href: "/chatbot-builder/trained",
    },
    {
      id: "b-2",
      name: "Sales Assistant",
      description: "Product recommendations and lead capture tuned for your catalog.",
      highlight: true,
      createdAt: "2026-02-10T08:00:00.000Z",
      updatedAt: "2026-04-11T09:30:00.000Z",
      previewHtml: miniPreview("Sales"),
      href: "/chatbot-builder/trained",
    },
    {
      id: "b-3",
      name: "Onboarding Guide",
      description: "Walks new users through setup with contextual tips.",
      createdAt: "2026-01-20T15:30:00.000Z",
      updatedAt: "2026-03-18T16:00:00.000Z",
      previewHtml: miniPreview("Guide"),
      href: "/chatbot-builder/trained",
    },
  ];
}

export function getDemoBotById(id: string): UserBot | undefined {
  return getDemoBots().find((b) => b.id === id);
}
