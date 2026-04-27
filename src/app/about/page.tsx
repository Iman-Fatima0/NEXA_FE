import { MarketingPage } from "../../components/shared/marketing-page";

export default function AboutPage() {
  return (
    <MarketingPage
      path="/about"
      kicker="Company"
      title="NEXA builds practical AI interfaces for modern product organizations"
      description="Our mission is to reduce complexity between idea and release by combining product creation and assistant workflows in one platform."
      cards={[
        { title: "Mission", body: "Enable teams to ship polished web experiences faster with lower overhead." },
        { title: "Principles", body: "Clarity, velocity, and reliability guide every platform decision." },
        { title: "Execution", body: "We focus on production-ready workflows, not just demos." },
      ]}
      relatedLinks={[
        { href: "/careers", label: "Careers" },
        { href: "/blog", label: "Blog" },
        { href: "/contact", label: "Contact" },
        { href: "/privacy", label: "Privacy" },
      ]}
    />
  );
}
