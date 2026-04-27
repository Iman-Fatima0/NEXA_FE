import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./marketing-layout.module.css";

const primaryNav = [
  { href: "/features", label: "Features" },
  { href: "/integrations", label: "Integrations" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

const footerGroups = [
  {
    label: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/integrations", label: "Integrations" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    label: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    label: "Resources",
    links: [
      { href: "/docs", label: "Docs" },
      { href: "/blog", label: "Blog" },
      { href: "/support", label: "Support" },
    ],
  },
  {
    label: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

type MarketingLayoutProps = {
  children: ReactNode;
  currentPath?: string;
};

export function MarketingLayout({ children, currentPath }: Readonly<MarketingLayoutProps>) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.shell} ${styles.headerInner}`}>
          <Link href="/" className={styles.brand}>
            <img src="/assets/images/NEXALOGO.png" alt="" width={28} height={28} />
            <span>NEXA</span>
          </Link>
          <nav className={styles.nav} aria-label="Marketing">
            {primaryNav.map((item) => (
              <Link key={item.href} href={item.href} className={item.href === currentPath ? styles.active : undefined}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className={styles.cta}>
            <Link href="/login" className={styles.ghost}>
              Sign in
            </Link>
            <Link href="/dashboard" className={styles.primary}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className={`${styles.shell} ${styles.main}`}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.shell}>
          <div className={styles.footerGrid}>
            {footerGroups.map((group) => (
              <section key={group.label} className={styles.footerGroup}>
                <p className={styles.footerLabel}>{group.label}</p>
                <div className={styles.footerLinks}>
                  {group.links.map((link) => (
                    <Link key={link.href} href={link.href}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
