import Link from "next/link";
import styles from "../../nexa-ss.module.css";

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/" className={styles.brand}>
            <img src="/assets/images/NEXALOGO.png" alt="" width={28} height={28} />
            <span>Nexa</span>
          </Link>
          <Link href="/" className={styles.btnLight}>
            Back to Home
          </Link>
        </div>
      </header>

      <main className={styles.container}>
        <h1 className={styles.dashboardTitle}>Welcome to Your Dashboard</h1>
        <p className={styles.dashboardSub}>Manage your websites, chatbots, and integrations all in one place</p>

        <section className={styles.cardRow}>
          <article className={styles.actionCard}>
            <div className={styles.actionHead}>
              <span className={styles.iconWrap}>🌐</span>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.6rem" }}>Create Website</h3>
                <p style={{ margin: 0, color: "#6b7280" }}>Build with AI</p>
              </div>
            </div>
            <Link href="/website-builder" className={styles.btnPrimary} style={{ width: "100%" }}>
              New Website
            </Link>
          </article>

          <article className={styles.actionCard}>
            <div className={styles.actionHead}>
              <span className={styles.iconWrap}>🤖</span>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.6rem" }}>Create Chatbot</h3>
                <p style={{ margin: 0, color: "#6b7280" }}>Train your AI</p>
              </div>
            </div>
            <Link href="/chatbot-builder" className={styles.btnPrimary} style={{ width: "100%" }}>
              New Chatbot
            </Link>
          </article>

          <article className={styles.actionCard}>
            <div className={styles.actionHead}>
              <span className={`${styles.iconWrap} ${styles.iconWrapPink}`}>🔗</span>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.6rem" }}>Integration</h3>
                <p style={{ margin: 0, color: "#6b7280" }}>Connect them</p>
              </div>
            </div>
            <Link href="/integration-manager" className={`${styles.btnPrimary} ${styles.btnPink}`} style={{ width: "100%" }}>
              Manage
            </Link>
          </article>
        </section>

        <section className={styles.itemSection}>
          <div className={styles.itemHeader}>
            <h2 style={{ margin: 0, fontSize: "2rem" }}>Your Websites</h2>
            <button className={styles.btnLight} type="button">
              Create New
            </button>
          </div>
          <div className={styles.itemGrid}>
            <article className={styles.itemCard}>
              <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.45rem" }}>My Business Website</h3>
              <p style={{ margin: "0 0 0.9rem", color: "#6b7280" }}>
                <span className={`${styles.status} ${styles.statusGreen}`}>Published</span> Last edited 2 hours ago
              </p>
              <div className={styles.toolbar}>
                <Link href="/website-builder/generated" className={styles.btnLight} style={{ flex: 1 }}>
                  Edit
                </Link>
                <Link href="/website-preview" className={styles.btnLight}>
                  👁
                </Link>
              </div>
            </article>
            <article className={styles.itemCard}>
              <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.45rem" }}>Portfolio Site</h3>
              <p style={{ margin: "0 0 0.9rem", color: "#6b7280" }}>
                <span className={`${styles.status} ${styles.statusYellow}`}>Draft</span> Last edited 1 day ago
              </p>
              <div className={styles.toolbar}>
                <Link href="/website-builder/generated" className={styles.btnLight} style={{ flex: 1 }}>
                  Edit
                </Link>
                <Link href="/website-preview" className={styles.btnLight}>
                  👁
                </Link>
              </div>
            </article>
          </div>
        </section>

        <section className={styles.itemSection}>
          <div className={styles.itemHeader}>
            <h2 style={{ margin: 0, fontSize: "2rem" }}>Your Chatbots</h2>
            <button className={styles.btnLight} type="button">
              Create New
            </button>
          </div>
          <div className={styles.itemGrid}>
            <article className={styles.itemCard}>
              <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.45rem" }}>Customer Support Bot</h3>
              <p style={{ margin: "0 0 0.9rem", color: "#6b7280" }}>
                <span className={`${styles.status} ${styles.statusGreen}`}>Active</span> 1,234 messages
              </p>
              <div className={styles.toolbar}>
                <Link href="/chatbot-builder/trained" className={styles.btnLight} style={{ flex: 1 }}>
                  Configure
                </Link>
                <Link href="/chatbot-testing" className={styles.btnLight}>
                  👁
                </Link>
              </div>
            </article>
            <article className={styles.itemCard}>
              <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.45rem" }}>FAQ Assistant</h3>
              <p style={{ margin: "0 0 0.9rem", color: "#6b7280" }}>
                <span className={`${styles.status} ${styles.statusBlue}`}>Training</span> 456 messages
              </p>
              <div className={styles.toolbar}>
                <Link href="/chatbot-builder/trained" className={styles.btnLight} style={{ flex: 1 }}>
                  Configure
                </Link>
                <Link href="/chatbot-testing" className={styles.btnLight}>
                  👁
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
