import Link from "next/link";
import styles from "../nexa-ss.module.css";

export default function IntegrationManagerPage() {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/dashboard" className={styles.btnLight}>
            ← Back
          </Link>
          <div className={styles.brand}>
            <span>✦</span>
            <span>Integration Manager</span>
          </div>
          <span />
        </div>
      </header>
      <main className={styles.container}>
        <section className={styles.split}>
          <div>
            <article className={styles.panel}>
              <h2 style={{ marginTop: 0, fontSize: "2rem" }}>Connect Chatbot to Website</h2>
              <div className={styles.field}>
                <label>Select Website</label>
                <select className={styles.select} defaultValue="">
                  <option value="">Choose a website</option>
                </select>
              </div>
              <div style={{ textAlign: "center", fontSize: "2.2rem", color: "#ef0f86", margin: "0.6rem 0" }}>🔗</div>
              <div className={styles.field}>
                <label>Select Chatbot</label>
                <select className={styles.select} defaultValue="">
                  <option value="">Choose a chatbot</option>
                </select>
              </div>
            </article>

            <article className={styles.panel} style={{ marginTop: "1rem" }}>
              <h2 style={{ marginTop: 0, fontSize: "2rem" }}>Customize Widget</h2>
              <div className={styles.field}>
                <label>Position on Page</label>
                <select className={styles.select} defaultValue="Bottom Right">
                  <option>Bottom Right</option>
                </select>
              </div>
              <div className={styles.field} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ marginBottom: 0 }}>Show Chat Bubble</label>
                <input type="checkbox" checked readOnly />
              </div>
              <div className={styles.field}>
                <label>Widget Size: 60px</label>
              </div>
              <Link href="/integration-manager/completed" className={`${styles.btnPrimary} ${styles.btnPink}`} style={{ width: "100%" }}>
                Connect to Website
              </Link>
            </article>
          </div>

          <article className={styles.previewPlaceholder}>
            <div>
              <div style={{ fontSize: "3rem", color: "#ef0f86" }}>🔗</div>
              <h3 style={{ margin: "0.8rem 0 0.35rem", fontSize: "1.8rem" }}>Preview your integration</h3>
              <p style={{ margin: 0 }}>Select a website and chatbot to see how they&apos;ll work together</p>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
