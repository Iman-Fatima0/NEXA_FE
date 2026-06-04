import Link from "next/link";
import styles from "../../../(auth)/auth.module.css";
import { confirmEmailWithToken } from "../../../../lib/auth/verify-email-server";

type PageProps = {
  searchParams?: Promise<{ token?: string | string[] }>;
};

export default async function VerifyEmailConfirmPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const raw = sp.token;
  const token = Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";

  const result = token ? await confirmEmailWithToken(token) : { ok: false, message: "Missing verification token." };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.AUTH_URL?.trim() || "";

  return (
    <main className={`${styles.page} ${styles.pageCyber} ${styles.pageCyberGrid}`}>
      <div className={`${styles.authMinimal} ${styles.authFormLayer} ${styles.fpFlow} ${styles.loginNeutral}`}>
        <Link href="/login" className={styles.fpBack} prefetch={false}>
          <span className={styles.fpBackChevron} aria-hidden>
            ‹
          </span>
          Back
        </Link>

        <header className={`${styles.authMinimalHeader} ${styles.headerCyber} ${styles.fpHeader}`}>
          <h1 className={styles.fpTitle}>{result.ok ? "Email verified" : "Verification problem"}</h1>
          <p className={styles.fpSubtitle}>{result.message}</p>
        </header>

        {!result.ok && appUrl ? (
          <p className={styles.fpNotice}>
            Verification links in email should use your app URL, for example:{" "}
            <code>
              {appUrl.replace(/\/+$/, "")}/auth/verify-email/confirm?token=…
            </code>{" "}
            — not <code>localhost:3000</code> unless the API server also serves this page.
          </p>
        ) : null}

        <Link href={result.ok ? "/login" : "/login?verify=1"} className={`${styles.btnCyberPrimary} ${styles.linkAsBtn}`}>
          <span className={styles.btnCyberPrimaryContent}>{result.ok ? "Sign in" : "Go to sign in"}</span>
        </Link>
      </div>
    </main>
  );
}
