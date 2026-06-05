"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import styles from "../../app/(auth)/auth.module.css";

type ForgotPasswordShellProps = {
  backHref: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function ForgotPasswordShell({ backHref, title, subtitle, children }: ForgotPasswordShellProps) {
  return (
    <div className={`${styles.authMinimal} ${styles.authFormLayer} ${styles.fpFlow} ${styles.loginNeutral}`}>
      <Link href={backHref} className={styles.fpBack} prefetch={false}>
        <span className={styles.fpBackChevron} aria-hidden>
          ‹
        </span>
        Back
      </Link>

      <header className={`${styles.authMinimalHeader} ${styles.headerCyber} ${styles.fpHeader}`}>
        <h1 className={styles.fpTitle}>{title}</h1>
        <p className={styles.fpSubtitle}>{subtitle}</p>
      </header>

      {children}
    </div>
  );
}
