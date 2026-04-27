import { MarketingPage } from "../../components/shared/marketing-page";

export default function SalesPage() {
  return (
    <MarketingPage
      path="/sales"
      kicker="Sales"
      title="Work with sales on rollout strategy and enterprise enablement"
      description="Discuss deployment constraints, timeline planning, and feature alignment for your organization."
      cards={[
        { title: "Discovery", body: "Align product objectives with team and architecture constraints." },
        { title: "Scoping", body: "Define rollout phases and capability requirements by environment." },
        { title: "Enablement", body: "Plan onboarding resources and support channels for launch." },
      ]}
      relatedLinks={[
        { href: "/pricing", label: "Pricing" },
        { href: "/features", label: "Features" },
        { href: "/contact", label: "Contact" },
        { href: "/register", label: "Start trial" },
      ]}
    />
  );
}
