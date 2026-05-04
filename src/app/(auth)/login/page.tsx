import { LoginForm } from "./login-form";
import styles from "../auth.module.css";

type LoginPageProps = {
  searchParams?: Promise<{ next?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = (await searchParams) ?? {};
  const raw = sp.next;
  const nextParam = Array.isArray(raw) ? raw[0] ?? null : raw ?? null;

  return (
    <main className={`${styles.page} ${styles.pageCyber}`}>
      <LoginForm nextParam={nextParam} />
    </main>
  );
}

