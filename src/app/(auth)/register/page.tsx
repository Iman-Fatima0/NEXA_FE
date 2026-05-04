import { RegisterForm } from "./register-form";
import styles from "../auth.module.css";

export default function RegisterPage() {
  return (
    <main className={`${styles.page} ${styles.pageCyber}`}>
      <RegisterForm />
    </main>
  );
}
