import { MarketingPage } from "../../components/shared/marketing-page";

export default function IntegrationsPage() {
  return (
    <MarketingPage
      path="/integrations"
      kicker="Ecosystem"
      title="Connect your stack and keep product data in sync"
      description="Link NEXA with collaboration, CRM, and support platforms so generated experiences stay aligned with your operational systems."
      cards={[
        { title: "Team tools", body: "Connect workflows with Slack, Notion, and GitHub for shared execution." },
        { title: "Customer systems", body: "Sync context from CRM and support channels for better responses." },
        { title: "Extensible model", body: "Use API-first patterns to align integrations with internal standards." },
      ]}
      relatedLinks={[
        { href: "/features", label: "Features" },
        { href: "/docs", label: "Integration docs" },
        { href: "/support", label: "Support" },
        { href: "/contact", label: "Request integration" },
      ]}
    />
  );
}
