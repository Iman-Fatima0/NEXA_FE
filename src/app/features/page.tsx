import { MarketingPage } from "../../components/shared/marketing-page";

export default function FeaturesPage() {
  return (
    <MarketingPage
      path="/features"
      kicker="Platform"
      title="Build and iterate faster with AI-native website and chatbot workflows"
      description="NEXA combines generation, editing, and deployment into one workspace designed for teams shipping modern product experiences."
      cards={[
        { title: "Prompt-to-page", body: "Describe requirements and generate structured page sections instantly." },
        { title: "Unified editing", body: "Refine copy, layout, and interaction states without switching tools." },
        { title: "Deployment ready", body: "Move from prototype to production flows with consistent release patterns." },
      ]}
      relatedLinks={[
        { href: "/integrations", label: "Integrations" },
        { href: "/docs", label: "Docs" },
        { href: "/pricing", label: "Pricing" },
        { href: "/contact", label: "Contact" },
      ]}
    />
  );
}
