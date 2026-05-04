"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "../auth.module.css";
import { EyeIcon, EyeOffIcon, FacebookLogo, GitHubLogo, GoogleLogo } from "../../../components/auth/icons";
import { formString, loginWithCredentials, readAuthErrorMessage } from "../../../lib/auth-api";

function safeRedirectPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

type LoginFormProps = {
  /** `next` query from server render; submit handler also reads `window.location` for post-nav updates */
  nextParam?: string | null;
};

export function LoginForm({ nextParam = null }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
              if (!res.ok) {
                const msg = await readAuthErrorMessage(res, "Sign in failed. Try again.");
                throw new Error(msg);
              }
              const fromUrl = new URL(globalThis.location.href).searchParams.get("next");
              const next = safeRedirectPath(fromUrl ?? nextParam);
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
            <Link href="/support" className={styles.linkCyber} prefetch={false}>
              Forgot password?
            </Link>
          </div>

          {formError ? (
            <p role="alert" style={{ color: "#fecaca", margin: "0 0 8px", fontSize: "0.9rem" }}>
              {formError}
            </p>
          ) : null}

          <button type="submit" className={styles.btnCyberPrimary} disabled={submitting}>
            <span className={styles.btnCyberPrimaryContent}>
              {submitting ? "Signing in…" : "Sign in"}
            </span>
          </button>
        </form>

        <hr className={styles.cyberDivider} />

        <div className={styles.socialRowCyberIconsOnly}>
          <button type="button" className={styles.socialPillCyberIcon} aria-label="Sign in with Google">
            <GoogleLogo className={styles.socialIconLg} />
          </button>
          <button type="button" className={styles.socialPillCyberIcon} aria-label="Sign in with GitHub">
            <GitHubLogo className={styles.socialIconLg} />
          </button>
          <button type="button" className={styles.socialPillCyberIcon} aria-label="Sign in with Facebook">
            <FacebookLogo className={styles.socialIconLg} />
          </button>
        </div>

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



