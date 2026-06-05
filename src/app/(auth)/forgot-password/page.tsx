import { ForgotPasswordEmailForm } from "./ForgotPasswordEmailForm";
import styles from "../auth.module.css";

export default function ForgotPasswordPage() {
  return (
    <main className={`${styles.page} ${styles.pageCyber} ${styles.pageCyberGrid}`}>
      <ForgotPasswordEmailForm />
    </main>
  );
}
