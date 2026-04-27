import { MarketingPage } from "../../components/shared/marketing-page";

export default function DocsPage() {
  return (
    <MarketingPage
      path="/docs"
      kicker="Documentation"
      title="Clear implementation guides for product, design, and engineering teams"
      description="Explore setup paths, architectural patterns, and best practices to adopt NEXA in production with predictable outcomes."
      cards={[
        { title: "Quickstart guides", body: "Set up core flows and environments in a structured onboarding sequence." },
        { title: "Architecture notes", body: "Understand routing, content models, and lifecycle conventions." },
        { title: "Operational playbooks", body: "Roll out workflows with observability and release discipline." },
      ]}
      relatedLinks={[
        { href: "/features", label: "Platform overview" },
        { href: "/integrations", label: "Integration catalog" },
        { href: "/support", label: "Get help" },
        { href: "/blog", label: "Product updates" },
      ]}
    />
  );
}
