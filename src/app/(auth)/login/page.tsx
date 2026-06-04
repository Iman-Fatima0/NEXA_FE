import { LoginForm } from "./login-form";
import styles from "../auth.module.css";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
    oauth_error?: string | string[];
    registered?: string | string[];
    verify?: string | string[];
    email?: string | string[];
    reset?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = (await searchParams) ?? {};
  const raw = sp.next;
  const nextParam = Array.isArray(raw) ? raw[0] ?? null : raw ?? null;
  const oauthRaw = sp.oauth_error;
  const oauthError = Array.isArray(oauthRaw) ? oauthRaw[0] ?? null : oauthRaw ?? null;
  const registered = Array.isArray(sp.registered) ? sp.registered[0] : sp.registered;
  const verify = Array.isArray(sp.verify) ? sp.verify[0] : sp.verify;
  const emailRaw = sp.email;
  const pendingEmail = Array.isArray(emailRaw) ? emailRaw[0] ?? null : emailRaw ?? null;
  const reset = Array.isArray(sp.reset) ? sp.reset[0] : sp.reset;

  return (
    <main className={`${styles.page} ${styles.pageCyber}`}>
      <LoginForm
        nextParam={nextParam}
        oauthError={oauthError}
        showVerifyNotice={registered === "1" && verify === "1"}
        pendingEmail={pendingEmail}
        showResetNotice={reset === "1"}
      />
    </main>
  );
}

