import Link from "next/link";
import wb from "../website-builder/website-builder.module.css";

const PREVIEW_WAIT_GIF = "/assets/images/redcirclesquare.gif";

export default function IntegrationManagerPage() {
  return (
    <div className={wb.page}>
      <Link href="/dashboard" className={wb.backNav} aria-label="Back to dashboard">
        <img src="/assets/images/redarrowithoutbg.png" alt="" width={24} height={24} className={wb.backNavImg} decoding="async" />
      </Link>
      <main className={wb.main}>
        <section className={wb.split}>
          <div>
            <article className={wb.panel}>
              <h2 className={wb.panelTitle}>Connect Chatbot to Website</h2>
              <div className={wb.field}>
                <label className={wb.label} htmlFor="im-website">
                  Select Website
                </label>
                <select id="im-website" className={wb.select} defaultValue="">
                  <option value="">Choose a website</option>
                </select>
              </div>
              <div className={wb.field}>
                <label className={wb.label} htmlFor="im-chatbot">
                  Select Chatbot
                </label>
                <select id="im-chatbot" className={wb.select} defaultValue="">
                  <option value="">Choose a chatbot</option>
                </select>
              </div>
            </article>

            <article className={`${wb.panel} ${wb.panelGap}`}>
              <h2 className={wb.panelTitle}>Customize Widget</h2>
              <div className={wb.field}>
                <label className={wb.label} htmlFor="im-position">
                  Position on Page
                </label>
                <select id="im-position" className={wb.select} defaultValue="bottom-right">
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                </select>
              </div>
              <div className={wb.fieldRow}>
                <label className={wb.label} htmlFor="im-bubble">
                  Show Chat Bubble
                </label>
                <input id="im-bubble" type="checkbox" className={wb.checkbox} defaultChecked />
              </div>
              <div className={wb.field}>
                <span className={wb.label}>Widget Size</span>
                <p className={wb.hintTight} style={{ marginTop: "0.25rem" }}>
                  60px
                </p>
              </div>
              <Link href="/integration-manager/completed" className={`${wb.btn} ${wb.linkAsBtn} ${wb.btnTop}`}>
                Connect to Website
              </Link>
            </article>
          </div>

          <article className={wb.previewShell}>
            <img className={wb.previewGif} src={PREVIEW_WAIT_GIF} alt="" width={800} height={600} decoding="async" />
            <div className={wb.previewScrim} aria-hidden />
            <div className={wb.previewMessage}>
              <h3 className={wb.previewHeading}>Preview your integration</h3>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
