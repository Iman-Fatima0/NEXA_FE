import { MarketingPage } from "../../components/shared/marketing-page";

export default function SupportPage() {
  return (
    <MarketingPage
      path="/support"
      kicker="Support"
      title="Get implementation support and operational guidance"
      description="Use support resources to troubleshoot onboarding, integration workflows, and production release issues effectively."
      cards={[
        { title: "Knowledge base", body: "Find troubleshooting paths and best-practice references." },
        { title: "Help channels", body: "Route requests by priority and technical scope." },
        { title: "Incident guidance", body: "Follow response patterns for service-impacting events." },
      ]}
      relatedLinks={[
        { href: "/docs", label: "Documentation" },
        { href: "/contact", label: "Contact team" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
      ]}
    />
  );
}
