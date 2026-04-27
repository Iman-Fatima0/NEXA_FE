import { MarketingPage } from "../../components/shared/marketing-page";

export default function CareersPage() {
  return (
    <MarketingPage
      path="/careers"
      kicker="Team"
      title="Help shape the next generation of AI product tooling"
      description="NEXA is hiring engineers, designers, and operators who care about quality execution and thoughtful platform architecture."
      cards={[
        { title: "Remote-first", body: "Distributed collaboration patterns with clear ownership and cadence." },
        { title: "High impact", body: "Work on core product systems used directly by growing teams." },
        { title: "Craft culture", body: "Prioritize maintainability, performance, and practical design systems." },
      ]}
      relatedLinks={[
        { href: "/about", label: "About" },
        { href: "/blog", label: "Team updates" },
        { href: "/contact", label: "Get in touch" },
        { href: "/features", label: "Product context" },
      ]}
    />
  );
}
