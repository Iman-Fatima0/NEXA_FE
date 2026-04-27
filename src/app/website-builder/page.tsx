import Link from "next/link";
import styles from "../nexa-ss.module.css";

export default function WebsiteBuilderPage() {
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
          <span />
        </div>
      </header>

      <main className={styles.container}>
        <section className={styles.split}>
          <article className={styles.panel}>
            <h2 style={{ marginTop: 0, fontSize: "2rem" }}>Describe Your Website</h2>
            <div className={styles.field}>
              <label>Website Name</label>
              <input className={styles.input} value="My Awesome Website" readOnly />
            </div>
            <div className={styles.field}>
              <label>What kind of website do you want?</label>
              <textarea
                className={styles.textarea}
                value="Example: Create a modern landing page for my coffee shop with a menu section, about us page, and contact form. Use warm colors and include images of coffee."
                readOnly
              />
            </div>
            <p style={{ margin: "0.2rem 0 0.9rem", color: "#6b7280", fontSize: "0.88rem" }}>
              Be as detailed as possible. Mention colors, sections, features, and style preferences.
            </p>
            <Link href="/website-builder/generated" className={styles.btnPrimary} style={{ width: "100%" }}>
              Generate Website
            </Link>
            <div className={styles.examples}>
              <h3 style={{ margin: "0 0 0.8rem", fontSize: "1.45rem" }}>Example Prompts</h3>
              <div className={styles.exampleItem}>Create a portfolio website for a photographer with gallery and contact sections</div>
              <div className={styles.exampleItem}>Build a landing page for a SaaS product with pricing tiers and testimonials</div>
              <div className={styles.exampleItem}>Design a restaurant website with menu, reservation system, and location map</div>
            </div>
          </article>

          <article className={styles.previewPlaceholder}>
            <div>
              <img src="/assets/images/NEXALOGO.png" alt="" width={64} height={64} style={{ opacity: 0.35 }} />
              <h3 style={{ margin: "0.8rem 0 0.35rem", fontSize: "1.8rem" }}>Your website will appear here</h3>
              <p style={{ margin: 0 }}>Describe your vision and let AI create a stunning website for you instantly</p>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
