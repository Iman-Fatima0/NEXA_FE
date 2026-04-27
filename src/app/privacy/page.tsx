import { MarketingPage } from "../../components/shared/marketing-page";

export default function PrivacyPage() {
  return (
    <MarketingPage
      path="/privacy"
      kicker="Legal"
      title="Privacy commitments for users and enterprise customers"
      description="Review how NEXA approaches data handling, access boundaries, and retention expectations across platform workflows."
      cards={[
        { title: "Data scope", body: "Clear boundaries around what information is processed and why." },
        { title: "Access controls", body: "Role-aware patterns to reduce accidental data exposure." },
        { title: "Retention policy", body: "Defined windows for operational and analytical storage." },
      ]}
      relatedLinks={[
        { href: "/terms", label: "Terms" },
        { href: "/support", label: "Support" },
        { href: "/contact", label: "Contact legal" },
        { href: "/security", label: "Security overview" },
      ]}
    />
  );
}
