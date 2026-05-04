import type { DashboardPayload } from "./dashboard-types";

/** Optional static fixture for tests or demos; the app dashboard route uses the live API only. */
export const DASHBOARD_MOCK: DashboardPayload = {
  projects: [
    {
      id: "p-web-1",
      type: "website",
      name: "My Business Website",
      status: "Published",
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      href: "/website-builder/generated",
    },
    {
      id: "p-web-2",
      type: "website",
      name: "Portfolio Site",
      status: "Draft",
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      href: "/website-builder/generated",
    },
    {
      id: "p-bot-1",
      type: "chatbot",
      name: "Customer Support Bot",
      status: "Active",
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      href: "/chatbot-builder/trained",
    },
    {
      id: "p-bot-2",
      type: "chatbot",
      name: "FAQ Assistant",
      status: "Training",
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      href: "/chatbot-builder/trained",
    },
    {
      id: "p-int-1",
      type: "integration",
      name: "Website + Support bot",
      status: "Live",
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      href: "/integration-manager/completed",
    },
  ],
  activity: [
    {
      id: "a-1",
      kind: "integration.connected",
      title: "Integration published",
      detail: "Customer Support Bot → My Business Website",
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: "a-2",
      kind: "chatbot.trained",
      title: "Chatbot training finished",
      detail: "FAQ Assistant",
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "a-3",
      kind: "website.generated",
      title: "Website draft updated",
      detail: "Portfolio Site",
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "a-4",
      kind: "files.uploaded",
      title: "Knowledge files uploaded",
      detail: "12 files · Customer Support Bot",
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
  ],
};
