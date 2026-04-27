import { MarketingPage } from "../../components/shared/marketing-page";

export default function DemoPage() {
  return (
    <MarketingPage
      path="/demo"
      kicker="Demo"
      title="See the NEXA workflow from prompt to production"
      description="Explore a guided walkthrough of core creation, editing, and deployment experiences in a single product lifecycle."
      cards={[
        { title: "Creation flow", body: "Generate a polished page and chatbot scaffold from clear intent." },
        { title: "Iteration cycle", body: "Refine UX and content with visual controls and fast feedback." },
        { title: "Release path", body: "Publish with predictable behavior and clear handoff between teams." },
      ]}
      relatedLinks={[
        { href: "/features", label: "Features" },
        { href: "/pricing", label: "Pricing" },
        { href: "/contact", label: "Book full demo" },
        { href: "/register", label: "Start free" },
      ]}
    />
  );
}
