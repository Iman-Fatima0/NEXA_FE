import { MarketingPage } from "../../components/shared/marketing-page";

export default function BlogPage() {
  return (
    <MarketingPage
      path="/blog"
      kicker="Insights"
      title="Product stories, implementation guides, and release notes from NEXA"
      description="Follow how teams are building AI-native experiences and how the platform evolves around production requirements."
      cards={[
        { title: "Launch stories", body: "Deep dives from teams going live with AI-assisted workflows." },
        { title: "Engineering updates", body: "Architecture decisions and delivery patterns from the core team." },
        { title: "Playbook content", body: "Reusable ideas to improve conversion, clarity, and user trust." },
      ]}
      relatedLinks={[
        { href: "/docs", label: "Read docs" },
        { href: "/about", label: "About NEXA" },
        { href: "/careers", label: "Join the team" },
        { href: "/support", label: "Support" },
      ]}
    />
  );
}
