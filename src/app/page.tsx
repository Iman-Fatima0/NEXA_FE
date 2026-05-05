import { cookies } from "next/headers";
import Link from "next/link";
import { SESSION_COOKIE } from "../lib/auth/session-cookie-names";
import styles from "./nexa-ss.module.css";

export default async function HomePage() {
  const jar = await cookies();
  const startBuildingHref = jar.get(SESSION_COOKIE)?.value
    ? "/dashboard"
    : `/login?next=${encodeURIComponent("/dashboard")}`;

  return (
    <div className={styles.page}>
      <section className={styles.introHero} aria-label="NEXA intro hero">
        <div className={styles.heroTopActions}>
          <Link href="/innovate" className={styles.heroTopLink}>
            Innovate
          </Link>
          <Link href="/register" className={styles.heroTopLink}>
            Sign Up
          </Link>
        </div>
        <h1 className={styles.introTitle}>NEXA</h1>
      </section>

      <section className={styles.matrixIntro}>
        <span className={styles.pixelHoverWrap}>
          <img
            src="/assets/images/pixeldinowithoutbg.png"
            alt="Pixel dino"
            className={styles.sectionSeparatorDino}
          />
          <span className={styles.pixelHoverBubble}>hi im a purposless dino</span>
        </span>
        <div className={styles.matrixIntroInner}>
          <p className={styles.matrixParagraph}>
            enter the matrix of digital creation. build websites and chatbots without code.
          </p>
        </div>
      </section>

      <section className={styles.featureTimelineSection} aria-label="StartBuildin timeline section">
        <img src="/assets/images/frekvensmotion.gif" alt="" className={styles.featureTimelineGif} />
        <div className={`${styles.featureTextBlock} ${styles.featureTextWebsite}`}>
          <p className={`${styles.featureTyped} ${styles.featureTypedCenter}`}>
            Website Builder
            <br />
            Describe your website in plain English and watch it come to life. Fully responsive and customizable.
          </p>
          <div className={`${styles.featureTabs} ${styles.featureTabsCenter}`} aria-label="Website builder highlights">
            <span className={styles.featureTab}>AI-powered generation</span>
            <span className={styles.featureTab}>Instant deployment</span>
            <span className={styles.featureTab}>Mobile responsive</span>
          </div>
        </div>

        <div className={`${styles.featureTextBlock} ${styles.featureTextIntegration}`}>
          <p className={`${styles.featureTyped} ${styles.featureTypedCenter}`}>
            Chatbot Creator
            <br />
            Upload your data and create intelligent chatbots in minutes. No coding required.
          </p>
          <div className={`${styles.featureTabs} ${styles.featureTabsCenter}`} aria-label="Chatbot creator highlights">
            <span className={styles.featureTab}>Easy data upload</span>
            <span className={styles.featureTab}>Smart responses</span>
            <span className={styles.featureTab}>Custom personality</span>
          </div>
        </div>

        <div className={`${styles.featureTextBlock} ${styles.featureTextChatbot}`}>
          <p className={`${styles.featureTyped} ${styles.featureTypedCenter}`}>
            Seamless Integration
            <br />
            Connect your chatbot with your website effortlessly. One-click integration.
          </p>
          <div className={`${styles.featureTabs} ${styles.featureTabsCenter}`} aria-label="Seamless integration highlights">
            <span className={styles.featureTab}>Drag &amp; drop placement</span>
            <span className={styles.featureTab}>Customizable widget</span>
            <span className={styles.featureTab}>Real-time updates</span>
          </div>
        </div>
      </section>

      <section className={styles.redReadySection} aria-label="Final ready section">
        <div className={styles.redReadyInner}>
          <h2 className={styles.redReadyTitle}>Ready to Get Started?</h2>
          <p className={styles.redReadyText}>Join thousands of users building amazing websites and chatbots with Nexa</p>
          <Link href={startBuildingHref} prefetch={false} className={styles.redReadyButton}>
            <span>Start Building Now</span>
            <span className={styles.redReadyButtonIcon} aria-hidden>
              ↗
            </span>
          </Link>
        </div>
        <div className={styles.redReadyPixelCluster}>
          <span className={styles.pixelHoverWrap}>
            <img src="/assets/images/pixelpizzawithoutbg.png" alt="Pixel pizza" className={styles.redReadyPixelItem} />
            <span className={styles.pixelHoverBubble}>hi i am a purposless pizza</span>
          </span>
          <span className={styles.pixelHoverWrap}>
            <img src="/assets/images/pixelhenwithoutbg.png" alt="Pixel hen" className={styles.redReadyPixelItem} />
            <span className={styles.pixelHoverBubble}>hi i am a purposless hen</span>
          </span>
          <span className={`${styles.pixelHoverWrap} ${styles.redReadyGhostWrap}`}>
            <img src="/assets/images/pixelghostwithoutbg.png" alt="Pixel ghost" className={styles.redReadyPixelItem} />
            <span className={styles.pixelHoverBubble}>hi i am a purposless ghost</span>
          </span>
        </div>
      </section>
    </div>
  );
}
