import Link from "next/link";
import wb from "../../website-builder/website-builder.module.css";

export default function IntegrationCompletedPage() {
  return (
    <div className={wb.page}>
      <Link href="/dashboard" className={wb.backNav} aria-label="Back to dashboard">
        <img src="/assets/images/redarrowithoutbg.png" alt="" width={24} height={24} className={wb.backNavImg} decoding="async" />
      </Link>
      <div className={wb.topExtras}>
        <Link href="/website-preview" className={wb.topExtraPrimary}>
          View Live Website
        </Link>
      </div>
      <main className={`${wb.main} ${wb.mainToolbarSpace}`}>
        <section className={wb.split}>
          <div>
            <article className={wb.panel}>
              <h2 className={wb.panelTitle}>Connect Chatbot to Website</h2>
              <div className={wb.field}>
                <label className={wb.label} htmlFor="im-done-website">
                  Select Website
                </label>
                <input id="im-done-website" className={wb.input} defaultValue="My Business Website" readOnly />
              </div>
              <div className={wb.field}>
                <label className={wb.label} htmlFor="im-done-bot">
                  Select Chatbot
                </label>
                <input id="im-done-bot" className={wb.input} defaultValue="Customer Support Bot" readOnly />
              </div>
            </article>

            <article className={`${wb.panel} ${wb.panelGap}`}>
              <h2 className={wb.panelTitle}>Customize Widget</h2>
              <div className={wb.field}>
                <label className={wb.label} htmlFor="im-done-pos">
                  Position on Page
                </label>
                <input id="im-done-pos" className={wb.input} defaultValue="Bottom Right" readOnly />
              </div>
              <div className={wb.fieldRow}>
                <label className={wb.label} htmlFor="im-done-bubble">
                  Show Chat Bubble
                </label>
                <input id="im-done-bubble" type="checkbox" className={wb.checkbox} defaultChecked disabled />
              </div>
              <div className={wb.field}>
                <span className={wb.label}>Widget Size</span>
                <p className={wb.hintTight} style={{ marginTop: "0.25rem" }}>
                  60px
                </p>
              </div>
            </article>
          </div>

          <article className={wb.panel}>
            <h2 className={wb.panelTitle}>Live Preview</h2>
            <div className={wb.ctaBanner}>
              <h3 className={wb.ctaBannerTitle}>Integration complete</h3>
              <p className={wb.ctaBannerText}>Your chatbot is now live on your website</p>
            </div>
            <div className={wb.browserDark}>
              <div className={wb.browserDarkBar} />
              <div className={wb.browserDarkBody}>
                <div className={wb.browserDarkShim} />
                <div className={wb.browserDarkHero} />
                <div className={wb.browserDarkBubble}>Hi! Need help?</div>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
