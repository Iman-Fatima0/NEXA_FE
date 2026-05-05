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

export function AppProviders({ children }: Readonly<AppProvidersProps>) {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useLayoutEffect(() => {
    if (shouldSkipEntrySplash()) {
      setShowSplash(false);
      return;
    }

    const fadeTimer = globalThis.setTimeout(() => {
      setFadeOut(true);
    }, 2200);

    const removeTimer = globalThis.setTimeout(() => {
      markEntrySplashDone();
      setShowSplash(false);
    }, 2550);

    return () => {
      globalThis.clearTimeout(fadeTimer);
      globalThis.clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      {children}
      {showSplash ? (
        <div className={`${styles.splash} ${fadeOut ? styles.splashOut : ""}`} aria-label="Opening animation">
          <img src="/assets/images/fireeye.gif" alt="" className={styles.fireEye} />
          <div className={styles.blackFade} />
        </div>
      ) : null}
    </>
  );
}
