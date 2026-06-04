"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "../auth.module.css";
import { ForgotPasswordShell } from "../../../components/auth/ForgotPasswordShell";
import { MailIcon } from "../../../components/auth/icons";
import {
  readForgotPasswordError,
  requestForgotPasswordEmail,
} from "../../../lib/auth/forgot-password-api";

export function ForgotPasswordEmailForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <ForgotPasswordShell
        backHref="/login"
        title="Check your email"
        subtitle="We sent a password reset link. Open it on this device to choose a new password."
      >
        <p className={styles.fpNotice} role="status">
          If you don&apos;t see it, check spam or wait a minute, then try again.
        </p>
        <button
          type="button"
          className={styles.btnCyberPrimary}
          onClick={() => {
            setSent(false);
            setError(null);
          }}
        >
          <span className={styles.btnCyberPrimaryContent}>Send again</span>
        </button>
        <p className={styles.footerCyber}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </ForgotPasswordShell>
    );
  }

  return (
    <ForgotPasswordShell
      backHref="/login"
      title="Forget Password?"
      subtitle="Enter your email address and we will send you a reset link"
    >
      <form
        className={`${styles.form} ${styles.fpForm}`}
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = email.trim().toLowerCase();
          if (!trimmed) {
            setError("Enter your email address.");
            return;
          }
          setError(null);
          setSubmitting(true);
          void (async () => {
            try {
              const res = await requestForgotPasswordEmail(trimmed);
              if (!res.ok) {
                setError(await readForgotPasswordError(res, "Could not send reset email."));
                setSubmitting(false);
                return;
              }
              setSent(true);
              setSubmitting(false);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Something went wrong.");
              setSubmitting(false);
            }
          })();
        }}
      >
        <label className={`${styles.field} ${styles.fieldCyber} ${styles.fpIconField}`}>
          <span className="sr-only">Email</span>
          <span className={styles.fpInputIcon} aria-hidden>
            <MailIcon className={styles.fpInputIconSvg} />
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            required
          />
        </label>

        {error ? (
          <p className={styles.fpError} role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className={styles.btnCyberPrimary} disabled={submitting}>
          <span className={styles.btnCyberPrimaryContent}>{submitting ? "Sending…" : "Send"}</span>
        </button>
      </form>
    </ForgotPasswordShell>
  );
}
