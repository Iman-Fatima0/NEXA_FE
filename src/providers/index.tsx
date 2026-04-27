"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import styles from "./entry-splash.module.css";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: Readonly<AppProvidersProps>) {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = globalThis.setTimeout(() => {
      setFadeOut(true);
    }, 2200);

    const removeTimer = globalThis.setTimeout(() => {
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
