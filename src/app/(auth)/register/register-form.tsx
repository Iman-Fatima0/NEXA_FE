"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../auth.module.css";
import { EyeIcon, EyeOffIcon, FacebookLogo, GitHubLogo, GoogleLogo } from "../../../components/auth/icons";
type AccountMode = "personal" | "company";
type RegisterStep = 1 | 2;

const REGISTER_STEP1_LEAD = "Select Personal or Company to open the signup form.";

export function RegisterForm() {
  const [step, setStep] = useState<RegisterStep>(1);
  const [mode, setMode] = useState<AccountMode>("personal");
  const [showPassword, setShowPassword] = useState(false);
  const [leadTypedLen, setLeadTypedLen] = useState(0);
  const [signupPendingNotice, setSignupPendingNotice] = useState<string | null>(null);

  useEffect(() => {
    if (step !== 1) {
      return;
    }
    setLeadTypedLen(0);
  }, [step]);

  useEffect(() => {
    if (step !== 1) {
      return;
    }
    if (leadTypedLen >= REGISTER_STEP1_LEAD.length) {
      return;
    }
    const id = globalThis.setTimeout(() => setLeadTypedLen((n) => n + 1), 38);
    return () => globalThis.clearTimeout(id);
  }, [step, leadTypedLen]);

  const chooseAccountType = (next: AccountMode) => {
    setMode(next);
    setStep(2);
  };

  const goBackToAccountType = () => {
    setStep(1);
    setShowPassword(false);
    setSignupPendingNotice(null);
  };

  return (
    <>
      {step === 1 ? (
        <div className={`${styles.authMinimal} ${styles.authFormLayer} ${styles.registerStep1Flow}`}>
          <div className={styles.registerStep1Hero} aria-hidden>
            <img
              src="/assets/images/circleloop.gif"
              alt=""
              className={styles.registerStep1HeroImg}
              width={480}
              height={480}
              decoding="async"
            />
          </div>
          <div className={styles.registerStep1Overlay}>
            <div className={styles.registerStep1Inner}>
              <div className={styles.registerStep1}>
                <fieldset
                  className={`${styles.fieldsetAccount} ${styles.fieldsetAccountCyber} ${styles.accountTypeCyber} ${styles.registerStep1Fieldset}`}
                >
                  <legend className={styles.registerStep1SrLegend}>Choose account type for signup</legend>
                  <p className={styles.registerStep1LeadWrap} aria-label={REGISTER_STEP1_LEAD}>
                    <span className={styles.registerStep1LeadMetallic}>
                      {REGISTER_STEP1_LEAD.slice(0, leadTypedLen)}
                    </span>
                    {leadTypedLen < REGISTER_STEP1_LEAD.length ? (
                      <span className={styles.registerStep1LeadCaret} aria-hidden />
                    ) : null}
                  </p>
                  <div className={styles.accountType}>
                    <button
                      type="button"
                      className={styles.accountTypeBtn}
                      onClick={() => chooseAccountType("personal")}
                      aria-label="Continue with Personal account"
                    >
                      <span className={styles.accountTypeLabel}>Personal</span>
                      <small className={styles.accountTypeHint}>Individual use</small>
                    </button>
                    <button
                      type="button"
                      className={styles.accountTypeBtn}
                      onClick={() => chooseAccountType("company")}
                      aria-label="Continue with Company account"
                    >
                      <span className={styles.accountTypeLabel}>Company</span>
                      <small className={styles.accountTypeHint}>Team or organization</small>
                    </button>
                  </div>
                </fieldset>
              </div>
              <p className={styles.footerCyber}>
                Already have an account? <Link href="/login">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`${styles.authMinimal} ${styles.authFormLayer} ${styles.loginPageFlow} ${styles.loginNeutral} ${styles.registerStep2Page}`}
        >
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

          <div className={`${styles.loginBottomStack} ${styles.registerStep2BottomStack}`}>
            <button type="button" className={styles.registerBackLink} onClick={goBackToAccountType}>
              ← Change account type
            </button>

            <form
              className={`${styles.form} ${styles.registerStep2Form}`}
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                if (!form.checkValidity()) {
                  form.reportValidity();
                  return;
                }
                setSignupPendingNotice(
                  "Signup is not connected to a server yet—only browser checks run here. Share your API routes when ready and we will wire them in.",
                );
              }}
            >
              <input type="hidden" name="accountType" value={mode} />

              {mode === "company" && (
                <>
                  <p className={styles.sectionTitleCyber}>Company</p>
                  <label className={`${styles.field} ${styles.fieldCyber}`}>
                    <span>Company name</span>
                    <input type="text" name="companyName" placeholder="Acme Inc." required={mode === "company"} />
                  </label>
                  <label className={`${styles.field} ${styles.fieldCyber}`}>
                    <span>Industry (optional)</span>
                    <input type="text" name="industry" placeholder="e.g. Finance, Healthcare" />
                  </label>
                  <label className={`${styles.field} ${styles.fieldCyber}`}>
                    <span>Company website (optional)</span>
                    <input type="url" name="companyWebsite" placeholder="https://acme.com" />
                  </label>
                  <label className={`${styles.field} ${styles.fieldCyber}`}>
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

              <p className={styles.sectionTitleCyber}>{mode === "company" ? "Your profile" : "Your details"}</p>

              <label className={`${styles.field} ${styles.fieldCyber}`}>
                <span>Full name</span>
                <input type="text" name="fullName" placeholder="e.g. Jane Cooper" required />
              </label>

              <div className={styles.loginFieldsGrid}>
                <label className={`${styles.field} ${styles.fieldCyber}`}>
                  <span>{mode === "company" ? "Work email" : "Email"}</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder={mode === "company" ? "Enter your work email" : "Enter your email"}
                    required
                  />
                </label>

                <label className={`${styles.field} ${styles.fieldCyber}`}>
                  <span>Password</span>
                  <div className={styles.passwordWrap}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="new-password"
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

              <p className={styles.hintCyber}>Use at least 8 characters.</p>

              {signupPendingNotice ? (
                <p role="status" className={styles.registerFormNotice}>
                  {signupPendingNotice}
                </p>
              ) : null}

              <button type="submit" className={styles.btnCyberPrimary}>
                <span className={styles.btnCyberPrimaryContent}>Create account</span>
              </button>
            </form>

            <hr className={styles.cyberDivider} />

            <div className={styles.socialRowCyberIconsOnly}>
              <button type="button" className={styles.socialPillCyberIcon} aria-label="Sign up with Google">
                <GoogleLogo className={styles.socialIconLg} />
              </button>
              <button type="button" className={styles.socialPillCyberIcon} aria-label="Sign up with GitHub">
                <GitHubLogo className={styles.socialIconLg} />
              </button>
              <button type="button" className={styles.socialPillCyberIcon} aria-label="Sign up with Facebook">
                <FacebookLogo className={styles.socialIconLg} />
              </button>
            </div>

            <p className={styles.footerCyber}>
              Already have an account? <Link href="/login">Sign in</Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
