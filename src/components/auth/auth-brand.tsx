import styles from "../../app/(auth)/auth.module.css";

const LOGO_SRC = "/assets/images/NEXALOGO.png";

export function AuthBrand() {
  return (
    <div className={styles.brandMeta}>
      <img src={LOGO_SRC} alt="NEXA" className={styles.brandLogo} width={200} height={56} decoding="async" />
    </div>
  );
}
