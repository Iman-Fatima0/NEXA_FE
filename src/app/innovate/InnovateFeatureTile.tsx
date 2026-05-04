import Link from "next/link";
import styles from "./innovate.module.css";

export type InnovateTileVariant = "red" | "glass" | "dark";

type InnovateFeatureTileProps = Readonly<{
  variant: InnovateTileVariant;
  mark: string;
  headline: string;
  subline?: string;
  footer: string;
  href: string;
  cta?: string;
  headlineCenter?: boolean;
  contentCentered?: boolean;
  darkAccent?: string;
  darkAccentSuffix?: string;
}>;

function TileActionBar() {
  const stroke = "#fb923c";
  const s = 1.6;
  return (
    <div className={styles.tileBar} aria-hidden>
      <svg className={styles.tileBarIcon} viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={stroke} strokeWidth={s} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z" />
      </svg>
      <svg className={styles.tileBarIcon} viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={stroke} strokeWidth={s} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
      <svg className={styles.tileBarIcon} viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={stroke} strokeWidth={s} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
      <span className={styles.tileBarSpacer} />
      <svg className={styles.tileBarIcon} viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={stroke} strokeWidth={s} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </div>
  );
}

export function InnovateFeatureTile(props: InnovateFeatureTileProps) {
  const { variant, mark, headline, subline, footer, href, cta, headlineCenter, contentCentered, darkAccent, darkAccentSuffix } = props;
  let surfaceClass = styles.tileDark;
  if (variant === "red") {
    surfaceClass = styles.tileRed;
  } else if (variant === "glass") {
    surfaceClass = styles.tileGlass;
  }
  const textClass = variant === "glass" ? styles.tileTextOnLight : styles.tileTextOnDark;
  let headlineCls = `${styles.tileHeadline} ${textClass}`;
  if (headlineCenter) {
    headlineCls += ` ${styles.tileHeadlineCenter}`;
  }
  if (variant === "dark" && darkAccent) {
    headlineCls += ` ${styles.tileBodyOnDark}`;
  }

  const ctaClass = variant === "glass" ? styles.tileCtaLight : styles.tileCtaDark;
  let layerClass = styles.tileLayer;
  if (contentCentered) {
    layerClass += ` ${styles.tileContentCentered}`;
  }

  return (
    <div className={styles.tileColumn}>
      <div className={styles.tileBadge}>{mark}</div>
      <Link href={href} className={`${styles.tileSurface} ${surfaceClass}`}>
        <div className={layerClass}>
          <span className={`${styles.tileBrand} ${textClass}`}>NEXA</span>
          {variant === "dark" && darkAccent ? (
            <p className={styles.tileDarkAccent}>
              {darkAccent}
              {darkAccentSuffix ? <span>{darkAccentSuffix}</span> : null}
            </p>
          ) : null}
          <h3 className={headlineCls}>{headline}</h3>
          {subline ? <p className={`${styles.tileSubline} ${textClass}`}>{subline}</p> : null}
          <span className={`${styles.tileFooter} ${textClass}`}>{footer}</span>
          {cta ? <span className={ctaClass}>{cta}</span> : null}
        </div>
      </Link>
      <TileActionBar />
    </div>
  );
}
