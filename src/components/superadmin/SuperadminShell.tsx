"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { logoutAndRedirectHome } from "../../lib/auth-api";
import { requireSuperadminAccess } from "../../lib/superadmin/fetch-superadmin";
import styles from "./superadmin.module.css";

type SuperadminShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function SuperadminShell({ title, subtitle, children }: SuperadminShellProps) {
  const [ready, setReady] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await requireSuperadminAccess();
        if (!cancelled) setReady(true);
      } catch {
        /* redirect handled in helper */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>Verifying superadmin access…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.brand}>{title}</h1>
          {subtitle ? <p className={styles.subBrand}>{subtitle}</p> : null}
        </div>
        <div className={styles.headerActions}>
          <Link href="/superadmin" className={styles.btnGhost}>
            Hub
          </Link>
          <button
            type="button"
            className={styles.btnGhost}
            disabled={loggingOut}
            onClick={async () => {
              setLoggingOut(true);
              await logoutAndRedirectHome();
            }}
          >
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
