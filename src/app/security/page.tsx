import { MarketingPage } from "../../components/shared/marketing-page";

export default function SecurityPage() {
  return (
    <MarketingPage
      path="/security"
      kicker="Security"
      title="Security-first controls for production AI experiences"
      description="NEXA applies practical security controls across access, transport, and operational change workflows."
      cards={[
        { title: "Transport protection", body: "Network paths are designed around encrypted data movement patterns." },
        { title: "Access discipline", body: "Role-scoped control surfaces reduce broad configuration risk." },
        { title: "Operational hygiene", body: "Release and maintenance practices emphasize reliability and traceability." },
      ]}
      relatedLinks={[
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
        { href: "/support", label: "Support" },
        { href: "/contact", label: "Security contact" },
      ]}
    />
  );
}
