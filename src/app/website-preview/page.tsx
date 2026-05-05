import { cookies } from "next/headers";
import Link from "next/link";
import { hubBackHrefForSession } from "../../lib/auth/hub-nav-for-session";
import styles from "../nexa-ss.module.css";

export default async function WebsitePreviewPage() {
  const jar = await cookies();
  const backHref = hubBackHrefForSession(jar, "website");
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href={backHref} className={styles.btnLight}>
            ← Back
          </Link>
          <div className={styles.brand}>
            <span>🌐</span>
            <span>Website Preview</span>
          </div>
          <div className={styles.topActions}>
            <button type="button" className={styles.btnLight}>
              Share
            </button>
            <button type="button" className={styles.btnLight}>
              Export
            </button>
            <Link href="/website-builder/generated" className={styles.btnPrimary}>
              Edit Website
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.container}>
        <article className={styles.browserMock}>
          <div className={styles.browserBar} style={{ height: 34 }} />
          <div style={{ background: "linear-gradient(90deg,#4f46f2,#8b25f6)", color: "#fff", padding: "1rem", fontWeight: 700 }}>
            My Business
          </div>
          <div style={{ background: "#eef0ff", padding: "3rem 1rem", textAlign: "center" }}>
            <h1 style={{ margin: 0, fontSize: "3rem", color: "#4f46f2" }}>Welcome to Our Platform</h1>
            <p style={{ margin: "0.9rem 0 1.25rem", color: "#4b5563" }}>
              Discover amazing solutions that will transform your business
            </p>
            <div className={styles.heroActions}>
              <button type="button" className={styles.btnPrimary}>
                Get Started
              </button>
              <button type="button" className={styles.btnLight}>
                Learn More
              </button>
            </div>
          </div>
          <div style={{ padding: "2.5rem 1rem", textAlign: "center", background: "#fff" }}>
            <h2 style={{ margin: 0, fontSize: "3rem" }}>Our Features</h2>
          </div>
        </article>
      </main>
    </div>
  );
}
