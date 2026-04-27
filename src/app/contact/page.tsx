import { MarketingPage } from "../../components/shared/marketing-page";

export default function ContactPage() {
  return (
    <MarketingPage
      path="/contact"
      kicker="Contact"
      title="Talk with the NEXA team about rollout, architecture, and scale"
      description="Share your use case and we will help map the best onboarding path for your product goals and technical constraints."
      cards={[
        { title: "Sales", body: "Plan rollout strategy and feature adoption for your team." },
        { title: "Partnerships", body: "Explore integrations and co-building opportunities." },
        { title: "General support", body: "Get direction for product and implementation questions." },
      ]}
      relatedLinks={[
        { href: "/pricing", label: "Pricing" },
        { href: "/support", label: "Support center" },
        { href: "/docs", label: "Documentation" },
        { href: "/about", label: "Company" },
      ]}
    />
  );
}
