import Link from "next/link";
import { InnovateGifSection } from "./innovate-gif-section";
import { InnovateFeatureTile } from "./InnovateFeatureTile";
import styles from "./innovate.module.css";

export default function InnovatePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-label="Innovate hero" />
      <section className={styles.cardsSection} aria-label="Build paths">
        <span className={styles.innovateDividerHoverWrap}>
          <img
            src="/assets/images/pixelhenandmanwithoutbgreal.png"
            alt="Pixel hen and man"
            className={styles.innovateSectionDividerPixel}
          />
          <span className={styles.innovateDividerBubble}>hi i went missing on home , scroll down for making it worth it  </span>
        </span>
        <div className={styles.cardsInner}>
          <div className={styles.tileGrid}>
            <InnovateFeatureTile
              variant="red"
              mark="W"
              headline="Website Generation"
              subline="Code Matrix - Build powerful digital experiences with intelligent website creation designed for speed, precision, and control."
              footer="website builder"
              href="/website-builder"
              cta="Generate Website"
              headlineCenter
              contentCentered
            />
            <InnovateFeatureTile
              variant="glass"
              mark="B"
              headline="Chatbot Generation"
              subline="Neural Bot - Deploy AI-driven chatbots trained on your data to deliver instant responses with adaptive intelligence."
              footer="chatbot-builder"
              href="/chatbot-builder"
              cta="Generate Chatbot"
              contentCentered
            />
            <InnovateFeatureTile
              variant="dark"
              mark="I"
              headline="Integration"
              subline="System Sync - Synchronize websites, chatbots, and live systems into one connected network for seamless digital operations."
              footer="integration-manager"
              href="/integration-manager"
              cta="Integrate"
              contentCentered
            />
          </div>
        </div>
      </section>
      <InnovateGifSection />
      <section id="innovate-after" className={styles.afterSection} aria-label="After transition">
        <div className={styles.afterInner}>
          <p>You made it past the smile.</p>
          <Link href="/" className={styles.backLink}>
            Back to home
          </Link>
        </div>
      </section>
    </div>
  );
}
