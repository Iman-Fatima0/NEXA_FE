"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useState } from "react";
import styles from "./entry-splash.module.css";

const SPLASH_STORAGE_KEY = "nexa_entry_splash_done";

/** Survives client-side remounts (e.g. Strict Mode, edge cases) without re-running the splash. */
let entrySplashCompletedInMemory = false;

type AppProvidersProps = {
  children: ReactNode;
};

function shouldSkipEntrySplash(): boolean {
  if (entrySplashCompletedInMemory) return true;
  try {
    return globalThis.sessionStorage.getItem(SPLASH_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markEntrySplashDone(): void {
  entrySplashCompletedInMemory = true;
  try {
    globalThis.sessionStorage.setItem(SPLASH_STORAGE_KEY, "1");
  } catch {
    /* ignore private mode / quota */
  }
}

type SplashPhase = "idle" | "active" | "fading" | "off";

export function AppProviders({ children }: Readonly<AppProvidersProps>) {
  /** Start idle so SSR and the first client render match (splash mounts only after hydration). */
  const [splashPhase, setSplashPhase] = useState<SplashPhase>("idle");

  useLayoutEffect(() => {
    if (shouldSkipEntrySplash()) {
      setSplashPhase("off");
      return;
    }

    setSplashPhase("active");

    const fadeTimer = globalThis.setTimeout(() => {
      setSplashPhase("fading");
    }, 2200);

    const removeTimer = globalThis.setTimeout(() => {
      markEntrySplashDone();
      setSplashPhase("off");
    }, 2550);

    return () => {
      globalThis.clearTimeout(fadeTimer);
      globalThis.clearTimeout(removeTimer);
    };
  }, []);

  const showSplash = splashPhase === "active" || splashPhase === "fading";

  return (
    <>
      {children}
      {showSplash ? (
        <div
          className={`${styles.splash} ${splashPhase === "fading" ? styles.splashOut : ""}`}
          aria-label="Opening animation"
        >
          <img
            src="/assets/images/fireeye.gif"
            alt=""
            className={styles.fireEye}
            suppressHydrationWarning
          />
          <div className={styles.blackFade} />
        </div>
      ) : null}
    </>
  );
}
