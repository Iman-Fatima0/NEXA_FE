"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "../auth.module.css";
import { AuthBrand } from "../../../components/auth/auth-brand";
import { GitHubLogo, GoogleLogo } from "../../../components/auth/icons";

type AccountMode = "personal" | "company";

export function RegisterForm() {
  const [mode, setMode] = useState<AccountMode>("personal");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className={`${styles.card} ${styles.cardMeta} ${styles.cardMetaWide}`}>
      <header className={styles.header}>
        <AuthBrand />
        <h1>Create your NEXA account</h1>
        <p>Choose account type, then complete your details.</p>
      </header>

      <fieldset className={styles.fieldsetAccount}>
        <legend>Account type</legend>
        <div className={styles.accountType}>
          <button
            type="button"
            className={`${styles.accountTypeBtn} ${mode === "personal" ? styles.accountTypeBtnActive : ""}`}
            onClick={() => setMode("personal")}
            aria-pressed={mode === "personal"}
          >
            <span className={styles.accountTypeLabel}>Personal</span>
            <small className={styles.accountTypeHint}>Individual use</small>
          </button>
          <button
            type="button"
            className={`${styles.accountTypeBtn} ${mode === "company" ? styles.accountTypeBtnActive : ""}`}
            onClick={() => setMode("company")}
            aria-pressed={mode === "company"}
          >
            <span className={styles.accountTypeLabel}>Company</span>
            <small className={styles.accountTypeHint}>Team or organization</small>
          </button>
        </div>
      </fieldset>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
        }}
        noValidate
      >
        {mode === "company" && (
          <>
            <p className={styles.sectionTitle}>Company</p>
            <label className={styles.field}>
              <span>Company name</span>
              <input type="text" name="companyName" placeholder="Acme Inc." required={mode === "company"} />
            </label>
            <label className={styles.field}>
              <span>Industry (optional)</span>
              <input type="text" name="industry" placeholder="e.g. Finance, Healthcare" />
            </label>
            <label className={styles.field}>
              <span>Company website (optional)</span>
              <input type="url" name="companyWebsite" placeholder="https://acme.com" />
            </label>
            <label className={styles.field}>
              <span>Company details</span>
              <textarea
                name="companyDetails"
                placeholder="Legal name, registration, team size, or other context"
                rows={3}
                required={mode === "company"}
              />
            </label>
          </>
        )}

        <p className={styles.sectionTitle}>{mode === "company" ? "Your profile" : "Your details"}</p>

        <label className={styles.field}>
          <span>Full name</span>
          <input type="text" name="fullName" placeholder="e.g. Jane Cooper" required />
        </label>

        <label className={styles.field}>
          <span>{mode === "company" ? "Work email" : "Email"}</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder={mode === "company" ? "you@company.com" : "you@email.com"}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Password</span>
          <div className={styles.passwordWrap}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              placeholder="Create a strong password"
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

        <p className={styles.hint}>Use at least 8 characters. You&apos;ll connect OAuth providers below.</p>

        <button type="submit" className={styles.btnMetaPrimary}>
          Create account
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
          <button type="button" className={styles.socialButtonIconOnly} aria-label="Sign up with Google">
            <GoogleLogo className={styles.socialIconLg} />
          </button>
          <button type="button" className={styles.socialButtonIconOnly} aria-label="Sign up with GitHub">
            <GitHubLogo className={styles.socialIconLg} />
          </button>
        </div>
      </div>

      <p className={styles.footer}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </section>
  );
}
