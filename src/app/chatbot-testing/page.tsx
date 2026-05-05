import { cookies } from "next/headers";
import Link from "next/link";
import { hubBackHrefForSession } from "../../lib/auth/hub-nav-for-session";
import wb from "../website-builder/website-builder.module.css";

export default async function ChatbotTestingPage() {
  const jar = await cookies();
  const backHref = hubBackHrefForSession(jar, "bot");
  return (
    <div className={wb.page}>
      <Link href={backHref} className={wb.backNav} aria-label="Back">
        <img src="/assets/images/redarrowithoutbg.png" alt="" width={24} height={24} className={wb.backNavImg} decoding="async" />
      </Link>
      <div className={wb.topExtras}>
        <Link href="/chatbot-builder/trained" className={wb.topExtraPrimary}>
          Edit Chatbot
        </Link>
      </div>
      <main className={`${wb.main} ${wb.mainToolbarSpace}`}>
        <article className={wb.panel}>
          <h2 className={wb.panelTitle}>Chatbot testing</h2>
          <div className={wb.chatDark}>
            <div className={wb.chatDarkHeader}>Customer support bot · online</div>
            <div className={`${wb.chatDarkBody} ${wb.chatDarkBodyTall}`}>
              <div className={wb.chatDarkBubble}>Hi! I&apos;m your AI assistant. How can I help you today?</div>
            </div>
            <div className={wb.chatComposeBar}>
              <input className={wb.input} type="text" placeholder="Type your message…" autoComplete="off" />
              <button type="button" className={wb.chatComposeSend} aria-label="Send message">
                Send
              </button>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
