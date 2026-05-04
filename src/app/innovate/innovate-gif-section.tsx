"use client";

import { useEffect } from "react";
import styles from "./innovate.module.css";

/** Beat before scrolling from full-page hero down to the GIF section. */
const HERO_FULL_VIEW_MS = 700;
/** GIF is not observable as a single “ended” event in `<img>`; tune to match one loop if you want. */
const GIF_FULL_VIEW_MS = 8200;

export function InnovateGifSection() {
  useEffect(() => {
    const scrollToGif = globalThis.setTimeout(() => {
      document.getElementById("innovate-gif")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, HERO_FULL_VIEW_MS);

    const scrollPastGif = globalThis.setTimeout(() => {
      document.getElementById("innovate-after")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, HERO_FULL_VIEW_MS + GIF_FULL_VIEW_MS);

    return () => {
      globalThis.clearTimeout(scrollToGif);
      globalThis.clearTimeout(scrollPastGif);
    };
  }, []);

  return (
    <section id="innovate-gif" className={styles.gifSection} aria-label="Smile transition">
      <img src="/assets/images/smiletransition.gif" alt="" className={styles.gif} />
    </section>
  );
}
