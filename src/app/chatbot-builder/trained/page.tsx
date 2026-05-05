import { cookies } from "next/headers";
import Link from "next/link";
import { dashboardPathOrLogin, hubBackHrefForSession } from "../../../lib/auth/hub-nav-for-session";
import wb from "../../website-builder/website-builder.module.css";

export default async function TrainedChatbotPage() {
  const jar = await cookies();
  const backHref = hubBackHrefForSession(jar, "bot");
  const saveHref = dashboardPathOrLogin(jar, "/dashboard/bots");
  return (
    <div className={`${wb.page} ${wb.botReviewPage}`}>
      <Link href={backHref} className={wb.backNav} aria-label="Back">
        <img src="/assets/images/redarrowithoutbg.png" alt="" width={24} height={24} className={wb.backNavImg} decoding="async" />
      </Link>
      <div className={wb.topExtras}>
        <Link href="/chatbot-testing" className={wb.topExtraGhost}>
          Test Bot
        </Link>
        <Link href={saveHref} className={wb.topExtraPrimary}>
          Save Chatbot
        </Link>
      </div>
      <main className={`${wb.main} ${wb.mainToolbarSpace}`}>
        <section className={wb.split}>
          <div>
            <article className={wb.panel}>
              <h2 className={wb.panelTitle}>Chatbot Configuration</h2>
              <div className={wb.field}>
                <label className={wb.label} htmlFor="cb-trained-name">
                  Chatbot Name
                </label>
                <input
                  id="cb-trained-name"
                  className={wb.input}
                  defaultValue=""
                  placeholder="e.g. Customer Support Assistant"
                  autoComplete="off"
                />
              </div>
              <div className={wb.field}>
                <label className={wb.label} htmlFor="cb-trained-tone">
                  Personality &amp; Tone
                </label>
                <input
                  id="cb-trained-tone"
                  className={wb.input}
                  defaultValue=""
                  placeholder="Example: Friendly and professional, helpful but concise"
                  autoComplete="off"
                />
              </div>
            </article>
            <article className={`${wb.panel} ${wb.panelGap}`}>
              <h2 className={wb.panelTitle}>Add Knowledge Base</h2>
              <div className={wb.btnRow2}>
                <button type="button" className={wb.btnGhost}>
                  Upload Files
                </button>
                <button type="button" className={wb.btnGhost}>
                  Enter Text
                </button>
              </div>
              <div className={wb.field}>
                <label className={wb.label} htmlFor="cb-trained-kb">
                  Knowledge text
                </label>
                <textarea
                  id="cb-trained-kb"
                  className={wb.textarea}
                  defaultValue=""
                  placeholder="Paste or type knowledge for your bot (FAQs, docs, product info…)"
                  rows={6}
                  autoComplete="off"
                />
              </div>
              <p className={wb.hintTight}>Enter as much information as possible to help your chatbot answer questions</p>
            </article>
          </div>

          <article className={wb.panel}>
            <h2 className={wb.panelTitle}>Chatbot Preview</h2>
            <div className={wb.ctaBanner}>
              <h3 className={wb.ctaBannerTitle}>Chatbot ready</h3>
              <p className={wb.ctaBannerText}>Your AI assistant has been trained successfully</p>
            </div>
            <div className={wb.chatDark}>
              <div className={wb.chatDarkHeader}>Customer support bot · online</div>
              <div className={wb.chatDarkBody}>
                <div className={wb.chatDarkBubble}>Hi! I&apos;m your AI assistant. How can I help you today?</div>
                <div className={`${wb.chatDarkBubble} ${wb.chatDarkBubbleUser}`}>Hello! Can you tell me about your services?</div>
                <div className={wb.chatDarkBubble}>
                  Of course! Based on the data you&apos;ve provided, I can answer questions about your products, services, and help your
                  customers.
                </div>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
