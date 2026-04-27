import Link from "next/link";
import styles from "../nexa-ss.module.css";

export default function ChatbotBuilderPage() {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/dashboard" className={styles.btnLight}>
            ← Back
          </Link>
          <div className={styles.brand}>
            <img src="/assets/images/NEXALOGO.png" alt="" width={24} height={24} />
            <span>Chatbot Builder</span>
          </div>
          <span />
        </div>
      </header>
      <main className={styles.container}>
        <section className={styles.split}>
          <div>
            <article className={styles.panel}>
              <h2 style={{ marginTop: 0, fontSize: "2rem" }}>Chatbot Configuration</h2>
              <div className={styles.field}>
                <label>Chatbot Name</label>
                <input className={styles.input} value="Customer Support Assistant" readOnly />
              </div>
              <div className={styles.field}>
                <label>Personality &amp; Tone</label>
                <input className={styles.input} value="Example: Friendly and professional, helpful but concise, uses emojis occasionally" readOnly />
              </div>
            </article>

            <article className={styles.panel} style={{ marginTop: "1rem" }}>
              <h2 style={{ marginTop: 0, fontSize: "2rem" }}>Add Knowledge Base</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.35rem", marginBottom: "0.9rem" }}>
                <button type="button" className={styles.btnLight}>
                  Upload Files
                </button>
                <button type="button" className={styles.btnLight}>
                  Enter Text
                </button>
              </div>
              <div style={{ border: "1px dashed #d1d5db", borderRadius: 10, padding: "2rem 1rem", textAlign: "center", color: "#6b7280" }}>
                <div style={{ fontSize: "2.2rem" }}>⇪</div>
                <div style={{ fontWeight: 700, color: "#111827" }}>Upload your data files</div>
                <div>Supports PDF, TXT, CSV, DOCX</div>
                <button type="button" className={styles.btnLight} style={{ marginTop: "0.8rem" }}>
                  Choose Files
                </button>
              </div>
              <Link href="/chatbot-builder/trained" className={styles.btnPrimary} style={{ marginTop: "0.9rem", width: "100%" }}>
                Train Chatbot
              </Link>
            </article>
          </div>
          <article className={styles.previewPlaceholder}>
            <div>
              <img src="/assets/images/NEXALOGO.png" alt="" width={64} height={64} style={{ opacity: 0.35 }} />
              <h3 style={{ margin: "0.8rem 0 0.35rem", fontSize: "1.8rem" }}>Your chatbot will appear here</h3>
              <p style={{ margin: 0 }}>Configure your chatbot and add data to train it. You&apos;ll be able to test it right here.</p>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
