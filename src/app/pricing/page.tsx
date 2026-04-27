import { MarketingPage } from "../../components/shared/marketing-page";

export default function PricingPage() {
  return (
    <MarketingPage
      path="/pricing"
      kicker="Plans"
      title="Transparent pricing designed for startups, growth teams, and enterprise"
      description="Choose the plan that fits your release cadence and governance needs, then scale with additive capabilities as usage grows."
      cards={[
        { title: "Starter", body: "For early teams validating concepts and shipping initial experiences." },
        { title: "Growth", body: "For product teams optimizing conversion and operational throughput." },
        { title: "Enterprise", body: "For organizations requiring advanced controls and support models." },
      ]}
      relatedLinks={[
        { href: "/features", label: "Compare capabilities" },
        { href: "/contact", label: "Contact sales" },
        { href: "/terms", label: "Terms" },
        { href: "/privacy", label: "Privacy" },
      ]}
    />
  );
}
