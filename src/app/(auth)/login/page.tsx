import { LoginForm } from "./login-form";
import styles from "../auth.module.css";

export default function LoginPage() {
  return (
    <main className={`${styles.page} ${styles.pageMeta}`}>
      <LoginForm />
    </main>
  );
}
