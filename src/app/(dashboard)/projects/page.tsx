import Link from "next/link";
import DashboardStyleBackNav from "../../../components/gallery/DashboardStyleBackNav";
import styles from "../dashboard-pages.module.css";

export default function ProjectsPage() {
  return (
    <>
      <DashboardStyleBackNav href="/dashboard" ariaLabel="Back to dashboard" />
      <main>
      <h1 className={styles.title}>Projects</h1>
      <p className={styles.subtitle}>Manage website and assistant initiatives across launch phases.</p>
      <section className={styles.grid}>
        <article className={styles.card}>
          <h3>Active builds</h3>
          <p>Coordinate features moving through design, build, and release.</p>
        </article>
        <article className={styles.card}>
          <h3>Backlog</h3>
          <p>Prioritize enhancements and integration requests by business impact.</p>
        </article>
        <article className={styles.card}>
          <h3>Completed</h3>
          <p>Review completed milestones and prepare post-release optimization.</p>
        </article>
      </section>
      <section className={styles.links} aria-label="Projects links">
        <Link href="/settings">Workspace settings</Link>
        <Link href="/pricing">Compare plans</Link>
      </section>
    </main>
    </>
  );
}
