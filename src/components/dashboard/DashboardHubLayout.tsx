"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback } from "react";
import styles from "../../app/nexa-ss.module.css";
import { logoutAndRedirectHome } from "../../lib/auth-api";

type DashboardHubLayoutProps = Readonly<{
  title?: string;
  lead?: string;
  children: ReactNode;
}>;

export function DashboardHubLayout({ title, lead, children }: DashboardHubLayoutProps) {
  const signOut = useCallback(async () => {
    await logoutAndRedirectHome();
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/" className={styles.brand}>
            <img src="/assets/images/NEXALOGO.png" alt="" width={28} height={28} />
            <span>Nexa</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <Link href="/dashboard" className={styles.btnLight}>
              Dashboard
            </Link>
            <Link href="/profile" className={styles.btnLight}>
              My profile
            </Link>
            <button type="button" className={styles.btnLight} onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className={styles.container}>
        {title ? <h1 className={styles.dashboardTitle}>{title}</h1> : null}
        {lead ? <p className={styles.dashboardSub}>{lead}</p> : null}
        {children}
      </main>
    </div>
  );
}
