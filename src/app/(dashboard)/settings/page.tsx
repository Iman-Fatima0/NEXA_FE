import Link from "next/link";
import styles from "../dashboard-pages.module.css";

export default function SettingsPage() {
  return (
    <main>
      <h1 className={styles.title}>Settings</h1>
      <p className={styles.subtitle}>Configure workspace preferences and operational guardrails.</p>
      <section className={styles.grid}>
        <article className={styles.card}>
          <h3>Organization</h3>
          <p>Define workspace identity, ownership, and collaboration policies.</p>
        </article>
        <article className={styles.card}>
          <h3>Integrations</h3>
          <p>Control external system connections and data sync behavior.</p>
        </article>
        <article className={styles.card}>
          <h3>Security</h3>
          <p>Set access controls and monitor account protection baselines.</p>
        </article>
      </section>
      <section className={styles.links} aria-label="Settings links">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/security">Security overview</Link>
      </section>
    </main>
  );
}
