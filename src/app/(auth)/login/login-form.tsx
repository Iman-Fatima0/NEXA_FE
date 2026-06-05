"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "../auth.module.css";
import { EyeIcon, EyeOffIcon } from "../../../components/auth/icons";
import { SocialAuthButtons } from "../../../components/auth/social-auth-buttons";
import {
  formString,
  loginWithCredentials,
  readAuthErrorMessage,
  resendVerificationEmail,
} from "../../../lib/auth-api";
import { resolvePostLoginPath } from "../../../lib/superadmin/login-redirect";
import { rememberProfileIconSeedEmail } from "../../../lib/user-profile-icon";

function safeRedirectPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

type LoginFormProps = {
  /** `next` query from server render; submit handler also reads `window.location` for post-nav updates */
  nextParam?: string | null;
  oauthError?: string | null;
  showVerifyNotice?: boolean;
  pendingEmail?: string | null;
  showResetNotice?: boolean;
};

export function LoginForm({
  nextParam = null,
  oauthError = null,
  showVerifyNotice = false,
  pendingEmail = null,
  showResetNotice = false,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(oauthError);
  const [statusNotice, setStatusNotice] = useState<string | null>(
    showResetNotice
      ? "Password updated. Sign in with your new password."
      : showVerifyNotice
        ? "Account created. Check your email and click the verification link before signing in."
        : null,
  );
  const [resendEmail, setResendEmail] = useState(pendingEmail ?? "");
  const [resending, setResending] = useState(false);

  return (
    <div className={`${styles.authMinimal} ${styles.authFormLayer} ${styles.loginPageFlow} ${styles.loginNeutral}`}>
      <div className={styles.loginHero} aria-hidden>
        <img
          src="/assets/images/circleloop.gif"
          alt=""
          className={styles.loginHeroImg}
          width={380}
          height={380}
          decoding="async"
        />
      </div>

      <div className={styles.loginBottomStack}>
        <form
          className={styles.form}
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            if (!form.checkValidity()) {
              form.reportValidity();
              return;
            }
            setFormError(null);
            setSubmitting(true);
            const fd = new FormData(form);
            const email = formString(fd, "email").trim();
            const password = formString(fd, "password");
            try {
              const res = await loginWithCredentials({ email, password });
              const raw = await res.text();
              let loginJson: unknown = null;
              try {
                loginJson = raw ? JSON.parse(raw) : null;
              } catch {
                loginJson = null;
              }
              if (!res.ok) {
                let msg = "Sign in failed. Try again.";
                if (loginJson && typeof loginJson === "object") {
                  const o = loginJson as { error?: string; message?: string };
                  if (typeof o.message === "string" && o.message.trim()) msg = o.message.trim();
                  else if (typeof o.error === "string" && o.error.trim()) msg = o.error.trim();
                }
                throw new Error(msg);
              }
              rememberProfileIconSeedEmail(email);
              const fromUrl = new URL(globalThis.location.href).searchParams.get("next");
              const fallback = safeRedirectPath(fromUrl ?? nextParam);
              const next = await resolvePostLoginPath(fallback, loginJson);
              globalThis.location.assign(next);
            } catch (err) {
              setFormError(err instanceof Error ? err.message : "Sign in failed. Try again.");
              setSubmitting(false);
            }
          }}
        >
          <div className={styles.loginFieldsGrid}>
            <label className={`${styles.field} ${styles.fieldCyber}`}>
              <span>Email</span>
              <input type="email" name="email" autoComplete="email" placeholder="Enter your email" required />
            </label>

            <label className={`${styles.field} ${styles.fieldCyber}`}>
              <span>Password</span>
              <div className={styles.passwordWrap}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className={`${styles.passwordToggleCyber} ${styles.passwordToggleIconCyber}`}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon className={styles.passwordToggleSvg} /> : <EyeIcon className={styles.passwordToggleSvg} />}
                </button>
              </div>
            </label>
          </div>

          <div className={`${styles.rowBetween} ${styles.loginForgotRow}`}>
            <span />
            <Link href="/forgot-password" className={styles.linkCyber} prefetch={false}>
              Forgot password?
            </Link>
          </div>

          {statusNotice ? (
            <p role="status" style={{ color: "#bbf7d0", margin: "0 0 8px", fontSize: "0.9rem" }}>
              {statusNotice}
            </p>
          ) : null}

          {formError ? (
            <p role="alert" style={{ color: "#fecaca", margin: "0 0 8px", fontSize: "0.9rem" }}>
              {formError}
            </p>
          ) : null}

          {formError?.toLowerCase().includes("not verified") ? (
            <div style={{ margin: "0 0 12px", fontSize: "0.85rem" }}>
              <label style={{ display: "block", marginBottom: 4 }}>Resend verification email</label>
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: "100%", marginBottom: 6, padding: "6px 8px" }}
              />
              <button
                type="button"
                disabled={resending || !resendEmail.trim()}
                className={styles.btnCyberPrimary}
                onClick={() => {
                  void (async () => {
                    setResending(true);
                    const res = await resendVerificationEmail(resendEmail);
                    const msg = await readAuthErrorMessage(res, "Could not resend verification email.");
                    setStatusNotice(res.ok ? msg : null);
                    setFormError(res.ok ? null : msg);
                    setResending(false);
                  })();
                }}
              >
                {resending ? "Sending…" : "Resend verification link"}
              </button>
            </div>
          ) : null}

          <button type="submit" className={styles.btnCyberPrimary} disabled={submitting}>
            <span className={styles.btnCyberPrimaryContent}>
              {submitting ? "Signing in…" : "Sign in"}
            </span>
          </button>
        </form>

        <hr className={styles.cyberDivider} />

        <SocialAuthButtons mode="login" />

        <p className={styles.footerCyber}>
          Don&apos;t have an account?{" "}
          <Link href="/register" prefetch={false}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}



