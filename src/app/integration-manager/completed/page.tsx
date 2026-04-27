import Link from "next/link";
import styles from "../../nexa-ss.module.css";

export default function IntegrationCompletedPage() {
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
          <Link href="/website-preview" className={`${styles.btnPrimary} ${styles.btnPink}`}>
            View Live Website
          </Link>
        </div>
      </header>
      <main className={styles.container}>
        <section className={styles.split}>
          <div>
            <article className={styles.panel}>
              <h2 style={{ marginTop: 0, fontSize: "2rem" }}>Connect Chatbot to Website</h2>
              <div className={styles.field}>
                <label>Select Website</label>
                <input className={styles.input} value="🌐 My Business Website" readOnly />
              </div>
              <div style={{ textAlign: "center", fontSize: "2.2rem", color: "#ef0f86", margin: "0.6rem 0" }}>🔗</div>
              <div className={styles.field}>
                <label>Select Chatbot</label>
                <input className={styles.input} value="🤖 Customer Support Bot" readOnly />
              </div>
            </article>

            <article className={styles.panel} style={{ marginTop: "1rem" }}>
              <h2 style={{ marginTop: 0, fontSize: "2rem" }}>Customize Widget</h2>
              <div className={styles.field}>
                <label>Position on Page</label>
                <input className={styles.input} value="Bottom Right" readOnly />
              </div>
              <div className={styles.field} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ marginBottom: 0 }}>Show Chat Bubble</label>
                <input type="checkbox" checked readOnly />
              </div>
              <div className={styles.field}>
                <label>Widget Size: 60px</label>
              </div>
            </article>
          </div>
          <article className={styles.panel}>
            <h2 style={{ marginTop: 0, fontSize: "2rem" }}>Live Preview</h2>
            <div className={styles.ctaBand} style={{ maxWidth: "100%", padding: "1.4rem 1rem" }}>
              <h2 style={{ margin: 0, fontSize: "2rem" }}>✓ Integration Complete!</h2>
              <p style={{ marginBottom: 0 }}>Your chatbot is now live on your website</p>
            </div>
            <div className={styles.browserMock}>
              <div className={styles.browserBar} />
              <div className={styles.browserBody}>
                <div style={{ height: 26, borderRadius: 6, background: "#d8d8f2", marginBottom: 10, width: "55%" }} />
                <div style={{ height: 118, borderRadius: 6, background: "#d8d8f2", marginBottom: 10 }} />
                <div style={{ width: 72, marginLeft: "auto", borderRadius: 10, padding: "0.35rem", background: "#fff" }}>
                  Hi! Need help?
                </div>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
