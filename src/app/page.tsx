import Link from "next/link";
import styles from "./page.module.css";

function HeroBolt() {
  return (
    <svg className={styles.heroBoltSvg} viewBox="0 0 140 240" aria-hidden>
      <defs>
        <linearGradient id="nexaBoltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff5ee" />
          <stop offset="22%" stopColor="#ff8a5c" />
          <stop offset="48%" stopColor="#e34234" />
          <stop offset="100%" stopColor="#2d1f3d" />
        </linearGradient>
        <filter id="nexaBoltGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        filter="url(#nexaBoltGlow)"
        fill="url(#nexaBoltGrad)"
        d="M78 4 L38 118 L62 118 L42 236 L108 88 L78 88 L102 4 Z"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.navBrand}>
            <img src="/assets/images/NEXALOGO.png" alt="" width={36} height={36} className={styles.navLogo} />
            <span>NEXA</span>
          </Link>
          <nav className={styles.navLinks} aria-label="Primary">
            <a href="#">Features</a>
            <a href="#">Integrations</a>
            <a href="#">Docs</a>
            <a href="#">Pricing</a>
            <a href="#">Blog</a>
          </nav>
          <div className={styles.navActions}>
            <Link href="/login" className={styles.navGhost}>
              Sign in
            </Link>
            <Link href="/register" className={styles.navCta}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.shell}>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <h1 className={styles.heroTitle}>Build Websites &amp; Chatbots Without Code</h1>
                <p className={styles.heroLead}>
                  Create stunning websites and intelligent chatbots with just a prompt. No technical knowledge
                  required. Perfect for businesses, creators, and entrepreneurs.
                </p>
                <div className={styles.heroRow}>
                  <Link href="/register" className={styles.btnPrimary}>
                    Start building free
                  </Link>
                  <a href="#" className={styles.btnOutline}>
                    View demo
                  </a>
                </div>
                <div className={styles.logoStrip} aria-hidden>
                  {["Intercom", "Salesforce", "Zendesk", "Slack", "Notion", "GitHub"].map((name) => (
                    <span key={name} className={styles.logoStripItem}>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.heroArt}>
                <div className={styles.heroGlow} />
                <HeroBolt />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.sectionMuted}>
          <div className={styles.shell}>
            <div className={styles.split}>
              <div>
                <p className={styles.kicker}>Architecture</p>
                <h2 className={styles.h2}>A simple, yet powerful flow</h2>
                <ul className={styles.list}>
                  <li>Describe what you want in plain language</li>
                  <li>NEXA generates pages, widgets, and chat logic</li>
                  <li>Iterate visually — adjust tone, layout, and data in one place</li>
                </ul>
              </div>
              <div className={styles.diagram} aria-hidden>
                <div className={styles.diagramHub}>NEXA</div>
                <span className={styles.diagramLine} style={{ top: "28%", left: "12%" }} />
                <span className={styles.diagramLine} style={{ top: "42%", right: "8%" }} />
                <span className={styles.diagramLine} style={{ bottom: "18%", left: "22%" }} />
                <div className={styles.diagramNode} style={{ top: "8%", left: "8%" }}>
                  Web
                </div>
                <div className={styles.diagramNode} style={{ top: "18%", right: "4%" }}>
                  Data
                </div>
                <div className={styles.diagramNode} style={{ bottom: "8%", left: "18%" }}>
                  Chat
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.shell}>
            <p className={styles.kickerCenter}>Integrations</p>
            <h2 className={styles.h2Center}>Plug into your data &amp; the tools you already use</h2>
            <div className={styles.integrations}>
              {["Slack", "Notion", "GitHub", "Discord", "Salesforce", "Zendesk", "Intercom", "Stripe"].map((n) => (
                <span key={n} className={styles.intBadge}>
                  {n}
                </span>
              ))}
            </div>
            <div className={styles.center}>
              <a href="#" className={styles.btnGradient}>
                See all integrations
              </a>
            </div>
          </div>
        </section>

        <section className={styles.sectionMuted}>
          <div className={styles.shell}>
            <p className={styles.kickerCenter}>Platform</p>
            <h2 className={styles.h2Center}>Everything you need in one place</h2>
            <div className={styles.cards3}>
              <article className={styles.card}>
                <div className={`${styles.cardIcon} ${styles.cardIconBlue}`}>&lt;/&gt;</div>
                <h3 className={styles.cardTitle}>Website builder</h3>
                <p className={styles.cardText}>
                  Launch responsive sites from a single prompt. Edit sections, swap themes, and publish instantly.
                </p>
                <ul className={styles.cardList}>
                  <li>AI-powered generation</li>
                  <li>Instant deployment</li>
                  <li>Mobile responsive</li>
                </ul>
              </article>
              <article className={styles.card}>
                <div className={`${styles.cardIcon} ${styles.cardIconPurple}`}>💬</div>
                <h3 className={styles.cardTitle}>Chatbot creator</h3>
                <p className={styles.cardText}>
                  Train assistants on your FAQs and docs. Tune tone, guardrails, and escalation paths without code.
                </p>
                <ul className={styles.cardList}>
                  <li>Easy data upload</li>
                  <li>Smart responses</li>
                  <li>Custom personality</li>
                </ul>
              </article>
              <article className={styles.card}>
                <div className={`${styles.cardIcon} ${styles.cardIconPink}`}>∞</div>
                <h3 className={styles.cardTitle}>Seamless integration</h3>
                <p className={styles.cardText}>
                  Drop a chat widget on your NEXA site or connect to your stack with a few clicks.
                </p>
                <ul className={styles.cardList}>
                  <li>Drag-and-drop placement</li>
                  <li>Customizable widget</li>
                  <li>Real-time updates</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.sectionBand}>
          <div className={styles.shell}>
            <div className={styles.split}>
              <div>
                <p className={styles.kickerLight}>Control</p>
                <h2 className={styles.h2Light}>Prompt when you want it. Tweak when you need to.</h2>
                <ul className={styles.listLight}>
                  <li>Visual editors for layout and copy</li>
                  <li>Export or embed where your users already are</li>
                  <li>Version changes safely before you ship</li>
                </ul>
              </div>
              <div className={styles.codeMock} aria-hidden>
                <div className={styles.codeBar}>
                  <span /> <span /> <span />
                </div>
                <pre className={styles.codePre}>
                  {`// Your NEXA workspace
deploy({
  site: "acme.nexa.app",
  widget: "chat-v2",
});`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.shell}>
            <p className={styles.kickerCenter}>How it works</p>
            <h2 className={styles.h2Center}>Three steps to live</h2>
            <ol className={styles.steps}>
              <li>
                <span className={styles.stepNum}>1</span>
                <div>
                  <h3 className={styles.stepTitle}>Describe your vision</h3>
                  <p className={styles.stepText}>
                    Type the kind of website or assistant you want — structure, audience, and goals.
                  </p>
                </div>
              </li>
              <li>
                <span className={`${styles.stepNum} ${styles.stepNum2}`}>2</span>
                <div>
                  <h3 className={styles.stepTitle}>Upload your data</h3>
                  <p className={styles.stepText}>
                    Add FAQs, policies, product copy, or files so answers stay on-brand and accurate.
                  </p>
                </div>
              </li>
              <li>
                <span className={`${styles.stepNum} ${styles.stepNum3}`}>3</span>
                <div>
                  <h3 className={styles.stepTitle}>Connect &amp; deploy</h3>
                  <p className={styles.stepText}>
                    Embed the widget, share your link, and iterate as traffic and feedback roll in.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section className={styles.sectionMuted}>
          <div className={styles.shell}>
            <h2 className={styles.h2Center}>Built for teams that ship</h2>
            <div className={styles.caseRow}>
              <article className={styles.caseCard}>
                <p className={styles.caseQuote}>
                  “We replaced three tools with NEXA — landing pages, docs, and our support bot now feel like one
                  product.”
                </p>
                <p className={styles.caseMeta}>Marketing lead · Growth brand</p>
                <a href="#" className={styles.caseLink}>
                  Read case study
                </a>
              </article>
              <article className={styles.caseCard}>
                <p className={styles.caseQuote}>
                  “Launching a multilingual site used to take weeks. With NEXA we went live in a day and kept
                  iterating.”
                </p>
                <p className={styles.caseMeta}>Founder · SaaS</p>
                <a href="#" className={styles.caseLink}>
                  Read case study
                </a>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.shell}>
            <h2 className={styles.h2}>Reliable. Scalable. Secure.</h2>
            <ul className={styles.list}>
              <li>GDPR-aware workflows you can document for your team</li>
              <li>High availability targets and clear status communication</li>
              <li>Encryption in transit; secrets never echoed in prompts</li>
            </ul>
            <div className={styles.heroRow}>
              <a href="#" className={styles.btnOutline}>
                Security overview
              </a>
              <a href="#" className={styles.btnPrimary}>
                Contact sales
              </a>
            </div>
          </div>
        </section>

        <section className={styles.prefooter}>
          <div className={styles.shell}>
            <h2 className={styles.prefooterTitle}>Simple enough to try. Powerful enough to ship.</h2>
            <Link href="/register" className={styles.btnOnOrange}>
              Get started
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.shell}>
          <div className={styles.footerGrid}>
            <div>
              <div className={styles.footerBrand}>
                <img src="/assets/images/NEXALOGO.png" alt="" width={32} height={32} />
                <span>NEXA</span>
              </div>
              <p className={styles.footerTag}>Websites &amp; chatbots without code.</p>
            </div>
            <div>
              <h4 className={styles.footerH}>Product</h4>
              <a href="#">Builder</a>
              <a href="#">Chatbots</a>
              <a href="#">Pricing</a>
            </div>
            <div>
              <h4 className={styles.footerH}>Company</h4>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
            <div>
              <h4 className={styles.footerH}>Resources</h4>
              <a href="#">Docs</a>
              <a href="#">Blog</a>
              <a href="#">Support</a>
            </div>
            <div>
              <h4 className={styles.footerH}>Legal</h4>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} NEXA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
