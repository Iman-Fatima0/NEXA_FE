import Link from "next/link";
import styles from "../../nexa-ss.module.css";

export default function TrainedChatbotPage() {
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
          <div className={styles.topActions}>
            <Link href="/chatbot-testing" className={styles.btnLight}>
              Test Bot
            </Link>
            <Link href="/dashboard" className={styles.btnPrimary}>
              Save Chatbot
            </Link>
          </div>
        </div>
      </header>
      <main className={styles.container}>
        <section className={styles.split}>
          <div>
            <article className={styles.panel}>
              <h2 style={{ marginTop: 0, fontSize: "2rem" }}>Chatbot Configuration</h2>
              <div className={styles.field}>
                <label>Chatbot Name</label>
                <input className={styles.input} value="customer support assistance" readOnly />
              </div>
              <div className={styles.field}>
                <label>Personality &amp; Tone</label>
                <input className={styles.input} value="proffessional" readOnly />
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
              <input className={styles.input} value="cofee shop" readOnly />
              <p style={{ margin: "0.5rem 0 0", color: "#6b7280", fontSize: "0.86rem" }}>
                Enter as much information as possible to help your chatbot answer questions
              </p>
            </article>
          </div>
          <article className={styles.panel}>
            <h2 style={{ marginTop: 0, fontSize: "2rem" }}>Chatbot Preview</h2>
            <div className={styles.ctaBand} style={{ maxWidth: "100%", padding: "1.4rem 1rem" }}>
              <h2 style={{ margin: 0, fontSize: "2rem" }}>🤖 Chatbot Ready!</h2>
              <p style={{ marginBottom: 0 }}>Your AI assistant has been trained successfully</p>
            </div>
            <div className={styles.chatWindow} style={{ marginTop: "0.9rem" }}>
              <div className={styles.chatHeader}>customer support assistance</div>
              <div className={styles.chatBody}>
                <div className={styles.chatBubble}>Hi! I&apos;m customer support assistance. How can I help you today?</div>
                <div className={`${styles.chatBubble} ${styles.chatBubbleRight}`}>Hello! Can you tell me about your services?</div>
                <div className={styles.chatBubble}>
                  Of course! Based on the data you&apos;ve provided, I can answer questions about your products, services,
                  and help your customers.
                </div>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
