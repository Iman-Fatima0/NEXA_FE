import Link from "next/link";
import styles from "../../nexa-ss.module.css";

export default function GeneratedWebsitePage() {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/dashboard" className={styles.btnLight}>
            ← Back
          </Link>
          <div className={styles.brand}>
            <img src="/assets/images/NEXALOGO.png" alt="" width={24} height={24} />
            <span>Website Builder</span>
          </div>
          <div className={styles.topActions}>
            <Link href="/website-preview" className={styles.btnLight}>
              Preview
            </Link>
            <Link href="/dashboard" className={styles.btnPrimary}>
              Save Website
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.container}>
        <section className={styles.split}>
          <article className={styles.panel}>
            <div className={styles.field}>
              <label>Website Name</label>
              <input className={styles.input} value="my awesome website" readOnly />
            </div>
            <div className={styles.field}>
              <label>What kind of website do you want?</label>
              <textarea className={styles.textarea} value="modern landing page of my coffee shop" readOnly />
            </div>
            <p style={{ margin: "0.2rem 0 0.9rem", color: "#6b7280", fontSize: "0.88rem" }}>
              Be as detailed as possible. Mention colors, sections, features, and style preferences.
            </p>
            <button type="button" className={styles.btnPrimary} style={{ width: "100%" }}>
              Generate Website
            </button>
            <div className={styles.examples}>
              <h3 style={{ margin: "0 0 0.8rem", fontSize: "1.45rem" }}>Example Prompts</h3>
              <div className={styles.exampleItem}>Create a portfolio website for a photographer with gallery and contact sections</div>
              <div className={styles.exampleItem}>Build a landing page for a SaaS product with pricing tiers and testimonials</div>
              <div className={styles.exampleItem}>Design a restaurant website with menu, reservation system, and location map</div>
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.ctaBand} style={{ maxWidth: "100%" }}>
              <h2 style={{ margin: 0, fontSize: "2rem" }}>🎉 Website Generated!</h2>
              <p style={{ marginBottom: 0 }}>Your website has been created successfully</p>
            </div>
            <div className={styles.browserMock}>
              <div className={styles.browserBar} />
              <div className={styles.browserBody}>
                <div style={{ height: 34, borderRadius: 6, background: "#d8d8f2", marginBottom: 10 }} />
                <div style={{ height: 130, borderRadius: 6, background: "#d8d8f2", marginBottom: 10 }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  <div style={{ height: 86, borderRadius: 6, background: "#d8d8f2" }} />
                  <div style={{ height: 86, borderRadius: 6, background: "#d8d8f2" }} />
                  <div style={{ height: 86, borderRadius: 6, background: "#d8d8f2" }} />
                </div>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
