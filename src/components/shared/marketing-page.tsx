import Link from "next/link";
import { MarketingLayout } from "./marketing-layout";
import styles from "./marketing-page.module.css";

type PageCard = {
  title: string;
  body: string;
};

type RelatedLink = {
  href: string;
  label: string;
};

type MarketingPageProps = {
  path: string;
  kicker: string;
  title: string;
  description: string;
  cards: PageCard[];
  relatedLinks: RelatedLink[];
};

export function MarketingPage({ path, kicker, title, description, cards, relatedLinks }: Readonly<MarketingPageProps>) {
  return (
    <MarketingLayout currentPath={path}>
      <section className={styles.hero}>
        <p className={styles.kicker}>{kicker}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>
          <Link href="/dashboard" className={`${styles.btn} ${styles.btnPrimary}`}>
            Get started
          </Link>
          <Link href="/contact" className={styles.btn}>
            Talk to sales
          </Link>
        </div>
      </section>

      <section className={styles.grid}>
        {cards.map((card) => (
          <article className={styles.card} key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </section>

      <section className={styles.links} aria-label="Related pages">
        {relatedLinks.map((link) => (
          <Link key={link.href} href={link.href} className={styles.chip}>
            {link.label}
          </Link>
        ))}
      </section>
    </MarketingLayout>
  );
}
