import { MarketingPage } from "../../components/shared/marketing-page";

export default function TermsPage() {
  return (
    <MarketingPage
      path="/terms"
      kicker="Legal"
      title="Terms that define acceptable use and service expectations"
      description="Review contractual expectations, usage responsibilities, and account management guidelines for using NEXA."
      cards={[
        { title: "Usage policy", body: "Platform usage expectations and prohibited operational behavior." },
        { title: "Service terms", body: "Commercial and account conditions for plan usage and upgrades." },
        { title: "Governance", body: "Dispute, compliance, and policy update handling standards." },
      ]}
      relatedLinks={[
        { href: "/privacy", label: "Privacy policy" },
        { href: "/pricing", label: "Pricing plans" },
        { href: "/support", label: "Support terms" },
        { href: "/contact", label: "Contact" },
      ]}
    />
  );
}
