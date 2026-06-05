import { Suspense } from "react";
import { ForgotPasswordResetForm } from "../ForgotPasswordResetForm";
import styles from "../../auth.module.css";

type ResetPageProps = {
  searchParams?: Promise<{ token?: string | string[] }>;
};

export default async function ForgotPasswordResetPage({ searchParams }: ResetPageProps) {
  const sp = (await searchParams) ?? {};
  const raw = sp.token;
  const token = Array.isArray(raw) ? raw[0] ?? null : raw ?? null;

  return (
    <main className={`${styles.page} ${styles.pageCyber} ${styles.pageCyberGrid}`}>
      <Suspense fallback={null}>
        <ForgotPasswordResetForm initialToken={token} />
      </Suspense>
    </main>
  );
}
