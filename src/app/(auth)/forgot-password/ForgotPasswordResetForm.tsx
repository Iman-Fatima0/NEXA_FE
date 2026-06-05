"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../auth.module.css";
import { ForgotPasswordShell } from "../../../components/auth/ForgotPasswordShell";
import { EyeIcon, EyeOffIcon, LockIcon } from "../../../components/auth/icons";
import { readForgotPasswordError, resetPasswordWithToken } from "../../../lib/auth/forgot-password-api";

type ForgotPasswordResetFormProps = {
  /** Token from email link query `?token=` */
  initialToken?: string | null;
};

export function ForgotPasswordResetForm({ initialToken = null }: ForgotPasswordResetFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(initialToken?.trim() || null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = searchParams.get("token")?.trim();
    if (fromUrl) setToken(fromUrl);
  }, [searchParams]);

  if (!token) {
    return (
      <ForgotPasswordShell
        backHref="/forgot-password"
        title="Invalid link"
        subtitle="This reset link is missing or expired. Request a new one."
      >
        <p className={styles.fpError} role="alert">
          Open the full link from your email, or request a new reset email.
        </p>
        <Link href="/forgot-password" className={`${styles.btnCyberPrimary} ${styles.linkAsBtn}`}>
          <span className={styles.btnCyberPrimaryContent}>Request reset link</span>
        </Link>
      </ForgotPasswordShell>
    );
  }

  return (
    <ForgotPasswordShell
      backHref="/forgot-password"
      title="Create New password"
      subtitle="Your new password must be different from previously used password"
    >
      <form
        className={`${styles.form} ${styles.fpForm}`}
        onSubmit={(e) => {
          e.preventDefault();
          if (password.length < 8) {
            setError("Use at least 8 characters.");
            return;
          }
          if (password !== confirm) {
            setError("Passwords do not match.");
            return;
          }
          setError(null);
          setSubmitting(true);
          void (async () => {
            try {
              const res = await resetPasswordWithToken(token, password);
              if (!res.ok) {
                setError(await readForgotPasswordError(res, "Could not reset password."));
                setSubmitting(false);
                return;
              }
              router.push("/login?reset=1");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Reset failed.");
              setSubmitting(false);
            }
          })();
        }}
      >
        <label className={`${styles.field} ${styles.fieldCyber} ${styles.fpIconField}`}>
          <span className="sr-only">New password</span>
          <span className={styles.fpInputIcon} aria-hidden>
            <LockIcon className={styles.fpInputIconSvg} />
          </span>
          <div className={styles.passwordWrap}>
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              autoComplete="new-password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
              minLength={8}
            />
            <button
              type="button"
              className={`${styles.passwordToggleCyber} ${styles.passwordToggleIconCyber}`}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon className={styles.passwordToggleSvg} /> : <EyeIcon className={styles.passwordToggleSvg} />}
            </button>
          </div>
        </label>

        <label className={`${styles.field} ${styles.fieldCyber} ${styles.fpIconField}`}>
          <span className="sr-only">Confirm password</span>
          <span className={styles.fpInputIcon} aria-hidden>
            <LockIcon className={styles.fpInputIconSvg} />
          </span>
          <div className={styles.passwordWrap}>
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={submitting}
              required
              minLength={8}
            />
            <button
              type="button"
              className={`${styles.passwordToggleCyber} ${styles.passwordToggleIconCyber}`}
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOffIcon className={styles.passwordToggleSvg} /> : <EyeIcon className={styles.passwordToggleSvg} />}
            </button>
          </div>
        </label>

        {error ? (
          <p className={styles.fpError} role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className={styles.btnCyberPrimary} disabled={submitting}>
          <span className={styles.btnCyberPrimaryContent}>{submitting ? "Saving…" : "Save"}</span>
        </button>
      </form>
    </ForgotPasswordShell>
  );
}
