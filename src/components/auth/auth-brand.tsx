import styles from "../../app/(auth)/auth.module.css";

const LOGO_SRC = "/assets/images/NEXALOGO.png";

type AuthBrandProps = {
  align?: "center" | "start";
};

export function AuthBrand({ align = "center" }: AuthBrandProps) {
  return (
    <div className={`${styles.brandMeta} ${align === "start" ? styles.brandMetaStart : ""}`}>
      <img src={LOGO_SRC} alt="NEXA" className={styles.brandLogo} width={200} height={56} decoding="async" />
    </div>
  );
}
