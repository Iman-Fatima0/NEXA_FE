import Link from "next/link";
import styles from "../nexa-ss.module.css";

export default function ChatbotTestingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/dashboard" className={styles.btnLight}>
            ← Back to Dashboard
          </Link>
          <div className={styles.brand}>
            <span>🤖</span>
            <span>Chatbot Testing</span>
          </div>
          <div className={styles.topActions}>
            <button type="button" className={styles.btnLight}>
              Copy Embed Code
            </button>
            <Link href="/chatbot-builder/trained" className={styles.btnPrimary}>
              Edit Chatbot
            </Link>
          </div>
        </div>
      </header>
      <main className={styles.container}>
        <section className={styles.split}>
          <article className={styles.chatWindow}>
            <div className={styles.chatHeader}>Customer Support Bot · Online</div>
            <div className={styles.chatBody}>
              <div className={styles.chatBubble}>Hi! I&apos;m your AI assistant. How can I help you today?</div>
            </div>
            <div style={{ borderTop: "1px solid #e5e7eb", padding: "0.75rem", display: "flex", gap: "0.5rem" }}>
              <input className={styles.input} placeholder="Type your message..." />
              <button type="button" className={`${styles.btnPrimary} ${styles.btnPink}`}>
                ✈
              </button>
            </div>
          </article>
          <aside className={styles.rightColStack}>
            <article className={styles.panel}>
              <h3 style={{ marginTop: 0, fontSize: "1.55rem" }}>Test Instructions</h3>
              <div style={{ border: "1px solid #e8d5fb", background: "#f8f2ff", borderRadius: 10, padding: "0.75rem" }}>
                <p style={{ margin: 0, color: "#7e22ce" }}>Try these questions:</p>
                <p style={{ margin: "0.3rem 0", color: "#7e22ce" }}>&quot;Hello, how can you help me?&quot;</p>
                <p style={{ margin: "0.3rem 0", color: "#7e22ce" }}>&quot;What are your features?&quot;</p>
                <p style={{ margin: "0.3rem 0", color: "#7e22ce" }}>&quot;Tell me about pricing&quot;</p>
              </div>
            </article>
            <article className={styles.panel}>
              <h3 style={{ marginTop: 0, fontSize: "1.55rem" }}>Statistics</h3>
              <p style={{ margin: "0.35rem 0", color: "#6b7280" }}>Average Response Time</p>
              <p style={{ margin: "0 0 0.5rem", fontSize: "2rem", color: "#7e22ce", fontWeight: 700 }}>&lt; 1s</p>
              <p style={{ margin: "0.35rem 0", color: "#6b7280" }}>Accuracy Rate</p>
              <p style={{ margin: "0 0 0.5rem", fontSize: "2rem", color: "#16a34a", fontWeight: 700 }}>94%</p>
              <p style={{ margin: "0.35rem 0", color: "#6b7280" }}>Conversations Today</p>
              <p style={{ margin: 0, fontSize: "2rem", color: "#4f46f2", fontWeight: 700 }}>156</p>
            </article>
            <article className={styles.panel}>
              <h3 style={{ marginTop: 0, fontSize: "1.55rem" }}>Capabilities</h3>
              <ul className={styles.list} style={{ marginTop: 0 }}>
                <li>Natural language understanding</li>
                <li>Context-aware responses</li>
                <li>Multi-turn conversations</li>
                <li>Sentiment analysis</li>
                <li>24/7 availability</li>
              </ul>
            </article>
            <article className={styles.panel} style={{ borderColor: "#e8d5fb", background: "#fbf7ff" }}>
              <h3 style={{ marginTop: 0, fontSize: "1.55rem" }}>Ready to deploy?</h3>
              <p style={{ color: "#6b7280" }}>Integrate this chatbot with your website in one click</p>
              <Link href="/integration-manager/completed" className={`${styles.btnPrimary} ${styles.btnPink}`} style={{ width: "100%" }}>
                Connect to Website
              </Link>
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}
