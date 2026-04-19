"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "../auth.module.css";
import { AuthBrand } from "../../../components/auth/auth-brand";
import { GitHubLogo, GoogleLogo } from "../../../components/auth/icons";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className={`${styles.card} ${styles.cardMeta}`}>
      <header className={styles.header}>
        <AuthBrand />
        <h1>Sign in</h1>
        <p>Use your email and password, or continue with a provider.</p>
      </header>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
        }}
        noValidate
      >
        <label className={styles.field}>
          <span>Email</span>
          <input type="email" name="email" autoComplete="email" placeholder="name@company.com" required />
        </label>

        <label className={styles.field}>
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
              className={styles.passwordToggle}
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <div className={styles.rowBetween}>
          <span />
          <Link href="#" className={styles.linkMuted} prefetch={false}>
            Forgot password?
          </Link>
        </div>

        <button type="submit" className={styles.btnMetaPrimary}>
          Sign in
        </button>
      </form>

      <div className={styles.divider} aria-hidden="true">
        <span />
        <p>Or</p>
        <span />
      </div>

      <div className={styles.socialBlock}>
        <p className={styles.socialLabel}>Continue with</p>
        <div className={styles.socialRowIcons}>
          <button type="button" className={styles.socialButtonIconOnly} aria-label="Sign in with Google">
            <GoogleLogo className={styles.socialIconLg} />
          </button>
          <button type="button" className={styles.socialButtonIconOnly} aria-label="Sign in with GitHub">
            <GitHubLogo className={styles.socialIconLg} />
          </button>
        </div>
      </div>

      <p className={styles.footer}>
        Don&apos;t have an account? <Link href="/register">Sign up</Link>
      </p>
    </section>
  );
}
